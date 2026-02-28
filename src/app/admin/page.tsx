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
import { ShieldCheck, UserCog, Search, Save, Edit2, X, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserData {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xp: number;
}

export default function AdminPage() {
  const { isSuperAdmin, profile, loading: authLoading } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const { toast } = useToast();

  const isAdmin = isSuperAdmin || profile?.role === 'administration';

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

  const startEditing = (user: UserData) => {
    setEditingId(user.id);
    setEditForm({ displayName: user.displayName, xp: user.xp, role: user.role });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveUserChanges = (id: string) => {
    if (!db || !profile) return;
    const userDocRef = doc(db, 'users', id);
    const currentUser = users.find(u => u.id === id);
    if (!currentUser) return;

    const newXP = Number(editForm.xp);
    const roleChanged = editForm.role !== currentUser.role;

    updateDocumentNonBlocking(userDocRef, { 
      displayName: editForm.displayName, 
      xp: newXP,
      role: editForm.role,
      updatedAt: new Date().toISOString()
    });

    if (roleChanged) {
      if (currentUser.role === 'administration') {
        deleteDocumentNonBlocking(doc(db, 'roles_admin', id));
      } else if (currentUser.role === 'council') {
        deleteDocumentNonBlocking(doc(db, 'roles_council', id));
      }

      if (editForm.role === 'administration') {
        setDocumentNonBlocking(doc(db, 'roles_admin', id), { userId: id, createdAt: new Date().toISOString() }, { merge: true });
      } else if (editForm.role === 'council') {
        setDocumentNonBlocking(doc(db, 'roles_council', id), { userId: id, createdAt: new Date().toISOString() }, { merge: true });
      }
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editForm, xp: newXP } : u));
    setEditingId(null);
    
    toast({
      title: t.xpUpdated,
      description: `Identity updated successfully.`,
    });
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
       <div className="flex flex-col items-center gap-6">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Syncing Admin Hub...</p>
       </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldCheck size={60} className="mx-auto text-destructive mb-4 opacity-20" />
        <h1 className="text-3xl font-black font-headline tracking-tighter">Access Denied</h1>
        <p className="text-muted-foreground mt-2 font-bold">Only the Hub Administration can access this page.</p>
        <Button variant="outline" className="mt-6 rounded-xl px-8 h-12 font-black" onClick={() => window.location.href = '/dashboard'}>Return to Hub</Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700 w-full px-4">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary font-black mb-1 rounded-full px-4 py-1 border-none shadow-sm uppercase tracking-[0.2em] text-[9px]">Command Center</Badge>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white leading-tight">
            <UserCog className="text-primary hidden md:block" size={48} />
            {t.adminPanel}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight">{t.manageUsers}</p>
        </div>
        
        <div className="relative w-full md:w-[350px] group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" />
          <Input 
            placeholder={t.searchUsers} 
            className="pl-14 h-14 w-full rounded-2xl bg-white dark:bg-slate-900 border-none shadow-lg focus:ring-8 focus:ring-primary/5 transition-all font-black text-lg placeholder:text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-xl overflow-x-auto animate-in fade-in slide-in-from-bottom-8 duration-700 mb-20 no-scrollbar">
        <TooltipProvider>
          <Table className="table-fixed min-w-[900px] lg:min-w-full">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-none">
                <TableHead className="w-[30%] py-6 px-6 md:px-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">{t.name}</TableHead>
                <TableHead className="w-[30%] py-6 px-6 md:px-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">{t.email}</TableHead>
                <TableHead className="w-[12%] py-6 px-6 md:px-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">{t.xp}</TableHead>
                <TableHead className="w-[18%] py-6 px-6 md:px-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">{t.role}</TableHead>
                <TableHead className="w-[10%] py-6 px-6 md:px-8 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-40">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-primary opacity-40" />
                      <span className="text-slate-300 font-black uppercase tracking-[0.3em] animate-pulse text-sm">Syncing...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-40">
                    <div className="flex flex-col items-center gap-6 opacity-20 grayscale">
                        <User size={60} />
                        <p className="text-xl font-black uppercase tracking-[0.2em]">No Identities</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300 group/row">
                    <TableCell className="py-4 px-6 md:px-8">
                      {editingId === u.id ? (
                        <Input 
                          value={editForm.displayName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-base px-4 shadow-inner"
                        />
                      ) : (
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg group-hover/row:scale-105 transition-all duration-300">
                            {u.displayName?.charAt(0)}
                          </div>
                          <span className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">{u.displayName}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 md:px-8 text-slate-400 dark:text-slate-500 font-bold text-sm md:text-base truncate">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-4 px-6 md:px-8">
                      {editingId === u.id ? (
                        <Input 
                          type="number"
                          value={editForm.xp} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                          className="h-10 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-base px-3 shadow-inner"
                        />
                      ) : (
                        u.role === 'student' || u.role === 'council' ? (
                          <Badge className={cn(
                            "h-9 px-3 rounded-xl font-black text-sm shadow-sm border-2",
                            u.xp < 0 
                              ? "bg-destructive/5 text-destructive border-destructive/10" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                          )}>
                            {u.xp > 0 ? '+' : ''}{u.xp}
                          </Badge>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800 font-black text-sm">—</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 md:px-8">
                      {editingId === u.id ? (
                        <Select 
                          value={editForm.role} 
                          onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                        >
                          <SelectTrigger className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-sm px-4 shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl border-none p-2">
                            <SelectItem value="student" className="rounded-lg px-4 py-2 font-black text-sm">Student</SelectItem>
                            <SelectItem value="teacher" className="rounded-lg px-4 py-2 font-black text-sm">Teacher</SelectItem>
                            <SelectItem value="council" className="rounded-lg px-4 py-2 font-black text-sm">Council</SelectItem>
                            <SelectItem value="administration" className="rounded-lg px-4 py-2 font-black text-sm">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="capitalize bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-none px-3 py-1.5 rounded-xl font-black text-[9px] tracking-widest">
                          {u.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 md:px-8 text-right">
                      {editingId === u.id ? (
                        <div className="flex justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" className="h-9 w-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg text-white" onClick={() => saveUserChanges(u.id)}>
                                <Save size={18} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="font-black text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500 text-white border-none shadow-lg">Save</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-destructive hover:bg-destructive hover:text-white" onClick={cancelEditing}>
                                <X size={18} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="font-black text-[10px] px-3 py-1.5 rounded-lg bg-destructive text-white border-none shadow-lg">Cancel</TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-primary/10 transition-all group-hover/row:text-primary" onClick={() => startEditing(u)}>
                              <Edit2 size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="font-black text-[10px] px-3 py-1.5 rounded-lg bg-slate-900 text-white border-none shadow-lg">Edit</TooltipContent>
                        </Tooltip>
                      )}
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
