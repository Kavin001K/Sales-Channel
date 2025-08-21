import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Target, CheckSquare, Plus, Ticket, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface TeamTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  owner: string;
}

interface SupportTicketLite {
  id: string;
  company: string;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
}

export default function AdminCompanyDashboard() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [tickets, setTickets] = useState<SupportTicketLite[]>([]);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  useEffect(() => {
    setTasks([
      { id: 't1', title: 'Onboard ACME Retail', status: 'in_progress', owner: 'support' },
      { id: 't2', title: 'Prepare demo for Fashion Boutique', status: 'pending', owner: 'sales' },
      { id: 't3', title: 'Upgrade servers', status: 'completed', owner: 'technical' }
    ]);
    setTickets([
      { id: 's1', company: 'Retail Plus', subject: 'POS freezes during billing', status: 'open' },
      { id: 's2', company: 'Tech Solutions', subject: 'Need help with reports', status: 'in_progress' }
    ]);
  }, []);

  const addTask = (title: string) => {
    setTasks(prev => [...prev, { id: `t${Date.now()}`, title, status: 'pending', owner: 'support' }]);
    toast.success('Task added');
  };

  const createInternalTicket = () => {
    setTickets(prev => [...prev, { id: `s${Date.now()}`, company: 'Internal', subject: ticketSubject, status: 'open' }]);
    setTicketSubject('');
    setTicketMessage('');
    setIsTicketDialogOpen(false);
    toast.success('Internal ticket created (demo)');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Company Dashboard</h1>
          <p className="text-sm text-muted-foreground">Workspace for support, sales, and technical teams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Tickets</CardTitle>
            <Ticket className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Team Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status !== 'completed').length}</div>
            <p className="text-xs text-muted-foreground">Pending and in-progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Customers Touched</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="tasks">Team Tasks</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Open Tickets</h2>
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Internal Ticket</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Subject" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} />
                  <Textarea placeholder="Message" value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} rows={5} />
                  <div className="flex justify-end">
                    <Button onClick={createInternalTicket}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.company}</TableCell>
                      <TableCell>{t.subject}</TableCell>
                      <TableCell className="capitalize">{t.status.replace('_', ' ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button size="sm" onClick={() => addTask('Follow up with Retail Plus')}><Plus className="w-4 h-4 mr-1" />Add Task</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell className="capitalize">{task.owner}</TableCell>
                      <TableCell className="capitalize">{task.status.replace('_', ' ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Send Broadcast to Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Input placeholder="Subject" />
                <Textarea placeholder="Message" rows={6} />
                <div className="flex justify-end">
                  <Button><Mail className="w-4 h-4 mr-1" />Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


