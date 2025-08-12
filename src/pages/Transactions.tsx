import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { transactionService } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
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
  
  const { company, employee } = useAuth();
  const { companySettings, printSettings } = useSettings();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!company) return;
      
      try {
        setLoading(true);
        const data = await transactionService.getAll(company?.id);
        console.log('Loaded transactions:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
        
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

  // Reprint function with proper labeling
  const handleReprint = async (transaction: Transaction) => {
    const newReprintCount = reprintCount + 1;
    setReprintCount(newReprintCount);
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id} (REPRINT)</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: auto !important; }
            body {
              font-family: 'Courier New', monospace;
              width: ${printSettings.paperSize === 'thermal' ? '300px' : '210mm'};
              margin: 0 auto;
              padding: 10px 0 0 0;
              font-size: ${printSettings.fontSize}px;
              line-height: 1.3;
              background: #fff;
              color: #000;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; color: #000; }
            .store-name { font-size: ${printSettings.fontSize + 4}px; font-weight: bold; color: #000; letter-spacing: 1px; }
            .company-detail { font-weight: bold; color: #000; white-space: pre-line; }
            .reprint-notice { 
              background: #ff0000; 
              color: #fff; 
              text-align: center; 
              padding: 5px; 
              font-weight: bold; 
              margin: 5px 0;
              border: 2px solid #000;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
            th { font-weight: bold; background: #fff; }
            .amount, .total-bold { font-weight: bold; }
            .total-row td { border-top: 2px solid #000; font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: ${printSettings.fontSize - 2}px; color: #000; font-weight: bold; }
            @media print {
              html, body { height: auto !important; }
              body { margin: 0; padding: 0; background: #fff; color: #000; }
              .no-print { display: none; }
              .footer { margin-bottom: 0; color: #000; font-weight: bold; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          <div class="reprint-notice">*** REPRINT - ORIGINAL DATE: ${new Date(transaction.timestamp).toLocaleDateString()} ${new Date(transaction.timestamp).toLocaleTimeString()} ***</div>
          <div class="header">
            <div class="store-name">${companySettings.name}</div>
            <div class="company-detail">${(companySettings.address || '').replace(/\n/g, '<br/>')}</div>
            <div class="company-detail">Phone: ${companySettings.phone}</div>
            ${companySettings.email ? `<div class="company-detail">Email: ${companySettings.email}</div>` : ''}
          </div>
          <div style="margin: 10px 0 10px 0; color: #000; font-weight: bold; text-align: left;">
            <div>Receipt #: ${transaction.id.slice(-8)}</div>
            <div>Date: ${new Date(transaction.timestamp).toLocaleDateString()}</div>
            <div>Time: ${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            <div>Reprint Date: ${new Date().toLocaleDateString()}</div>
            <div>Reprint Time: ${new Date().toLocaleTimeString()}</div>
            ${transaction.employeeName ? `<div>Cashier: ${transaction.employeeName}</div>` : ''}
            ${transaction.customerName ? `<div>Customer: ${transaction.customerName}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:32px">S.No</th>
                <th>PARTICULARS</th>
                <th style="width:40px">QTY</th>
                <th style="width:70px">RATE<br/>M.R.P.</th>
                <th style="width:70px">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>
                    ₹${item.price.toFixed(2)}
                    ${item.mrp ? `<br/><span style='font-size:${printSettings.fontSize - 2}px'>UNT ₹${item.mrp.toFixed(2)}</span>` : ''}
                  </td>
                  <td class="amount">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="border-top: 2px solid #000; margin: 8px 0;"></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Qty : ${transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span>Sub Total <span style="font-weight: bold;">₹${transaction.subtotal.toFixed(2)}</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Round Off</span>
            <span>₹${(Math.round(transaction.total) - transaction.total).toFixed(2)}</span>
          </div>
          <div class="total-row" style="font-size: ${printSettings.fontSize + 2}px; margin-top: 8px;">
            <table style="width:100%; border:none;">
              <tr>
                <td style="border:none; text-align:right; font-weight:bold;">TOTAL</td>
                <td style="border:none; text-align:right; font-weight:bold;">₹ ${Math.round(transaction.total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Savings</span>
            <span>₹${(transaction.items.reduce((sum, item) => sum + ((item.mrp || 0) - item.price) * item.quantity, 0)).toFixed(2)}</span>
          </div>
          <div style="margin: 10px 0; color: #000; font-weight: bold;">
            <div><strong>Payment:</strong> ${transaction.paymentMethod === 'cash' ? 'Cash' : transaction.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Mobile Wallet'}</div>
            ${transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount ? `
              <div>Cash: ₹${transaction.paymentDetails.cashAmount.toFixed(2)}</div>
              ${transaction.paymentDetails.change ? `<div>Change: ₹${transaction.paymentDetails.change.toFixed(2)}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'card' && transaction.paymentDetails?.cardAmount ? `
              <div>Card: ₹${transaction.paymentDetails.cardAmount.toFixed(2)}</div>
              ${transaction.receipt ? `<div>Txn ID: ${transaction.receipt}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'wallet' ? `<div>Wallet Payment</div>` : ''}
          </div>
          <div class="reprint-notice">*** REPRINT - ORIGINAL DATE: ${new Date(transaction.timestamp).toLocaleDateString()} ${new Date(transaction.timestamp).toLocaleTimeString()} ***</div>
          <div class="footer">
            <div>${printSettings.header}</div>
            <div>${printSettings.footer}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.print();
        setTimeout(() => {
          try { printWindow.close(); } catch {}
        }, 300);
      };
    }
    
    toast({
      title: "Receipt Reprinted",
      description: `Receipt reprinted successfully! (Reprint #${newReprintCount})`,
    });
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
      await transactionService.update(editingTransaction.id, editingTransaction);
      
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
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReprint(transaction)}
                            className="h-8 w-8 p-0"
                            title="Reprint Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="h-8 w-8 p-0"
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
    </div>
  );
}