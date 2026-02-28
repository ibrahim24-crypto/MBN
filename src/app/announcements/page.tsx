
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
import { Megaphone, Plus, Calendar, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      authorId: profile?.id,
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700 w-full">
        <div>
          <Badge className="bg-primary/10 text-primary font-bold mb-2 rounded-full px-4 border-none shadow-sm">Notice Board</Badge>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white leading-none">
            <Megaphone className="text-primary" size={48} />
            {t.announcements}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xl mt-3">{t.checkLatest}</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-3 rounded-[1.5rem] font-black shadow-xl shadow-primary/20 h-16 px-10 hover:scale-[1.05] transition-all text-lg">
                <Plus size={28} />
                {t.newAnnouncement}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-10 bg-white dark:bg-slate-950 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">{t.newAnnouncement}</DialogTitle>
              </DialogHeader>
              <div className="space-y-8 py-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t.headline}</label>
                  <Input 
                    placeholder={t.headline} 
                    className="rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-14 px-5 font-bold text-lg"
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t.details}</label>
                  <Textarea 
                    placeholder={t.details} 
                    className="min-h-[200px] rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 font-medium text-lg leading-relaxed"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button variant="ghost" className="font-bold h-12 rounded-xl" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                <Button className="font-black h-12 rounded-xl px-10 shadow-lg shadow-primary/20" onClick={createAnnouncement}>{t.publish}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {/* Moved Search Bar for Better Style */}
      <div className="w-full max-w-2xl mx-auto mb-16 relative group px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
        <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full opacity-50"></div>
        <Search size={22} className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all duration-300" />
        <Input 
          placeholder={t.newsSearch} 
          className="pl-16 h-16 w-full rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 focus:ring-8 focus:ring-primary/5 transition-all font-black text-lg placeholder:text-slate-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 w-full pb-32">
        {fetching ? (
          <div className="col-span-full text-center py-32 flex flex-col items-center gap-8">
            <Loader2 size={80} className="animate-spin text-primary opacity-50" />
            <p className="text-slate-300 font-black uppercase tracking-[0.4em] animate-pulse">Syncing Hub News...</p>
          </div>
        ) : !filteredAnnouncements || filteredAnnouncements.length === 0 ? (
          <div className="col-span-full text-center py-40 bg-white dark:bg-slate-900/50 rounded-[5rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50 flex flex-col items-center gap-10 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <div className="p-16 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200 dark:text-slate-700 animate-pulse shadow-inner">
               <Megaphone size={120} />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.noAnnouncements}</h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xl max-w-md mx-auto">The board is clear. Check back later for official MBN updates and council reports.</p>
            </div>
          </div>
        ) : (
          filteredAnnouncements.map((ann, idx) => (
            <Card key={ann.id} className="group border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden hover:scale-[1.01] transition-all duration-700 animate-in fade-in slide-in-from-bottom-12 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="p-12 md:p-16 flex flex-col lg:flex-row gap-16">
                <div className="lg:w-1/3 flex flex-col justify-between">
                  <div className="space-y-8">
                    <Badge variant="outline" className="uppercase tracking-[0.3em] text-[10px] font-black border-primary/20 text-primary bg-primary/5 px-6 py-3 rounded-full shadow-sm w-fit">
                      {ann.authorRole}
                    </Badge>
                    <CardTitle className="text-4xl md:text-5xl font-black font-headline text-slate-900 dark:text-white leading-[1.05] tracking-tight group-hover:text-primary transition-colors duration-500">
                      {ann.title}
                    </CardTitle>
                  </div>
                  
                  <div className="mt-16 flex items-center gap-6 border-t dark:border-slate-800/50 pt-10">
                    <Avatar className="h-16 w-16 border-[6px] border-slate-50 dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-700">
                      <AvatarFallback className="bg-primary text-white font-black text-2xl">
                        {ann.authorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-none mb-2">{ann.authorName}</span>
                      <span className="text-[12px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <Calendar size={16} className="text-primary" />
                        {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'PPP') : '...'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-2/3 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3.5rem] p-10 md:p-14 border border-slate-100/50 dark:border-slate-800/50 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-1000 shadow-inner">
                  <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 text-2xl leading-relaxed font-medium font-body italic opacity-80 group-hover:opacity-100 transition-opacity">
                    "{ann.content}"
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
