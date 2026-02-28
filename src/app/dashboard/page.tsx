"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Megaphone, Calendar, ShieldAlert, ArrowRight, ExternalLink, Sparkles, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();
  const { t } = useLanguage();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
       <div className="flex flex-col items-center gap-6">
          <Loader2 size={64} className="animate-spin text-primary" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Hub...</p>
       </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 py-6">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-5 py-1.5 text-[11px] uppercase tracking-[0.2em] shadow-sm">
                <Sparkles size={14} className="mr-2 text-accent" />
                Moussa Ibn Nousayr Life Center
              </Badge>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-[0.85] text-balance">
              {t.welcomeBack} <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-2xl text-slate-400 max-w-2xl font-medium leading-relaxed">
              {t.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-5 shrink-0">
            <Button variant="outline" className="rounded-3xl h-16 px-10 border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:border-primary transition-all text-lg shadow-sm" asChild>
              <Link href="/profile">My Profile</Link>
            </Button>
            <Button className="rounded-3xl h-16 px-10 font-black gap-4 shadow-2xl shadow-primary/40 hover:scale-[1.02] transition-all text-lg" asChild>
              <Link href="/announcements">
                Bulletin Board
                <ArrowRight size={24} />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* XP Widget (Student) */}
              {profile?.role === 'student' && (
                <Card className="border-none bg-gradient-to-br from-primary via-primary to-accent text-white shadow-[0_40px_100px_rgba(59,130,246,0.25)] relative overflow-hidden group rounded-[3rem] p-4 transition-all hover:scale-[1.01]">
                  <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-1000">
                    <Trophy size={250} />
                  </div>
                  <CardHeader className="relative p-10 pb-0">
                    <CardTitle className="text-xl font-black tracking-[0.2em] uppercase opacity-80 mb-2">{t.progress}</CardTitle>
                    <CardDescription className="text-white/80 font-bold text-lg">Next level at {(Math.floor(profile.xp / 100) + 1) * 100} XP</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-10">
                    <div className="flex items-baseline gap-4 mb-8">
                      <span className="text-9xl font-black tracking-tighter leading-none">{profile.xp}</span>
                      <span className="text-3xl font-black opacity-60 uppercase tracking-widest">XP</span>
                    </div>
                    <div className="space-y-6">
                      <Progress value={profile.xp % 100} className="h-6 bg-white/20 border-none rounded-full" />
                      <div className="flex justify-between items-center bg-white/10 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                         <p className="text-sm font-black text-white uppercase tracking-[0.1em]">{t.keepParticipating}</p>
                         <TrendingUp size={20} className="text-white/60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Panel Access */}
              {(profile?.role === 'administration' || isSuperAdmin) && (
                <Card className="border-none bg-slate-900 dark:bg-slate-900 text-white shadow-3xl relative overflow-hidden group rounded-[3rem] p-4 transition-all hover:scale-[1.01]">
                  <div className="absolute -bottom-20 -right-20 p-20 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                    <Users size={300} />
                  </div>
                  <CardHeader className="relative p-10 pb-0">
                    <CardTitle className="text-xl font-black tracking-[0.2em] uppercase opacity-50 mb-2">System Governance</CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-lg">Infrastructure & Access Control</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-10">
                    <div className="text-5xl font-black mb-10 leading-tight tracking-tight">{t.adminPanel}</div>
                    <Button variant="secondary" className="w-full h-16 font-black rounded-3xl bg-white text-slate-900 hover:bg-slate-100 shadow-2xl text-lg group" asChild>
                      <Link href="/admin">
                        {t.manageUsers}
                        <ExternalLink size={20} className="ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* News Snippet */}
              <Card className="shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border-none bg-white dark:bg-slate-900 group hover:translate-y-[-8px] transition-all duration-500 rounded-[3rem] overflow-hidden p-2">
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-lg shadow-primary/5">
                      <Megaphone size={32} />
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-none px-4 py-1.5 rounded-full">Active Feed</Badge>
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900 dark:text-white leading-none">{t.recentBulletin}</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                  <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-10 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-primary/20 group-hover:shadow-xl transition-all duration-500">
                    <h4 className="font-black text-slate-900 dark:text-white text-xl mb-3">Campus Infrastructure Update</h4>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">Major renovations planned for the main auditorium and laboratory wing are set to begin next semester. Stay tuned for...</p>
                  </div>
                  <Button variant="ghost" className="w-full h-16 font-black rounded-3xl text-lg hover:bg-primary hover:text-white transition-all duration-500 shadow-sm" asChild>
                    <Link href="/announcements">{t.viewBoard}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Council Notification */}
            {profile?.role === 'council' && (
              <div className="p-12 rounded-[3.5rem] bg-orange-50 dark:bg-orange-950/20 border border-orange-100/60 dark:border-orange-900/40 flex flex-col md:flex-row items-center gap-10 shadow-3xl shadow-orange-500/10 group transition-all hover:bg-orange-100/30 dark:hover:bg-orange-900/30">
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] text-orange-600 shadow-2xl shadow-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <ShieldAlert size={56} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-black text-orange-950 dark:text-orange-100 mb-2 leading-none">{t.actionRequired}</h3>
                  <p className="text-orange-800/60 dark:text-orange-400 font-bold text-xl">{t.proposalsReview}</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-3xl h-16 px-12 shadow-2xl shadow-orange-500/40 shrink-0 text-lg" asChild>
                  <Link href="/council">{t.reviewProposals}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4">
            <Card className="shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border-none bg-white dark:bg-slate-900 rounded-[3rem] h-full overflow-hidden flex flex-col p-2">
              <CardHeader className="p-10 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white leading-none">{t.nextMeeting}</CardTitle>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Priority Assembly</p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-2xl text-accent shadow-lg shadow-accent/5">
                    <Calendar size={32} />
                  </div>
                </div>
                
                <div className="flex items-center gap-6 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:border-accent/20 transition-all duration-500">
                  <div className="flex flex-col items-center justify-center min-w-[90px] h-[90px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 border border-slate-100 dark:border-slate-800 group-hover:bg-accent group-hover:text-white transition-all">
                    <span className="font-black text-4xl leading-none">24</span>
                    <span className="text-xs font-black uppercase tracking-widest mt-1 opacity-60">Oct</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 dark:text-white text-2xl leading-tight truncate mb-1">Thursday General</h4>
                    <p className="text-base text-slate-500 dark:text-slate-400 font-bold">Room 402 • 14:30</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-10 pb-10 flex-1 flex flex-col">
                <Separator className="bg-slate-100 dark:bg-slate-800 my-10" />
                <div className="space-y-8">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Agenda Overview</h5>
                  <div className="space-y-6">
                    {['Budget Allocation Q4', 'Annual Sports Week Prep', 'Cafeteria Menu Update'].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 group cursor-pointer">
                        <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40 group-hover:scale-[1.8] group-hover:rotate-45 transition-all" />
                        <span className="text-lg text-slate-700 dark:text-slate-200 font-bold group-hover:text-primary group-hover:translate-x-1 transition-all">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-12">
                  <Button variant="outline" className="w-full h-16 font-black border-slate-200 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary transition-all text-lg shadow-sm">
                    {t.addCalendar}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
