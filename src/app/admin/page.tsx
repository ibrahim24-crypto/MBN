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
import { ShieldCheck, Search, Save, Edit2, X, Loader2, User, Users, Zap, Info, Plus, Trash2, Wand2 } from 'lucide-react';
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
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

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

    if (editingTemplateId) {
      updateDocumentNonBlocking(doc(db, 'xp_templates', editingTemplateId), {
        ...newTemplate,
        updatedAt: new Date().toISOString()
      });
    } else {
      addDocumentNonBlocking(collection(db, 'xp_templates'), {
        ...newTemplate,
        createdAt: new Date(),
        updatedAt: new Date().toISOString()
      });
    }

    setIsTemplateDialogOpen(false);
    setNewTemplate({ label: '', reason: '', amount: 10 });
    setEditingTemplateId(null);
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
        <p className="text-slate-500 mt-2 font-bold">Only administrators can access this command center.</p>
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
                <Button variant="outline" className="gap-2 h-14 rounded-2xl font-black px-6 shadow-lg hover:bg-slate-50 border-none bg-white">
                  <Wand2 size={20} className="text-accent" />
                  {t.manageTemplates}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-2xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black tracking-tight">{t.xpTemplates}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {templates?.map(tpl => (
                    <div key={tpl.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between group">
                      <div>
                        <p className="font-black text-sm">{tpl.label}</p>
                        <p className="text-xs text-slate-400">{tpl.reason} ({tpl.amount > 0 ? '+' : ''}{tpl.amount} XP)</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => handleDeleteTemplate(tpl.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <DropdownMenuSeparator className="my-4" />
                  <div className="space-y-4 pt-2">
                    <Input placeholder={t.templateLabel} value={newTemplate.label} onChange={e => setNewTemplate(p => ({ ...p, label: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    <Input placeholder={t.reasonPlaceholder} value={newTemplate.reason} onChange={e => setNewTemplate(p => ({ ...p, reason: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                    <Input type="number" value={newTemplate.amount} onChange={e => setNewTemplate(p => ({ ...p, amount: parseInt(e.target.value) }))} className="h-12 rounded-xl bg-slate-50 border-none font-black" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="h-12 rounded-xl font-black w-full" onClick={handleSaveTemplate}>{t.publish}</Button>
                </DialogFooter>
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
        <Card className="p-6 bg-slate-900 text-white rounded-[2rem] border-none shadow-2xl flex flex-col lg:flex-row items-center gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
             <Zap size={200} />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
              <Zap size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/50">{t.quickActions}</span>
              <h3 className="text-lg font-black tracking-tight leading-none">Mass Application</h3>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full">
            <Input 
              placeholder={t.reasonPlaceholder}
              value={quickReason}
              onChange={(e) => setQuickReason(e.target.value)}
              className="h-12 bg-white/5 border-none rounded-xl text-white font-bold px-6 placeholder:text-white/20 focus:ring-4 focus:ring-primary/20 w-full"
            />
            <div className="flex items-center gap-2 w-full md:w-48 shrink-0">
              <span className="text-xs font-black uppercase text-white/40 ml-2">XP</span>
              <Input 
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(parseInt(e.target.value))}
                className="h-12 bg-white/5 border-none rounded-xl text-white font-black px-4 text-center focus:ring-4 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Enter a reason to enable Zap buttons</span>
          </div>
        </Card>
      </header>

      <div className="w-full max-w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 mb-20">
        <TooltipProvider>
          <Table className="table-auto w-full">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-none">
                <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.name}</TableHead>
                <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] hidden lg:table-cell">{t.email}</TableHead>
                <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">{t.xp}</TableHead>
                <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.role}</TableHead>
                <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-primary opacity-40" />
                      <span className="text-slate-300 font-black uppercase tracking-[0.3em] animate-pulse text-sm">Syncing...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-6 opacity-20 grayscale">
                        <User size={60} />
                        <p className="text-xl font-black uppercase tracking-[0.2em]">No Identities Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300 group/row">
                    <TableCell className="py-4 px-8">
                      {editingId === u.id ? (
                        <Input 
                          value={editForm.displayName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm px-4 shadow-inner"
                        />
                      ) : (
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-2xl border-none shadow-md shrink-0 transition-transform group-hover/row:scale-110">
                            <AvatarImage src={u.photoURL} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-base">
                              {u.displayName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-base font-black text-slate-900 dark:text-white">{u.displayName}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-8 text-slate-400 dark:text-slate-500 font-medium text-xs hidden lg:table-cell">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-4 px-8 text-center">
                      {editingId === u.id ? (
                        <Input 
                          type="number"
                          value={editForm.xp} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                          className="h-10 w-24 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-sm px-2 shadow-inner text-center"
                        />
                      ) : (
                        u.role === 'student' || u.role === 'council' ? (
                          <Badge className={cn(
                            "h-8 px-4 rounded-xl font-black text-sm shadow-none border-none",
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
                    <TableCell className="py-4 px-8">
                      {editingId === u.id ? (
                        <Select 
                          value={editForm.role} 
                          onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                          disabled={!canModifyRoles}
                        >
                          <SelectTrigger className={cn(
                            "w-full h-10 rounded-xl border-none font-black text-xs px-4 shadow-inner",
                            canModifyRoles ? "bg-slate-100 dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900/50 opacity-50 cursor-not-allowed"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                            <SelectItem value="student" className="rounded-xl px-4 py-3 font-black text-sm">Student</SelectItem>
                            <SelectItem value="teacher" className="rounded-xl px-4 py-3 font-black text-sm">Teacher</SelectItem>
                            <SelectItem value="council" className="rounded-xl px-4 py-3 font-black text-sm">Council</SelectItem>
                            <SelectItem value="administration" className="rounded-xl px-4 py-3 font-black text-sm">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="capitalize bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-none px-4 py-1.5 rounded-lg font-black text-[10px] tracking-widest">
                          {u.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-8 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Template and Quick XP Actions */}
                        {(u.role === 'student' || u.role === 'council') && !editingId && (
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl shadow-md border-none bg-slate-50 hover:bg-slate-100">
                                  <Wand2 size={18} className="text-accent" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl p-2 min-w-[200px]">
                                {templates?.length === 0 ? (
                                  <div className="p-4 text-center text-xs text-slate-400 font-black uppercase">No Templates</div>
                                ) : (
                                  templates?.map(tpl => (
                                    <DropdownMenuItem key={tpl.id} className="rounded-xl px-4 py-3 cursor-pointer" onClick={() => applyXP(u, tpl.reason, tpl.amount)}>
                                      <div className="flex flex-col">
                                        <span className="font-black text-sm">{tpl.label}</span>
                                        <span className="text-[10px] text-slate-400">{tpl.amount > 0 ? '+' : ''}{tpl.amount} XP</span>
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
                                    "h-10 w-10 rounded-xl shadow-lg transition-all",
                                    quickReason 
                                      ? "bg-primary hover:bg-primary/90 text-white hover:scale-110 active:scale-90" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed"
                                  )}
                                  onClick={() => applyXP(u, quickReason, quickAmount)}
                                  disabled={!quickReason}
                                >
                                  <Zap size={18} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-slate-900 text-white font-black text-[10px] border-none rounded-lg p-2">
                                {quickReason ? `${t.apply} ${quickAmount > 0 ? '+' : ''}${quickAmount} XP` : "Define reason first"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}

                        {editingId === u.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg text-white" onClick={() => saveUserChanges(u.id)}>
                              <Save size={18} />
                            </Button>
                            <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800 text-destructive" onClick={cancelEditing}>
                              <X size={18} />
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/10" onClick={() => startEditing(u)}>
                            <Edit2 size={18} />
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
