"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Plus, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: any;
}

export default function AnnouncementsPage() {
  const { profile, loading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const { toast } = useToast();

  const canCreate = profile?.role === 'council' || profile?.role === 'administration';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Announcement));
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements", error);
    } finally {
      setFetching(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newTitle || !newContent) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        title: newTitle,
        content: newContent,
        authorName: profile?.displayName,
        authorRole: profile?.role,
        createdAt: serverTimestamp(),
      });
      
      setIsDialogOpen(false);
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements();
      
      toast({
        title: "Announcement Published",
        description: "Your message is now live on the board.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish announcement.",
      });
    }
  };

  return (
    <AppLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Megaphone className="text-primary" />
            Announcement Board
          </h1>
          <p className="text-muted-foreground">Official school council updates and notices.</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-primary/20">
                <Plus size={18} />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Post to Board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input 
                    placeholder="Headline" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Write your announcement details here..." 
                    className="min-h-[150px]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={createAnnouncement}>Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {fetching ? (
          <div className="text-center py-20 text-muted-foreground">Loading board...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed flex flex-col items-center gap-4">
            <Megaphone size={48} className="text-muted-foreground opacity-20" />
            <div className="text-muted-foreground">No announcements yet.</div>
          </div>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className="shadow-sm border-primary/5 hover:border-primary/20 transition-all">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold font-headline text-primary">{ann.title}</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {ann.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'PPP') : 'Just now'}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="uppercase tracking-tighter text-[10px]">
                  {ann.authorRole}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                  {ann.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}