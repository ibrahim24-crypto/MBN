"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { collection, query, orderBy } from 'firebase/firestore';
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
import { Megaphone, Plus, Calendar, Search, Loader2, Send } from 'lucide-react';
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
    return query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: announcements, isLoading: fetching } = useCollection<Announcement>(announcementsQuery);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const canCreate = profile?.role === 'council' || profile?.role === 'administration';
  const isFormValid = newTitle.trim() !== '' && newContent.trim() !== '';

  const filteredAnnouncements = announcements?.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const createAnnouncement = () => {
    if (!isFormValid || !db || !profile) return;

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700 w-full px-4">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary font-black mb-1 rounded-full px-4 py-1.5 border-none shadow-sm uppercase tracking-[0.2em] text-[9px]">Notice Board</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black font-headline tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white leading-tight">
            <Megaphone className="text-primary hidden md:block" size={40} />
            {t.announcements}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight">{t.checkLatest}</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-3 rounded-2xl font-black shadow-xl shadow-primary/20 h-14 px-8 hover:scale-[1.02] transition-all text-base text-white">
                <Plus size={20} />
                {t.newAnnouncement}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl p-8 bg-white dark:bg-slate-950 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">{t.newAnnouncement}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t.headline}</label>
                  <Input 
                    placeholder={t.headline} 
                    className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-14 px-5 font-black text-lg focus:ring-4 focus:ring-primary/5 transition-all"
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t.details}</label>
                    <span className="text-[8px] font-black text-destructive uppercase tracking-widest px-1">Required</span>
                  </div>
                  <Textarea 
                    placeholder={t.details} 
                    className="min-h-[200px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-none p-6 font-medium text-lg leading-relaxed focus:ring-4 focus:ring-primary/5 transition-all no-scrollbar"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button variant="outline" className="font-black h-12 rounded-xl px-6 text-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                <Button 
                  className="font-black h-12 rounded-xl px-10 shadow-lg shadow-primary/10 text-sm text-white gap-2" 
                  onClick={createAnnouncement}
                  disabled={!isFormValid}
                >
                  <Send size={16} />
                  {t.publish}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="w-full max-w-2xl mx-auto mb-16 relative group px-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <Search size={20} className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300" />
        <Input 
          placeholder={t.newsSearch} 
          className="pl-14 h-14 w-full rounded-2xl bg-white dark:bg-slate-900 border-none shadow-lg focus:ring-8 focus:ring-primary/5 transition-all font-black text-lg placeholder:text-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-10 w-full pb-32 max-w-5xl mx-auto px-4">
        {fetching ? (
          <div className="col-span-full text-center py-20 flex flex-col items-center gap-6">
            <Loader2 size={48} className="animate-spin text-primary opacity-40" />
            <p className="text-slate-300 font-black uppercase tracking-[0.3em] animate-pulse text-sm">Syncing Bulletin...</p>
          </div>
        ) : !filteredAnnouncements || filteredAnnouncements.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800/50 flex flex-col items-center gap-8 shadow-sm">
            <div className="p-12 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200 dark:text-slate-700">
               <Megaphone size={64} />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{t.noAnnouncements}</h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed">The board is clear. Check back later for official updates.</p>
            </div>
          </div>
        ) : (
          filteredAnnouncements.map((ann, idx) => (
            <Card key={ann.id} className="group border-none shadow-xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="p-10 flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3 flex flex-col justify-between">
                  <div className="space-y-6">
                    <Badge variant="outline" className="uppercase tracking-[0.2em] text-[9px] font-black border-primary/20 text-primary bg-primary/5 px-4 py-1.5 rounded-full shadow-sm w-fit">
                      {ann.visibility}
                    </Badge>
                    <CardTitle className="text-3xl font-black font-headline text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-primary transition-colors duration-500">
                      {ann.title}
                    </CardTitle>
                  </div>
                  
                  <div className="mt-10 flex items-center gap-4 border-t dark:border-slate-800/50 pt-8">
                    <Avatar className="h-12 w-12 border-4 border-slate-50 dark:border-slate-800 shadow-lg rounded-xl">
                      <AvatarFallback className="bg-primary text-white font-black text-lg">
                        {ann.authorRole?.charAt(0) || 'L'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Hub Admin</span>
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <Calendar size={12} className="text-primary" />
                        {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'PPP') : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-8 border border-slate-100/50 dark:border-slate-800/50 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-700">
                  <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 text-xl leading-relaxed font-medium font-body italic opacity-85 group-hover:opacity-100 transition-opacity">
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
