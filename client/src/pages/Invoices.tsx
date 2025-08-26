import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  DollarSign,
  User,
  Building2
} from 'lucide-react';
import { 
  Invoice, 
  InvoiceItem, 
  getInvoices, 
  saveInvoice, 
  deleteInvoice, 
  getInvoiceStats,
  generateInvoiceNumber,
  calculateInvoiceTotals,
  getInvoiceSettings
} from '@/lib/invoice-utils';
import InvoiceViewer from '@/components/invoice/InvoiceViewer';



const Invoices = () => {
  const { toast } = useToast();
  const { company } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Form state for new invoice
  const [newInvoice, setNewInvoice] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    items: [{ id: '1', name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
    template: 1,
    currency: 'INR',
    taxRate: 18
  });

  useEffect(() => {
    // Load invoices from localStorage
    const savedInvoices = getInvoices();
    setInvoices(savedInvoices);
  }, []);

  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    return calculateInvoiceTotals(items, taxRate);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const createInvoice = () => {
    if (!newInvoice.customer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals(newInvoice.items, newInvoice.taxRate);
    
    const invoice: Invoice = {
      id: Date.now().toString(),
      number: generateInvoiceNumber(getInvoiceSettings().invoiceNumberPrefix),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: newInvoice.customer,
      items: newInvoice.items,
      subtotal,
      taxRate: newInvoice.taxRate,
      taxAmount,
      total,
      status: 'draft',
      notes: newInvoice.notes,
      template: newInvoice.template,
      currency: newInvoice.currency
    };

    const updatedInvoices = saveInvoice(invoice);
    setInvoices(updatedInvoices);
    
    // Reset form
    setNewInvoice({
      customer: { name: '', email: '', phone: '', address: '' },
      items: [{ id: '1', name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
      template: 1,
      currency: 'INR',
      taxRate: 18
    });
    
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "Invoice created successfully"
    });
  };

  const handleDeleteInvoice = (id: string) => {
    const updatedInvoices = deleteInvoice(id);
    setInvoices(updatedInvoices);
    toast({
      title: "Success",
      description: "Invoice deleted successfully"
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getInvoiceStats(invoices);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and billing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Invoice Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={selectedTemplate.toString()} onValueChange={(value) => setSelectedTemplate(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <SelectItem key={num} value={num.toString()}>Template {num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={newInvoice.currency} onValueChange={(value) => setNewInvoice({...newInvoice, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name *</Label>
                      <Input
                        value={newInvoice.customer.name}
                        onChange={(e) => setNewInvoice({
                          ...newInvoice,
                          customer: { ...newInvoice.customer, name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newInvoice.customer.email}
                        onChange={(e) => setNewInvoice({
                          ...newInvoice,
                          customer: { ...newInvoice.customer, email: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={newInvoice.customer.phone}
                        onChange={(e) => setNewInvoice({
                          ...newInvoice,
                          customer: { ...newInvoice.customer, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={newInvoice.taxRate}
                        onChange={(e) => setNewInvoice({...newInvoice, taxRate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={newInvoice.customer.address}
                      onChange={(e) => setNewInvoice({
                        ...newInvoice,
                        customer: { ...newInvoice.customer, address: e.target.value }
                      })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <div className="space-y-4">
                  {newInvoice.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        {newInvoice.items.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">Total: ₹{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addItem} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 text-right">
                    <div>Subtotal: ₹{calculateTotals(newInvoice.items, newInvoice.taxRate).subtotal.toFixed(2)}</div>
                    <div>Tax ({newInvoice.taxRate}%): ₹{calculateTotals(newInvoice.items, newInvoice.taxRate).taxAmount.toFixed(2)}</div>
                    <div className="text-lg font-bold">
                      Total: ₹{calculateTotals(newInvoice.items, newInvoice.taxRate).total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">INVOICE PREVIEW</h2>
                    <p className="text-gray-600">Template {selectedTemplate}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <h3 className="font-bold mb-2">From:</h3>
                      <p className="text-sm">{company?.name || 'Your Company'}</p>
                      <p className="text-sm text-gray-600">Company Address</p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">To:</h3>
                      <p className="text-sm">{newInvoice.customer.name || 'Customer Name'}</p>
                      <p className="text-sm text-gray-600">{newInvoice.customer.address || 'Customer Address'}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Items:</h3>
                    <div className="space-y-2">
                      {newInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name || `Item ${index + 1}`}</span>
                          <span>₹{item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 text-right">
                    <div className="space-y-1">
                      <div>Subtotal: ₹{calculateTotals(newInvoice.items, newInvoice.taxRate).subtotal.toFixed(2)}</div>
                      <div>Tax: ₹{calculateTotals(newInvoice.items, newInvoice.taxRate).taxAmount.toFixed(2)}</div>
                      <div className="text-lg font-bold">
                        Total: ₹{calculateTotals(newInvoice.items, newInvoice.taxRate).total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createInvoice}>
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage and track your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.customer.name}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>₹{invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                                     <TableCell>
                     <div className="flex space-x-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleViewInvoice(invoice)}
                       >
                         <Eye className="h-4 w-4" />
                       </Button>
                       <Button variant="outline" size="sm">
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleDeleteInvoice(invoice.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
                 </CardContent>
       </Card>

       {/* Invoice Viewer */}
       {selectedInvoice && (
         <InvoiceViewer
           invoice={selectedInvoice}
           isOpen={isViewerOpen}
           onClose={() => {
             setIsViewerOpen(false);
             setSelectedInvoice(null);
           }}
         />
       )}
     </div>
   );
 };

export default Invoices;
