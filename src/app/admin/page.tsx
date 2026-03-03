
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
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Search, Save, Edit2, X, Loader2, User, Users, Zap, Info } from 'lucide-react';
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

interface UserData {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xp: number;
  photoURL?: string;
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
  
  const { toast } = useToast();

  const isAdmin = profile?.role === 'administration' || isSuperAdmin;
  const canModifyRoles = isSuperAdmin;

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

  const applyQuickXP = (user: UserData) => {
    if (!db || !isAdmin || !quickReason) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a reason before applying XP.",
      });
      return;
    }

    const newXP = user.xp + quickAmount;
    const userDocRef = doc(db, 'users', user.id);
    const logColRef = collection(db, 'users', user.id, 'xp_logs');

    // 1. Update User XP
    updateDocumentNonBlocking(userDocRef, { 
      xp: newXP,
      updatedAt: new Date().toISOString()
    });

    // 2. Add to History
    addDocumentNonBlocking(logColRef, {
      amount: quickAmount,
      reason: quickReason,
      timestamp: new Date().toISOString()
    });

    // 3. Update local state
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, xp: newXP } : u));

    toast({
      title: "Success",
      description: `${quickAmount > 0 ? '+' : ''}${quickAmount} XP applied to ${user.displayName}`,
    });
  };

  const startEditing = (user: UserData) => {
    setEditingId(user.id);
    setEditForm({ displayName: user.displayName, xp: user.xp, role: user.role });
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
                        {/* Quick XP Apply Button */}
                        {(u.role === 'student' || u.role === 'council') && !editingId && (
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
                                onClick={() => applyQuickXP(u)}
                                disabled={!quickReason}
                              >
                                <Zap size={18} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white font-black text-[10px] border-none rounded-lg p-2">
                              {quickReason ? `${t.apply} ${quickAmount > 0 ? '+' : ''}${quickAmount} XP` : "Define reason first"}
                            </TooltipContent>
                          </Tooltip>
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
