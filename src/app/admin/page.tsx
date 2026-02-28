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
  updateDoc 
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, UserCog, Search, Save, Edit2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';

interface UserData {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  xp: number;
}

export default function AdminPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const db = useFirestore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && isSuperAdmin && db) {
      fetchUsers();
    }
  }, [authLoading, isSuperAdmin, db]);

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

  const saveUserChanges = async (id: string) => {
    if (!db) return;
    const userDocRef = doc(db, 'users', id);
    try {
      await updateDoc(userDocRef, { 
        displayName: editForm.displayName, 
        xp: Number(editForm.xp),
        role: editForm.role 
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editForm, xp: Number(editForm.xp!) } : u));
      setEditingId(null);
      toast({
        title: "User Updated",
        description: "User information has been successfully changed.",
      });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: editForm
        }));
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the user.",
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isSuperAdmin && !authLoading) return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldCheck size={48} className="mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Only the Super Admin can access this page.</p>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <UserCog className="text-primary" />
            Administration
          </h1>
          <p className="text-muted-foreground">Manage user names, XP, and roles.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search users..." 
            className="pl-9 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-card dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">XP</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">No users found.</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell className="font-medium">
                    {editingId === u.id ? (
                      <Input 
                        value={editForm.displayName} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="h-9 w-40"
                      />
                    ) : (
                      u.displayName
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <Input 
                        type="number"
                        value={editForm.xp} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                        className="h-9 w-24"
                      />
                    ) : (
                      <Badge variant="outline" className={cn(
                        "font-black",
                        u.xp < 0 ? "text-destructive border-destructive/20 bg-destructive/5" : "text-primary border-primary/20 bg-primary/5"
                      )}>
                        {u.xp}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <Select 
                        value={editForm.role} 
                        onValueChange={(val: UserRole) => setEditForm(prev => ({ ...prev, role: val }))}
                      >
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="council">Council</SelectItem>
                          <SelectItem value="administration">Administration</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className="capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none">
                        {u.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === u.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => saveUserChanges(u.id)}>
                          <Save size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={cancelEditing}>
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => startEditing(u)}>
                        <Edit2 size={16} />
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