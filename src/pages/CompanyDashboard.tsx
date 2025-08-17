// src/pages/CompanyDashboard.tsx

import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, CompanySubscription, SupportTicket } from '@/lib/subscription-types';
import { Company } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth'; // To get the logged-in company
import {
  getSubscriptionByCompany,
  getSubscriptionPlans,
  getTicketsByCompany,
  createSupportTicket,
} from '@/lib/subscription-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function CompanyDashboard() {
  const { company } = useAuth(); // Assuming useAuth provides the logged-in company's details
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!company) {
        setIsLoading(false);
        return;
      }
      
      try {
        const [sub, plans, supportTickets] = await Promise.all([
          getSubscriptionByCompany(company.id),
          getSubscriptionPlans(),
          getTicketsByCompany(company.id),
        ]);
        
        if (sub) {
          setSubscription(sub);
          // Ensure plans is an array before calling .find()
          if (Array.isArray(plans)) {
            const activePlan = plans.find(p => p.id === sub.planId);
            setPlan(activePlan || null);
          } else {
            console.warn('getSubscriptionPlans() did not return an array:', plans);
            setPlan(null);
          }
        }
        
        // Ensure supportTickets is an array before setting it
        if (Array.isArray(supportTickets)) {
          setTickets(supportTickets);
        } else {
          console.warn('getTicketsByCompany() did not return an array:', supportTickets);
          setTickets([]);
        }

      } catch (error) {
        console.error("Failed to fetch company data:", error);
        toast.error('Could not load your dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [company]);

  const handleCreateTicket = async () => {
    if (!newTicketSubject || !newTicketMessage) {
      toast.error('Please provide a subject and a message for your ticket.');
      return;
    }
    
    if (!company) {
      toast.error('You must be logged in to create a ticket.');
      return;
    }
    
    try {
      await createSupportTicket({
        companyId: company.id,
        subject: newTicketSubject,
        message: newTicketMessage,
      });
      toast.success('Support ticket created successfully!');
      setIsTicketDialogOpen(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
      // Refresh tickets
      const supportTickets = await getTicketsByCompany(company.id);
      if (Array.isArray(supportTickets)) {
        setTickets(supportTickets);
      } else {
        console.warn('getTicketsByCompany() did not return an array:', supportTickets);
        setTickets([]);
      }
    } catch (error) {
      toast.error('Failed to create support ticket.');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading your dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Company Dashboard</h1>

      {/* My Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>My Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription && plan ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                  {subscription.status}
                </Badge>
              </div>
              <p>
                Active from {new Date(subscription.startDate).toLocaleDateString()} to {new Date(subscription.endDate).toLocaleDateString()}
              </p>
              <div>
                <Label>Token Usage</Label>
                <Progress value={(subscription.tokensUsed / plan.tokenLimit) * 100} className="w-full" />
                <p className="text-sm text-gray-500 mt-1">
                  {subscription.tokensUsed} / {plan.tokenLimit} tokens used
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Plan Features:</h4>
                <ul className="list-disc list-inside">
                  {Array.isArray(plan.features) ? (
                    plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))
                  ) : (
                    <li>No features listed</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <p>You do not have an active subscription. Please contact support.</p>
          )}
        </CardContent>
      </Card>

      {/* Customer Support */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Support</CardTitle>
          <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={newTicketSubject} onChange={(e) => setNewTicketSubject(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={newTicketMessage} onChange={(e) => setNewTicketMessage(e.target.value)} />
                </div>
                <Button onClick={handleCreateTicket} className="w-full">Submit Ticket</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Last Updated</TableHead></TableRow></TableHeader>
            <TableBody>
              {Array.isArray(tickets) && tickets.length > 0 ? (
                tickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell><Badge variant={ticket.status === 'closed' ? 'secondary' : 'default'}>{ticket.status}</Badge></TableCell>
                    <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No support tickets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
