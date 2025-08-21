import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getSupportTickets, createSupportTicket, sendSupportMessage, getConversationMessages } from '@/lib/storage';
import { toast } from 'sonner';

interface TicketLite {
  id: string;
  companyId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export default function SupportCenter() {
  const [tickets, setTickets] = useState<TicketLite[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketLite['status']>('all');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Messaging
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    }
  }, [activeConversationId]);

  const loadTickets = async () => {
    const list = await getSupportTickets();
    setTickets(list as any);
  };

  const filtered = useMemo(() => {
    return tickets.filter(t =>
      (statusFilter === 'all' || t.status === statusFilter) &&
      (search === '' || t.subject.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tickets, search, statusFilter]);

  const handleCreateTicket = async () => {
    if (!subject || !message) return;
    await createSupportTicket({ companyId: 'admin_company', subject, message, status: 'open' });
    toast.success('Ticket created');
    setIsNewTicketOpen(false);
    setSubject('');
    setMessage('');
    await loadTickets();
  };

  const loadConversation = async (ticketId: string) => {
    const msgs = await getConversationMessages(ticketId);
    setConversationMessages(msgs);
  };

  const sendMessageToConversation = async () => {
    if (!activeConversationId || !newChatMessage) return;
    await sendSupportMessage({ conversationId: activeConversationId, sender: 'support', body: newChatMessage });
    setNewChatMessage('');
    await loadConversation(activeConversationId);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-sm text-muted-foreground">Track tickets and chat with companies</p>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="messages">Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input placeholder="Search subject..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <select className="border rounded p-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button size="sm">New Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                  <Textarea placeholder="Describe the issue" rows={6} value={message} onChange={e => setMessage(e.target.value)} />
                  <div className="flex justify-end"><Button onClick={handleCreateTicket}>Create</Button></div>
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
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.subject}</TableCell>
                      <TableCell className="capitalize">{t.status.replace('_', ' ')}</TableCell>
                      <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setActiveConversationId(t.id)}>Open Chat</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tickets.map(t => (
                  <Button key={t.id} variant={activeConversationId === t.id ? 'default' : 'outline'} className="w-full justify-start" onClick={() => setActiveConversationId(t.id)}>
                    {t.subject}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
              <CardContent>
                {activeConversationId ? (
                  <div className="flex flex-col h-[420px]">
                    <div className="flex-1 overflow-auto space-y-2 border rounded p-2 mb-2 bg-background">
                      {conversationMessages.map((m, idx) => (
                        <div key={idx} className={`max-w-[70%] p-2 rounded ${m.sender === 'support' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                          <div className="text-xs text-muted-foreground">{m.sender}</div>
                          <div className="text-sm">{m.body}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Type a message" value={newChatMessage} onChange={e => setNewChatMessage(e.target.value)} />
                      <Button onClick={sendMessageToConversation}>Send</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Select a conversation to start chatting.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


