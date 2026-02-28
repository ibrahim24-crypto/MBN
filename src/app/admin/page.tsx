
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
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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
    const xpDifference = newXP - currentUser.xp;
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

    if (xpDifference !== 0) {
      addDocumentNonBlocking(collection(db, 'users', id, 'xp_logs'), {
        userId: id,
        amount: xpDifference,
        reason: t.manualAdjustment,
        adminId: profile.id,
        timestamp: new Date().toISOString()
      });
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
          <Loader2 size={64} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Admin Hub...</p>
       </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldCheck size={72} className="mx-auto text-destructive mb-6 opacity-20" />
        <h1 className="text-4xl font-black font-headline tracking-tighter">Access Denied</h1>
        <p className="text-muted-foreground mt-2 font-bold">Only the Hub Administration can access this page.</p>
        <Button variant="outline" className="mt-8 rounded-2xl px-10 h-14 font-black" onClick={() => window.location.href = '/dashboard'}>Return to Hub</Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000 w-full px-4">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary font-black mb-2 rounded-full px-6 py-1.5 border-none shadow-sm uppercase tracking-[0.3em] text-[10px]">Command Center</Badge>
          <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter flex items-center gap-6 text-slate-900 dark:text-white leading-[0.85]">
            <UserCog className="text-primary hidden md:block" size={72} />
            {t.adminPanel}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-2xl tracking-tight">{t.manageUsers}</p>
        </div>
        
        <div className="relative w-full md:w-[450px] group">
          <div className="absolute inset-0 bg-primary/10 blur-[60px] -z-10 rounded-full opacity-30 group-focus-within:opacity-60 transition-opacity"></div>
          <Search size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" />
          <Input 
            placeholder={t.searchUsers} 
            className="pl-20 h-20 w-full rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] focus:ring-12 focus:ring-primary/5 transition-all font-black text-2xl placeholder:text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[4rem] border-none shadow-[0_64px_128px_-32px_rgba(0,0,0,0.12)] overflow-x-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 mb-40 no-scrollbar">
        <TooltipProvider>
          <Table className="table-fixed min-w-[1000px] lg:min-w-full">
            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md">
              <TableRow className="border-none">
                <TableHead className="w-[25%] py-8 md:py-12 px-6 md:px-8 lg:px-12 font-black text-slate-400 uppercase tracking-[0.4em] text-[11px]">{t.name}</TableHead>
                <TableHead className="w-[25%] py-8 md:py-12 px-6 md:px-8 lg:px-12 font-black text-slate-400 uppercase tracking-[0.4em] text-[11px]">{t.email}</TableHead>
                <TableHead className="w-[15%] py-8 md:py-12 px-6 md:px-8 lg:px-12 font-black text-slate-400 uppercase tracking-[0.4em] text-[11px]">{t.xp}</TableHead>
                <TableHead className="w-[20%] py-8 md:py-12 px-6 md:px-8 lg:px-12 font-black text-slate-400 uppercase tracking-[0.4em] text-[11px]">{t.role}</TableHead>
                <TableHead className="w-[15%] py-8 md:py-12 px-6 md:px-8 lg:px-12 font-black text-slate-400 uppercase tracking-[0.4em] text-[11px] text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-60">
                    <div className="flex flex-col items-center gap-8">
                      <Loader2 size={64} className="animate-spin text-primary opacity-40" />
                      <span className="text-slate-300 font-black uppercase tracking-[0.5em] animate-pulse text-xl">Syncing Hub Registry...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-60">
                    <div className="flex flex-col items-center gap-12 opacity-20 grayscale">
                        <User size={120} />
                        <p className="text-3xl font-black uppercase tracking-[0.3em]">No Identities Detected</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-500 group/row">
                    <TableCell className="py-8 md:py-12 px-6 md:px-8 lg:px-12">
                      {editingId === u.id ? (
                        <Input 
                          value={editForm.displayName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="h-16 w-full max-w-[280px] rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-xl px-6 shadow-inner"
                        />
                      ) : (
                        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                          <div className="h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-black text-2xl md:text-3xl group-hover/row:scale-110 transition-all duration-500 shadow-sm">
                            {u.displayName?.charAt(0)}
                          </div>
                          <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">{u.displayName}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-8 md:py-12 px-6 md:px-8 lg:px-12 text-slate-400 dark:text-slate-500 font-bold text-base md:text-xl truncate">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-8 md:py-12 px-6 md:px-8 lg:px-12">
                      {editingId === u.id ? (
                        <Input 
                          type="number"
                          value={editForm.xp} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                          className="h-16 w-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-xl px-4 shadow-inner"
                        />
                      ) : (
                        u.role === 'student' || u.role === 'council' ? (
                          <Badge className={cn(
                            "h-12 md:h-14 px-4 md:px-6 rounded-2xl font-black text-lg md:text-xl shadow-sm border-2",
                            u.xp < 0 
                              ? "bg-destructive/5 text-destructive border-destructive/10" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                          )}>
                            {u.xp > 0 ? '+' : ''}{u.xp} XP
                          </Badge>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800 font-black">—</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="py-8 md:py-12 px-6 md:px-8 lg:px-12">
                      {editingId === u.id ? (
                        <Select 
                          value={editForm.role} 
                          onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                        >
                          <SelectTrigger className="w-full h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-base md:text-xl px-6 shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-[2rem] shadow-2xl border-none p-4">
                            <SelectItem value="student" className="rounded-2xl px-6 py-4 font-black text-lg">Student</SelectItem>
                            <SelectItem value="teacher" className="rounded-2xl px-6 py-4 font-black text-lg">Teacher</SelectItem>
                            <SelectItem value="council" className="rounded-2xl px-6 py-4 font-black text-lg">Council</SelectItem>
                            <SelectItem value="administration" className="rounded-2xl px-6 py-4 font-black text-lg">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="capitalize bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-none px-4 md:px-6 py-3 rounded-2xl font-black text-[10px] md:text-xs tracking-[0.2em]">
                          {u.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-8 md:py-12 px-6 md:px-8 lg:px-12 text-right">
                      {editingId === u.id ? (
                        <div className="flex justify-end gap-3 md:gap-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg text-white" onClick={() => saveUserChanges(u.id)}>
                                <Save size={24} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="font-black text-xs px-4 py-2 rounded-xl bg-emerald-500 text-white border-none shadow-lg">Save Changes</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-slate-200 dark:border-slate-800 text-destructive hover:bg-destructive hover:text-white" onClick={cancelEditing}>
                                <X size={24} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="font-black text-xs px-4 py-2 rounded-xl bg-destructive text-white border-none shadow-lg">Cancel</TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-primary/10 transition-all group-hover/row:text-primary" onClick={() => startEditing(u)}>
                              <Edit2 size={24} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="font-black text-xs px-4 py-2 rounded-xl bg-slate-900 text-white border-none shadow-lg">Edit Identity</TooltipContent>
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

