
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, MessageSquare, ListCheck, FileText, Plus, Edit2, Trash2, Eye, Calendar, Loader2, Sparkles } from 'lucide-react';
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000 w-full px-4">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary font-black mb-2 rounded-full px-6 py-1.5 border-none shadow-sm uppercase tracking-[0.3em] text-[10px]">Staff Only</Badge>
          <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter flex items-center gap-6 text-slate-900 dark:text-white leading-[0.85]">
            <ShieldCheck className="text-primary hidden md:block" size={72} />
            {t.councilWorkspace}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-2xl tracking-tight">Active Delegation Governance</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full pb-40">
        
        {/* PROPOSALS MANAGEMENT */}
        <Card className="border-none shadow-[0_48px_80px_-24px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden flex flex-col min-h-[600px]">
          <CardHeader className="p-12 md:p-16 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tighter flex items-center gap-4">
                <MessageSquare className="text-primary" size={32} />
                {t.manageProposals}
              </CardTitle>
              <CardDescription className="text-lg font-bold">Draft and broadcast school-wide initiatives.</CardDescription>
            </div>
            <Dialog open={proposalDialog} onOpenChange={(open) => { setProposalDialog(open); if (!open) resetProposalForm(); }}>
              <DialogTrigger asChild>
                <Button size="icon" className="h-16 w-16 rounded-2xl shadow-xl shadow-primary/30 hover:scale-110 transition-transform">
                  <Plus size={32} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] rounded-[4rem] p-12 bg-white dark:bg-slate-950 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black tracking-tighter">{editingId ? t.edit : t.newProposal}</DialogTitle>
                </DialogHeader>
                <div className="space-y-8 py-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t.headline}</label>
                    <Input 
                      placeholder={t.headline} 
                      className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-xl px-6"
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t.visibility}</label>
                    <Select value={proposalForm.visibility} onValueChange={(val: any) => setProposalForm(p => ({ ...p, visibility: val }))}>
                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-xl px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-4">
                        <SelectItem value="PUBLIC" className="rounded-xl px-6 py-4 font-black">{t.visibilityPublic}</SelectItem>
                        <SelectItem value="STUDENT" className="rounded-xl px-6 py-4 font-black">{t.visibilityStudents}</SelectItem>
                        <SelectItem value="TEACHER" className="rounded-xl px-6 py-4 font-black">{t.visibilityTeachers}</SelectItem>
                        <SelectItem value="COUNCIL" className="rounded-xl px-6 py-4 font-black">{t.visibilityCouncil}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t.details}</label>
                    <Textarea 
                      placeholder={t.details} 
                      className="min-h-[250px] rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border-none p-8 font-medium text-xl leading-relaxed"
                      value={proposalForm.content}
                      onChange={(e) => setProposalForm(p => ({ ...p, content: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-4">
                  <Button variant="ghost" className="h-14 rounded-2xl font-black px-10 text-lg" onClick={() => setProposalDialog(false)}>{t.cancel}</Button>
                  <Button className="h-14 rounded-2xl font-black px-14 shadow-xl shadow-primary/20 text-lg" onClick={handleSaveProposal}>{t.publish}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-8 flex-1 overflow-y-auto max-h-[800px]">
            {loadingProposals ? (
               <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-30">
                  <Loader2 className="animate-spin" size={48} />
                  <span className="font-black uppercase tracking-[0.2em]">Syncing Proposals...</span>
               </div>
            ) : !proposals || proposals.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 gap-8 opacity-20 grayscale">
                  <MessageSquare size={80} />
                  <p className="text-2xl font-black uppercase tracking-[0.2em]">{t.noAnnouncements}</p>
               </div>
            ) : (
              proposals.map(p => (
                <div key={p.id} className="group/item p-8 rounded-[3rem] bg-slate-50/50 dark:bg-slate-800/30 border-2 border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-3">
                      <Badge className="bg-primary/5 text-primary border-primary/20 font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px]">{p.visibility}</Badge>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{p.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/10 transition-all" onClick={() => openEditProposal(p)}>
                        <Edit2 size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => handleDelete('proposals', p.id)}>
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-lg text-slate-500 font-medium line-clamp-3 mb-6 italic">"{p.content}"</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* MEETING MINUTES MANAGEMENT */}
        <Card className="border-none shadow-[0_48px_80px_-24px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden flex flex-col min-h-[600px]">
          <CardHeader className="p-12 md:p-16 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tighter flex items-center gap-4">
                <FileText className="text-accent" size={32} />
                {t.manageMinutes}
              </CardTitle>
              <CardDescription className="text-lg font-bold">Archive assembly results for official records.</CardDescription>
            </div>
            <Dialog open={minuteDialog} onOpenChange={(open) => { setMinuteDialog(open); if (!open) resetMinuteForm(); }}>
              <DialogTrigger asChild>
                <Button size="icon" className="h-16 w-16 rounded-2xl shadow-xl shadow-accent/30 bg-accent hover:bg-accent/90 hover:scale-110 transition-transform">
                  <Plus size={32} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] rounded-[4rem] p-12 bg-white dark:bg-slate-950 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black tracking-tighter">{editingId ? t.edit : t.newMinute}</DialogTitle>
                </DialogHeader>
                <div className="space-y-8 py-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t.headline}</label>
                    <Input 
                      placeholder={t.headline} 
                      className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-xl px-6"
                      value={minuteForm.title}
                      onChange={(e) => setMinuteForm(m => ({ ...m, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t.meetingDate}</label>
                    <Input 
                      type="date"
                      className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-xl px-6"
                      value={minuteForm.meetingDate}
                      onChange={(e) => setMinuteForm(m => ({ ...m, meetingDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t.details}</label>
                    <Textarea 
                      placeholder={t.details} 
                      className="min-h-[250px] rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border-none p-8 font-medium text-xl leading-relaxed"
                      value={minuteForm.content}
                      onChange={(e) => setMinuteForm(m => ({ ...m, content: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-4">
                  <Button variant="ghost" className="h-14 rounded-2xl font-black px-10 text-lg" onClick={() => setMinuteDialog(false)}>{t.cancel}</Button>
                  <Button className="h-14 rounded-2xl font-black px-14 shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-lg" onClick={handleSaveMinute}>{t.publish}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-8 flex-1 overflow-y-auto max-h-[800px]">
            {loadingMinutes ? (
               <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-30">
                  <Loader2 className="animate-spin text-accent" size={48} />
                  <span className="font-black uppercase tracking-[0.2em]">Syncing Archive...</span>
               </div>
            ) : !minutes || minutes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 gap-8 opacity-20 grayscale">
                  <FileText size={80} />
                  <p className="text-2xl font-black uppercase tracking-[0.2em]">{t.noLogs}</p>
               </div>
            ) : (
              minutes.map(m => (
                <div key={m.id} className="group/item flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border-2 border-transparent hover:border-accent/20 transition-all duration-500 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-accent/10 rounded-2xl flex flex-col items-center justify-center text-accent group-hover/item:bg-accent group-hover/item:text-white transition-all">
                       <Calendar size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{m.title}</h4>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{m.meetingDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-accent hover:bg-accent/10 transition-all" onClick={() => openEditMinute(m)}>
                      <Edit2 size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => handleDelete('meetingMinutes', m.id)}>
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
