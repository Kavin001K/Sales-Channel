-- ================================================
-- ANALYTICS MATERIALIZED VIEWS
-- Fast pre-aggregated data for dashboard & reports
-- ================================================

-- 1. Daily Sales Summary
-- Aggregates all sales data by day for fast queries
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_sales_summary AS
SELECT
  company_id,
  DATE(timestamp) as sale_date,
  COUNT(*) as transaction_count,
  SUM(subtotal) as total_subtotal,
  SUM(tax) as total_tax,
  SUM(discount) as total_discount,
  SUM(total) as total_revenue,
  AVG(total) as avg_transaction_value,
  -- Payment method breakdown
  COUNT(*) FILTER (WHERE payment_method = 'cash') as cash_count,
  SUM(total) FILTER (WHERE payment_method = 'cash') as cash_revenue,
  COUNT(*) FILTER (WHERE payment_method = 'card') as card_count,
  SUM(total) FILTER (WHERE payment_method = 'card') as card_revenue,
  COUNT(*) FILTER (WHERE payment_method = 'upi') as upi_count,
  SUM(total) FILTER (WHERE payment_method = 'upi') as upi_revenue,
  COUNT(*) FILTER (WHERE payment_method = 'wallet') as wallet_count,
  SUM(total) FILTER (WHERE payment_method = 'wallet') as wallet_revenue,
  -- Customer stats
  COUNT(DISTINCT customer_id) as unique_customers,
  -- Product stats
  SUM(jsonb_array_length(items::jsonb)) as total_items_sold
FROM transactions
WHERE status = 'completed'
GROUP BY company_id, DATE(timestamp);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_sales_company_date
ON daily_sales_summary(company_id, sale_date DESC);

-- 2. Product Performance Summary
-- Tracks product sales and inventory
CREATE MATERIALIZED VIEW IF NOT EXISTS product_performance AS
SELECT
  p.company_id,
  p.id as product_id,
  p.name,
  p.category,
  p.price,
  p.cost,
  p.stock,
  p.min_stock,
  -- Sales metrics
  COUNT(t.id) as times_sold,
  COALESCE(SUM((item->>'quantity')::int), 0) as total_quantity_sold,
  COALESCE(SUM((item->>'quantity')::int * (item->>'price')::numeric), 0) as total_revenue,
  COALESCE(SUM((item->>'quantity')::int * p.cost), 0) as total_cost,
  COALESCE(SUM((item->>'quantity')::int * (item->>'price')::numeric) - SUM((item->>'quantity')::int * p.cost), 0) as total_profit,
  -- Last sold
  MAX(t.timestamp) as last_sold_at
FROM products p
LEFT JOIN transactions t ON t.company_id = p.company_id AND t.status = 'completed'
LEFT JOIN LATERAL jsonb_array_elements(t.items::jsonb) as item ON item->>'productId' = p.id
WHERE p.is_active = true
GROUP BY p.company_id, p.id, p.name, p.category, p.price, p.cost, p.stock, p.min_stock;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_perf_company
ON product_performance(company_id);

CREATE INDEX IF NOT EXISTS idx_product_perf_revenue
ON product_performance(company_id, total_revenue DESC);

CREATE INDEX IF NOT EXISTS idx_product_perf_quantity
ON product_performance(company_id, total_quantity_sold DESC);

-- 3. Customer Insights Summary
-- Customer behavior and value metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS customer_insights AS
SELECT
  c.company_id,
  c.id as customer_id,
  c.name,
  c.email,
  c.phone,
  c.loyalty_points,
  c.total_spent,
  c.visit_count,
  c.last_visit,
  -- RFM Analysis
  DATE_PART('day', NOW() - c.last_visit) as days_since_last_visit,
  c.visit_count as frequency,
  c.total_spent as monetary_value,
  -- Segmentation
  CASE
    WHEN DATE_PART('day', NOW() - c.last_visit) <= 30 AND c.visit_count >= 10 AND c.total_spent >= 50000 THEN 'Champion'
    WHEN DATE_PART('day', NOW() - c.last_visit) <= 60 AND c.visit_count >= 5 AND c.total_spent >= 25000 THEN 'Loyal'
    WHEN DATE_PART('day', NOW() - c.last_visit) <= 90 AND c.visit_count >= 3 THEN 'Potential'
    WHEN DATE_PART('day', NOW() - c.last_visit) > 180 THEN 'At Risk'
    ELSE 'Regular'
  END as customer_segment,
  -- Lifetime value
  CASE
    WHEN c.visit_count > 0 THEN c.total_spent / c.visit_count
    ELSE 0
  END as avg_order_value
FROM customers c
WHERE c.is_active = true;

-- Create index
CREATE INDEX IF NOT EXISTS idx_customer_insights_company
ON customer_insights(company_id);

CREATE INDEX IF NOT EXISTS idx_customer_insights_segment
ON customer_insights(company_id, customer_segment);

-- 4. Hourly Sales Pattern
-- Analyze peak hours for staffing optimization
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_sales_pattern AS
SELECT
  company_id,
  EXTRACT(HOUR FROM timestamp) as hour_of_day,
  EXTRACT(DOW FROM timestamp) as day_of_week, -- 0 = Sunday
  COUNT(*) as transaction_count,
  SUM(total) as total_revenue,
  AVG(total) as avg_transaction_value
FROM transactions
WHERE status = 'completed'
  AND timestamp >= NOW() - INTERVAL '90 days' -- Last 90 days
GROUP BY company_id, EXTRACT(HOUR FROM timestamp), EXTRACT(DOW FROM timestamp);

-- Create index
CREATE INDEX IF NOT EXISTS idx_hourly_pattern_company
ON hourly_sales_pattern(company_id);

-- ================================================
-- REFRESH FUNCTIONS
-- Call these to update materialized views
-- ================================================

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY customer_insights;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hourly_sales_pattern;
END;
$$ LANGUAGE plpgsql;

-- Refresh only daily sales (faster, for frequent updates)
CREATE OR REPLACE FUNCTION refresh_daily_sales()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- HELPER VIEWS (Regular views, no caching)
-- ================================================

-- Low stock products (real-time)
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  company_id,
  id,
  name,
  category,
  stock,
  min_stock,
  (min_stock - stock) as units_needed,
  price * (min_stock - stock) as restock_cost
FROM products
WHERE stock <= min_stock
  AND is_active = true
ORDER BY (min_stock - stock) DESC;

-- Today's sales (real-time)
CREATE OR REPLACE VIEW todays_sales AS
SELECT
  company_id,
  COUNT(*) as transaction_count,
  SUM(total) as total_revenue,
  AVG(total) as avg_transaction_value,
  SUM(total) FILTER (WHERE payment_method = 'cash') as cash_revenue,
  SUM(total) FILTER (WHERE payment_method = 'card') as card_revenue,
  SUM(total) FILTER (WHERE payment_method = 'upi') as upi_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM transactions
WHERE DATE(timestamp) = CURRENT_DATE
  AND status = 'completed'
GROUP BY company_id;

-- ================================================
-- SCHEDULED REFRESH (using pg_cron extension)
-- Uncomment if pg_cron is installed
-- ================================================

-- Refresh every hour
-- SELECT cron.schedule('refresh-analytics-hourly', '0 * * * *', 'SELECT refresh_all_analytics_views()');

-- Refresh daily sales every 15 minutes
-- SELECT cron.schedule('refresh-daily-sales', '*/15 * * * *', 'SELECT refresh_daily_sales()');
