"use client";

import { useEffect, useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  collection, 
  getDocs, 
  doc, 
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Search, Save, Edit2, X, Loader2, User, Users, Zap, Info, Plus, Trash2, Wand2, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface UserData {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xp: number;
  photoURL?: string;
}

interface XpTemplate {
  id: string;
  label: string;
  reason: string;
  amount: number;
  createdAt: any;
}

const SUPER_ADMIN_EMAIL = 'ibrahimezzine09@gmail.com';

export default function AdminPage() {
  const { isSuperAdmin, profile, loading: authLoading } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  
  // Quick Actions State
  const [quickReason, setQuickReason] = useState('');
  const [quickAmount, setQuickAmount] = useState<number>(10);
  
  // Template Management State
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ label: '', reason: '', amount: 10 });

  const { toast } = useToast();

  const isAdmin = profile?.role === 'administration' || isSuperAdmin;
  const canModifyRoles = isSuperAdmin;

  const templatesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'xp_templates'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: templates, isLoading: loadingTemplates } = useCollection<XpTemplate>(templatesQuery);

  useEffect(() => {
    if (!authLoading && isAdmin && db) {
      fetchUsers();
    }
  }, [authLoading, isAdmin, db]);

  const fetchUsers = async () => {
    if (!db) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userData = querySnapshot.docs.map(doc => doc.data() as UserData);
      setUsers(userData);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'users',
          operation: 'list'
        }));
      }
    } finally {
      setFetching(false);
    }
  };

  const applyXP = (user: UserData, reason: string, amount: number) => {
    if (!db || !isAdmin || !reason) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a reason before applying XP.",
      });
      return;
    }

    const newXP = user.xp + amount;
    const userDocRef = doc(db, 'users', user.id);
    const logColRef = collection(db, 'users', user.id, 'xp_logs');

    updateDocumentNonBlocking(userDocRef, { 
      xp: newXP,
      updatedAt: new Date().toISOString()
    });

    addDocumentNonBlocking(logColRef, {
      amount: amount,
      reason: reason,
      timestamp: new Date().toISOString()
    });

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, xp: newXP } : u));

    toast({
      title: "Success",
      description: `${amount > 0 ? '+' : ''}${amount} XP applied to ${user.displayName}`,
    });
  };

  const startEditing = (u: UserData) => {
    setEditingId(u.id);
    setEditForm({ ...u });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveUserChanges = (id: string) => {
    if (!db || !isAdmin) return;
    const userDocRef = doc(db, 'users', id);
    const currentUser = users.find(u => u.id === id);
    if (!currentUser) return;

    const newXP = Number(editForm.xp);
    const roleToSave = canModifyRoles ? (editForm.role || currentUser.role) : currentUser.role;
    const roleChanged = canModifyRoles && editForm.role !== currentUser.role;

    updateDocumentNonBlocking(userDocRef, { 
      displayName: editForm.displayName, 
      xp: newXP,
      role: roleToSave,
      updatedAt: new Date().toISOString()
    });

    if (roleChanged && canModifyRoles) {
      if (currentUser.role === 'administration') {
        deleteDocumentNonBlocking(doc(db, 'roles_admin', id));
      } else if (currentUser.role === 'council') {
        deleteDocumentNonBlocking(doc(db, 'roles_council', id));
      }

      if (roleToSave === 'administration') {
        setDocumentNonBlocking(doc(db, 'roles_admin', id), { userId: id, createdAt: new Date().toISOString() }, { merge: true });
      } else if (roleToSave === 'council') {
        setDocumentNonBlocking(doc(db, 'roles_council', id), { userId: id, createdAt: new Date().toISOString() }, { merge: true });
      }
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editForm, role: roleToSave, xp: newXP } : u));
    setEditingId(null);
    
    toast({
      title: t.xpUpdated,
      description: `Identity updated successfully.`,
    });
  };

  const handleSaveTemplate = () => {
    if (!db || !newTemplate.label || !newTemplate.reason) return;

    addDocumentNonBlocking(collection(db, 'xp_templates'), {
      ...newTemplate,
      createdAt: new Date(),
      updatedAt: new Date().toISOString()
    });

    setNewTemplate({ label: '', reason: '', amount: 10 });
    toast({ title: t.xpUpdated });
  };

  const handleDeleteTemplate = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'xp_templates', id));
    toast({ variant: 'destructive', title: t.deleteConfirm });
  };

  const filteredUsers = users.filter(u => 
    u.email !== SUPER_ADMIN_EMAIL &&
    (u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
       <div className="flex flex-col items-center gap-6">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Syncing Registry...</p>
       </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldCheck size={60} className="mx-auto text-destructive mb-4 opacity-20" />
        <h1 className="text-3xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-tight">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-bold">Only authorized staff can access this registry.</p>
        <Button variant="outline" className="mt-6 rounded-xl px-8 h-12 font-black" onClick={() => window.location.href = '/dashboard'}>Return</Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <header className="flex flex-col gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700 w-full px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Badge className="bg-primary/10 text-primary font-black mb-1 rounded-full px-4 py-1.5 border-none shadow-sm uppercase tracking-[0.2em] text-[10px]">Command Center</Badge>
            <h1 className="text-4xl font-black font-headline tracking-tighter flex items-center gap-3 text-slate-900 dark:text-white leading-tight">
              <Users className="text-primary hidden md:block" size={36} />
              {t.adminPanel}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base tracking-tight">{t.manageUsers}</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-3 h-14 rounded-2xl font-black px-6 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 border-none bg-white dark:bg-slate-900 transition-all hover:scale-[1.02]">
                  <Wand2 size={20} className="text-accent" />
                  {t.manageTemplates}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-slate-900 text-white p-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                      <Wand2 className="text-accent" />
                      {t.xpTemplates}
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-slate-400 text-sm font-bold mt-2">Create standardized actions for rapid community management.</p>
                </div>
                <div className="p-8 space-y-8 bg-white dark:bg-slate-950">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Library</h4>
                    <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {loadingTemplates ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin opacity-20" /></div>
                      ) : !templates || templates.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Templates Yet</p>
                        </div>
                      ) : (
                        templates.map(tpl => (
                          <div key={tpl.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between group border border-transparent hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center font-black",
                                tpl.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"
                              )}>
                                {tpl.amount > 0 ? '+' : ''}{tpl.amount}
                              </div>
                              <div>
                                <p className="font-black text-sm text-slate-900 dark:text-white">{tpl.label}</p>
                                <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{tpl.reason}</p>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteTemplate(tpl.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Create New</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder={t.templateLabel} value={newTemplate.label} onChange={e => setNewTemplate(p => ({ ...p, label: e.target.value }))} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold" />
                      <Input type="number" value={newTemplate.amount} onChange={e => setNewTemplate(p => ({ ...p, amount: parseInt(e.target.value) }))} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-black text-center" />
                    </div>
                    <Input placeholder={t.reasonPlaceholder} value={newTemplate.reason} onChange={e => setNewTemplate(p => ({ ...p, reason: e.target.value }))} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold" />
                    <Button className="h-12 rounded-xl font-black w-full shadow-lg text-white" onClick={handleSaveTemplate}>
                      <Plus className="mr-2" size={16} />
                      {t.newTemplate}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="relative w-full md:w-[320px] group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" />
              <Input 
                placeholder={t.searchUsers} 
                className="pl-12 h-14 w-full rounded-2xl bg-white dark:bg-slate-900 border-none shadow-lg focus:ring-4 focus:ring-primary/5 transition-all font-bold text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <Card className="p-8 bg-slate-900 text-white rounded-[2.5rem] border-none shadow-2xl flex flex-col lg:flex-row items-center gap-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
             <Zap size={250} />
          </div>
          <div className="flex items-center gap-5 shrink-0 z-10">
            <div className={cn(
              "p-4 rounded-2xl shadow-lg transition-all duration-500",
              quickReason ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-slate-800 text-slate-500"
            )}>
              <Zap size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">{t.quickActions}</span>
              <h3 className="text-xl font-black tracking-tighter leading-none">Mass Application</h3>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center gap-5 w-full z-10">
            <div className="relative flex-1 w-full">
              <Input 
                placeholder={t.reasonPlaceholder}
                value={quickReason}
                onChange={(e) => setQuickReason(e.target.value)}
                className="h-14 bg-white/5 border-none rounded-2xl text-white font-bold px-8 placeholder:text-white/20 focus:ring-8 focus:ring-primary/10 w-full text-lg"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-56 shrink-0 bg-white/5 rounded-2xl px-6 h-14 border border-white/5">
              <span className="text-xs font-black uppercase text-white/30 tracking-widest">XP</span>
              <Input 
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(parseInt(e.target.value))}
                className="bg-transparent border-none text-white font-black text-center focus:ring-0 text-xl w-full"
              />
              <div className="flex flex-col gap-1">
                 <button onClick={() => setQuickAmount(p => p + 5)} className="text-white/20 hover:text-white transition-colors"><Plus size={12} /></button>
                 <button onClick={() => setQuickAmount(p => p - 5)} className="text-white/20 hover:text-white transition-colors"><X size={12} /></button>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity z-10 px-4">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", quickReason ? "bg-emerald-500" : "bg-destructive")} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {quickReason ? "Zap Ready" : "Set Reason"}
            </span>
          </div>
        </Card>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-20">
        <TooltipProvider>
          <Table className="table-auto w-full">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-none">
                <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-widest text-[11px]">{t.name}</TableHead>
                <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-widest text-[11px] hidden lg:table-cell">{t.email}</TableHead>
                <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-widest text-[11px] text-center">{t.xp}</TableHead>
                <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-widest text-[11px]">{t.role}</TableHead>
                <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-widest text-[11px] text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={48} className="animate-spin text-primary opacity-30" />
                      <span className="text-slate-300 font-black uppercase tracking-[0.4em] animate-pulse text-xs">Syncing Session...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32">
                    <div className="flex flex-col items-center gap-8 opacity-20 grayscale">
                        <User size={80} />
                        <p className="text-2xl font-black uppercase tracking-[0.3em]">No Identities Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all duration-500 group/row">
                    <TableCell className="py-6 px-10">
                      {editingId === u.id ? (
                        <Input 
                          value={editForm.displayName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-base px-6 shadow-inner"
                        />
                      ) : (
                        <div className="flex items-center gap-5">
                          <Avatar className="h-14 w-14 rounded-2xl border-none shadow-xl shrink-0 transition-transform group-hover/row:scale-110 duration-500">
                            <AvatarImage src={u.photoURL} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
                              {u.displayName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">{u.displayName}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest lg:hidden">{u.role}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-6 px-10 text-slate-400 dark:text-slate-500 font-bold text-sm hidden lg:table-cell">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-6 px-10 text-center">
                      {editingId === u.id ? (
                        <Input 
                          type="number"
                          value={editForm.xp} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                          className="h-12 w-28 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-lg px-2 shadow-inner text-center"
                        />
                      ) : (
                        u.role === 'student' || u.role === 'council' ? (
                          <Badge className={cn(
                            "h-10 px-6 rounded-2xl font-black text-base shadow-lg border-none transition-all group-hover/row:scale-105",
                            u.xp < 0 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                          )}>
                            {u.xp > 0 ? '+' : ''}{u.xp}
                          </Badge>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800 font-black text-sm px-2">—</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="py-6 px-10">
                      {editingId === u.id ? (
                        <Select 
                          value={editForm.role} 
                          onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                          disabled={!canModifyRoles}
                        >
                          <SelectTrigger className={cn(
                            "w-full h-12 rounded-2xl border-none font-black text-sm px-6 shadow-inner",
                            canModifyRoles ? "bg-slate-100 dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900/50 opacity-50 cursor-not-allowed"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-none p-2 bg-white dark:bg-slate-900">
                            <SelectItem value="student" className="rounded-xl px-4 py-3 font-black text-sm">Student</SelectItem>
                            <SelectItem value="teacher" className="rounded-xl px-4 py-3 font-black text-sm">Teacher</SelectItem>
                            <SelectItem value="council" className="rounded-xl px-4 py-3 font-black text-sm">Council</SelectItem>
                            <SelectItem value="administration" className="rounded-xl px-4 py-3 font-black text-sm">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="capitalize bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-none px-5 py-2 rounded-xl font-black text-[11px] tracking-widest">
                          {u.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-6 px-10 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {/* Template and Quick XP Actions */}
                        {(u.role === 'student' || u.role === 'council') && !editingId && (
                          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl shadow-lg border-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 transition-all">
                                  <Wand2 size={20} className="text-accent" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-[1.5rem] shadow-2xl p-3 min-w-[240px] border-none bg-white dark:bg-slate-950">
                                <div className="px-4 py-3 mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.applyTemplate}</span>
                                </div>
                                {templates?.length === 0 ? (
                                  <div className="p-6 text-center text-xs text-slate-300 font-black uppercase border-2 border-dashed border-slate-50 dark:border-slate-900 rounded-xl">No Templates</div>
                                ) : (
                                  templates?.map(tpl => (
                                    <DropdownMenuItem key={tpl.id} className="rounded-xl px-4 py-4 cursor-pointer hover:bg-primary/5 group" onClick={() => applyXP(u, tpl.reason, tpl.amount)}>
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                          <span className="font-black text-sm group-hover:text-primary transition-colors">{tpl.label}</span>
                                          <span className="text-[10px] text-slate-400 font-bold">{tpl.reason}</span>
                                        </div>
                                        <Badge className={cn(
                                          "ml-4 h-8 px-3 rounded-lg font-black text-xs border-none shadow-sm",
                                          tpl.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-destructive/10 text-destructive"
                                        )}>
                                          {tpl.amount > 0 ? '+' : ''}{tpl.amount}
                                        </Badge>
                                      </div>
                                    </DropdownMenuItem>
                                  ))
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="icon" 
                                  className={cn(
                                    "h-12 w-12 rounded-2xl shadow-2xl transition-all duration-500",
                                    quickReason 
                                      ? "bg-primary hover:bg-primary/90 text-white hover:scale-125 active:scale-95 shadow-primary/30" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed opacity-40"
                                  )}
                                  onClick={() => applyXP(u, quickReason, quickAmount)}
                                  disabled={!quickReason}
                                >
                                  <Zap size={20} className={cn(quickReason && "animate-pulse")} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-slate-900 text-white font-black text-[11px] border-none rounded-xl p-3 shadow-2xl">
                                {quickReason ? `${t.apply} ${quickAmount > 0 ? '+' : ''}${quickAmount} XP` : "Set Reason in Header First"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}

                        {editingId === u.id ? (
                          <div className="flex justify-end gap-3">
                            <Button size="icon" className="h-12 w-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl text-white hover:scale-105 transition-all" onClick={() => saveUserChanges(u.id)}>
                              <Save size={20} />
                            </Button>
                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800 text-destructive hover:bg-destructive/5 transition-all" onClick={cancelEditing}>
                              <X size={20} />
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-primary hover:bg-primary/10 transition-all ml-2" onClick={() => startEditing(u)}>
                            <Edit2 size={20} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </AppLayout>
  );
}
