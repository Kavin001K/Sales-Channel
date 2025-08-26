import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft,
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Shield,
  Database,
  Server,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'expired' | 'suspended' | 'pending';
  startDate: Date;
  endDate: Date;
  monthlyFee: number;
  features: string[];
  employees: number;
  transactions: number;
  revenue: number;
  lastLogin: Date;
  status: 'active' | 'inactive';
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  billing: {
    nextBillingDate: Date;
    lastPaymentDate: Date;
    lastPaymentAmount: number;
    paymentMethod: string;
    outstandingAmount: number;
  };
  usage: {
    storageUsed: string;
    storageLimit: string;
    transactionsThisMonth: number;
    transactionsLimit: number;
    employeesActive: number;
    employeesLimit: number;
  };
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'sale' | 'refund' | 'adjustment';
  status: 'completed' | 'pending' | 'failed';
  customer: string;
  items: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
  permissions: string[];
}

export default function CompanyDetails() {
  const { companyId } = useParams();
  const [, setLocation] = useLocation();
  const location = useLocation() as any;
  const [company, setCompany] = useState<Company | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  // Handle navigation state to auto-open editing or specific tab
  useEffect(() => {
    if (location?.state?.startEditing) {
      setIsEditing(true);
    }
    if (location?.state?.tab === 'settings') {
      // If you add controlled Tabs, you could set default here; for now, scroll to settings section
      const el = document.getElementById('company-settings-section');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    }
  }, [location?.state]);

  const loadCompanyData = () => {
    // Mock company data
    const mockCompany: Company = {
      id: companyId || '1',
      name: 'Cafe Central',
      email: 'admin@cafecentral.com',
      phone: '+91 98765 43210',
      address: '123 Main St, Mumbai, India',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyFee: 2999,
      features: ['POS System', 'Inventory Management', 'Reports', 'Multi-location'],
      employees: 15,
      transactions: 1250,
      revenue: 450000,
      lastLogin: new Date(),
      status: 'active',
      owner: {
        name: 'Rajesh Kumar',
        email: 'rajesh@cafecentral.com',
        phone: '+91 98765 43210'
      },
      billing: {
        nextBillingDate: new Date('2024-12-31'),
        lastPaymentDate: new Date('2024-11-30'),
        lastPaymentAmount: 2999,
        paymentMethod: 'Credit Card',
        outstandingAmount: 0
      },
      usage: {
        storageUsed: '8.5GB',
        storageLimit: '20GB',
        transactionsThisMonth: 1250,
        transactionsLimit: 5000,
        employeesActive: 12,
        employeesLimit: 25
      }
    };

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: new Date(),
        amount: 1250,
        type: 'sale',
        status: 'completed',
        customer: 'John Doe',
        items: 3
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000),
        amount: 850,
        type: 'sale',
        status: 'completed',
        customer: 'Jane Smith',
        items: 2
      },
      {
        id: '3',
        date: new Date(Date.now() - 172800000),
        amount: 2100,
        type: 'sale',
        status: 'completed',
        customer: 'Mike Johnson',
        items: 5
      }
    ];

    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@cafecentral.com',
        role: 'Owner',
        status: 'active',
        lastLogin: new Date(),
        permissions: ['all']
      },
      {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@cafecentral.com',
        role: 'Manager',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000),
        permissions: ['sales', 'inventory', 'reports']
      },
      {
        id: '3',
        name: 'Amit Patel',
        email: 'amit@cafecentral.com',
        role: 'Cashier',
        status: 'active',
        lastLogin: new Date(Date.now() - 7200000),
        permissions: ['sales']
      }
    ];

    setCompany(mockCompany);
    setTransactions(mockTransactions);
    setEmployees(mockEmployees);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'enterprise': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleSuspendCompany = () => {
    if (company) {
      setCompany({ ...company, status: 'inactive', subscriptionStatus: 'suspended' });
      toast.success('Company suspended successfully');
      setIsSuspendDialogOpen(false);
    }
  };

  const handleDeleteCompany = () => {
    toast.success('Company deleted successfully');
    navigate('/admin');
    setIsDeleteDialogOpen(false);
  };

  if (!company) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">Company Management & Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(company.subscriptionStatus)}>
            {company.subscriptionStatus}
          </Badge>
          <Badge className={getPlanColor(company.subscriptionPlan)}>
            {company.subscriptionPlan}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Suspend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suspend Company</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to suspend {company.name}? This will disable their access to the system.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleSuspendCompany}>
                  Suspend Company
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <X className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Company</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to permanently delete {company.name}? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteCompany}>
                  Delete Company
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{company.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.transactions}</div>
            <p className="text-xs text-muted-foreground">
              {company.usage.transactionsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.usage.employeesActive}</div>
            <p className="text-xs text-muted-foreground">
              of {company.usage.employeesLimit} limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.usage.storageUsed}</div>
            <p className="text-xs text-muted-foreground">
              of {company.usage.storageLimit} limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <div className="mt-1">{company.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {company.email}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {company.phone}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {company.address}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Owner Name</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {company.owner.name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Owner Email</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {company.owner.email}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Owner Phone</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {company.owner.phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <div className="mt-1">
                    <Badge className={getPlanColor(company.subscriptionPlan)}>
                      {company.subscriptionPlan}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monthly Fee</Label>
                  <div className="mt-1 text-lg font-bold">₹{company.monthlyFee.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subscription Period</Label>
                  <div className="mt-1">
                    {company.startDate.toLocaleDateString()} - {company.endDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium">Features</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {company.features.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Next Billing Date</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {company.billing.nextBillingDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Payment Date</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {company.billing.lastPaymentDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Payment Amount</Label>
                    <div className="mt-1 text-lg font-bold">₹{company.billing.lastPaymentAmount.toLocaleString()}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {company.billing.paymentMethod}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Outstanding Amount</Label>
                    <div className="mt-1 text-lg font-bold text-red-600">
                      ₹{company.billing.outstandingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Manage company employees and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.lastLogin.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {employee.lastLogin.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                View recent sales and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.date.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {transaction.date.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={transaction.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.items}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                Manage company configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent id="company-settings-section">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue={company.name} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input id="companyEmail" defaultValue={company.email} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input id="companyPhone" defaultValue={company.phone} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                    <Select defaultValue={company.subscriptionPlan} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success('Company settings updated successfully!');
                      setIsEditing(false);
                    }}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 