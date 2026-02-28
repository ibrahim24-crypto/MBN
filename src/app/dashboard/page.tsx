
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Users, Megaphone, ShieldAlert, ArrowRight, ExternalLink, Sparkles, Zap, Loader2, LayoutDashboard, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();

  // Fetch latest meeting date
  const minutesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'meetingMinutes'), orderBy('meetingDate', 'desc'), limit(1));
  }, [db]);

  const { data: latestMinute, isLoading: loadingMinutes } = useCollection(minutesQuery);

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
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 text-[10px] uppercase tracking-[0.2em]">
                <Sparkles size={12} className="mr-2 text-accent" />
                MBN HUB COMMAND
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-[0.85]">
              {t.welcomeBack} <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* XP PROGRESS CARD (STUDENT ONLY) */}
          {isStudent && (
            <Card className="aspect-square border-none bg-gradient-to-br from-primary to-accent text-white shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-10 transition-all hover:scale-[1.02]">
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Trophy size={200} />
              </div>
              <div className="flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-2">
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase opacity-70">{t.progress}</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-8xl font-black tracking-tighter leading-none">{profile?.xp || 0}</span>
                    <span className="text-xl font-black opacity-60 uppercase tracking-widest">{t.xp}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 p-1">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
                  </div>
                  <div className="flex items-center gap-4 bg-black/10 p-5 rounded-2xl backdrop-blur-md">
                     <Zap size={20} className="text-yellow-300 shrink-0" />
                     <p className="text-xs font-black uppercase tracking-[0.05em] leading-tight opacity-90">{t.keepParticipating}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ADMIN PANEL CARD */}
          {isAdmin && (
            <Card className="aspect-square border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-10 transition-all hover:scale-[1.02]">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Users size={220} />
              </div>
              <div className="flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-2">
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase opacity-50">{t.adminPanel}</span>
                  <h3 className="text-4xl font-black tracking-tighter leading-tight">{t.manageUsers}</h3>
                </div>
                <Button variant="secondary" className="w-full h-16 font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 group text-lg" asChild>
                  <Link href="/admin">
                    {t.manageUsers}
                    <ExternalLink size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* LATEST MEETING CARD */}
          <Card className="aspect-square shadow-2xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-4px] transition-all rounded-2xl flex flex-col p-10">
            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="p-4 bg-accent/10 rounded-2xl text-accent">
                    <Calendar size={32} />
                  </div>
                  <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-none px-4 py-1.5 rounded-full">Record</Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase text-slate-400">{t.nextMeeting || "Latest Assembly"}</span>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                    {latestMinute?.[0] ? latestMinute[0].title : t.noLogs}
                  </h3>
                  {latestMinute?.[0] && (
                    <p className="text-lg font-bold text-primary">
                      {format(new Date(latestMinute[0].meetingDate), 'PPP')}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" className="w-full h-16 font-black rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:bg-accent hover:text-white transition-all text-lg" asChild>
                <Link href="/council">{t.manageMinutes}</Link>
              </Button>
            </div>
          </Card>

          {/* RECENT BULLETIN CARD */}
          <Card className="aspect-square shadow-2xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-4px] transition-all rounded-2xl flex flex-col p-10">
            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <Megaphone size={32} />
                  </div>
                  <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-none px-4 py-1.5 rounded-full">Feed</Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase text-slate-400">Bulletin</span>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{t.recentBulletin}</h3>
                </div>
              </div>
              <Button variant="ghost" className="w-full h-16 font-black rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:bg-primary hover:text-white transition-all text-lg" asChild>
                <Link href="/announcements">{t.viewBoard}</Link>
              </Button>
            </div>
          </Card>

          {/* COUNCIL WORKSPACE CARD */}
          {isCouncil && (
            <Card className="aspect-square border-none bg-orange-50 dark:bg-orange-950/20 shadow-2xl relative overflow-hidden group rounded-2xl flex flex-col p-10 border-2 border-dashed border-orange-200 dark:border-orange-900/40">
              <div className="flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-8">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-orange-600 shadow-md w-fit">
                    <ShieldAlert size={32} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black tracking-[0.3em] uppercase text-orange-600/60">{t.actionRequired}</span>
                    <h3 className="text-4xl font-black text-orange-950 dark:text-orange-100 tracking-tighter leading-tight">{t.reviewProposals}</h3>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl h-16 w-full shadow-xl text-lg" asChild>
                  <Link href="/council">{t.reviewProposals}</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* GENERIC DASHBOARD CARD (PLACEHOLDER FOR BALANCE) */}
          <Card className="aspect-square shadow-2xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-4px] transition-all rounded-2xl flex flex-col p-10 opacity-30">
            <div className="flex-1 flex flex-col justify-center items-center gap-6 text-center">
               <LayoutDashboard size={64} className="text-slate-200 dark:text-slate-800" />
               <p className="font-black text-[12px] uppercase tracking-[0.3em] text-slate-300">More Tools Soon</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
