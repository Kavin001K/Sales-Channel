import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface PaymentMethodsChartProps {
  data: {
    cash: number;
    card: number;
    upi: number;
    wallet: number;
  };
  currency?: string;
}

const COLORS = {
  cash: '#10b981', // Green
  card: '#3b82f6', // Blue
  upi: '#f59e0b', // Orange
  wallet: '#8b5cf6', // Purple
};

const LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  wallet: 'Wallet',
};

export function PaymentMethodsChart({ data, currency = '₹' }: PaymentMethodsChartProps) {
  // Convert to array format for Recharts
  const chartData = Object.entries(data)
    .map(([method, value]) => ({
      name: LABELS[method as keyof typeof LABELS],
      value: value || 0,
      color: COLORS[method as keyof typeof COLORS],
    }))
    .filter(item => item.value > 0); // Only show methods with data

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>

      {total > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1000}
                label={(entry) => `${((entry.value / total) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {currency}{item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral">
                    {((item.value / total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-neutral">Total</p>
            <p className="text-2xl font-bold text-primary">
              {currency}{total.toLocaleString()}
            </p>
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center text-neutral">
          <p>No payment data available</p>
        </div>
      )}
    </motion.div>
  );
}
