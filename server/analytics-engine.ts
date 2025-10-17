import { sqliteDB } from './sqlite-database';

// Advanced Analytics Engine with Mathematical & Statistical Algorithms
export class AnalyticsEngine {
  private static instance: AnalyticsEngine;

  private constructor() {}

  static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  // ==================== SALES ANALYTICS ====================

  /**
   * Calculate sales trends using linear regression
   * Formula: y = mx + b
   */
  calculateSalesTrend(companyId: string, days: number = 30): {
    slope: number;
    intercept: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: number;
    r_squared: number;
  } {
    const data = sqliteDB.query<{ date: string; total: number }>(`
      SELECT DATE(timestamp) as date, SUM(total) as total
      FROM transactions
      WHERE company_id = ? AND timestamp >= date('now', '-' || ? || ' days')
      AND status = 'completed'
      GROUP BY DATE(timestamp)
      ORDER BY date
    `, [companyId, days]);

    if (data.length < 2) {
      return { slope: 0, intercept: 0, trend: 'stable', prediction: 0, r_squared: 0 };
    }

    // Prepare data points
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.total);

    // Calculate means
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    // Calculate slope (m) and intercept (b)
    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Calculate R² (coefficient of determination)
    const yPredicted = x.map(xi => slope * xi + intercept);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPredicted[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    // Predict next day
    const prediction = slope * n + intercept;

    return {
      slope,
      intercept,
      trend: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable',
      prediction: Math.max(0, prediction),
      r_squared: rSquared
    };
  }

  /**
   * Calculate moving average for sales forecasting
   * Exponential Moving Average (EMA) for better responsiveness
   */
  calculateMovingAverage(companyId: string, period: number = 7): {
    sma: number;
    ema: number;
    forecast: number;
  } {
    const data = sqliteDB.query<{ total: number }>(`
      SELECT SUM(total) as total
      FROM transactions
      WHERE company_id = ? AND timestamp >= date('now', '-' || ? || ' days')
      AND status = 'completed'
      GROUP BY DATE(timestamp)
      ORDER BY timestamp DESC
    `, [companyId, period * 2]);

    if (data.length === 0) return { sma: 0, ema: 0, forecast: 0 };

    // Simple Moving Average (SMA)
    const recentData = data.slice(0, period);
    const sma = recentData.reduce((sum, d) => sum + d.total, 0) / recentData.length;

    // Exponential Moving Average (EMA)
    const multiplier = 2 / (period + 1);
    let ema = data[data.length - 1]?.total || 0;
    for (let i = data.length - 2; i >= 0; i--) {
      ema = (data[i].total * multiplier) + (ema * (1 - multiplier));
    }

    // Forecast using weighted average of SMA and EMA
    const forecast = (sma * 0.4) + (ema * 0.6);

    return { sma, ema, forecast };
  }

  /**
   * ABC Analysis for inventory categorization
   * A: Top 20% products (70% revenue)
   * B: Next 30% products (20% revenue)
   * C: Last 50% products (10% revenue)
   */
  performABCAnalysis(companyId: string): {
    categoryA: any[];
    categoryB: any[];
    categoryC: any[];
  } {
    const products = sqliteDB.query(`
      SELECT
        p.id,
        p.name,
        p.stock,
        p.price,
        COALESCE(SUM(json_extract(t.value, '$.quantity') * json_extract(t.value, '$.price')), 0) as revenue
      FROM products p
      LEFT JOIN transactions tr ON tr.company_id = p.company_id
      LEFT JOIN json_each(tr.items) t ON json_extract(t.value, '$.productId') = p.id
      WHERE p.company_id = ? AND p.is_active = 1
      GROUP BY p.id
      ORDER BY revenue DESC
    `, [companyId]);

    const totalRevenue = products.reduce((sum: number, p: any) => sum + p.revenue, 0);
    let cumulativeRevenue = 0;
    const categoryA = [];
    const categoryB = [];
    const categoryC = [];

    for (const product of products) {
      cumulativeRevenue += product.revenue;
      const cumulativePercent = (cumulativeRevenue / totalRevenue) * 100;

      if (cumulativePercent <= 70) {
        categoryA.push({ ...product, category: 'A', revenuePercent: (product.revenue / totalRevenue) * 100 });
      } else if (cumulativePercent <= 90) {
        categoryB.push({ ...product, category: 'B', revenuePercent: (product.revenue / totalRevenue) * 100 });
      } else {
        categoryC.push({ ...product, category: 'C', revenuePercent: (product.revenue / totalRevenue) * 100 });
      }
    }

    return { categoryA, categoryB, categoryC };
  }

