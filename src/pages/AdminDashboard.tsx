import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from 'sonner';

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
  const navigate = useNavigate();
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage companies, subscriptions, and system health</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`${getSystemHealthColor(systemStats.systemHealth)} bg-opacity-10`}>
            <Activity className="w-4 h-4 mr-1" />
            System: {systemStats.systemHealth}
          </Badge>
          <Badge variant="outline">
            <Server className="w-4 h-4 mr-1" />
            Uptime: {systemStats.uptime}%
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {((systemStats.activeSubscriptions / systemStats.totalCompanies) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{systemStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Company</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" placeholder="Enter company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - ₹{plan.price}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter company address" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Company added successfully!');
                    setIsAddCompanyOpen(false);
                  }}>
                    Add Company
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Companies Overview</CardTitle>
              <CardDescription>
                Manage all companies and their subscription status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">{company.email}</div>
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
                      <TableCell>₹{company.monthlyFee.toLocaleString()}</TableCell>
                      <TableCell>{company.employees}</TableCell>
                      <TableCell>
                        {company.lastLogin.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {company.lastLogin.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/company/${company.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subscription Plans</CardTitle>
                  <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Subscription Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="planName">Plan Name</Label>
                          <Input id="planName" placeholder="Enter plan name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planPrice">Monthly Price (₹)</Label>
                          <Input id="planPrice" type="number" placeholder="Enter price" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxEmployees">Max Employees</Label>
                          <Input id="maxEmployees" type="number" placeholder="Enter max employees" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxTransactions">Max Transactions</Label>
                          <Input id="maxTransactions" type="number" placeholder="Enter max transactions" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddPlanOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          toast.success('Plan added successfully!');
                          setIsAddPlanOpen(false);
                        }}>
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
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <Badge className={getPlanColor(plan.name.toLowerCase())}>
                          ₹{plan.price}/month
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        <div>Max Employees: {plan.maxEmployees}</div>
                        <div>Max Transactions: {plan.maxTransactions.toLocaleString()}</div>
                        <div>Storage: {plan.storage}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Features: {plan.features.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Revenue</span>
                    <span className="font-bold">₹{systemStats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Recurring Revenue</span>
                    <span className="font-bold">₹{systemStats.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Revenue Per User</span>
                    <span className="font-bold">₹{(systemStats.monthlyRevenue / systemStats.totalCompanies).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Churn Rate</span>
                    <span className="font-bold text-red-600">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-16 h-16" />
                  <span className="ml-2">Revenue Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>System Status</span>
                    <Badge className={getSystemHealthColor(systemStats.systemHealth)}>
                      {systemStats.systemHealth}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uptime</span>
                    <span className="font-bold">{systemStats.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Users</span>
                    <span className="font-bold">{systemStats.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>New company &quot;Tech Cafe&quot; registered</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Subscription renewed for &quot;Bakery Delight&quot;</span>
                    <span className="text-muted-foreground">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Payment failed for &quot;Restaurant Elite&quot;</span>
                    <span className="text-muted-foreground">6 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>System backup completed</span>
                    <span className="text-muted-foreground">1 day ago</span>
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