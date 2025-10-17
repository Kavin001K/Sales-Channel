import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    revenue: number;
    transactions?: number;
  }>;
  currency?: string;
}

export function SalesTrendChart({ data, currency = '₹' }: SalesTrendChartProps) {
  // Format data for Recharts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    transactions: item.transactions || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 30 Days)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />

          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Revenue']}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-neutral">Total Revenue</p>
          <p className="text-xl font-bold text-primary">
            {currency}{chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral">Avg Daily</p>
          <p className="text-xl font-bold">
            {currency}{(chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral">Transactions</p>
          <p className="text-xl font-bold">
            {chartData.reduce((sum, d) => sum + d.transactions, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
