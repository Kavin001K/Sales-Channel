import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings,
  TrendingUp,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';
export default function Index() {
  // Mock data for demonstration
  const stats = [
    { title: 'Today\'s Sales', value: '₹12,345', icon: DollarSign, trend: '+12%', trendDirection: 'up' as const },
    { title: 'Products Sold', value: '89', icon: Package, trend: '+8%', trendDirection: 'up' as const },
    { title: 'Active Customers', value: '156', icon: Users, trend: '+24%', trendDirection: 'up' as const },
    { title: 'Total Transactions', value: '23', icon: Receipt, trend: '+5%', trendDirection: 'up' as const },
  ];

  const quickActions = [
    { title: 'New Sale', description: 'Start a new transaction', icon: ShoppingCart, href: '/sales', color: 'bg-blue-500' },
    { title: 'Add Product', description: 'Add new inventory item', icon: Package, href: '/products', color: 'bg-green-500' },
    { title: 'Add Customer', description: 'Register new customer', icon: Users, href: '/customers', color: 'bg-purple-500' },
    { title: 'View Reports', description: 'Check sales analytics', icon: BarChart3, href: '/reports', color: 'bg-orange-500' },
  ];

  const recentActivity = [
    { action: 'Sale completed', amount: '₹1,250', time: '2 min ago', customer: 'John Doe' },
    { action: 'Product added', amount: '₹850', time: '15 min ago', customer: 'Jane Smith' },
    { action: 'Refund processed', amount: '₹420', time: '1 hour ago', customer: 'Mike Johnson' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ace-Bill Dashboard</h1>
        <p className="text-muted-foreground">Manage your point of sale operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={stat.trendDirection === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">{item.customer} • {item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Week</span>
                <span className="text-lg font-bold">₹45,678</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Week</span>
                <span className="text-lg font-bold text-muted-foreground">₹38,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Growth</span>
                <Badge className="bg-green-100 text-green-800">+19.5%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
