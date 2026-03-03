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
  orderBy
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Search, Save, Edit2, X, Loader2, User, Users, Zap, Plus, Trash2, Wand2 } from 'lucide-react';
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
  DropdownMenuTrigger
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
  
  const [quickReason, setQuickReason] = useState('');
  const [quickAmount, setQuickAmount] = useState<number>(10);
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
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

  const startEditingTemplate = (tpl: XpTemplate) => {
    setEditingTemplateId(tpl.id);
    setNewTemplate({ label: tpl.label, reason: tpl.reason, amount: tpl.amount });
  };

  const cancelEditingTemplate = () => {
    setEditingTemplateId(null);
    setNewTemplate({ label: '', reason: '', amount: 10 });
  };

  const handleSaveTemplate = () => {
    if (!db || !newTemplate.label || !newTemplate.reason) return;

    if (editingTemplateId) {
      const tplRef = doc(db, 'xp_templates', editingTemplateId);
      updateDocumentNonBlocking(tplRef, { ...newTemplate, updatedAt: new Date().toISOString() });
      setEditingTemplateId(null);
    } else {
      addDocumentNonBlocking(collection(db, 'xp_templates'), { ...newTemplate, createdAt: new Date(), updatedAt: new Date().toISOString() });
    }

    setNewTemplate({ label: '', reason: '', amount: 10 });
    toast({ title: t.xpUpdated });
  };

  const handleDeleteTemplate = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'xp_templates', id));
    toast({ variant: 'destructive', title: t.deleteConfirm });
    if (editingTemplateId === id) cancelEditingTemplate();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
                           u.email?.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Super Admin sees everyone except themselves
    if (isSuperAdmin) {
      return u.email !== SUPER_ADMIN_EMAIL;
    }

    // Normal Admins only see students and teachers
    return (u.role === 'student' || u.role === 'teacher');
  });

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
      <header className="flex flex-col gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700 w-full px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Badge className="bg-primary/10 text-primary font-black mb-1 rounded-full px-4 py-1 text-[9px] uppercase tracking-[0.2em] border-none shadow-sm">Command Center</Badge>
            <h1 className="text-3xl font-black font-headline tracking-tighter flex items-center gap-3 text-slate-900 dark:text-white leading-tight">
              <Users className="text-primary hidden md:block" size={30} />
              {t.adminPanel}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">{t.manageUsers}</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => { setIsTemplateDialogOpen(open); if (!open) cancelEditingTemplate(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 h-12 rounded-xl font-black px-5 shadow-lg border-none bg-white dark:bg-slate-900 transition-all hover:scale-[1.02]">
                  <Wand2 size={16} className="text-accent" />
                  {t.manageTemplates}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-slate-900 text-white p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Wand2 className="text-accent" size={24} />
                      {t.xpTemplates}
                    </DialogTitle>
                  </DialogHeader>
                </div>
                <div className="p-6 space-y-6 bg-white dark:bg-slate-950">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library</h4>
                    <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                      {loadingTemplates ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin opacity-20" /></div>
                      ) : templates?.map(tpl => (
                        <div key={tpl.id} className={cn(
                          "p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between group border transition-all",
                          editingTemplateId === tpl.id ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/20"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs",
                              tpl.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"
                            )}>
                              {tpl.amount > 0 ? '+' : ''}{tpl.amount}
                            </div>
                            <div>
                              <p className="font-black text-xs text-slate-900 dark:text-white">{tpl.label}</p>
                              <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">{tpl.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-primary" onClick={() => startEditingTemplate(tpl)}>
                              <Edit2 size={12} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => handleDeleteTemplate(tpl.id)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 pt-3 border-t dark:border-slate-800">
                    <Input placeholder={t.templateLabel} value={newTemplate.label} onChange={e => setNewTemplate(p => ({ ...p, label: e.target.value }))} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" value={newTemplate.amount} onChange={e => setNewTemplate(p => ({ ...p, amount: parseInt(e.target.value) }))} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-black text-center" />
                      <Button className="h-11 rounded-xl font-black bg-primary text-white" onClick={handleSaveTemplate}>
                        {editingTemplateId ? t.save : t.newTemplate}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="relative w-full md:w-[280px] group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" />
              <Input 
                placeholder={t.searchUsers} 
                className="pl-11 h-12 w-full rounded-xl bg-white dark:bg-slate-900 border-none shadow-lg focus:ring-4 focus:ring-primary/5 font-bold text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 text-white rounded-[2rem] border-none shadow-xl flex flex-col lg:flex-row items-center gap-6 overflow-hidden relative group">
          <div className="flex items-center gap-4 shrink-0 z-10">
            <div className={cn("p-3 rounded-xl transition-all", quickReason ? "bg-primary scale-110" : "bg-slate-800")}>
              <Zap size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{t.quickActions}</span>
              <h3 className="text-lg font-black tracking-tight">Mass Adjustment</h3>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full z-10">
            <Input 
              placeholder={t.reasonPlaceholder}
              value={quickReason}
              onChange={(e) => setQuickReason(e.target.value)}
              className="h-12 bg-white/5 border-none rounded-xl text-white font-bold px-6 placeholder:text-white/20 focus:ring-4 focus:ring-primary/10 w-full"
            />
            <div className="flex items-center gap-3 w-full md:w-44 shrink-0 bg-white/5 rounded-xl px-4 h-12 border border-white/5">
              <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">XP</span>
              <Input 
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(parseInt(e.target.value))}
                className="bg-transparent border-none text-white font-black text-center focus:ring-0 text-lg w-full"
              />
            </div>
          </div>
        </Card>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-20">
        <TooltipProvider>
          <Table className="table-fixed w-full min-w-full">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-none">
                <TableHead className="w-[30%] py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.name}</TableHead>
                <TableHead className="w-[20%] py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px] hidden lg:table-cell text-center">{t.role}</TableHead>
                <TableHead className="w-[15%] py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">{t.xp}</TableHead>
                <TableHead className="w-[35%] py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto opacity-20" size={32} /></TableCell></TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20 font-black text-slate-200 uppercase tracking-widest">No Identities Found</TableCell></TableRow>
              ) : filteredUsers.map((u) => (
                <TableRow key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all duration-300 group">
                  <TableCell className="py-4 px-8">
                    {editingId === u.id ? (
                      <Input value={editForm.displayName} onChange={e => setEditForm(prev => ({ ...prev, displayName: e.target.value }))} className="h-10 text-sm font-bold rounded-lg" />
                    ) : (
                      <div className="flex items-center gap-4 overflow-hidden">
                        <Avatar className="h-11 w-11 rounded-xl shrink-0">
                          <AvatarImage src={u.photoURL} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{u.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-slate-900 dark:text-white truncate">{u.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{u.email}</span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4 hidden lg:table-cell">
                    <div className="flex justify-center">
                      {editingId === u.id ? (
                        <Select value={editForm.role} onValueChange={(val: any) => setEditForm(p => ({ ...p, role: val }))} disabled={!canModifyRoles}>
                          <SelectTrigger className="h-9 text-xs font-bold rounded-lg border-none bg-slate-100 dark:bg-slate-800"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="teacher">Teacher</SelectItem><SelectItem value="council">Council</SelectItem><SelectItem value="administration">Admin</SelectItem></SelectContent>
                        </Select>
                      ) : (
                        <Badge className="capitalize bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-none px-3 py-1 rounded-lg font-black text-[9px] tracking-widest">
                          {u.role}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-center">
                    {editingId === u.id ? (
                      <Input type="number" value={editForm.xp} onChange={e => setEditForm(p => ({ ...p, xp: parseInt(e.target.value) }))} className="h-10 w-20 mx-auto text-center font-black" />
                    ) : (
                      <Badge className={cn("h-8 px-4 rounded-lg font-black text-xs border-none shadow-sm", u.xp < 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-600")}>
                        {u.xp > 0 ? '+' : ''}{u.xp}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-8 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {!editingId && (u.role === 'student' || u.role === 'council') && (
                        <div className="flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                <Wand2 size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-2 min-w-[200px] border-none shadow-2xl">
                              {templates?.map(tpl => (
                                <DropdownMenuItem key={tpl.id} className="rounded-lg px-3 py-2 cursor-pointer font-bold text-xs flex justify-between" onClick={() => applyXP(u, tpl.reason, tpl.amount)}>
                                  <span>{tpl.label}</span>
                                  <span className={tpl.amount > 0 ? "text-emerald-500" : "text-destructive"}>{tpl.amount > 0 ? '+' : ''}{tpl.amount}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button size="icon" variant="ghost" className={cn("h-10 w-10 rounded-xl transition-all", quickReason ? "text-primary bg-primary/10" : "text-slate-200")} onClick={() => applyXP(u, quickReason, quickAmount)} disabled={!quickReason}>
                            <Zap size={18} />
                          </Button>
                        </div>
                      )}
                      {editingId === u.id ? (
                        <div className="flex gap-2">
                          <Button size="icon" className="h-10 w-10 rounded-xl bg-emerald-500 text-white" onClick={() => saveUserChanges(u.id)}><Save size={18} /></Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-destructive" onClick={cancelEditing}><X size={18} /></Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary" onClick={() => startEditing(u)}><Edit2 size={18} /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </AppLayout>
  );
}
