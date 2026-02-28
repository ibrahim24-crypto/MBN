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
import { Megaphone, Plus, Calendar, User, Search, Filter } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const canCreate = profile?.role === 'council' || profile?.role === 'administration';

  const filteredAnnouncements = announcements?.filter(ann => 
    ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <Badge className="bg-primary/10 text-primary font-bold mb-2">Notice Board</Badge>
          <h1 className="text-4xl font-black font-headline tracking-tight flex items-center gap-3 text-slate-900">
            <Megaphone className="text-primary" size={32} />
            {t.announcements}
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">{t.checkLatest}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search news..." 
              className="pl-10 w-full md:w-72 rounded-xl bg-white border-slate-200 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20 h-11 px-6">
                  <Plus size={20} />
                  {t.newAnnouncement}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-3xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{t.newAnnouncement}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 px-1">Headline</label>
                    <Input 
                      placeholder={t.headline} 
                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold"
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 px-1">Details</label>
                    <Textarea 
                      placeholder={t.details} 
                      className="min-h-[180px] rounded-xl bg-slate-50 border-slate-200 p-4 font-medium leading-relaxed"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" className="font-bold rounded-xl" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                  <Button className="font-bold rounded-xl px-8 shadow-lg shadow-primary/20" onClick={createAnnouncement}>{t.publish}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
        {fetching ? (
          <div className="col-span-full text-center py-32">
            <div className="animate-spin text-primary mx-auto mb-4">
               <Megaphone size={40} />
            </div>
            <p className="text-slate-500 font-bold">Fetching latest news...</p>
          </div>
        ) : !filteredAnnouncements || filteredAnnouncements.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-6 shadow-sm">
            <div className="p-8 bg-slate-50 rounded-full text-slate-200">
               <Megaphone size={80} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">{t.noAnnouncements}</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">Check back later for official school updates and council proposals.</p>
            </div>
          </div>
        ) : (
          filteredAnnouncements.map((ann, idx) => (
            <Card key={ann.id} className="group border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden hover:scale-[1.01] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 flex flex-col justify-between">
                  <div className="space-y-4">
                    <Badge variant="outline" className="uppercase tracking-[0.2em] text-[10px] font-black border-primary/20 text-primary bg-primary/5 px-3 py-1">
                      {ann.authorRole}
                    </Badge>
                    <CardTitle className="text-2xl md:text-3xl font-black font-headline text-slate-900 leading-tight group-hover:text-primary transition-colors">
                      {ann.title}
                    </CardTitle>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4 border-t pt-6">
                    <Avatar className="h-10 w-10 border-2 border-slate-50">
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                        {ann.authorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{ann.authorName}</span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar size={12} className="text-primary/60" />
                        {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'PPP') : '...'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-2/3 bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100/50">
                  <p className="whitespace-pre-wrap text-slate-600 text-lg leading-relaxed font-medium font-body">
                    {ann.content}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}