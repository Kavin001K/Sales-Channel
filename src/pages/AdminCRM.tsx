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
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Target,
  CheckSquare,
  Activity as ActivityIcon,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  MapPin,
  Building2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Lead, Opportunity, Task, Activity as ActivityType, SoftwareCompanyEmployee } from '@/lib/types';

export default function AdminCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [employees, setEmployees] = useState<SoftwareCompanyEmployee[]>([]);
  
  // Dialog states
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isLeadViewDialogOpen, setIsLeadViewDialogOpen] = useState(false);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  
  // Form states
  const [leadForm, setLeadForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    companySize: 'small' as const,
    source: 'website' as const,
    estimatedValue: '',
    notes: ''
  });

  const [opportunityForm, setOpportunityForm] = useState({
    leadId: '',
    title: '',
    description: '',
    value: '',
    probability: '',
    stage: 'discovery' as const,
    expectedCloseDate: '',
    notes: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'call' as const,
    priority: 'medium' as const,
    assignedTo: '',
    dueDate: '',
    notes: ''
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock employees
    const mockEmployees: SoftwareCompanyEmployee[] = [
      {
        id: 'emp-1',
        employeeId: 'EMP001',
        name: 'John Smith',
        email: 'john@possystem.com',
        phone: '+1-555-0123',
        department: 'sales',
        position: 'Sales Manager',
        hireDate: new Date('2023-01-15'),
        isActive: true,
        skills: ['Sales', 'CRM', 'Negotiation'],
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'emp-2',
        employeeId: 'EMP002',
        name: 'Sarah Johnson',
        email: 'sarah@possystem.com',
        phone: '+1-555-0124',
        department: 'support',
        position: 'Support Specialist',
        hireDate: new Date('2023-02-20'),
        isActive: true,
        skills: ['Customer Support', 'Technical Support'],
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date()
      }
    ];

    // Mock leads
    const mockLeads: Lead[] = [
      {
        id: 'lead-1',
        companyName: 'Tech Solutions Inc',
        contactPerson: 'Mike Wilson',
        email: 'mike@techsolutions.com',
        phone: '+1-555-0101',
        industry: 'Technology',
        companySize: 'medium',
        source: 'website',
        status: 'qualified',
        assignedTo: 'emp-1',
        estimatedValue: 5000,
        notes: 'Interested in POS system for retail chain',
        nextFollowUp: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: 'lead-2',
        companyName: 'Retail Plus',
        contactPerson: 'Lisa Brown',
        email: 'lisa@retailplus.com',
        phone: '+1-555-0102',
        industry: 'Retail',
        companySize: 'large',
        source: 'referral',
        status: 'new',
        estimatedValue: 8000,
        notes: 'Looking for comprehensive POS solution',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date()
      },
      {
        id: 'lead-3',
        companyName: 'Food Court Express',
        contactPerson: 'David Chen',
        email: 'david@foodcourtexpress.com',
        phone: '+1-555-0103',
        industry: 'Food & Beverage',
        companySize: 'small',
        source: 'cold_call',
        status: 'contacted',
        assignedTo: 'emp-2',
        estimatedValue: 3000,
        notes: 'Multiple locations, needs inventory management',
        nextFollowUp: new Date('2024-01-18'),
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date()
      },
      {
        id: 'lead-4',
        companyName: 'Fashion Boutique',
        contactPerson: 'Emma Rodriguez',
        email: 'emma@fashionboutique.com',
        phone: '+1-555-0104',
        industry: 'Fashion',
        companySize: 'medium',
        source: 'social_media',
        status: 'proposal',
        assignedTo: 'emp-1',
        estimatedValue: 6000,
        notes: 'Interested in customer loyalty features',
        nextFollowUp: new Date('2024-01-20'),
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date()
      }
    ];

    // Mock opportunities
    const mockOpportunities: Opportunity[] = [
      {
        id: 'opp-1',
        leadId: 'lead-1',
        title: 'Tech Solutions POS Implementation',
        description: 'Full POS system implementation for 5 locations',
        value: 5000,
        probability: 75,
        stage: 'proposal',
        expectedCloseDate: new Date('2024-02-15'),
        assignedTo: 'emp-1',
        notes: 'Proposal sent, waiting for response',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date()
      },
      {
        id: 'opp-2',
        leadId: 'lead-4',
        title: 'Fashion Boutique Customer Loyalty System',
        description: 'POS with advanced customer loyalty and inventory management',
        value: 6000,
        probability: 60,
        stage: 'negotiation',
        expectedCloseDate: new Date('2024-02-20'),
        assignedTo: 'emp-1',
        notes: 'Final pricing discussion scheduled',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date()
      },
      {
        id: 'opp-3',
        leadId: 'lead-2',
        title: 'Retail Plus Multi-Location Setup',
        description: 'Enterprise POS solution for 15 retail locations',
        value: 8000,
        probability: 40,
        stage: 'qualification',
        expectedCloseDate: new Date('2024-03-01'),
        assignedTo: 'emp-2',
        notes: 'Technical requirements gathering in progress',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date()
      }
    ];

    // Mock tasks
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Follow up with Tech Solutions',
        description: 'Call Mike to discuss proposal feedback',
        type: 'call',
        priority: 'high',
        status: 'pending',
        assignedTo: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-1' },
        dueDate: new Date('2024-01-16'),
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Prepare demo for Retail Plus',
        description: 'Create customized demo for retail chain',
        type: 'meeting',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-2' },
        dueDate: new Date('2024-01-20'),
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date()
      },
      {
        id: 'task-3',
        title: 'Send proposal to Fashion Boutique',
        description: 'Prepare and send detailed proposal with pricing',
        type: 'proposal',
        priority: 'high',
        status: 'pending',
        assignedTo: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-4' },
        dueDate: new Date('2024-01-17'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'task-4',
        title: 'Schedule demo with Food Court Express',
        description: 'Arrange online demo for inventory management features',
        type: 'meeting',
        priority: 'medium',
        status: 'pending',
        assignedTo: 'emp-2',
        relatedTo: { type: 'lead', id: 'lead-3' },
        dueDate: new Date('2024-01-19'),
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date()
      },
      {
        id: 'task-5',
        title: 'Review competitor analysis',
        description: 'Research competitor pricing and features',
        type: 'other',
        priority: 'low',
        status: 'completed',
        assignedTo: 'emp-1',
        dueDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date()
      }
    ];

    // Mock activities
    const mockActivities: ActivityType[] = [
      {
        id: 'act-1',
        type: 'call',
        title: 'Initial call with Tech Solutions',
        description: 'Discussed POS requirements and pricing',
        performedBy: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-1' },
        timestamp: new Date('2024-01-13'),
        duration: 30,
        outcome: 'Positive response, proposal requested'
      },
      {
        id: 'act-2',
        type: 'email',
        title: 'Proposal sent to Tech Solutions',
        description: 'Sent detailed proposal with pricing',
        performedBy: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-1' },
        timestamp: new Date('2024-01-14'),
        outcome: 'Proposal delivered successfully'
      },
      {
        id: 'act-3',
        type: 'meeting',
        title: 'Demo with Fashion Boutique',
        description: 'Presented customer loyalty features and pricing',
        performedBy: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-4' },
        timestamp: new Date('2024-01-15'),
        duration: 45,
        outcome: 'Very interested, requested proposal'
      },
      {
        id: 'act-4',
        type: 'call',
        title: 'Follow-up with Food Court Express',
        description: 'Discussed inventory management requirements',
        performedBy: 'emp-2',
        relatedTo: { type: 'lead', id: 'lead-3' },
        timestamp: new Date('2024-01-16'),
        duration: 25,
        outcome: 'Scheduled demo for next week'
      },
      {
        id: 'act-5',
        type: 'email',
        title: 'Welcome email to Retail Plus',
        description: 'Sent welcome package and next steps',
        performedBy: 'emp-1',
        relatedTo: { type: 'lead', id: 'lead-2' },
        timestamp: new Date('2024-01-16'),
        outcome: 'Email opened and acknowledged'
      }
    ];

    setEmployees(mockEmployees);
    setLeads(mockLeads);
    setOpportunities(mockOpportunities);
    setTasks(mockTasks);
    setActivities(mockActivities);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed_won': return 'bg-green-100 text-green-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'follow_up': return <ArrowRight className="w-4 h-4" />;
      case 'proposal': return <FileText className="w-4 h-4" />;
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  const handleAddLead = () => {
    if (editingLeadId) {
      setLeads(leads.map(l => l.id === editingLeadId ? {
        ...l,
        companyName: leadForm.companyName,
        contactPerson: leadForm.contactPerson,
        email: leadForm.email,
        phone: leadForm.phone,
        industry: leadForm.industry,
        companySize: leadForm.companySize,
        source: leadForm.source,
        estimatedValue: parseFloat(leadForm.estimatedValue) || 0,
        notes: leadForm.notes,
        updatedAt: new Date()
      } : l));
      setEditingLeadId(null);
      toast.success('Lead updated successfully');
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        companyName: leadForm.companyName,
        contactPerson: leadForm.contactPerson,
        email: leadForm.email,
        phone: leadForm.phone,
        industry: leadForm.industry,
        companySize: leadForm.companySize,
        source: leadForm.source,
        status: 'new',
        estimatedValue: parseFloat(leadForm.estimatedValue) || 0,
        notes: leadForm.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setLeads([...leads, newLead]);
      toast.success('Lead added successfully');
    }
    setLeadForm({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: '',
      companySize: 'small',
      source: 'website',
      estimatedValue: '',
      notes: ''
    });
    setIsLeadDialogOpen(false);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setLeadForm({
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      email: lead.email || '',
      phone: lead.phone || '',
      industry: lead.industry || '',
      companySize: (lead.companySize as any) || 'small',
      source: (lead.source as any) || 'website',
      estimatedValue: lead.estimatedValue?.toString() || '',
      notes: lead.notes || ''
    });
    setIsLeadDialogOpen(true);
  };

  const handleViewLead = (lead: Lead) => {
    setViewLead(lead);
    setIsLeadViewDialogOpen(true);
  };

  const handleAddOpportunity = () => {
    const newOpportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      leadId: opportunityForm.leadId,
      title: opportunityForm.title,
      description: opportunityForm.description,
      value: parseFloat(opportunityForm.value) || 0,
      probability: parseFloat(opportunityForm.probability) || 0,
      stage: opportunityForm.stage,
      expectedCloseDate: opportunityForm.expectedCloseDate ? new Date(opportunityForm.expectedCloseDate) : undefined,
      notes: opportunityForm.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setOpportunities([...opportunities, newOpportunity]);
    setOpportunityForm({
      leadId: '',
      title: '',
      description: '',
      value: '',
      probability: '',
      stage: 'discovery',
      expectedCloseDate: '',
      notes: ''
    });
    setIsOpportunityDialogOpen(false);
    toast.success('Opportunity added successfully');
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      type: taskForm.type,
      priority: taskForm.priority,
      status: 'pending',
      assignedTo: taskForm.assignedTo,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
      notes: taskForm.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks([...tasks, newTask]);
    setTaskForm({
      title: '',
      description: '',
      type: 'call',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
      notes: ''
    });
    setIsTaskDialogOpen(false);
    toast.success('Task added successfully');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', completedAt: new Date(), updatedAt: new Date() }
        : task
    ));
    toast.success('Task completed successfully');
  };

  const handleUpdateTaskStatus = (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status, 
            completedAt: status === 'completed' ? new Date() : undefined,
            updatedAt: new Date() 
          }
        : task
    ));
    toast.success(`Task status updated to ${status.replace('_', ' ')}`);
  };

  const handleUpdateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, status, updatedAt: new Date() }
        : lead
    ));
    toast.success(`Lead status updated to ${status.replace('_', ' ')}`);
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(leads.filter(lead => lead.id !== leadId));
    toast.success('Lead deleted successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully');
  };

  const filteredLeads = leads.filter(lead => 
    (searchQuery === '' || 
     lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || lead.status === statusFilter) &&
    (assignedFilter === 'all' || lead.assignedTo === assignedFilter)
  );

  const filteredTasks = tasks.filter(task =>
    (searchQuery === '' || 
     task.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || task.status === statusFilter) &&
    (assignedFilter === 'all' || task.assignedTo === assignedFilter)
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage leads, opportunities, and customer relationships</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Badge variant="outline" className="text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {leads.length} Leads
          </Badge>
          <Badge variant="outline" className="text-xs sm:text-sm">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {opportunities.length} Opportunities
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              +{leads.filter(l => l.status === 'new').length} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {opportunities.length} active opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? Math.round((opportunities.length / leads.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Leads to opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leads" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="leads" className="text-xs sm:text-sm">Leads</TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs sm:text-sm">Opportunities</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="activities" className="text-xs sm:text-sm">Activities</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={leadForm.companyName}
                        onChange={(e) => setLeadForm({...leadForm, companyName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={leadForm.contactPerson}
                        onChange={(e) => setLeadForm({...leadForm, contactPerson: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={leadForm.industry}
                        onChange={(e) => setLeadForm({...leadForm, industry: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select value={leadForm.companySize} onValueChange={(value) => setLeadForm({...leadForm, companySize: value as 'small' | 'medium' | 'large'})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="estimatedValue">Estimated Value</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={leadForm.estimatedValue}
                      onChange={(e) => setLeadForm({...leadForm, estimatedValue: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsLeadDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddLead} className="flex-1">
                      Add Lead
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leads Overview</CardTitle>
              <CardDescription>
                Manage and track potential customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.companyName}</div>
                          <div className="text-sm text-muted-foreground">{lead.industry}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.contactPerson}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{lead.estimatedValue?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="capitalize">{lead.source.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {lead.nextFollowUp ? lead.nextFollowUp.toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewLead(lead)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditLead(lead)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteLead(lead.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isOpportunityDialogOpen} onOpenChange={setIsOpportunityDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Opportunity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="opportunityTitle">Title</Label>
                    <Input
                      id="opportunityTitle"
                      value={opportunityForm.title}
                      onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opportunityDescription">Description</Label>
                    <Textarea
                      id="opportunityDescription"
                      value={opportunityForm.description}
                      onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="opportunityValue">Value (₹)</Label>
                      <Input
                        id="opportunityValue"
                        type="number"
                        value={opportunityForm.value}
                        onChange={(e) => setOpportunityForm({...opportunityForm, value: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="opportunityProbability">Probability (%)</Label>
                      <Input
                        id="opportunityProbability"
                        type="number"
                        min="0"
                        max="100"
                        value={opportunityForm.probability}
                        onChange={(e) => setOpportunityForm({...opportunityForm, probability: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="opportunityStage">Stage</Label>
                      <Select value={opportunityForm.stage} onValueChange={(value) => setOpportunityForm({...opportunityForm, stage: value as 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discovery">Discovery</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed_won">Closed Won</SelectItem>
                          <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="opportunityCloseDate">Expected Close Date</Label>
                      <Input
                        id="opportunityCloseDate"
                        type="date"
                        value={opportunityForm.expectedCloseDate}
                        onChange={(e) => setOpportunityForm({...opportunityForm, expectedCloseDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="opportunityLead">Related Lead</Label>
                    <Select value={opportunityForm.leadId} onValueChange={(value) => setOpportunityForm({...opportunityForm, leadId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>{lead.companyName} - {lead.contactPerson}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opportunityNotes">Notes</Label>
                    <Textarea
                      id="opportunityNotes"
                      value={opportunityForm.notes}
                      onChange={(e) => setOpportunityForm({...opportunityForm, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsOpportunityDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddOpportunity} className="flex-1">
                      Add Opportunity
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Opportunities Overview</CardTitle>
              <CardDescription>
                Track sales opportunities and pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opportunity) => {
                    const relatedLead = leads.find(lead => lead.id === opportunity.leadId);
                    return (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{opportunity.title}</div>
                            <div className="text-sm text-muted-foreground">{opportunity.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {relatedLead ? (
                            <div>
                              <div className="font-medium">{relatedLead.companyName}</div>
                              <div className="text-sm text-muted-foreground">{relatedLead.contactPerson}</div>
                            </div>
                          ) : 'Unknown Lead'}
                        </TableCell>
                        <TableCell>₹{opportunity.value.toLocaleString()}</TableCell>
                        <TableCell>{opportunity.probability}%</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(opportunity.stage)}>
                            {opportunity.stage.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {opportunity.expectedCloseDate ? opportunity.expectedCloseDate.toLocaleDateString() : 'Not set'}
                        </TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="taskTitle">Title</Label>
                    <Input
                      id="taskTitle"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskDescription">Description</Label>
                    <Textarea
                      id="taskDescription"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taskType">Type</Label>
                      <Select value={taskForm.type} onValueChange={(value) => setTaskForm({...taskForm, type: value as 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'other'})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="follow_up">Follow Up</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taskPriority">Priority</Label>
                      <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value as 'low' | 'medium' | 'high' | 'urgent'})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taskAssignedTo">Assign To</Label>
                      <Select value={taskForm.assignedTo} onValueChange={(value) => setTaskForm({...taskForm, assignedTo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taskDueDate">Due Date</Label>
                      <Input
                        id="taskDueDate"
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="taskNotes">Notes</Label>
                    <Textarea
                      id="taskNotes"
                      value={taskForm.notes}
                      onChange={(e) => setTaskForm({...taskForm, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddTask} className="flex-1">
                      Add Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tasks Overview</CardTitle>
              <CardDescription>
                Track and manage team tasks and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTaskTypeIcon(task.type)}
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employees.find(emp => emp.id === task.assignedTo)?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? task.dueDate.toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {task.status !== 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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
                      {getTaskTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      {activity.outcome && (
                        <p className="text-sm text-green-600 mt-1">
                          Outcome: {activity.outcome}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>By: {employees.find(emp => emp.id === activity.performedBy)?.name || 'Unknown'}</span>
                        {activity.duration && (
                          <span>Duration: {activity.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Lead View Dialog */}
      <Dialog open={isLeadViewDialogOpen} onOpenChange={setIsLeadViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {viewLead && (
            <div className="space-y-2 text-sm">
              <div className="text-base font-semibold">{viewLead.companyName}</div>
              <div>Contact: {viewLead.contactPerson}</div>
              {viewLead.email && <div>Email: {viewLead.email}</div>}
              {viewLead.phone && <div>Phone: {viewLead.phone}</div>}
              {viewLead.industry && <div>Industry: {viewLead.industry}</div>}
              <div>Status: {viewLead.status}</div>
              {viewLead.estimatedValue && <div>Estimated Value: ₹{viewLead.estimatedValue.toLocaleString()}</div>}
              {viewLead.notes && <div className="italic">“{viewLead.notes}”</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 