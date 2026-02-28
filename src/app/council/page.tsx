
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, MessageSquare, FileText, Plus, Edit2, Trash2, Calendar, Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  collection, 
  query, 
  orderBy, 
  doc 
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface Proposal {
  id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'STUDENT' | 'TEACHER' | 'COUNCIL';
  authorId: string;
  createdAt: any;
}

interface MeetingMinute {
  id: string;
  title: string;
  content: string;
  meetingDate: string;
  authorId: string;
  createdAt: any;
}

export default function CouncilPage() {
  const { profile, loading: authLoading } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [proposalDialog, setProposalDialog] = useState(false);
  const [minuteDialog, setMinuteDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [proposalForm, setProposalForm] = useState({ title: '', content: '', visibility: 'PUBLIC' as Proposal['visibility'] });
  const [minuteForm, setMinuteForm] = useState({ title: '', content: '', meetingDate: format(new Date(), 'yyyy-MM-dd') });

  const proposalsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
  }, [db]);

  const minutesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'meetingMinutes'), orderBy('meetingDate', 'desc'));
  }, [db]);

  const { data: proposals, isLoading: loadingProposals } = useCollection<Proposal>(proposalsQuery);
  const { data: minutes, isLoading: loadingMinutes } = useCollection<MeetingMinute>(minutesQuery);

  if (authLoading || !profile) return null;

  const isStaff = profile.role === 'council' || profile.role === 'administration';

  if (!isStaff) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex items-center justify-center p-4">
          <div className="text-center">
            <ShieldCheck size={100} className="mx-auto text-destructive mb-8 opacity-20" />
            <h1 className="text-5xl font-black font-headline tracking-tighter">Limited Authority</h1>
            <p className="text-slate-500 mt-4 text-xl font-bold">This restricted workspace is for active MBN Council delegates only.</p>
            <Button variant="outline" className="mt-12 rounded-2xl px-12 h-16 font-black text-lg border-2" onClick={() => window.location.href = '/dashboard'}>Return to Hub</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleSaveProposal = () => {
    if (!db || !proposalForm.title) return;

    const data = {
      ...proposalForm,
      authorId: profile.id,
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'proposals', editingId), data);
      toast({ title: "Proposal Updated" });
    } else {
      addDocumentNonBlocking(collection(db, 'proposals'), { ...data, createdAt: new Date() });
      toast({ title: "Proposal Created" });
    }

    setProposalDialog(false);
    resetProposalForm();
  };

  const handleSaveMinute = () => {
    if (!db || !minuteForm.title) return;

    const data = {
      ...minuteForm,
      authorId: profile.id,
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'meetingMinutes', editingId), data);
      toast({ title: "Minute Updated" });
    } else {
      addDocumentNonBlocking(collection(db, 'meetingMinutes'), { ...data, createdAt: new Date() });
      toast({ title: "Minute Saved" });
    }

    setMinuteDialog(false);
    resetMinuteForm();
  };

  const resetProposalForm = () => {
    setProposalForm({ title: '', content: '', visibility: 'PUBLIC' });
    setEditingId(null);
  };

  const resetMinuteForm = () => {
    setMinuteForm({ title: '', content: '', meetingDate: format(new Date(), 'yyyy-MM-dd') });
    setEditingId(null);
  };

  const handleDelete = (col: string, id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, col, id));
    toast({ variant: "destructive", title: "Item Removed" });
  };

  const openEditProposal = (p: Proposal) => {
    setProposalForm({ title: p.title, content: p.content, visibility: p.visibility });
    setEditingId(p.id);
    setProposalDialog(true);
  };

  const openEditMinute = (m: MeetingMinute) => {
    setMinuteForm({ title: m.title, content: m.content, meetingDate: m.meetingDate });
    setEditingId(m.id);
    setMinuteDialog(true);
  };

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 w-full">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary font-black mb-1 rounded-full px-4 py-1 border-none shadow-sm uppercase tracking-[0.2em] text-[8px]">Staff Only</Badge>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white leading-none">
            <ShieldCheck className="text-primary hidden md:block" size={48} />
            {t.councilWorkspace}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight">Active Delegation Governance</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full pb-32">
        
        {/* PROPOSALS MANAGEMENT */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MessageSquare className="text-primary shrink-0" size={44} />
              <div className="space-y-0.5">
                <CardTitle className="text-2xl font-black tracking-tighter">
                  {t.manageProposals}
                </CardTitle>
                <CardDescription className="text-sm font-bold line-clamp-1">Draft school initiatives.</CardDescription>
              </div>
            </div>
            <Dialog open={proposalDialog} onOpenChange={(open) => { setProposalDialog(open); if (!open) resetProposalForm(); }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl font-black shadow-lg shadow-primary/20 h-12 px-6 hover:scale-[1.02] transition-all text-sm shrink-0 gap-2 text-white">
                  <Plus size={18} />
                  {t.newProposal}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] rounded-2xl p-8 bg-white dark:bg-slate-950 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tighter">{editingId ? t.edit : t.newProposal}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.headline}</label>
                    <Input 
                      placeholder={t.headline} 
                      className="h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-black text-lg px-5 focus:ring-4 focus:ring-primary/5 transition-all"
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.visibility}</label>
                    <Select value={proposalForm.visibility} onValueChange={(val: any) => setProposalForm(p => ({ ...p, visibility: val }))}>
                      <SelectTrigger className="h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-black text-lg px-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl p-2">
                        <SelectItem value="PUBLIC" className="rounded-lg px-4 py-3 font-black">{t.visibilityPublic}</SelectItem>
                        <SelectItem value="STUDENT" className="rounded-lg px-4 py-3 font-black">{t.visibilityStudents}</SelectItem>
                        <SelectItem value="TEACHER" className="rounded-lg px-4 py-3 font-black">{t.visibilityTeachers}</SelectItem>
                        <SelectItem value="COUNCIL" className="rounded-lg px-4 py-3 font-black">{t.visibilityCouncil}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.details}</label>
                    <Textarea 
                      placeholder={t.details} 
                      className="min-h-[200px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-none p-6 font-medium text-lg leading-relaxed focus:ring-4 focus:ring-primary/5 transition-all"
                      value={proposalForm.content}
                      onChange={(e) => setProposalForm(p => ({ ...p, content: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button variant="outline" className="h-12 rounded-xl font-black px-6 text-sm border-slate-200 dark:border-slate-800" onClick={() => setProposalDialog(false)}>{t.cancel}</Button>
                  <Button className="h-12 rounded-xl font-black px-10 shadow-lg shadow-primary/10 text-sm gap-2 text-white" onClick={handleSaveProposal}>
                    <Send size={16} />
                    {t.publish}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[700px]">
            {loadingProposals ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Syncing...</span>
               </div>
            ) : !proposals || proposals.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-20 grayscale">
                  <MessageSquare size={64} />
                  <p className="text-xl font-black uppercase tracking-[0.2em]">{t.noAnnouncements}</p>
               </div>
            ) : (
              <TooltipProvider>
                {proposals.map(p => (
                  <div key={p.id} className="group/item p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1.5">
                        <Badge className="bg-primary/5 text-primary border-primary/10 font-black px-3 py-1 rounded-full uppercase tracking-widest text-[8px]">{p.visibility}</Badge>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{p.title}</h4>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5" onClick={() => openEditProposal(p)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete('proposals', p.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-base text-slate-500 font-medium line-clamp-2 italic">"{p.content}"</p>
                  </div>
                ))}
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

        {/* MEETING MINUTES MANAGEMENT */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <FileText className="text-accent shrink-0" size={44} />
              <div className="space-y-0.5">
                <CardTitle className="text-2xl font-black tracking-tighter">
                  {t.manageMinutes}
                </CardTitle>
                <CardDescription className="text-sm font-bold line-clamp-1">Archive school results.</CardDescription>
              </div>
            </div>
            <Dialog open={minuteDialog} onOpenChange={(open) => { setMinuteDialog(open); if (!open) resetMinuteForm(); }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl font-black shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90 h-12 px-6 hover:scale-[1.02] transition-all text-sm shrink-0 gap-2 text-white">
                  <Plus size={18} />
                  {t.newMinute}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] rounded-2xl p-8 bg-white dark:bg-slate-950 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tighter">{editingId ? t.edit : t.newMinute}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.headline}</label>
                    <Input 
                      placeholder={t.headline} 
                      className="h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-black text-lg px-5 focus:ring-4 focus:ring-accent/5 transition-all"
                      value={minuteForm.title}
                      onChange={(e) => setMinuteForm(m => ({ ...m, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.meetingDate}</label>
                    <Input 
                      type="date"
                      className="h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-black text-lg px-5"
                      value={minuteForm.meetingDate}
                      onChange={(e) => setMinuteForm(m => ({ ...m, meetingDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.details}</label>
                    <Textarea 
                      placeholder={t.details} 
                      className="min-h-[200px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-none p-6 font-medium text-lg leading-relaxed focus:ring-4 focus:ring-accent/5 transition-all"
                      value={minuteForm.content}
                      onChange={(e) => setMinuteForm(m => ({ ...m, content: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button variant="outline" className="h-12 rounded-xl font-black px-6 text-sm border-slate-200 dark:border-slate-800" onClick={() => setMinuteDialog(false)}>{t.cancel}</Button>
                  <Button className="h-12 rounded-xl font-black px-10 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90 text-sm gap-2 text-white" onClick={handleSaveMinute}>
                    <Send size={16} />
                    {t.publish}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[700px]">
            {loadingMinutes ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                  <Loader2 className="animate-spin text-accent" size={32} />
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Syncing...</span>
               </div>
            ) : !minutes || minutes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-20 grayscale">
                  <FileText size={64} />
                  <p className="text-xl font-black uppercase tracking-[0.2em]">{t.noLogs}</p>
               </div>
            ) : (
              <TooltipProvider>
                {minutes.map(m => (
                  <div key={m.id} className="group/item flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-accent/20 transition-all duration-300 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-accent/10 rounded-xl flex flex-col items-center justify-center text-accent group-hover/item:bg-accent group-hover/item:text-white transition-all">
                         <Calendar size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{m.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.meetingDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/5" onClick={() => openEditMinute(m)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete('meetingMinutes', m.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
