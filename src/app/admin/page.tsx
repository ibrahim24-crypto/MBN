
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
import { TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    u.email !== SUPER_ADMIN_EMAIL &&
    (u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
       <div className="flex flex-col items-center gap-6">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Syncing Hub Registry...</p>
       </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldCheck size={60} className="mx-auto text-destructive mb-4 opacity-20" />
        <h1 className="text-3xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-tight">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-bold">Only the Hub Administration can access this area.</p>
        <Button variant="outline" className="mt-6 rounded-xl px-8 h-12 font-black" onClick={() => window.location.href = '/dashboard'}>Return to Hub</Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700 w-full px-4">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary font-black mb-1 rounded-full px-4 py-1.5 border-none shadow-sm uppercase tracking-[0.2em] text-[10px]">Command Center</Badge>
          <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tighter flex items-center gap-3 text-slate-900 dark:text-white leading-tight">
            <UserCog className="text-primary hidden md:block" size={32} />
            {t.adminPanel}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base tracking-tight">{t.manageUsers}</p>
        </div>
        
        <div className="relative w-full md:w-[320px] group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" />
          <Input 
            placeholder={t.searchUsers} 
            className="pl-12 h-12 w-full rounded-xl bg-white dark:bg-slate-900 border-none shadow-lg focus:ring-4 focus:ring-primary/5 transition-all font-bold text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 mb-20">
        <TooltipProvider>
          <Table className="table-fixed w-full">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-none">
                <TableHead className="w-[25%] py-3 px-6 font-black text-slate-400 uppercase tracking-widest text-xs">{t.name}</TableHead>
                <TableHead className="w-[30%] py-3 px-6 font-black text-slate-400 uppercase tracking-widest text-xs">{t.email}</TableHead>
                <TableHead className="w-[10%] py-3 px-6 font-black text-slate-400 uppercase tracking-widest text-xs text-center">{t.xp}</TableHead>
                <TableHead className="w-[20%] py-3 px-6 font-black text-slate-400 uppercase tracking-widest text-xs">{t.role}</TableHead>
                <TableHead className="w-[15%] py-3 px-6 font-black text-slate-400 uppercase tracking-widest text-xs text-right">{t.actions}</TableHead>
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
                    <TableCell className="py-2.5 px-6">
                      {editingId === u.id ? (
                        <Input 
                          value={editForm.displayName} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm px-3 shadow-inner"
                        />
                      ) : (
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Avatar className="h-9 w-9 rounded-lg border-none shadow-sm shrink-0">
                            <AvatarImage src={u.photoURL} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                              {u.displayName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.displayName}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-6 text-slate-400 dark:text-slate-500 font-medium text-xs truncate">
                      <div className="truncate w-full" title={u.email}>{u.email}</div>
                    </TableCell>
                    <TableCell className="py-2.5 px-6 text-center">
                      {editingId === u.id ? (
                        <Input 
                          type="number"
                          value={editForm.xp} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                          className="h-9 w-20 mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 border-none font-bold text-sm px-2 shadow-inner text-center"
                        />
                      ) : (
                        u.role === 'student' || u.role === 'council' ? (
                          <Badge className={cn(
                            "h-7 px-3 rounded-md font-black text-sm shadow-none border-none",
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
                    <TableCell className="py-2.5 px-6">
                      {editingId === u.id ? (
                        <Select 
                          value={editForm.role} 
                          onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                        >
                          <SelectTrigger className="w-full h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border-none font-bold text-xs px-2 shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl border-none p-2">
                            <SelectItem value="student" className="rounded-lg px-4 py-2 font-black text-xs">Student</SelectItem>
                            <SelectItem value="teacher" className="rounded-lg px-4 py-2 font-black text-xs">Teacher</SelectItem>
                            <SelectItem value="council" className="rounded-lg px-4 py-2 font-black text-xs">Council</SelectItem>
                            <SelectItem value="administration" className="rounded-lg px-4 py-2 font-black text-xs">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="capitalize bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-none px-3 py-1 rounded-md font-black text-[10px] tracking-widest">
                          {u.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-6 text-right">
                      {editingId === u.id ? (
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" className="h-8 w-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 shadow-md text-white" onClick={() => saveUserChanges(u.id)}>
                            <Save size={14} />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800 text-destructive" onClick={cancelEditing}>
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/10" onClick={() => startEditing(u)}>
                          <Edit2 size={14} />
                        </Button>
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
