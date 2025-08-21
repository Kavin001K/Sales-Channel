import { useState, useEffect } from 'react';
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
  Users, 
  Phone, 
  Mail, 
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
  Server,
  Building2,
  UserCheck,
  MessageSquare,
  FileText,
  Target,
  TrendingUp,
  AlertTriangle,
  Star,
  MapPin,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: string;
  assignedTo: string;
  lastContact: Date;
  nextFollowUp: Date;
  value: number;
  notes: string;
  tags: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: Date;
  customerId?: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'demo' | 'proposal';
}

interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  assignedTo: string;
  lastActivity: Date;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  customerId: string;
  customerName: string;
  description: string;
  date: Date;
  assignedTo: string;
  duration?: number;
  outcome?: string;
}

export default function EmployeeDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock customers data
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@techsolutions.com',
        phone: '+91 98765 43210',
        company: 'Tech Solutions Pvt Ltd',
        status: 'customer',
        source: 'Website',
        assignedTo: 'Priya Sharma',
        lastContact: new Date(),
        nextFollowUp: new Date(Date.now() + 86400000 * 7),
        value: 50000,
        notes: 'Interested in Enterprise plan, needs custom features',
        tags: ['enterprise', 'high-value', 'technical']
      },
      {
        id: '2',
        name: 'Amit Patel',
        email: 'amit@cafecentral.com',
        phone: '+91 87654 32109',
        company: 'Cafe Central',
        status: 'prospect',
        source: 'Referral',
        assignedTo: 'Priya Sharma',
        lastContact: new Date(Date.now() - 86400000 * 2),
        nextFollowUp: new Date(Date.now() + 86400000 * 3),
        value: 25000,
        notes: 'Looking for POS system for multiple locations',
        tags: ['restaurant', 'multi-location', 'pos']
      },
      {
        id: '3',
        name: 'Sneha Reddy',
        email: 'sneha@bakerydelight.com',
        phone: '+91 76543 21098',
        company: 'Bakery Delight',
        status: 'lead',
        source: 'Cold Call',
        assignedTo: 'Priya Sharma',
        lastContact: new Date(Date.now() - 86400000 * 5),
        nextFollowUp: new Date(Date.now() + 86400000 * 1),
        value: 15000,
        notes: 'New bakery opening, needs inventory management',
        tags: ['bakery', 'new-business', 'inventory']
      }
    ];

    // Mock tasks data
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Follow up with Tech Solutions',
        description: 'Discuss enterprise features and pricing',
        assignedTo: 'Priya Sharma',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000 * 2),
        customerId: '1',
        type: 'call'
      },
      {
        id: '2',
        title: 'Send proposal to Cafe Central',
        description: 'Prepare detailed proposal for multi-location setup',
        assignedTo: 'Priya Sharma',
        priority: 'medium',
        status: 'in-progress',
        dueDate: new Date(Date.now() + 86400000 * 5),
        customerId: '2',
        type: 'proposal'
      },
      {
        id: '3',
        title: 'Demo for Bakery Delight',
        description: 'Show inventory management features',
        assignedTo: 'Priya Sharma',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000 * 1),
        customerId: '3',
        type: 'demo'
      }
    ];

    // Mock deals data
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Tech Solutions Enterprise Deal',
        customerId: '1',
        customerName: 'Tech Solutions Pvt Ltd',
        value: 50000,
        stage: 'negotiation',
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 86400000 * 30),
        assignedTo: 'Priya Sharma',
        lastActivity: new Date()
      },
      {
        id: '2',
        title: 'Cafe Central POS System',
        customerId: '2',
        customerName: 'Cafe Central',
        value: 25000,
        stage: 'proposal',
        probability: 60,
        expectedCloseDate: new Date(Date.now() + 86400000 * 45),
        assignedTo: 'Priya Sharma',
        lastActivity: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: '3',
        title: 'Bakery Delight Inventory System',
        customerId: '3',
        customerName: 'Bakery Delight',
        value: 15000,
        stage: 'qualification',
        probability: 40,
        expectedCloseDate: new Date(Date.now() + 86400000 * 60),
        assignedTo: 'Priya Sharma',
        lastActivity: new Date(Date.now() - 86400000 * 5)
      }
    ];

    // Mock activities data
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'call',
        customerId: '1',
        customerName: 'Tech Solutions Pvt Ltd',
        description: 'Discussed enterprise features and pricing',
        date: new Date(),
        assignedTo: 'Priya Sharma',
        duration: 30,
        outcome: 'Positive response, interested in custom features'
      },
      {
        id: '2',
        type: 'email',
        customerId: '2',
        customerName: 'Cafe Central',
        description: 'Sent initial proposal for POS system',
        date: new Date(Date.now() - 86400000 * 1),
        assignedTo: 'Priya Sharma',
        outcome: 'Proposal sent, waiting for feedback'
      },
      {
        id: '3',
        type: 'meeting',
        customerId: '3',
        customerName: 'Bakery Delight',
        description: 'Initial discovery meeting',
        date: new Date(Date.now() - 86400000 * 3),
        assignedTo: 'Priya Sharma',
        duration: 45,
        outcome: 'Good understanding of requirements'
      }
    ];

    setCustomers(mockCustomers);
    setTasks(mockTasks);
    setDeals(mockDeals);
    setActivities(mockActivities);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'customer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'qualification': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'proposal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'closed-won': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed-lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground">CRM & Customer Management System</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-4 h-4 mr-1" />
            Active
          </Badge>
          <Badge variant="outline">
            <UserCheck className="w-4 h-4 mr-1" />
            Priya Sharma
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length}</div>
            <p className="text-xs text-muted-foreground">
              ₹{deals.reduce((sum, d) => sum + d.value, 0).toLocaleString()} pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search customers..."
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
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="prospect">Prospects</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input id="name" placeholder="Enter customer name" />
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
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Enter company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input id="source" placeholder="Enter lead source" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Customer added successfully!');
                    setIsAddCustomerOpen(false);
                  }}>
                    Add Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers Overview</CardTitle>
              <CardDescription>
                Manage your customer relationships and track interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{customer.value.toLocaleString()}</TableCell>
                      <TableCell>
                        {customer.lastContact.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {customer.lastContact.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.nextFollowUp.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {customer.nextFollowUp.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
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

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Pipeline</h2>
            <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Deal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealTitle">Deal Title</Label>
                    <Input id="dealTitle" placeholder="Enter deal title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Deal Value (₹)</Label>
                    <Input id="value" type="number" placeholder="Enter deal value" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="qualification">Qualification</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed-won">Closed Won</SelectItem>
                        <SelectItem value="closed-lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDealOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Deal added successfully!');
                    setIsAddDealOpen(false);
                  }}>
                    Add Deal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deal.title}</div>
                          <div className="text-sm text-muted-foreground">Assigned to {deal.assignedTo}</div>
                        </div>
                      </TableCell>
                      <TableCell>{deal.customerName}</TableCell>
                      <TableCell>₹{deal.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStageColor(deal.stage)}>
                          {deal.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{deal.probability}%</TableCell>
                      <TableCell>{deal.expectedCloseDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
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

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Task Management</h2>
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle">Task Title</Label>
                    <Input id="taskTitle" placeholder="Enter task title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDescription">Description</Label>
                    <Input id="taskDescription" placeholder="Enter task description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskPriority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskType">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Task added successfully!');
                    setIsAddTaskOpen(false);
                  }}>
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.dueDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {task.customerId ? customers.find(c => c.id === task.customerId)?.name : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="w-4 h-4" />
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

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Track all customer interactions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'call' && <Phone className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'email' && <Mail className="w-5 h-5 text-green-600" />}
                      {activity.type === 'meeting' && <Calendar className="w-5 h-5 text-purple-600" />}
                      {activity.type === 'note' && <FileText className="w-5 h-5 text-orange-600" />}
                      {activity.type === 'task' && <CheckCircle className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.customerName}</h4>
                        <span className="text-sm text-muted-foreground">
                          {activity.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      {activity.outcome && (
                        <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                          <strong>Outcome:</strong> {activity.outcome}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-16 h-16" />
                  <span className="ml-2">Sales Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="w-16 h-16" />
                  <span className="ml-2">Customer Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 