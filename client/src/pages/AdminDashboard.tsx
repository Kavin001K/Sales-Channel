import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
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
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
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
  Server
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
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxEmployees: number;
  maxTransactions: number;
  storage: string;
}

interface SystemStats {
  totalCompanies: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
  pendingPayments: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalCompanies: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    systemHealth: 'excellent',
    uptime: 99.9,
    activeUsers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock companies data
    const mockCompanies: Company[] = [
      {
        id: '1',
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
        status: 'active'
      },
      {
        id: '2',
        name: 'Bakery Delight',
        email: 'info@bakerydelight.com',
        phone: '+91 87654 32109',
        address: '456 Park Ave, Delhi, India',
        subscriptionPlan: 'basic',
        subscriptionStatus: 'active',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-01-31'),
        monthlyFee: 1499,
        features: ['POS System', 'Basic Reports'],
        employees: 8,
        transactions: 850,
        revenue: 280000,
        lastLogin: new Date(Date.now() - 86400000),
        status: 'active'
      },
      {
        id: '3',
        name: 'Restaurant Elite',
        email: 'contact@restaurantelite.com',
        phone: '+91 76543 21098',
        address: '789 Business Rd, Bangalore, India',
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'expired',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-05-31'),
        monthlyFee: 5999,
        features: ['POS System', 'Inventory Management', 'Reports', 'Multi-location', 'API Access', 'Custom Branding'],
        employees: 45,
        transactions: 3200,
        revenue: 1200000,
        lastLogin: new Date(Date.now() - 172800000),
        status: 'inactive'
      }
    ];

    const mockPlans: SubscriptionPlan[] = [
      {
        id: '1',
        name: 'Basic',
        price: 1499,
        features: ['POS System', 'Basic Reports', 'Email Support'],
        maxEmployees: 10,
        maxTransactions: 1000,
        storage: '5GB'
      },
      {
        id: '2',
        name: 'Premium',
        price: 2999,
        features: ['POS System', 'Inventory Management', 'Advanced Reports', 'Phone Support'],
        maxEmployees: 25,
        maxTransactions: 5000,
        storage: '20GB'
      },
      {
        id: '3',
        name: 'Enterprise',
        price: 5999,
        features: ['POS System', 'Inventory Management', 'Advanced Reports', 'Multi-location', 'API Access', 'Custom Branding', 'Priority Support'],
        maxEmployees: 100,
        maxTransactions: 50000,
        storage: '100GB'
      }
    ];

    setCompanies(mockCompanies);
    setSubscriptionPlans(mockPlans);
    
    // Calculate system stats
    const activeSubs = mockCompanies.filter(c => c.subscriptionStatus === 'active').length;
    const monthlyRev = mockCompanies.reduce((sum, c) => sum + c.monthlyFee, 0);
    const totalRev = mockCompanies.reduce((sum, c) => sum + c.revenue, 0);
    
