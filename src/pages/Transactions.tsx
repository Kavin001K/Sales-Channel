import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { transactionService } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, Receipt, Printer } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card'>('all');
  const [loading, setLoading] = useState(true);
  
  const { company } = useAuth();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!company) return;
      
      try {
        setLoading(true);
        const data = await transactionService.getAll();
        console.log('Loaded transactions:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
        
        // Ensure we always have an array
        const transactionArray = Array.isArray(data) ? data : [];
        
        // If you want to filter by company, uncomment the next line:
        // const filtered = transactionArray.filter((t: Transaction) => t.companyId === company.id);
        setTransactions(transactionArray);
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [company]);

  const handleReprint = async (transaction: Transaction) => {
    try {
      // Here you would typically call a print service
      // For now, we'll simulate printing by showing a toast
      toast({
        title: "Reprinting Receipt",
        description: `Reprinting receipt for transaction ${transaction.id.slice(-8)}`,
      });
      
      // Simulate print delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Receipt Printed",
        description: "Receipt has been sent to the printer",
      });
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Failed to print receipt",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
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
          startDate = new Date(0);
          endDate = now;
      }

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === paymentFilter);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, searchQuery, dateFilter, paymentFilter]);

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all sales transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Total: ₹{totalAmount.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as 'all' | 'today' | 'week' | 'month')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as 'all' | 'cash' | 'card')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(transaction.timestamp), 'MMM dd, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(transaction.timestamp), 'hh:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.customerName || 'Walk-in Customer'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.paymentMethod === 'cash' ? 'default' : 'secondary'}>
                          {transaction.paymentMethod?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Paid: ₹{transaction.total.toFixed(2)}</div>
                          {transaction.paymentMethod === 'cash' && (
                            <div className="text-muted-foreground">
                              Cash Payment
                            </div>
                          )}
                          {transaction.paymentMethod === 'card' && (
                            <div className="text-muted-foreground">
                              Card Payment
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.employeeName || 'System'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{transaction.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'refunded' ? 'destructive' : 'secondary'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReprint(transaction)}
                          className="h-8 w-8 p-0"
                          title="Reprint Receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}