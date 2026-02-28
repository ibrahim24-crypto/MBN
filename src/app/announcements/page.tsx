"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useLanguage } from '@/context/LanguageContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: any;
  status: string;
}

export default function AnnouncementsPage() {
  const { profile } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  
  const announcementsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: announcements, isLoading: fetching } = useCollection<Announcement>(announcementsQuery);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const { toast } = useToast();

  const canCreate = profile?.role === 'council' || profile?.role === 'administration';

  const createAnnouncement = () => {
    if (!newTitle || !newContent || !db) return;

    addDocumentNonBlocking(collection(db, 'announcements'), {
      title: newTitle,
      content: newContent,
      authorName: profile?.displayName,
      authorRole: profile?.role,
      authorId: profile?.uid,
      createdAt: new Date(),
      status: 'Published'
    });
    
    setIsDialogOpen(false);
    setNewTitle('');
    setNewContent('');
    
    toast({
      title: "Announcement Published",
      description: "Your message is now live on the board.",
    });
  };

  return (
    <AppLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Megaphone className="text-primary" />
            {t.announcements}
          </h1>
          <p className="text-muted-foreground">{t.checkLatest}</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-primary/20">
                <Plus size={18} />
                {t.newAnnouncement}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t.newAnnouncement}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input 
                    placeholder={t.headline} 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder={t.details} 
                    className="min-h-[150px]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                <Button onClick={createAnnouncement}>{t.publish}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6">
        {fetching ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed flex flex-col items-center gap-4">
            <Megaphone size={48} className="text-muted-foreground opacity-20" />
            <div className="text-muted-foreground">{t.noAnnouncements}</div>
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
                      {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'PPP') : '...'}
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
