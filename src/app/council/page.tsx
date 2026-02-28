"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, MessageSquare, ListCheck, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CouncilPage() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;

  const isCouncilOrAdmin = profile.role === 'council' || profile.role === 'administration';

  if (!isCouncilOrAdmin) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <ShieldCheck size={48} className="mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Access Limited</h1>
          <p className="text-muted-foreground">This area is reserved for MBN Council members.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-primary" />
          Council Workspace
        </h1>
        <p className="text-muted-foreground">Management tools for active council representatives.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="text-primary" size={20} />
              Open Proposals
            </CardTitle>
            <CardDescription>Items awaiting discussion in the next assembly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-bold text-primary mb-1">New Library Computers</h4>
              <p className="text-sm text-muted-foreground mb-3">Proposal to upgrade 20 workstations in the main library area.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8">Details</Button>
                <Button size="sm" className="h-8">Support</Button>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-bold text-primary mb-1">Extended Recess Trial</h4>
              <p className="text-sm text-muted-foreground mb-3">Discussion on extending Friday lunch by 15 minutes.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8">Details</Button>
                <Button size="sm" className="h-8">Support</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Meeting Minutes
            </CardTitle>
            <CardDescription>Archive of previous assembly outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium">Assembly No. {45 - i}</span>
                  <span className="text-xs text-muted-foreground">Oct {15 - i}, 2023</span>
                </div>
                <Button variant="ghost" size="icon">
                  <FileText size={18} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}