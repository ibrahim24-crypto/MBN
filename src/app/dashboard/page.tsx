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
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] shadow-sm w-fit">
                <Sparkles size={12} className="mr-2 text-accent" />
                Moussa Ibn Nousayr Hub
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-[0.9] text-balance">
              {t.welcomeBack} <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
              {t.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Button variant="outline" className="rounded-2xl h-14 px-8 border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-all text-base shadow-sm" asChild>
              <Link href="/profile">My Profile</Link>
            </Button>
            <Button className="rounded-2xl h-14 px-8 font-black gap-3 shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all text-base" asChild>
              <Link href="/announcements">
                Bulletin Board
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-wrap gap-8">
              {/* XP Widget (Student) */}
              {profile?.role === 'student' && (
                <Card className="flex-1 min-w-[300px] border-none bg-gradient-to-br from-primary via-primary to-accent text-white shadow-2xl relative overflow-hidden group rounded-[2.5rem] p-2 transition-all hover:scale-[1.01]">
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                    <Trophy size={200} />
                  </div>
                  <CardHeader className="relative p-8 pb-0">
                    <CardTitle className="text-sm font-black tracking-[0.2em] uppercase opacity-80 mb-1">{t.progress}</CardTitle>
                    <CardDescription className="text-white/80 font-bold">Next level at {(Math.floor(profile.xp / 100) + 1) * 100} XP</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8">
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-7xl font-black tracking-tighter leading-none">{profile.xp}</span>
                      <span className="text-xl font-black opacity-60 uppercase tracking-widest">XP</span>
                    </div>
                    <div className="space-y-4">
                      <Progress value={profile.xp % 100} className="h-4 bg-white/20 border-none rounded-full" />
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit">
                         <p className="text-[10px] font-black text-white uppercase tracking-[0.1em]">{t.keepParticipating}</p>
                         <TrendingUp size={16} className="text-white/60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Panel Access */}
              {(profile?.role === 'administration' || isSuperAdmin) && (
                <Card className="flex-1 min-w-[300px] border-none bg-slate-900 dark:bg-slate-900 text-white shadow-2xl relative overflow-hidden group rounded-[2.5rem] p-2 transition-all hover:scale-[1.01]">
                  <div className="absolute -bottom-10 -right-10 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                    <Users size={200} />
                  </div>
                  <CardHeader className="relative p-8 pb-0">
                    <CardTitle className="text-sm font-black tracking-[0.2em] uppercase opacity-50 mb-1">Governance</CardTitle>
                    <CardDescription className="text-slate-400 font-bold">Access Control Hub</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8">
                    <div className="text-4xl font-black mb-8 leading-tight tracking-tight">{t.adminPanel}</div>
                    <Button variant="secondary" className="w-full h-14 font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl group" asChild>
                      <Link href="/admin">
                        {t.manageUsers}
                        <ExternalLink size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* News Snippet */}
              <Card className="flex-1 min-w-[300px] shadow-xl border-none bg-white dark:bg-slate-900 group hover:translate-y-[-4px] transition-all duration-500 rounded-[2.5rem] overflow-hidden p-1">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <Megaphone size={24} />
                    </div>
                    <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] border-none px-3 py-1 rounded-full">Active Feed</Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">{t.recentBulletin}</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-6 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-500">
                    <h4 className="font-black text-slate-900 dark:text-white text-lg mb-2">Campus Infrastructure</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">Major renovations planned for the main auditorium are set to begin next semester...</p>
                  </div>
                  <Button variant="ghost" className="w-full h-14 font-black rounded-2xl hover:bg-primary hover:text-white transition-all duration-500" asChild>
                    <Link href="/announcements">{t.viewBoard}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Council Notification */}
            {profile?.role === 'council' && (
              <div className="p-8 rounded-[2.5rem] bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 flex flex-col md:flex-row items-center gap-8 shadow-xl group transition-all hover:bg-orange-100/30">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl text-orange-600 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <ShieldAlert size={40} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black text-orange-950 dark:text-orange-100 mb-1 leading-none">{t.actionRequired}</h3>
                  <p className="text-orange-800/60 dark:text-orange-400 font-bold text-lg">{t.proposalsReview}</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl h-14 px-10 shadow-xl shrink-0" asChild>
                  <Link href="/council">{t.reviewProposals}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4">
            <Card className="shadow-xl border-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden p-1">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">{t.nextMeeting}</CardTitle>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Priority Assembly</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <Calendar size={24} />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 transition-all duration-500">
                  <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 group-hover:bg-accent group-hover:text-white transition-all">
                    <span className="font-black text-2xl leading-none">24</span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Oct</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight truncate">General Assembly</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Room 402 • 14:30</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 flex flex-col">
                <Separator className="bg-slate-100 dark:bg-slate-800 my-8" />
                <div className="space-y-6">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agenda</h5>
                  <div className="space-y-4">
                    {['Budget Allocation Q4', 'Annual Sports Week', 'Cafeteria Update'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/40 group-hover:scale-150 transition-all" />
                        <span className="text-sm text-slate-700 dark:text-slate-200 font-bold group-hover:text-primary transition-all">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-8">
                  <Button variant="outline" className="w-full h-14 font-black border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary transition-all shadow-sm">
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