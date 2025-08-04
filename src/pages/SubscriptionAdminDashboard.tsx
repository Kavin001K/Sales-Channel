import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, CompanySubscription, SupportTicket } from '@/lib/subscription-types';
import { Company } from '@/lib/types';
import { 
  getSubscriptionPlans, 
  saveSubscriptionPlan, 
  getSubscribedCompanies, 
  saveSubscribedCompany,
  assignSubscriptionToCompany,
  getSupportTickets,
  updateSupportTicketStatus,
  getSubscriptionByCompany
} from '@/lib/subscription-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionAdminDashboard() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>({});
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
  
  useEffect(() => {
    reloadData();
  }, []);

  const reloadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, companiesData, ticketsData] = await Promise.all([
        getSubscriptionPlans(),
        getSubscribedCompanies(),
        getSupportTickets()
      ]);
      setPlans(plansData);
      setCompanies(companiesData);
      setTickets(ticketsData);
    } catch (error) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!currentPlan.name || !currentPlan.price || !currentPlan.durationDays) {
      toast.error('Please fill in all plan details.');
      return;
    }
    const planToSave: SubscriptionPlan = {
      id: currentPlan.id || `plan_${Date.now()}`,
      name: currentPlan.name,
      price: Number(currentPlan.price),
      durationDays: Number(currentPlan.durationDays),
      features: (typeof currentPlan.features === 'string' ? currentPlan.features.split(',') : currentPlan.features) || [],
      tokenLimit: Number(currentPlan.tokenLimit) || 0,
    };
    await saveSubscriptionPlan(planToSave);
    toast.success('Subscription plan saved!');
    setIsPlanDialogOpen(false);
    await reloadData();
  };

  const handleSaveCompany = async () => {
    if (!currentCompany.name || !currentCompany.email) {
      toast.error('Please enter company name and email.');
      return;
    }
    const companyToSave: Company = {
        id: currentCompany.id || `comp_${Date.now()}`,
        name: currentCompany.name,
        email: currentCompany.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: currentCompany.id || `comp_${Date.now()}`,
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        taxId: '',
        logoUrl: '',
    };
    await saveSubscribedCompany(companyToSave);
    toast.success('Company saved!');
    setIsCompanyDialogOpen(false);
    await reloadData();
  };

  const handleAssignSubscription = async (companyId: string, planId: string) => {
    if (!planId) {
      toast.error('Please select a plan.');
      return;
    }
    await assignSubscriptionToCompany(companyId, planId);
    toast.success('Subscription assigned successfully!');
    await reloadData();
  };

  const handleTicketStatusChange = async (ticketId: string, status: 'open' | 'in_progress' | 'closed') => {
    await updateSupportTicketStatus(ticketId, status);
    toast.success('Ticket status updated.');
    await reloadData();
  };
  
  const getCompanyPlan = (companyId: string, subscriptions: CompanySubscription[]) => {
    const subscription = subscriptions.find(s => s.companyId === companyId);
    if (!subscription) return { name: 'No Plan', status: 'inactive' };
    const plan = plans.find(p => p.id === subscription.planId);
    return { name: plan?.name || 'Unknown Plan', status: subscription.status };
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin - Subscription Ecosystem</h1>

      {/* Subscription Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subscription Plans</CardTitle>
          <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentPlan({})}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create/Edit Subscription Plan</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Plan Name</Label><Input value={currentPlan.name || ''} onChange={e => setCurrentPlan({...currentPlan, name: e.target.value})} /></div>
                <div><Label>Price</Label><Input type="number" value={currentPlan.price || ''} onChange={e => setCurrentPlan({...currentPlan, price: Number(e.target.value)})} /></div>
                <div><Label>Duration (Days)</Label><Input type="number" value={currentPlan.durationDays || ''} onChange={e => setCurrentPlan({...currentPlan, durationDays: Number(e.target.value)})} /></div>
                <div><Label>Features (comma-separated)</Label><Input value={Array.isArray(currentPlan.features) ? currentPlan.features.join(',') : ''} onChange={e => setCurrentPlan({...currentPlan, features: e.target.value.split(',')})} /></div>
                <div><Label>Token Limit</Label><Input type="number" value={currentPlan.tokenLimit || ''} onChange={e => setCurrentPlan({...currentPlan, tokenLimit: Number(e.target.value)})} /></div>
                <Button onClick={handleSavePlan} className="w-full">Save Plan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Duration</TableHead><TableHead>Tokens</TableHead></TableRow></TableHeader>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>${plan.price.toFixed(2)}</TableCell>
                  <TableCell>{plan.durationDays} days</TableCell>
                  <TableCell>{plan.tokenLimit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Companies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Companies</CardTitle>
          <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentCompany({})}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Company</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Company Name</Label><Input value={currentCompany.name || ''} onChange={e => setCurrentCompany({...currentCompany, name: e.target.value})} /></div>
                <div><Label>Company Email</Label><Input type="email" value={currentCompany.email || ''} onChange={e => setCurrentCompany({...currentCompany, email: e.target.value})} /></div>
                <Button onClick={handleSaveCompany} className="w-full">Save Company</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subscription</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {companies.map(company => {
                const [subscriptions, setSubscriptions] = useState<CompanySubscription[]>([]);
                useEffect(() => {
                  const fetchSubs = async () => {
                    const subs = await getCompanySubscriptions();
                    setSubscriptions(subs);
                  }
                  fetchSubs();
                }, []);
                const planInfo = getCompanyPlan(company.id, subscriptions);
                return (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell><Badge variant={planInfo.status === 'active' ? 'default' : 'destructive'}>{planInfo.name}</Badge></TableCell>
                    <TableCell>
                      <select onChange={e => handleAssignSubscription(company.id, e.target.value)} className="p-1 border rounded text-sm">
                        <option value="">Assign Plan</option>
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader><CardTitle>Support Tickets</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>{companies.find(c => c.id === ticket.companyId)?.name || 'N/A'}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell><Badge variant={ticket.status === 'closed' ? 'secondary' : 'default'}>{ticket.status}</Badge></TableCell>
                  <TableCell>
                    <select value={ticket.status} onChange={e => handleTicketStatusChange(ticket.id, e.target.value as any)} className="p-1 border rounded text-sm">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
