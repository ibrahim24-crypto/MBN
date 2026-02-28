
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Users, Megaphone, ShieldAlert, ExternalLink, Sparkles, Zap, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();

  const minutesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'meetingMinutes'), orderBy('meetingDate', 'desc'), limit(1));
  }, [db]);

  const { data: latestMinute } = useCollection(minutesQuery);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
       <div className="flex flex-col items-center gap-6">
          <Loader2 size={64} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Hub...</p>
       </div>
    </div>
  );

  const isStudent = profile?.role === 'student';
  const isCouncil = profile?.role === 'council';
  const isAdmin = profile?.role === 'administration' || isSuperAdmin;
  const xpProgress = Math.min(((profile?.xp || 0) / 200) * 100, 100);

  return (
    <AppLayout>
      <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full items-center">
        <header className="w-full max-w-[90%] flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 text-[10px] uppercase tracking-[0.2em]">
              <Sparkles size={12} className="mr-2 text-accent" />
              {t.language === 'ar' ? 'ثانوية موسى بن نصير' : 'LYCÉE MOUSSA IBN NOUSAYR'}
            </Badge>
          </div>
          <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-[0.85]">
            {t.welcomeBack} <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
          </h1>
        </header>

        <div className="flex flex-col gap-10 w-full max-w-[90%] items-center pb-20">
          
          {/* XP PROGRESS CARD (STUDENT ONLY) */}
          {isStudent && (
            <Card className="w-full min-h-[400px] border-none bg-gradient-to-br from-primary to-accent text-white shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-12 transition-all hover:scale-[1.01]">
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Trophy size={450} />
              </div>
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-6">
                  <span className="text-xs font-black tracking-[0.3em] uppercase opacity-70">{t.progress}</span>
                  <div className="flex items-baseline gap-6">
                    <span className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none">{profile?.xp || 0}</span>
                    <span className="text-2xl md:text-4xl font-black opacity-60 uppercase tracking-widest">{t.xp}</span>
                  </div>
                </div>
                <div className="space-y-8 mt-12">
                  <div className="h-6 md:h-8 bg-white/20 rounded-full overflow-hidden border border-white/10 p-1.5 shadow-inner">
                    <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${xpProgress}%` }} />
                  </div>
                  <div className="flex items-center gap-6 bg-black/10 p-8 rounded-2xl backdrop-blur-md border border-white/5">
                     <Zap size={32} className="text-yellow-300 shrink-0" />
                     <p className="text-lg md:text-xl font-black uppercase tracking-[0.05em] leading-tight opacity-95">{t.keepParticipating}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ADMIN PANEL CARD */}
          {isAdmin && (
            <Card className="w-full min-h-[350px] border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-12 transition-all hover:scale-[1.01]">
              <div className="absolute -bottom-20 -right-20 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Users size={500} />
              </div>
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-6">
                  <span className="text-xs font-black tracking-[0.3em] uppercase opacity-50">{t.adminPanel}</span>
                  <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight">{t.manageUsers}</h3>
                </div>
                <Button variant="secondary" className="w-full md:w-fit h-20 md:h-24 px-12 md:px-16 font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 group text-2xl md:text-3xl mt-10" asChild>
                  <Link href="/admin">
                    {t.manageUsers}
                    <ExternalLink size={32} className="ml-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* LATEST MEETING CARD */}
          <Card className="w-full min-h-[350px] shadow-2xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-6px] transition-all rounded-2xl flex flex-col p-12 border border-slate-50 dark:border-slate-800">
            <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="p-6 md:p-8 bg-accent/10 rounded-2xl text-accent shadow-sm">
                    <Calendar size={48} />
                  </div>
                  <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-sm uppercase tracking-[0.2em] border-none px-8 py-3 rounded-full shadow-sm">Archive</Badge>
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-slate-400">Assembleé</span>
                  <h3 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                    {latestMinute?.[0] ? latestMinute[0].title : t.noLogs}
                  </h3>
                  {latestMinute?.[0] && (
                    <p className="text-2xl md:text-4xl font-bold text-primary">
                      {format(new Date(latestMinute[0].meetingDate), 'PPP')}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" className="w-full h-20 md:h-24 mt-12 font-black rounded-2xl border-4 border-dashed border-slate-100 dark:border-slate-800 hover:bg-accent hover:text-white hover:border-accent transition-all text-2xl md:text-3xl" asChild>
                <Link href="/council">{t.manageMinutes}</Link>
              </Button>
            </div>
          </Card>

          {/* RECENT BULLETIN CARD */}
          <Card className="w-full min-h-[350px] shadow-2xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-6px] transition-all rounded-2xl flex flex-col p-12 border border-slate-50 dark:border-slate-800">
            <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="p-6 md:p-8 bg-primary/10 rounded-2xl text-primary shadow-sm">
                    <Megaphone size={48} />
                  </div>
                  <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-sm uppercase tracking-[0.2em] border-none px-8 py-3 rounded-full shadow-sm">Feed</Badge>
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-slate-400">Bulletin</span>
                  <h3 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{t.recentBulletin}</h3>
                </div>
              </div>
              <Button variant="ghost" className="w-full h-20 md:h-24 mt-12 font-black rounded-2xl border-4 border-dashed border-slate-100 dark:border-slate-800 hover:bg-primary hover:text-white hover:border-primary transition-all text-2xl md:text-3xl" asChild>
                <Link href="/announcements">{t.viewBoard}</Link>
              </Button>
            </div>
          </Card>

          {/* COUNCIL WORKSPACE CARD */}
          {isCouncil && (
            <Card className="w-full min-h-[350px] border-none bg-orange-50 dark:bg-orange-950/20 shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-12 border-4 border-dashed border-orange-200 dark:border-orange-900/40">
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-10">
                  <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-2xl text-orange-600 shadow-md w-fit">
                    <ShieldAlert size={48} />
                  </div>
                  <div className="space-y-4">
                    <span className="text-xs font-black tracking-[0.3em] uppercase text-orange-600/60">{t.actionRequired}</span>
                    <h3 className="text-5xl md:text-7xl font-black text-orange-950 dark:text-orange-100 tracking-tighter leading-tight">{t.reviewProposals}</h3>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl h-20 md:h-24 w-full shadow-xl text-2xl md:text-3xl mt-12" asChild>
                  <Link href="/council">{t.reviewProposals}</Link>
                </Button>
              </div>
            </Card>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
