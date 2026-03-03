
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
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

  const isStudent = profile?.role === 'student';
  const isCouncil = profile?.role === 'council';
  const isAdmin = profile?.role === 'administration' || isSuperAdmin;

  const minutesQuery = useMemoFirebase(() => {
    // Only fetch minutes if the user is staff (Council or Admin)
    if (!db || !(isAdmin || isCouncil)) return null;
    return query(collection(db, 'meetingMinutes'), orderBy('meetingDate', 'desc'), limit(1));
  }, [db, isAdmin, isCouncil]);

  const { data: latestMinute } = useCollection(minutesQuery);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
       <div className="flex flex-col items-center gap-6">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Initializing...</p>
       </div>
    </div>
  );

  const xpProgress = Math.min(((profile?.xp || 0) / 200) * 100, 100);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full items-center">
        <header className="w-full max-w-full flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-3 py-0.5 text-[9px] uppercase tracking-[0.2em]">
              <Sparkles size={10} className="mr-1.5 text-accent" />
              {t.language === 'ar' ? 'ثانوية موسى بن نصير' : 'LYCÉE MOUSSA IBN NOUSAYR'}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-tight text-center md:text-left">
            {t.welcomeBack} <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
          </h1>
        </header>

        <div className="flex flex-col gap-5 w-full items-center pb-20">
          
          {/* XP PROGRESS CARD (STUDENT ONLY) */}
          {isStudent && (
            <Card className="w-full min-h-[180px] border-none bg-gradient-to-br from-primary to-accent text-white shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-6 transition-all hover:scale-[1.01]">
              <div className="absolute -top-6 -right-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Trophy size={140} />
              </div>
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-70">{t.progress}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{profile?.xp || 0}</span>
                    <span className="text-sm font-black opacity-60 uppercase tracking-widest">{t.xp}</span>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                    <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${xpProgress}%` }} />
                  </div>
                  <div className="flex items-center gap-2 bg-black/10 p-3 rounded-xl backdrop-blur-md border border-white/5">
                     <Zap size={16} className="text-yellow-300 shrink-0" />
                     <p className="text-[10px] font-black uppercase tracking-[0.05em] leading-tight opacity-95">{t.keepParticipating}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ADMIN PANEL CARD - Accessible to Admins and SuperAdmin */}
          {isAdmin && (
            <Card className="w-full min-h-[160px] border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-6 transition-all hover:scale-[1.01]">
              <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Users size={180} />
              </div>
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-50">{t.adminPanel}</span>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">{t.manageUsers}</h3>
                </div>
                <Button variant="secondary" className="w-full md:w-fit h-11 px-6 font-black rounded-xl bg-white text-slate-900 hover:bg-slate-100 group text-sm mt-4 shadow-xl" asChild>
                  <Link href="/admin">
                    {t.manageUsers}
                    <ExternalLink size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* LATEST MEETING CARD - Only for Admin/Council */}
          {(isAdmin || isCouncil) && (
            <Card className="w-full min-h-[160px] shadow-xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-4px] transition-all rounded-2xl flex flex-col p-6 border border-slate-50 dark:border-slate-800">
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-accent/10 rounded-xl text-accent shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[8px] uppercase tracking-[0.2em] border-none px-3 py-1 rounded-full shadow-sm">Archive</Badge>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400">{t.councilBoard}</span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                      {latestMinute?.[0] ? latestMinute[0].title : t.noLogs}
                    </h3>
                    {latestMinute?.[0] && (
                      <p className="text-sm font-bold text-primary">
                        {format(new Date(latestMinute[0].meetingDate), 'PPP')}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" className="w-full h-11 mt-4 font-black rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:bg-accent hover:text-white hover:border-accent transition-all text-sm" asChild>
                  <Link href="/council">{t.manageMinutes}</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* RECENT ANNONCE CARD */}
          <Card className="w-full min-h-[160px] shadow-xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-4px] transition-all rounded-2xl flex flex-col p-6 border border-slate-50 dark:border-slate-800">
            <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary shadow-sm">
                    <Megaphone size={20} />
                  </div>
                  <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[8px] uppercase tracking-[0.2em] border-none px-3 py-1 rounded-full shadow-sm">Feed</Badge>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400">{t.announcements}</span>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{t.recentBulletin}</h3>
                </div>
              </div>
              <Button variant="ghost" className="w-full h-11 mt-4 font-black rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:bg-primary hover:text-white hover:border-primary transition-all text-sm" asChild>
                <Link href="/announcements">{t.viewBoard}</Link>
              </Button>
            </div>
          </Card>

          {/* COUNCIL WORKSPACE CARD */}
          {isCouncil && (
            <Card className="w-full min-h-[160px] border-none bg-orange-50 dark:bg-orange-950/20 shadow-xl relative overflow-hidden group rounded-2xl flex flex-col p-6 border-2 border-dashed border-orange-200 dark:border-orange-900/40">
              <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
                <div className="space-y-3">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl text-orange-600 shadow-md w-fit">
                    <ShieldAlert size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-orange-600/60">{t.actionRequired}</span>
                    <h3 className="text-2xl md:text-3xl font-black text-orange-950 dark:text-orange-100 tracking-tighter leading-tight">{t.reviewProposals}</h3>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl h-11 w-full shadow-lg text-sm mt-4" asChild>
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
