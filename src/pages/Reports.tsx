import { useState, useEffect, useMemo } from 'react';
import { Transaction, Product, Employee, Customer } from '@/lib/types';
import { getTransactions, getProducts, getEmployees, getCustomers } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Calendar, Download, FileSpreadsheet } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, getHours } from 'date-fns';
import * as XLSX from 'xlsx';
import { printDriver } from '@/lib/printDrivers';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());
    setEmployees(getEmployees());
    setCustomers(getCustomers());
  }, []);

  const filteredTransactions = useMemo(() => {
    if (dateFilter === 'all') return transactions;

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      default:
        return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });
  }, [transactions, dateFilter]);

  // Sales Overview
  const salesOverview = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    const totalCost = filteredTransactions.reduce((sum, transaction) => {
      return sum + transaction.items.reduce((itemSum, item) => {
        return itemSum + (item.product.cost * item.quantity);
      }, 0);
    }, 0);
    
    const totalProfit = totalSales - totalCost;

    return { totalSales, totalTransactions, averageTransaction, totalProfit };
  }, [filteredTransactions]);

  // Item-wise Sales
  const itemWiseSales = useMemo(() => {
    const itemMap = new Map<string, { product: Product; quantity: number; revenue: number; profit: number }>();
    
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const key = item.product.id;
        const existing = itemMap.get(key);
        const revenue = item.product.price * item.quantity;
        const cost = item.product.cost * item.quantity;
        const profit = revenue - cost;
        
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += revenue;
          existing.profit += profit;
        } else {
          itemMap.set(key, {
            product: item.product,
            quantity: item.quantity,
            revenue,
            profit
          });
        }
      });
    });
    
    return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions]);

  // Employee-wise Sales
  const employeeWiseSales = useMemo(() => {
    const employeeMap = new Map<string, { name: string; transactions: number; revenue: number }>();
    
    filteredTransactions.forEach(transaction => {
      const employeeName = transaction.employeeName || 'System';
      const existing = employeeMap.get(employeeName);
      
      if (existing) {
        existing.transactions += 1;
        existing.revenue += transaction.total;
      } else {
        employeeMap.set(employeeName, {
          name: employeeName,
          transactions: 1,
          revenue: transaction.total
        });
      }
    });
    
    return Array.from(employeeMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions]);

  // Daily Sales (for charts)
  const dailySales = useMemo(() => {
    if (dateFilter === 'today') {
      // Hourly breakdown for today
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        time: `${hour}:00`,
        sales: 0,
        transactions: 0
      }));
      
      filteredTransactions.forEach(transaction => {
        const hour = getHours(new Date(transaction.timestamp));
        hourlyData[hour].sales += transaction.total;
        hourlyData[hour].transactions += 1;
      });
      
      return hourlyData.filter(data => data.sales > 0 || data.transactions > 0);
    } else {
      // Daily breakdown
      const now = new Date();
      const startDate = dateFilter === 'week' ? startOfWeek(now) : 
                       dateFilter === 'month' ? startOfMonth(now) : 
                       new Date(now.getFullYear(), 0, 1);
      const endDate = now;
      
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyData = dateRange.map(date => ({
        date: format(date, 'MMM dd'),
        sales: 0,
        transactions: 0
      }));
      
      filteredTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        const dayIndex = dateRange.findIndex(date => 
          format(date, 'yyyy-MM-dd') === format(transactionDate, 'yyyy-MM-dd')
        );
        
        if (dayIndex !== -1) {
          dailyData[dayIndex].sales += transaction.total;
          dailyData[dayIndex].transactions += 1;
        }
      });
      
      return dailyData;
    }
  }, [filteredTransactions, dateFilter]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const breakdown = { cash: 0, card: 0 };
    filteredTransactions.forEach(transaction => {
      breakdown[transaction.paymentMethod] += transaction.total;
    });
    
    return [
      { name: 'Cash', value: breakdown.cash, color: '#8884d8' },
      { name: 'Card', value: breakdown.card, color: '#82ca9d' }
    ].filter(item => item.value > 0);
  }, [filteredTransactions]);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Overview Sheet
    const overviewData = [
      ['Sales Report Overview'],
      ['Generated:', format(new Date(), 'dd/MM/yyyy HH:mm:ss')],
      ['Period:', dateFilter.toUpperCase()],
      [''],
      ['Metric', 'Value'],
      ['Total Sales', `₹${salesOverview.totalSales.toFixed(2)}`],
      ['Total Transactions', salesOverview.totalTransactions.toString()],
      ['Average Transaction', `₹${salesOverview.averageTransaction.toFixed(2)}`],
      ['Total Profit', `₹${salesOverview.totalProfit.toFixed(2)}`],
      [''],
      ['Top Products', 'Quantity Sold', 'Revenue', 'Profit'],
      ...itemWiseSales.slice(0, 10).map(item => [
        item.product.name,
        item.quantity.toString(),
        `₹${item.revenue.toFixed(2)}`,
        `₹${item.profit.toFixed(2)}`
      ])
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
    
    // All Transactions Sheet
    const transactionsData = [
      ['Transaction ID', 'Date', 'Time', 'Customer', 'Employee', 'Items Count', 'Subtotal', 'Tax', 'Total', 'Payment Method', 'Status']
    ];
    filteredTransactions.forEach(transaction => {
      const employee = employees.find(e => e.id === transaction.employeeId);
      transactionsData.push([
        transaction.id,
        format(new Date(transaction.timestamp), 'dd/MM/yyyy'),
        format(new Date(transaction.timestamp), 'HH:mm'),
        transaction.customerName || 'Walk-in Customer',
        employee?.name || 'Unknown',
        transaction.items.length.toString(),
        `₹${transaction.subtotal.toFixed(2)}`,
        `₹${transaction.tax.toFixed(2)}`,
        `₹${transaction.total.toFixed(2)}`,
        transaction.paymentMethod,
        transaction.status
      ]);
    });
    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'All Transactions');
    
    // Product-wise Sales Sheet
    const itemsData = [
      ['Product Name', 'SKU', 'Category', 'Quantity Sold', 'Unit Price', 'Revenue', 'Cost', 'Profit', 'Profit Margin %']
    ];
    itemWiseSales.forEach(item => {
      const totalCost = item.quantity * item.product.cost;
      itemsData.push([
        item.product.name,
        item.product.sku,
        item.product.category,
        item.quantity.toString(),
        `₹${item.product.price.toFixed(2)}`,
        `₹${item.revenue.toFixed(2)}`,
        `₹${totalCost.toFixed(2)}`,
        `₹${item.profit.toFixed(2)}`,
        `${((item.profit / item.revenue) * 100).toFixed(2)}%`
      ]);
    });
    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Product Sales');
    
    // Customer-wise Sales Sheet
    const customerSalesData = [
      ['Customer Name', 'Email', 'Phone', 'Total Purchases', 'Total Amount', 'Average Order', 'Last Purchase', 'Loyalty Points']
    ];
    
    const customerSales = customers.map(customer => {
      const customerTransactions = filteredTransactions.filter(t => t.customerId === customer.id);
      const totalAmount = customerTransactions.reduce((sum, t) => sum + t.total, 0);
      const lastPurchase = customerTransactions.length > 0 
        ? customerTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
        : null;
      
      return {
        customer,
        transactions: customerTransactions.length,
        totalAmount,
        averageOrder: customerTransactions.length > 0 ? totalAmount / customerTransactions.length : 0,
        lastPurchase
      };
    }).filter(cs => cs.transactions > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    customerSales.forEach(cs => {
      customerSalesData.push([
        cs.customer.name,
        cs.customer.email,
        cs.customer.phone,
        cs.transactions.toString(),
        `₹${cs.totalAmount.toFixed(2)}`,
        `₹${cs.averageOrder.toFixed(2)}`,
        cs.lastPurchase ? format(cs.lastPurchase, 'dd/MM/yyyy') : 'N/A',
        cs.customer.loyaltyPoints?.toString() || '0'
      ]);
    });
    const customerSheet = XLSX.utils.aoa_to_sheet(customerSalesData);
    XLSX.utils.book_append_sheet(workbook, customerSheet, 'Customer Sales');
    
    // Employee Performance Sheet
    const employeeData = [
      ['Employee Name', 'Role', 'Transactions', 'Total Revenue', 'Average Transaction', 'Items Sold', 'Commission Rate']
    ];
    employeeWiseSales.forEach(employeePerf => {
      const employee = employees.find(e => e.name === employeePerf.name);
      const employeeTransactions = filteredTransactions.filter(t => t.employeeId === employee?.id);
      const itemsSold = employeeTransactions.reduce((sum, t) => 
        sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
      
      employeeData.push([
        employeePerf.name,
        employee?.role || 'Unknown',
        employeePerf.transactions.toString(),
        `₹${employeePerf.revenue.toFixed(2)}`,
        `₹${(employeePerf.revenue / employeePerf.transactions).toFixed(2)}`,
        itemsSold.toString(),
        `₹${employee?.hourlyRate?.toFixed(2) || '0.00'}/hr`
      ]);
    });
    const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee Performance');
    
    // Daily Sales Sheet
    const salesData = [
      dateFilter === 'today' ? ['Time', 'Sales', 'Transactions', 'Items Sold'] : ['Date', 'Sales', 'Transactions', 'Items Sold']
    ];
    dailySales.forEach(sale => {
      const periodTransactions = dateFilter === 'today' 
        ? filteredTransactions.filter(t => format(t.timestamp, 'HH:mm') === sale.time)
        : filteredTransactions.filter(t => format(t.timestamp, 'dd/MM') === sale.date);
      
      const itemsSold = periodTransactions.reduce((sum, t) => 
        sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
      
      salesData.push([
        dateFilter === 'today' ? sale.time : sale.date,
        `₹${sale.sales.toFixed(2)}`,
        sale.transactions.toString(),
        itemsSold.toString()
      ]);
    });
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Daily Sales');
    
    // Save the file
    XLSX.writeFile(workbook, `sales_report_${dateFilter}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportReport = () => {
    exportToExcel();
  };

  const printReport = async () => {
    const reportContent = `
      Sales Report - ${dateFilter.toUpperCase()}
      Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
      
      Overview:
      - Total Sales: ₹${salesOverview.totalSales.toFixed(2)}
      - Total Transactions: ${salesOverview.totalTransactions}
      - Average Transaction: ₹${salesOverview.averageTransaction.toFixed(2)}
      - Total Profit: ₹${salesOverview.totalProfit.toFixed(2)}
      
      Top Products:
      ${itemWiseSales.slice(0, 5).map((item, index) => 
        `${index + 1}. ${item.product.name} - ${item.quantity} sold - ₹${item.revenue.toFixed(2)}`
      ).join('\n')}
      
      Employee Performance:
      ${employeeWiseSales.slice(0, 5).map((emp, index) => 
        `${index + 1}. ${emp.name} - ${emp.transactions} transactions - ₹${emp.revenue.toFixed(2)}`
      ).join('\n')}
    `;
    
    await printDriver.printText(reportContent);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive sales and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={printReport} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filter by Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesOverview.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {salesOverview.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesOverview.averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesOverview.totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((salesOverview.totalProfit / salesOverview.totalSales) * 100).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Products</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemWiseSales.length}</div>
            <p className="text-xs text-muted-foreground">
              products sold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Item Sales</TabsTrigger>
          <TabsTrigger value="employees">Employee Performance</TabsTrigger>
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemWiseSales.slice(0, 5).map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.revenue.toFixed(2)}</TableCell>
                        <TableCell className={item.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                          ₹{item.profit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Sales breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Item-wise Sales Report</CardTitle>
              <CardDescription>Performance of individual products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Profit Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemWiseSales.map((item) => (
                    <TableRow key={item.product.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.product.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.revenue.toFixed(2)}</TableCell>
                      <TableCell className={item.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{item.profit.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.profit > 0 ? 'default' : 'destructive'}>
                          {((item.profit / item.revenue) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
              <CardDescription>Sales performance by employee</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Average Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeWiseSales.map((employee) => (
                    <TableRow key={employee.name}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.transactions}</TableCell>
                      <TableCell>₹{employee.revenue.toFixed(2)}</TableCell>
                      <TableCell>₹{(employee.revenue / employee.transactions).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>Revenue and transaction trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={dateFilter === 'today' ? 'time' : 'date'} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Analysis</CardTitle>
              <CardDescription>Detailed breakdown of payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                  <div className="space-y-4">
                    {paymentBreakdown.map((method) => (
                      <div key={method.name} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {((method.value / salesOverview.totalSales) * 100).toFixed(1)}% of total sales
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{method.value.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}