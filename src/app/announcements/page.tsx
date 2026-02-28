"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  Card, 
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
  visibility: string;
  createdAt: any;
}

export default function AnnouncementsPage() {
  const { profile } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  
  const announcementsQuery = useMemoFirebase(() => {
    if (!db) return null;
    // Query the 'proposals' collection as these are the source of official announcements
    return query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: announcements, isLoading: fetching } = useCollection<Announcement>(announcementsQuery);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const canCreate = profile?.role === 'council' || profile?.role === 'administration';

  // Client-side filtering as secondary layer to security rules
  const filteredAnnouncements = announcements?.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const createAnnouncement = () => {
    if (!newTitle || !newContent || !db || !profile) return;

    addDocumentNonBlocking(collection(db, 'proposals'), {
      title: newTitle,
      content: newContent,
      authorId: profile.id,
      visibility: 'PUBLIC',
      createdAt: new Date(),
      updatedAt: new Date().toISOString()
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000 w-full px-4">
        <div>
          <Badge className="bg-primary/10 text-primary font-black mb-4 rounded-full px-6 py-1.5 border-none shadow-sm uppercase tracking-[0.3em] text-[10px]">Notice Board</Badge>
          <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter flex items-center gap-6 text-slate-900 dark:text-white leading-[0.85]">
            <Megaphone className="text-primary hidden md:block" size={72} />
            {t.announcements}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-2xl mt-6 tracking-tight">{t.checkLatest}</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-4 rounded-[2rem] font-black shadow-2xl shadow-primary/30 h-20 px-12 hover:scale-[1.05] transition-all text-xl">
                <Plus size={32} />
                {t.newAnnouncement}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] rounded-[4rem] p-12 bg-white dark:bg-slate-950 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-4xl font-black tracking-tighter">{t.newAnnouncement}</DialogTitle>
              </DialogHeader>
              <div className="space-y-10 py-10">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 px-2">{t.headline}</label>
                  <Input 
                    placeholder={t.headline} 
                    className="rounded-3xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-16 px-6 font-black text-xl"
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 px-2">{t.details}</label>
                  <Textarea 
                    placeholder={t.details} 
                    className="min-h-[250px] rounded-[3rem] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 font-medium text-xl leading-relaxed"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-4">
                <Button variant="ghost" className="font-black h-14 rounded-2xl px-8 text-lg" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                <Button className="font-black h-14 rounded-2xl px-12 shadow-xl shadow-primary/20 text-lg" onClick={createAnnouncement}>{t.publish}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {/* Reworked High-Fidelity Search Bar */}
      <div className="w-full max-w-3xl mx-auto mb-20 relative group px-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
        <div className="absolute inset-0 bg-primary/10 blur-[80px] -z-10 rounded-full opacity-30"></div>
        <Search size={28} className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all duration-300" />
        <Input 
          placeholder={t.newsSearch} 
          className="pl-20 h-20 w-full rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] focus:ring-12 focus:ring-primary/5 transition-all font-black text-2xl placeholder:text-slate-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-16 w-full pb-40">
        {fetching ? (
          <div className="col-span-full text-center py-40 flex flex-col items-center gap-10">
            <Loader2 size={100} className="animate-spin text-primary opacity-40" />
            <p className="text-slate-300 font-black uppercase tracking-[0.5em] animate-pulse text-lg">Syncing Bulletin...</p>
          </div>
        ) : !filteredAnnouncements || filteredAnnouncements.length === 0 ? (
          <div className="col-span-full text-center py-48 bg-white dark:bg-slate-900/50 rounded-[5rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50 flex flex-col items-center gap-12 shadow-sm">
            <div className="p-20 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200 dark:text-slate-700 animate-pulse">
               <Megaphone size={140} />
            </div>
            <div className="space-y-6">
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{t.noAnnouncements}</h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-2xl max-w-xl mx-auto leading-relaxed">The board is clear. Check back later for official MBN updates and council reports.</p>
            </div>
          </div>
        ) : (
          filteredAnnouncements.map((ann, idx) => (
            <Card key={ann.id} className="group border-none shadow-[0_48px_80px_-24px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-[5rem] overflow-hidden hover:translate-y-[-8px] transition-all duration-700 animate-in fade-in slide-in-from-bottom-12 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="p-14 md:p-20 flex flex-col lg:flex-row gap-20">
                <div className="lg:w-2/5 flex flex-col justify-between">
                  <div className="space-y-10">
                    <Badge variant="outline" className="uppercase tracking-[0.4em] text-[11px] font-black border-primary/20 text-primary bg-primary/5 px-8 py-4 rounded-full shadow-sm w-fit">
                      {ann.visibility}
                    </Badge>
                    <CardTitle className="text-5xl md:text-6xl font-black font-headline text-slate-900 dark:text-white leading-[0.95] tracking-tight group-hover:text-primary transition-colors duration-500">
                      {ann.title}
                    </CardTitle>
                  </div>
                  
                  <div className="mt-20 flex items-center gap-8 border-t dark:border-slate-800/50 pt-12">
                    <Avatar className="h-20 w-20 border-[8px] border-slate-50 dark:border-slate-800 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                      <AvatarFallback className="bg-primary text-white font-black text-3xl">
                        {ann.authorRole?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-3">MBN Hub</span>
                      <span className="text-xs font-black text-slate-400 flex items-center gap-3 uppercase tracking-[0.3em]">
                        <Calendar size={18} className="text-primary" />
                        {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'PPP') : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-3/5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[4rem] p-12 md:p-16 border border-slate-100/50 dark:border-slate-800/50 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-1000 shadow-inner">
                  <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 text-3xl leading-relaxed font-medium font-body italic opacity-85 group-hover:opacity-100 transition-opacity">
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