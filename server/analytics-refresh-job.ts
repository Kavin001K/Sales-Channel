import { pool } from './postgres-pool';
import { CronJob } from 'cron';

class AnalyticsRefreshService {
  private dailyJob: CronJob | null = null;
  private hourlyJob: CronJob | null = null;

  /**
   * Refresh all materialized views
   */
  async refreshAll(): Promise<void> {
    try {
      console.log('🔄 Refreshing all analytics views...');
      const start = Date.now();

      await pool.query('SELECT refresh_all_analytics_views()');

      const duration = Date.now() - start;
      console.log(`✅ Analytics views refreshed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Failed to refresh analytics views:', error);
      throw error;
    }
  }

  /**
   * Refresh only daily sales (faster)
   */
  async refreshDailySales(): Promise<void> {
    try {
      console.log('🔄 Refreshing daily sales...');
      const start = Date.now();

      await pool.query('SELECT refresh_daily_sales()');

      const duration = Date.now() - start;
      console.log(`✅ Daily sales refreshed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Failed to refresh daily sales:', error);
      throw error;
    }
  }

  /**
   * Initialize materialized views (run once on server start)
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing analytics views...');

      // Read and execute the SQL file
      const fs = require('fs');
      const path = require('path');
      const sqlPath = path.join(__dirname, 'analytics-views.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');

      await pool.query(sql);

      console.log('✅ Analytics views initialized');

      // Do initial refresh
      await this.refreshAll();
    } catch (error) {
      console.error('❌ Failed to initialize analytics views:', error);
      // Don't throw - server should still start even if views fail
    }
  }

  /**
   * Start scheduled refresh jobs
   */
  startScheduledJobs(): void {
    // Refresh all views every hour
    this.hourlyJob = new CronJob(
      '0 * * * *', // Every hour at minute 0
      async () => {
        console.log('⏰ Running scheduled analytics refresh (hourly)');
        await this.refreshAll();
      },
      null,
      true,
      'America/New_York'
    );

    // Refresh daily sales every 15 minutes (lighter operation)
    this.dailyJob = new CronJob(
      '*/15 * * * *', // Every 15 minutes
      async () => {
        console.log('⏰ Running scheduled daily sales refresh');
        await this.refreshDailySales();
      },
      null,
      true,
      'America/New_York'
    );

    console.log('✅ Analytics refresh jobs started');
    console.log('   - Full refresh: Every hour');
    console.log('   - Daily sales: Every 15 minutes');
  }

  /**
   * Stop scheduled jobs
   */
  stopScheduledJobs(): void {
    if (this.hourlyJob) {
      this.hourlyJob.stop();
    }
    if (this.dailyJob) {
      this.dailyJob.stop();
    }
    console.log('🛑 Analytics refresh jobs stopped');
  }

  /**
   * Get dashboard metrics (optimized queries using materialized views)
   */
  async getDashboardMetrics(companyId: string, dateRange: { start: Date; end: Date }) {
    try {
      // Today's real-time metrics
      const todayResult = await pool.query(`
        SELECT * FROM todays_sales WHERE company_id = $1
      `, [companyId]);

      // Historical data from materialized view (fast!)
      const trendResult = await pool.query(`
        SELECT
          sale_date,
          total_revenue,
          transaction_count,
          avg_transaction_value,
          unique_customers
        FROM daily_sales_summary
        WHERE company_id = $1
          AND sale_date >= $2
          AND sale_date <= $3
        ORDER BY sale_date DESC
      `, [companyId, dateRange.start, dateRange.end]);

      // Top products from materialized view
      const topProductsResult = await pool.query(`
        SELECT
          product_id,
          name,
          category,
          total_quantity_sold,
          total_revenue,
          total_profit
        FROM product_performance
        WHERE company_id = $1
        ORDER BY total_revenue DESC
        LIMIT 10
      `, [companyId]);

      // Payment method breakdown
      const paymentBreakdownResult = await pool.query(`
        SELECT
          SUM(cash_revenue) as cash,
          SUM(card_revenue) as card,
          SUM(upi_revenue) as upi,
          SUM(wallet_revenue) as wallet
        FROM daily_sales_summary
        WHERE company_id = $1
          AND sale_date >= $2
          AND sale_date <= $3
      `, [companyId, dateRange.start, dateRange.end]);

      // Customer segments
      const customerSegmentsResult = await pool.query(`
        SELECT
          customer_segment,
          COUNT(*) as count,
          SUM(total_spent) as total_revenue,
          AVG(avg_order_value) as avg_order_value
        FROM customer_insights
        WHERE company_id = $1
        GROUP BY customer_segment
        ORDER BY total_revenue DESC
      `, [companyId]);

      // Low stock alerts
      const lowStockResult = await pool.query(`
        SELECT * FROM low_stock_products
        WHERE company_id = $1
        LIMIT 10
      `, [companyId]);

      return {
        today: todayResult.rows[0] || {},
        salesTrend: trendResult.rows,
        topProducts: topProductsResult.rows,
        paymentBreakdown: paymentBreakdownResult.rows[0] || {},
        customerSegments: customerSegmentsResult.rows,
        lowStock: lowStockResult.rows,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get hourly sales pattern for heatmap
   */
  async getHourlySalesPattern(companyId: string) {
    try {
      const result = await pool.query(`
        SELECT
          hour_of_day,
          day_of_week,
          transaction_count,
          total_revenue
        FROM hourly_sales_pattern
        WHERE company_id = $1
        ORDER BY day_of_week, hour_of_day
      `, [companyId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching hourly pattern:', error);
      throw error;
    }
  }
}

export const analyticsRefreshService = new AnalyticsRefreshService();
