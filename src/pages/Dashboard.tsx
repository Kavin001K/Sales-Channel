import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTransactions, getProducts, getCustomers } from '@/lib/storage';
import { Transaction, Product, InventoryAlert } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getInvoices, getInvoiceStats } from '@/lib/invoice-utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  LogOut,
  Sun,
  Moon,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { logout, logoutEmployee, employee } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    transactions: 0,
    customers: 0,
    averageTransaction: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allTransactions = await getTransactions();
      const allProducts = await getProducts();
      const allCustomers = await getCustomers();
      const allInvoices = getInvoices();

      // Ensure we have arrays
      const transactionsArray = Array.isArray(allTransactions) ? allTransactions : [];
      const productsArray = Array.isArray(allProducts) ? allProducts : [];
      const customersArray = Array.isArray(allCustomers) ? allCustomers : [];
      const invoicesArray = Array.isArray(allInvoices) ? allInvoices : [];

      setTransactions(transactionsArray);
      setProducts(productsArray);
      setInvoices(invoicesArray);

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayTransactions = transactionsArray.filter(t => {
        const transactionDate = new Date(t.timestamp);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === today.getTime();
      });

      const todaySales = Array.isArray(todayTransactions) ? todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0) : 0;
      const uniqueCustomers = new Set(Array.isArray(todayTransactions) ? todayTransactions.map(t => t.customerId).filter(Boolean) : []).size;

      setTodayStats({
        sales: todaySales,
        transactions: todayTransactions.length,
        customers: uniqueCustomers,
        averageTransaction: todayTransactions.length > 0 ? todaySales / todayTransactions.length : 0
      });

      // Check inventory alerts
      const alerts: InventoryAlert[] = productsArray
        .filter(p => p.stock <= p.minStock)
        .map(p => ({
          product: p,
          currentStock: p.stock,
          minStock: p.minStock,
          type: p.stock === 0 ? 'out_of_stock' : 'low_stock'
        }));

      setInventoryAlerts(alerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
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

  const handleLogout = () => {
    if (employee) {
      // If employee is logged in, logout employee only
      logoutEmployee();
    } else {
      // If no employee, logout completely
      logout();
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle dark mode class on document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleDarkMode}
                className="flex items-center gap-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {employee ? 'Logout Employee' : 'Logout'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Logout from the current session</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayStats.sales.toFixed(2)}</div>
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
            <div className="text-2xl font-bold">₹{todayStats.averageTransaction.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2.3% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInvoiceStats(invoices).total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-600">{getInvoiceStats(invoices).paid} paid</span>
              <span className="mx-1">•</span>
              <span className="text-yellow-600">{getInvoiceStats(invoices).pending} pending</span>
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
                    <p className="font-medium">₹{transaction.total.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
              {getRecentTransactions().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent transactions</p>
                  <p className="text-sm">Start making sales to see them here</p>
                </div>
              )}
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
              {inventoryAlerts.map((alert) => (
                <div key={alert.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{alert.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {alert.currentStock} {alert.product.unit}
                      </p>
                    </div>
                  </div>
                  <Badge variant={alert.type === 'out_of_stock' ? 'destructive' : 'secondary'}>
                    {alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
              ))}
              {inventoryAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No inventory alerts</p>
                  <p className="text-sm">All products are well stocked!</p>
                </div>
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
              <div className="text-3xl font-bold text-green-600">₹{weeklyStats.sales.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{weeklyStats.transactions}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">+{weeklyStats.growth}%</div>
              <div className="text-sm text-muted-foreground">Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}