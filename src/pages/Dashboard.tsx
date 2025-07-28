import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTransactions, getProducts, getCustomers } from '@/lib/storage';
import { Transaction, Product, InventoryAlert } from '@/lib/types';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    transactions: 0,
    customers: 0,
    averageTransaction: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allTransactions = getTransactions();
    const allProducts = getProducts();
    const allCustomers = getCustomers();

    setTransactions(allTransactions);
    setProducts(allProducts);

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    });

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const uniqueCustomers = new Set(todayTransactions.map(t => t.customerId).filter(Boolean)).size;

    setTodayStats({
      sales: todaySales,
      transactions: todayTransactions.length,
      customers: uniqueCustomers,
      averageTransaction: todayTransactions.length > 0 ? todaySales / todayTransactions.length : 0
    });

    // Check inventory alerts
    const alerts: InventoryAlert[] = allProducts
      .filter(p => p.stock <= p.minStock)
      .map(p => ({
        product: p,
        currentStock: p.stock,
        minStock: p.minStock,
        type: p.stock === 0 ? 'out_of_stock' : 'low_stock'
      }));

    setInventoryAlerts(alerts);
  };

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekTransactions = transactions.filter(t => new Date(t.timestamp) >= weekAgo);
    const weekSales = weekTransactions.reduce((sum, t) => sum + t.total, 0);
    
    return {
      sales: weekSales,
      transactions: weekTransactions.length,
      growth: 12.5 // Mock growth percentage
    };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayStats.sales.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.transactions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.customers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.1% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayStats.averageTransaction.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2.3% from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest sales activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentTransactions().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.customerName || 'Guest'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${transaction.total.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No inventory alerts - all products are well stocked!
                </p>
              ) : (
                inventoryAlerts.map((alert) => (
                  <div key={alert.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.type === 'out_of_stock' ? 'bg-destructive/10' : 'bg-yellow-100'
                      }`}>
                        <Package className={`w-5 h-5 ${
                          alert.type === 'out_of_stock' ? 'text-destructive' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{alert.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.currentStock} left (min: {alert.minStock})
                        </p>
                      </div>
                    </div>
                    <Badge variant={alert.type === 'out_of_stock' ? 'destructive' : 'secondary'}>
                      {alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>Performance summary for the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">${weeklyStats.sales.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{weeklyStats.transactions}</div>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{weeklyStats.growth}%</div>
              <p className="text-sm text-muted-foreground">Growth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}