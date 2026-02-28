
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
import { ShieldCheck, UserCog, Search, Save, Edit2, X, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
    const newXP = Number(editForm.xp);
    const xpDifference = newXP - (currentUser?.xp || 0);

    // 1. Update User Profile (Non-blocking)
    updateDocumentNonBlocking(userDocRef, { 
      displayName: editForm.displayName, 
      xp: newXP,
      role: editForm.role,
      updatedAt: new Date().toISOString()
    });

    // 2. Create XP Log if XP changed (Non-blocking)
    if (xpDifference !== 0) {
      addDocumentNonBlocking(collection(db, 'users', id, 'xp_logs'), {
        userId: id,
        amount: xpDifference,
        reason: t.manualAdjustment,
        adminId: profile.id,
        timestamp: new Date().toISOString()
      });
    }

    // Optimistic Update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editForm, xp: newXP } : u));
    setEditingId(null);
    
    toast({
      title: t.xpUpdated,
      description: `Name and XP (${xpDifference > 0 ? '+' : ''}${xpDifference}) updated.`,
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
        
        <div className="relative w-full md:w-[400px] group">
          <div className="absolute inset-0 bg-primary/10 blur-[60px] -z-10 rounded-full opacity-30 group-focus-within:opacity-60 transition-opacity"></div>
          <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" />
          <Input 
            placeholder={t.searchUsers || "Search identities..."} 
            className="pl-16 h-20 w-full rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] focus:ring-12 focus:ring-primary/5 transition-all font-black text-xl placeholder:text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[4rem] border-none shadow-[0_64px_128px_-32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="border-none">
              <TableHead className="py-10 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{t.name || "Identity"}</TableHead>
              <TableHead className="py-10 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{t.email || "Contact"}</TableHead>
              <TableHead className="py-10 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{t.xp || "XP Credits"}</TableHead>
              <TableHead className="py-10 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{t.role || "Authority"}</TableHead>
              <TableHead className="py-10 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] text-right">{t.actions || "Ops"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-48">
                  <div className="flex flex-col items-center gap-6">
                    <Loader2 size={48} className="animate-spin text-primary opacity-40" />
                    <span className="text-slate-300 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-48">
                   <div className="flex flex-col items-center gap-10 opacity-30 grayscale">
                      <Search size={100} />
                      <p className="text-2xl font-black uppercase tracking-[0.2em]">No Identities Found</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u, idx) => (
                <TableRow key={u.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300 group/row">
                  <TableCell className="py-10 px-12">
                    {editingId === u.id ? (
                      <Input 
                        value={editForm.displayName} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="h-14 w-64 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-lg px-6"
                      />
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl group-hover/row:scale-110 transition-transform">
                          {u.displayName?.charAt(0)}
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">{u.displayName}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-10 px-12 text-slate-500 dark:text-slate-400 font-bold text-lg">{u.email}</TableCell>
                  <TableCell className="py-10 px-12">
                    {editingId === u.id ? (
                      <Input 
                        type="number"
                        value={editForm.xp} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                        className="h-14 w-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-lg px-6"
                      />
                    ) : (
                      <Badge className={cn(
                        "h-12 px-6 rounded-2xl font-black text-lg shadow-sm border-2",
                        u.xp < 0 
                          ? "bg-destructive/5 text-destructive border-destructive/10" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                      )}>
                        {u.xp > 0 ? '+' : ''}{u.xp} XP
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-10 px-12">
                    {editingId === u.id ? (
                      <Select 
                        value={editForm.role} 
                        onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                      >
                        <SelectTrigger className="w-48 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-lg px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-none p-4">
                          <SelectItem value="student" className="rounded-xl px-6 py-4 font-black">Student</SelectItem>
                          <SelectItem value="teacher" className="rounded-xl px-6 py-4 font-black">Teacher</SelectItem>
                          <SelectItem value="council" className="rounded-xl px-6 py-4 font-black">Council</SelectItem>
                          <SelectItem value="administration" className="rounded-xl px-6 py-4 font-black">Administration</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className="capitalize bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none px-6 py-3 rounded-xl font-black text-xs tracking-widest">
                        {u.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-10 px-12 text-right">
                    {editingId === u.id ? (
                      <div className="flex justify-end gap-4">
                        <Button size="icon" className="h-14 w-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 text-white" onClick={() => saveUserChanges(u.id)}>
                          <Save size={24} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-destructive hover:bg-destructive hover:text-white" onClick={cancelEditing}>
                          <X size={24} />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl text-slate-300 hover:text-primary hover:bg-primary/10 transition-all" onClick={() => startEditing(u)}>
                        <Edit2 size={24} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}

