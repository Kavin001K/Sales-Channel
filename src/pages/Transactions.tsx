import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { getTransactions, saveTransaction, updateTransaction } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { thermalPrinter, ReceiptData } from '@/lib/thermalPrinter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Search, Filter, Receipt, Printer, Eye, Edit, Save, X } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [reprintCount, setReprintCount] = useState(0);
  const [isReprintDialogOpen, setIsReprintDialogOpen] = useState(false);
  
  const { company, employee } = useAuth();
  const { companySettings, printSettings } = useSettings();

  // Test function to create a sample transaction
  const createTestTransaction = async () => {
    if (!company?.id) {
      toast({
        title: "Error",
        description: "No company ID available",
        variant: "destructive",
      });
      return;
    }

    try {
      const testTransaction: Transaction = {
        id: `TEST-${Date.now()}`,
        companyId: company.id,
        employeeId: employee?.id || 'test-employee',
        employeeName: employee?.name || 'Test Employee',
        customerName: 'Test Customer',
        customerPhone: '1234567890',
        items: [
          {
            productId: 'test-product-1',
            name: 'Test Product 1',
            price: 100.00,
            quantity: 2,
            total: 200.00
          },
          {
            productId: 'test-product-2',
            name: 'Test Product 2',
            price: 50.00,
            quantity: 1,
            total: 50.00
          }
        ],
        subtotal: 250.00,
        tax: 45.00,
        discount: 0,
        total: 295.00,
        paymentMethod: 'cash',
        paymentDetails: {
          cashAmount: 300.00,
          change: 5.00
        },
        timestamp: new Date(),
        status: 'completed'
      };

      console.log('Creating test transaction:', testTransaction);
      const savedTransaction = await saveTransaction(testTransaction);
      console.log('Test transaction saved:', savedTransaction);
      
      toast({
        title: "Success",
        description: "Test transaction created successfully",
      });

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('transactionUpdated'));
      
      // Reload transactions
      const data = await getTransactions(company.id);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error creating test transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create test transaction",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadTransactions = async () => {
      if (!company) return;
      
      try {
        setLoading(true);
        const data = await getTransactions(company?.id);
        console.log('Loading transactions for company:', company?.id);
        console.log('Loaded transactions:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
        console.log('Transaction count:', Array.isArray(data) ? data.length : 0);
        
        // Ensure we always have an array
        const transactionArray = Array.isArray(data) ? data : [];
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

  // Add refresh function that can be called from other components
  const refreshTransactions = async () => {
    if (!company) return;
    
    try {
      setLoading(true);
      const data = await getTransactions(company?.id);
      const transactionArray = Array.isArray(data) ? data : [];
      setTransactions(transactionArray);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      toast({
        title: "Error",
        description: "Failed to refresh transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen for transaction updates from other components
  useEffect(() => {
    const handleTransactionUpdate = () => {
      refreshTransactions();
    };

    window.addEventListener('transactionUpdated', handleTransactionUpdate);
    return () => {
      window.removeEventListener('transactionUpdated', handleTransactionUpdate);
    };
  }, [company]);

  // Reprint function with proper labeling
  const handleReprint = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReprintDialogOpen(true);
  };

  // Confirm reprint
  const confirmReprint = async () => {
    if (!selectedTransaction) return;
    
    const newReprintCount = reprintCount + 1;
    setReprintCount(newReprintCount);
    setIsReprintDialogOpen(false);
    
    const transaction = selectedTransaction;
    
    // Prepare receipt data for thermal printer
    const receiptData: ReceiptData = {
      companyName: companySettings?.name || 'ACE Business',
      companyAddress: companySettings?.address || '',
      companyPhone: companySettings?.phone || '',
      companyTaxId: companySettings?.taxId || '',
      receiptNumber: transaction.id,
      date: new Date(transaction.timestamp).toLocaleString(),
      cashierName: transaction.employeeName || 'Unknown',
      customerName: transaction.customerName || 'Walk-in Customer',
      items: transaction.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      subtotal: transaction.subtotal,
      tax: transaction.tax,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      paymentDetails: transaction.paymentDetails,
      isReprint: true,
      reprintCount: newReprintCount
    };

    // Print receipt using thermal printer service
    const printSuccess = await thermalPrinter.printReceipt(receiptData);
    
    if (printSuccess) {
      toast({
        title: "Success",
        description: `Receipt reprinted successfully! (Reprint #${newReprintCount})`,
      });
    } else {
      toast({
        title: "Warning",
        description: "Reprint failed - check printer connection",
        variant: "destructive",
      });
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({ ...transaction });
    setIsEditDialogOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (!editingTransaction) return;

    try {
      // Save transaction with cloud backup
              await updateTransaction(editingTransaction.id, editingTransaction);
      
      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id ? editingTransaction : t
      ));
      
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      
      toast({
        title: "Transaction Updated",
        description: "Transaction saved and backed up to cloud successfully!",
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Update Error",
        description: "Transaction saved locally but cloud backup failed",
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-gray-600 mt-2 text-lg">View and manage all sales transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={createTestTransaction}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Test Transaction
          </Button>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="text-sm font-medium">Total Revenue</div>
            <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as 'all' | 'today' | 'week' | 'month')}>
              <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
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
              <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
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
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <CardDescription className="text-green-100">
            Showing {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Receipt className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <TableHead className="font-bold text-gray-700 py-4">Transaction ID</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Date & Time</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Customer</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Items</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Payment Method</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Payment Details</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Employee</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4 text-right">Total</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4">Status</TableHead>
                    <TableHead className="font-bold text-gray-700 py-4 text-center">Actions</TableHead>
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
                          {transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount && (
                            <div className="text-muted-foreground">
                              Cash: ₹{transaction.paymentDetails.cashAmount.toFixed(2)}
                            </div>
                          )}
                          {transaction.paymentMethod === 'card' && transaction.paymentDetails?.cardAmount && (
                            <div className="text-muted-foreground">
                              Card: ₹{transaction.paymentDetails.cardAmount.toFixed(2)}
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
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReprint(transaction)}
                            className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                            title="Reprint Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="h-9 w-9 p-0 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Transaction ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Date & Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedTransaction.timestamp), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Customer</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.customerName || 'Walk-in Customer'}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Employee</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.employeeName || 'System'}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Payment Method</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.paymentMethod?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge variant={
                    selectedTransaction.status === 'completed' ? 'default' :
                    selectedTransaction.status === 'refunded' ? 'destructive' : 'secondary'
                  }>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Items</Label>
                <div className="mt-2 border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="font-semibold">Subtotal</Label>
                  <p className="text-lg font-bold">₹{selectedTransaction.subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tax</Label>
                  <p className="text-lg font-bold">₹{selectedTransaction.tax.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Total</Label>
                  <p className="text-lg font-bold">₹{selectedTransaction.total.toFixed(2)}</p>
                </div>
              </div>
              
              {selectedTransaction.notes && (
                <div>
                  <Label className="font-semibold">Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={editingTransaction.customerName || ''}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      customerName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={editingTransaction.paymentMethod || 'cash'}
                    onValueChange={(value) => setEditingTransaction({
                      ...editingTransaction,
                      paymentMethod: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingTransaction.status || 'completed'}
                    onValueChange={(value) => setEditingTransaction({
                      ...editingTransaction,
                      status: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="total">Total Amount</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={editingTransaction.total}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      total: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editingTransaction.notes || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    notes: e.target.value
                  })}
                  placeholder="Add any additional notes..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingTransaction(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTransaction}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reprint Confirmation Dialog */}
      <Dialog open={isReprintDialogOpen} onOpenChange={setIsReprintDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Printer className="h-5 w-5" />
              Reprint Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-700 mb-2">
                Are you sure you want to reprint the receipt for transaction:
              </p>
              <div className="font-mono text-sm bg-white p-2 rounded border">
                {selectedTransaction?.id.slice(-8)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Customer: <span className="font-medium">{selectedTransaction?.customerName || 'Walk-in Customer'}</span>
              </p>
              <p className="text-sm text-gray-600">
                Amount: <span className="font-bold text-green-600">₹{selectedTransaction?.total.toFixed(2)}</span>
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsReprintDialogOpen(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReprint}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Reprint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}