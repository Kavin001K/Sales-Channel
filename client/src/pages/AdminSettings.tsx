import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { adminAuth } = useAuth();
  const [crmLeadSources, setCrmLeadSources] = useState<string>('website,referral,cold_call');
  const [crmStages, setCrmStages] = useState<string>('discovery,qualification,proposal,negotiation,closed_won,closed_lost');
  const [supportEmail, setSupportEmail] = useState<string>('support@acebill.com');
  const [brandName, setBrandName] = useState<string>('Ace-Bill');

  if (!adminAuth.isAuthenticated) {
    return <div className="p-6">Unauthorized</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure software company settings and CRM defaults</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="crm">CRM Defaults</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand</CardTitle>
              <CardDescription>Set product branding visible to all tenants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="brandName">Product Name</Label>
                <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>
              <Button onClick={() => toast.success('Admin brand settings saved (demo)')}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CRM Defaults</CardTitle>
              <CardDescription>Defaults for lead sources and pipeline stages for staff in Admin CRM.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="leadSources">Lead Sources (comma separated)</Label>
                <Input id="leadSources" value={crmLeadSources} onChange={(e) => setCrmLeadSources(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="stages">Pipeline Stages (comma separated)</Label>
                <Input id="stages" value={crmStages} onChange={(e) => setCrmStages(e.target.value)} />
              </div>
              <Button onClick={() => toast.success('CRM defaults saved (demo)')}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Contact details and SLA for your support team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </div>
              <Button onClick={() => toast.success('Support settings saved (demo)')}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


