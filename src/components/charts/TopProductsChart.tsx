import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface TopProductsChartProps {
  data: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  currency?: string;
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
];

export function TopProductsChart({ data, currency = '₹' }: TopProductsChartProps) {
  // Take top 10 and sort by revenue
  const chartData = data
    .slice(0, 10)
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Top 10 Products</h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />

          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
          />

          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            width={120}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'revenue') {
                return [`${currency}${value.toLocaleString()}`, 'Revenue'];
              }
              return [value.toLocaleString(), 'Quantity'];
            }}
          />

          <Bar
            dataKey="revenue"
            radius={[0, 8, 8, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <p className="text-sm text-neutral">Total Revenue from Top 10</p>
        <p className="text-2xl font-bold text-primary">
          {currency}{chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
