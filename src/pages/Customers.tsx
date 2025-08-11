import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Users, Star, DollarSign, Upload, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ExcelImport } from '@/components/import/ExcelImport';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  // Expand formData to include all new fields
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
    email: '',
    phoneNo: '',
    mobileNo: '',
    panNo: '',
    gstin: '',
    documentType: '',
    documentNo: '',
    dob: '',
    anniversary: '',
    openingBalance: '',
    creditAllowed: 'N',
    creditLimit: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const customersData = await getCustomers();
      const customersArray = Array.isArray(customersData) ? customersData : [];
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  // Update resetForm to reset all fields
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pin: '',
      email: '',
      phoneNo: '',
      mobileNo: '',
      panNo: '',
      gstin: '',
      documentType: '',
      documentNo: '',
      dob: '',
      anniversary: '',
      openingBalance: '',
      creditAllowed: 'N',
      creditLimit: '',
      notes: ''
    });
  };

  // Update handleSubmit to use new fields and validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobileNo) {
      toast.error('Name and Mobile No are required');
      return;
    }
    // Add more validation as needed
    const customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.mobileNo || undefined,
      address: (formData.address || formData.city || formData.state || formData.pin) ? {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pin
      } : undefined,
      loyaltyPoints: 0,
      totalSpent: 0,
      visits: 0,
      notes: formData.notes || undefined,
      isActive: true
    };
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addCustomer(newCustomer);
      toast.success('Customer added successfully');
    }
    loadCustomers();
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address?.street || '',
      city: customer.address?.city || '',
      state: customer.address?.state || '',
      country: 'India',
      pin: customer.address?.zipCode || '',
      email: customer.email || '',
      phoneNo: '', // No direct mapping, left blank
      mobileNo: customer.phone || '',
      panNo: '',
      gstin: '',
      documentType: '',
      documentNo: '',
      dob: '',
      anniversary: '',
      openingBalance: '',
      creditAllowed: 'N',
      creditLimit: '',
      notes: customer.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleView = (customer: Customer) => {
    setViewCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleMessage = (customer: Customer) => {
    setViewCustomer(customer);
    setMessageSubject(`Hello ${customer.name}`);
    setMessageBody('');
    setIsMessageDialogOpen(true);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Message sent to ${viewCustomer?.name} (demo)`);
    setIsMessageDialogOpen(false);
    setMessageSubject('');
    setMessageBody('');
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    loadCustomers();
    toast.success('Customer deleted successfully');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const stats = {
    totalCustomers: customers.length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your customer database and relationships</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCustomer(null); }} size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
                  {/* All form fields here, responsive grid for better mobile and desktop usability */}
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} maxLength={50} required />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} maxLength={50} />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} maxLength={50} required />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} maxLength={50} required />
                </div>
                <div>
                  <Label htmlFor="pin">PIN</Label>
                  <Input id="pin" value={formData.pin} onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setFormData({...formData, pin: e.target.value}); }} maxLength={6} />
                </div>
                <div>
                  <Label htmlFor="email">Email ID</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} maxLength={50} />
                </div>
                <div>
                  <Label htmlFor="phoneNo">Phone No</Label>
                  <Input id="phoneNo" value={formData.phoneNo} onChange={e => { if (/^\d{0,12}$/.test(e.target.value)) setFormData({...formData, phoneNo: e.target.value}); }} maxLength={12} />
                </div>
                <div>
                  <Label htmlFor="mobileNo">Mobile No *</Label>
                  <Input id="mobileNo" value={formData.mobileNo} onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) setFormData({...formData, mobileNo: e.target.value}); }} maxLength={10} required />
                </div>
                <div>
                  <Label htmlFor="panNo">PAN No.</Label>
                  <Input id="panNo" value={formData.panNo} onChange={e => setFormData({...formData, panNo: e.target.value})} maxLength={10} />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} maxLength={15} />
                </div>
                <div>
                  <Label htmlFor="documentType">Document Type</Label>
                  <Input id="documentType" value={formData.documentType} onChange={e => setFormData({...formData, documentType: e.target.value})} maxLength={50} />
                </div>
                <div>
                  <Label htmlFor="documentNo">Document No.</Label>
                  <Input id="documentNo" value={formData.documentNo} onChange={e => setFormData({...formData, documentNo: e.target.value})} maxLength={20} />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} placeholder="dd/mm/yyyy" maxLength={10} />
                </div>
                <div>
                  <Label htmlFor="anniversary">Anniversary Date</Label>
                  <Input id="anniversary" value={formData.anniversary} onChange={e => setFormData({...formData, anniversary: e.target.value})} placeholder="dd/mm/yyyy" maxLength={10} />
                </div>
                <div>
                  <Label htmlFor="openingBalance">Opening Balance</Label>
                  <Input id="openingBalance" value={formData.openingBalance} onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) setFormData({...formData, openingBalance: e.target.value}); }} maxLength={10} />
                </div>
                <div>
                  <Label htmlFor="creditAllowed">Credit Allowed</Label>
                  <select id="creditAllowed" value={formData.creditAllowed} onChange={e => setFormData({...formData, creditAllowed: e.target.value})}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input id="creditLimit" value={formData.creditLimit} onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) setFormData({...formData, creditLimit: e.target.value}); }} maxLength={10} />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} maxLength={250} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">{editingCustomer ? 'Update' : 'Add'} Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="customers" className="text-xs sm:text-sm py-2">Customer List</TabsTrigger>
          <TabsTrigger value="import" className="text-xs sm:text-sm py-2">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import from Excel</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <ExcelImport 
            type="customers" 
            onImportComplete={() => {
              setCustomers(getCustomers());
              toast.success('Customers imported successfully!');
            }} 
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 sm:space-y-6">

      {/* Stats Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Average Spent</CardTitle>
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">${stats.averageSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search - Responsive */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Customers Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg">{customer.name}</CardTitle>
                  {customer.email && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{customer.email}</p>
                  )}
                </div>
                <Badge variant={customer.visits > 5 ? 'default' : 'secondary'} className="text-xs">
                  {customer.visits > 5 ? 'VIP' : 'Regular'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">${customer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Visits</p>
                  <p className="font-semibold">{customer.visits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Points</p>
                  <p className="font-semibold">{customer.loyaltyPoints}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Visit</p>
                  <p className="font-semibold">
                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              {customer.phone && (
                <p className="text-xs sm:text-sm text-muted-foreground">Phone: {customer.phone}</p>
              )}
              
              {customer.address && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {customer.address.street}, {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                </p>
              )}
              
              {customer.notes && (
                <p className="text-xs sm:text-sm text-muted-foreground italic">
                  &quot;{customer.notes}&quot;
                </p>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(customer)}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(customer)}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMessage(customer)}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Message
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{customer.name}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        </TabsContent>
      </Tabs>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-base">{viewCustomer.name}</div>
              {viewCustomer.email && <div>Email: {viewCustomer.email}</div>}
              {viewCustomer.phone && <div>Phone: {viewCustomer.phone}</div>}
              {viewCustomer.address && (
                <div>
                  Address: {viewCustomer.address.street}, {viewCustomer.address.city}, {viewCustomer.address.state} {viewCustomer.address.zipCode}
                </div>
              )}
              <div>Total Spent: ${viewCustomer.totalSpent.toFixed(2)}</div>
              <div>Visits: {viewCustomer.visits}</div>
              {viewCustomer.notes && <div className="italic">“{viewCustomer.notes}”</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Customer Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Message {viewCustomer ? `to ${viewCustomer.name}` : ''}</DialogTitle>
          </DialogHeader>
          <form onSubmit={sendMessage} className="space-y-3">
            <div>
              <Label htmlFor="msgSubject">Subject</Label>
              <Input id="msgSubject" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="msgBody">Message</Label>
              <Textarea id="msgBody" value={messageBody} onChange={e => setMessageBody(e.target.value)} required rows={5} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Send</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}