    setSystemStats({
      totalCompanies: mockCompanies.length,
      activeSubscriptions: activeSubs,
      monthlyRevenue: monthlyRev,
      totalRevenue: totalRev,
      pendingPayments: 3,
      systemHealth: 'excellent',
      uptime: 99.9,
      activeUsers: mockCompanies.filter(c => c.status === 'active').length
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || company.subscriptionPlan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

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

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground dark:text-gray-300">Manage companies, subscriptions, and system health</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`${getSystemHealthColor(systemStats.systemHealth)} bg-opacity-10 dark:bg-opacity-20`}>
            <Activity className="w-4 h-4 mr-1" />
            System: {systemStats.systemHealth}
          </Badge>
          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
            <Server className="w-4 h-4 mr-1" />
            Uptime: {systemStats.uptime}%
          </Badge>
        </div>
      </div>

        {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{systemStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{systemStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {((systemStats.activeSubscriptions / systemStats.totalCompanies) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{systemStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              +5.2% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800 dark:border-gray-700">
          <TabsTrigger value="companies" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Companies</TabsTrigger>
          <TabsTrigger value="subscriptions" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="system" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">System</TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Status</SelectItem>
                  <SelectItem value="active" className="dark:text-white dark:hover:bg-gray-700">Active</SelectItem>
                  <SelectItem value="expired" className="dark:text-white dark:hover:bg-gray-700">Expired</SelectItem>
                  <SelectItem value="suspended" className="dark:text-white dark:hover:bg-gray-700">Suspended</SelectItem>
                  <SelectItem value="pending" className="dark:text-white dark:hover:bg-gray-700">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Plans</SelectItem>
                  <SelectItem value="basic" className="dark:text-white dark:hover:bg-gray-700">Basic</SelectItem>
                  <SelectItem value="premium" className="dark:text-white dark:hover:bg-gray-700">Premium</SelectItem>
                  <SelectItem value="enterprise" className="dark:text-white dark:hover:bg-gray-700">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
              <DialogTrigger asChild>
                <Button className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Add New Company</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-white">Company Name</Label>
                    <Input id="name" placeholder="Enter company name" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-white">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-white">Phone</Label>
                    <Input id="phone" placeholder="Enter phone number" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan" className="dark:text-white">Subscription Plan</Label>
                    <Select>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {subscriptionPlans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id} className="dark:text-white dark:hover:bg-gray-700">
                            {plan.name} - ₹{plan.price}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address" className="dark:text-white">Address</Label>
                    <Input id="address" placeholder="Enter company address" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Company added successfully!');
                    setIsAddCompanyOpen(false);
                  }} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                    Add Company
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Companies Table */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Companies Overview</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Manage all companies and their subscription status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700 dark:hover:bg-gray-700">
                    <TableHead className="dark:text-white">Company</TableHead>
                    <TableHead className="dark:text-white">Plan</TableHead>
                    <TableHead className="dark:text-white">Status</TableHead>
                    <TableHead className="dark:text-white">Monthly Fee</TableHead>
                    <TableHead className="dark:text-white">Employees</TableHead>
                    <TableHead className="dark:text-white">Last Login</TableHead>
                    <TableHead className="dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="dark:border-gray-700 dark:hover:bg-gray-700">
                      <TableCell className="dark:text-white">
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground dark:text-gray-400">{company.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPlanColor(company.subscriptionPlan)}>
                          {company.subscriptionPlan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(company.subscriptionStatus)}>
                          {company.subscriptionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="dark:text-white">₹{company.monthlyFee.toLocaleString()}</TableCell>
                      <TableCell className="dark:text-white">{company.employees}</TableCell>
                      <TableCell className="dark:text-white">
                        {company.lastLogin.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground dark:text-gray-400">
                          {company.lastLogin.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/company/${company.id}`)}
                            className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            onClick={() => navigate(`/admin/company/${company.id}`, { state: { startEditing: true } })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            onClick={() => navigate(`/admin/company/${company.id}`, { state: { tab: 'settings' } })}
                          >
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

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Plans */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Subscription Plans</CardTitle>
                  <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="dark:text-white">Add New Subscription Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="planName" className="dark:text-white">Plan Name</Label>
                          <Input id="planName" placeholder="Enter plan name" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planPrice" className="dark:text-white">Monthly Price (₹)</Label>
                          <Input id="planPrice" type="number" placeholder="Enter price" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxEmployees" className="dark:text-white">Max Employees</Label>
                          <Input id="maxEmployees" type="number" placeholder="Enter max employees" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxTransactions" className="dark:text-white">Max Transactions</Label>
                          <Input id="maxTransactions" type="number" placeholder="Enter max transactions" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddPlanOpen(false)} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          toast.success('Plan added successfully!');
                          setIsAddPlanOpen(false);
                        }} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                          Add Plan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold dark:text-white">{plan.name}</h3>
                        <Badge className={getPlanColor(plan.name.toLowerCase())}>
                          ₹{plan.price}/month
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-gray-300 mb-3">
                        <div>Max Employees: {plan.maxEmployees}</div>
                        <div>Max Transactions: {plan.maxTransactions.toLocaleString()}</div>
                        <div>Storage: {plan.storage}</div>
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400">
                        Features: {plan.features.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Analytics */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Subscription Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Total Revenue</span>
                    <span className="font-bold dark:text-white">₹{systemStats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Monthly Recurring Revenue</span>
                    <span className="font-bold dark:text-white">₹{systemStats.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Average Revenue Per User</span>
                    <span className="font-bold dark:text-white">₹{(systemStats.monthlyRevenue / systemStats.totalCompanies).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Churn Rate</span>
                    <span className="font-bold text-red-600 dark:text-red-400">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground dark:text-gray-400">
                  <BarChart3 className="w-16 h-16" />
                  <span className="ml-2">Revenue Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground dark:text-gray-400">
                  <PieChart className="w-16 h-16" />
                  <span className="ml-2">Plan Distribution</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">System Status</span>
                    <Badge className={getSystemHealthColor(systemStats.systemHealth)}>
                      {systemStats.systemHealth}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Uptime</span>
                    <span className="font-bold dark:text-white">{systemStats.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Active Users</span>
                    <span className="font-bold dark:text-white">{systemStats.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="dark:text-white">Database Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="dark:text-white">New company &quot;Tech Cafe&quot; registered</span>
                    <span className="text-muted-foreground dark:text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="dark:text-white">Subscription renewed for &quot;Bakery Delight&quot;</span>
                    <span className="text-muted-foreground dark:text-gray-400">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="dark:text-white">Payment failed for &quot;Restaurant Elite&quot;</span>
                    <span className="text-muted-foreground dark:text-gray-400">6 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="dark:text-white">System backup completed</span>
                    <span className="text-muted-foreground dark:text-gray-400">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 