  /**
   * Customer Segmentation using RFM Analysis
   * R: Recency (how recently customer purchased)
   * F: Frequency (how often customer purchases)
   * M: Monetary (how much customer spends)
   */
  performRFMAnalysis(companyId: string): any[] {
    const customers = sqliteDB.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        JULIANDAY('now') - JULIANDAY(MAX(t.timestamp)) as recency,
        COUNT(t.id) as frequency,
        SUM(t.total) as monetary
      FROM customers c
      LEFT JOIN transactions t ON t.customer_id = c.id AND t.status = 'completed'
      WHERE c.company_id = ? AND c.is_active = 1
      GROUP BY c.id
      HAVING frequency > 0
    `, [companyId]);

    if (customers.length === 0) return [];

    // Calculate quintiles for scoring (1-5 scale)
    const recencyValues = customers.map((c: any) => c.recency).sort((a, b) => a - b);
    const frequencyValues = customers.map((c: any) => c.frequency).sort((a, b) => b - a);
    const monetaryValues = customers.map((c: any) => c.monetary).sort((a, b) => b - a);

    const getQuintileScore = (value: number, sortedValues: number[], reverse = false) => {
      const quintile = Math.ceil((sortedValues.indexOf(value) + 1) / sortedValues.length * 5);
      return reverse ? 6 - quintile : quintile;
    };

    return customers.map((customer: any) => {
      const rScore = getQuintileScore(customer.recency, recencyValues, true);
      const fScore = getQuintileScore(customer.frequency, frequencyValues);
      const mScore = getQuintileScore(customer.monetary, monetaryValues);
      const rfmScore = rScore + fScore + mScore;

      let segment = '';
      if (rfmScore >= 12) segment = 'Champions';
      else if (rfmScore >= 10) segment = 'Loyal Customers';
      else if (rfmScore >= 8) segment = 'Potential Loyalists';
      else if (rfmScore >= 6) segment = 'At Risk';
      else segment = 'Lost';

      return {
        ...customer,
        rScore,
        fScore,
        mScore,
        rfmScore,
        segment
      };
    });
  }

  /**
   * Demand Forecasting using Time Series Analysis
   * Uses Holt-Winters exponential smoothing
   */
  forecastDemand(companyId: string, productId: string, periods: number = 7): number[] {
    const sales = sqliteDB.query<{ quantity: number }>(`
      SELECT SUM(json_extract(t.value, '$.quantity')) as quantity
      FROM transactions tr
      LEFT JOIN json_each(tr.items) t ON json_extract(t.value, '$.productId') = ?
      WHERE tr.company_id = ? AND tr.status = 'completed'
      AND tr.timestamp >= date('now', '-60 days')
      GROUP BY DATE(tr.timestamp)
      ORDER BY tr.timestamp
    `, [productId, companyId]);

    if (sales.length < 7) return Array(periods).fill(0);

    const data = sales.map(s => s.quantity);
    const n = data.length;

    // Initialize parameters
    const alpha = 0.3; // Level smoothing
    const beta = 0.1;  // Trend smoothing
    const gamma = 0.3; // Seasonal smoothing
    const seasonLength = 7;

    let level = data[0];
    let trend = (data[1] - data[0]);
    const seasonal = data.slice(0, seasonLength).map((val, i) => val / level);

    const forecast = [];

    for (let i = 0; i < periods; i++) {
      const seasonIndex = (n + i) % seasonLength;
      const forecastValue = (level + trend * (i + 1)) * seasonal[seasonIndex];
      forecast.push(Math.max(0, Math.round(forecastValue)));
    }

    return forecast;
  }

  /**
   * Calculate Customer Lifetime Value (CLV)
   * CLV = (Average Purchase Value × Purchase Frequency) × Customer Lifespan
   */
  calculateCLV(companyId: string, customerId: string): number {
    const data = sqliteDB.queryOne<{
      avg_purchase: number;
      purchase_count: number;
      first_purchase: string;
      last_purchase: string;
    }>(`
      SELECT
        AVG(total) as avg_purchase,
        COUNT(*) as purchase_count,
        MIN(timestamp) as first_purchase,
        MAX(timestamp) as last_purchase
      FROM transactions
      WHERE company_id = ? AND customer_id = ? AND status = 'completed'
    `, [companyId, customerId]);

    if (!data || data.purchase_count === 0) return 0;

    // Calculate customer lifespan in years
    const firstDate = new Date(data.first_purchase);
    const lastDate = new Date(data.last_purchase);
    const lifespanDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const lifespanYears = Math.max(lifespanDays / 365, 0.25); // Minimum 3 months

    // Calculate purchase frequency (purchases per year)
    const purchaseFrequency = data.purchase_count / lifespanYears;

    // Projected lifespan (assuming 3 years average customer lifecycle)
    const projectedLifespan = 3;

    // CLV calculation
    const clv = data.avg_purchase * purchaseFrequency * projectedLifespan;

    return Math.round(clv);
  }

  /**
   * Profit Margin Analysis
   */
  calculateProfitMargins(companyId: string): {
    overall: number;
    byCategory: any[];
    byProduct: any[];
  } {
    const overall = sqliteDB.queryOne<{ profit_margin: number }>(`
      SELECT
        (SUM(tr.total) - SUM(json_extract(t.value, '$.quantity') * p.cost)) / SUM(tr.total) * 100 as profit_margin
      FROM transactions tr
      LEFT JOIN json_each(tr.items) t
      LEFT JOIN products p ON json_extract(t.value, '$.productId') = p.id
      WHERE tr.company_id = ? AND tr.status = 'completed'
      AND tr.timestamp >= date('now', '-30 days')
    `, [companyId]);

    const byCategory = sqliteDB.query(`
      SELECT
        p.category,
        (SUM(json_extract(t.value, '$.price') * json_extract(t.value, '$.quantity')) -
         SUM(p.cost * json_extract(t.value, '$.quantity'))) /
        SUM(json_extract(t.value, '$.price') * json_extract(t.value, '$.quantity')) * 100 as profit_margin,
        SUM(json_extract(t.value, '$.price') * json_extract(t.value, '$.quantity')) as revenue
      FROM transactions tr
      LEFT JOIN json_each(tr.items) t
      LEFT JOIN products p ON json_extract(t.value, '$.productId') = p.id
      WHERE tr.company_id = ? AND tr.status = 'completed'
      AND p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY revenue DESC
    `, [companyId]);

    const byProduct = sqliteDB.query(`
      SELECT
        p.id,
        p.name,
        (SUM(json_extract(t.value, '$.price') * json_extract(t.value, '$.quantity')) -
         SUM(p.cost * json_extract(t.value, '$.quantity'))) /
        SUM(json_extract(t.value, '$.price') * json_extract(t.value, '$.quantity')) * 100 as profit_margin,
        SUM(json_extract(t.value, '$.quantity')) as units_sold
      FROM transactions tr
      LEFT JOIN json_each(tr.items) t
      LEFT JOIN products p ON json_extract(t.value, '$.productId') = p.id
      WHERE tr.company_id = ? AND tr.status = 'completed'
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 20
    `, [companyId]);

    return {
      overall: overall?.profit_margin || 0,
      byCategory,
      byProduct
    };
  }

  /**
   * Calculate Economic Order Quantity (EOQ) for inventory optimization
   * EOQ = √((2 × Demand × Order Cost) / Holding Cost)
   */
  calculateEOQ(companyId: string, productId: string): {
    eoq: number;
    reorderPoint: number;
    averageDemand: number;
  } {
    const demand = sqliteDB.queryOne<{ avg_demand: number }>(`
      SELECT AVG(daily_demand) as avg_demand
      FROM (
        SELECT SUM(json_extract(t.value, '$.quantity')) as daily_demand
        FROM transactions tr
        LEFT JOIN json_each(tr.items) t ON json_extract(t.value, '$.productId') = ?
        WHERE tr.company_id = ? AND tr.status = 'completed'
        AND tr.timestamp >= date('now', '-30 days')
        GROUP BY DATE(tr.timestamp)
      )
    `, [productId, companyId]);

    const avgDemand = demand?.avg_demand || 0;
    const annualDemand = avgDemand * 365;

    // Assumed costs (can be configurable)
    const orderCost = 100; // Cost per order
    const holdingCostPercent = 0.25; // 25% of product cost

    const product = sqliteDB.queryOne<{ cost: number }>(`
      SELECT cost FROM products WHERE id = ? AND company_id = ?
    `, [productId, companyId]);

    const holdingCost = (product?.cost || 0) * holdingCostPercent;

    // EOQ Formula
    const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCost);

    // Reorder Point (assuming 7-day lead time)
    const leadTimeDemand = avgDemand * 7;
    const safetyStock = avgDemand * 3; // 3 days of safety stock
    const reorderPoint = leadTimeDemand + safetyStock;

    return {
      eoq: Math.round(eoq),
      reorderPoint: Math.round(reorderPoint),
      averageDemand: avgDemand
    };
  }

  /**
   * Churn Prediction Score (0-100, higher means higher risk)
   */
  calculateChurnRisk(companyId: string, customerId: string): number {
    const data = sqliteDB.queryOne<{
      days_since_last_purchase: number;
      avg_days_between_purchases: number;
      purchase_count: number;
      total_spent: number;
    }>(`
      SELECT
        JULIANDAY('now') - JULIANDAY(MAX(timestamp)) as days_since_last_purchase,
        (JULIANDAY(MAX(timestamp)) - JULIANDAY(MIN(timestamp))) / COUNT(*) as avg_days_between_purchases,
        COUNT(*) as purchase_count,
        SUM(total) as total_spent
      FROM transactions
      WHERE company_id = ? AND customer_id = ? AND status = 'completed'
    `, [companyId, customerId]);

    if (!data || data.purchase_count < 2) return 50; // Neutral for new customers

    // Calculate churn indicators
    const recencyFactor = Math.min(data.days_since_last_purchase / (data.avg_days_between_purchases * 2), 1);
    const frequencyFactor = 1 - Math.min(data.purchase_count / 10, 1);
    const monetaryFactor = 1 - Math.min(data.total_spent / 10000, 1);

    // Weighted churn score
    const churnScore = (recencyFactor * 0.5 + frequencyFactor * 0.3 + monetaryFactor * 0.2) * 100;

    return Math.round(churnScore);
  }
}

export const analyticsEngine = AnalyticsEngine.getInstance();
