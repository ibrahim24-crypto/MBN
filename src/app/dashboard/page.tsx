"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Megaphone, Calendar, ShieldAlert, ArrowRight, ExternalLink, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();
  const { t } = useLanguage();

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
       <div className="animate-spin text-primary">
          <Zap size={48} />
       </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 font-black px-4 py-1 text-[10px] uppercase tracking-widest">
                <Sparkles size={12} className="mr-2" />
                Live Hub
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 leading-[0.9]">
              {t.welcomeBack} <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
              {t.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Button variant="outline" className="rounded-[1.25rem] h-14 px-8 border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all" asChild>
              <Link href="/profile">My Profile</Link>
            </Button>
            <Button className="rounded-[1.25rem] h-14 px-8 font-black gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all" asChild>
              <Link href="/announcements">
                Bulletin Board
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* XP Widget (Student) */}
              {profile?.role === 'student' && (
                <Card className="border-none bg-gradient-to-br from-primary to-accent text-white shadow-[0_20px_50px_rgba(59,130,246,0.3)] relative overflow-hidden group rounded-[2.5rem]">
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Trophy size={180} />
                  </div>
                  <CardHeader className="relative p-10 pb-0">
                    <CardTitle className="text-lg font-black tracking-widest uppercase opacity-80">{t.progress}</CardTitle>
                    <CardDescription className="text-white/70 font-bold text-base">Next level at {(Math.floor(profile.xp / 100) + 1) * 100} XP</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-10">
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-8xl font-black tracking-tighter">{profile.xp}</span>
                      <span className="text-2xl font-black opacity-60 uppercase">XP</span>
                    </div>
                    <div className="space-y-4">
                      <Progress value={profile.xp % 100} className="h-4 bg-white/20 border-none rounded-full" />
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-black text-white/70 tracking-widest uppercase">{t.keepParticipating}</p>
                         <TrendingUp size={16} className="text-white/50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Panel Access */}
              {(profile?.role === 'administration' || isSuperAdmin) && (
                <Card className="border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden group rounded-[2.5rem]">
                  <div className="absolute -bottom-10 -right-10 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Users size={200} />
                  </div>
                  <CardHeader className="relative p-10 pb-0">
                    <CardTitle className="text-lg font-black tracking-widest uppercase opacity-60">System Control</CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-base">Governance & Hierarchy</CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-10">
                    <div className="text-4xl font-black mb-8 leading-tight">{t.adminPanel}</div>
                    <Button variant="secondary" className="w-full h-14 font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl" asChild>
                      <Link href="/admin">
                        {t.manageUsers}
                        <ExternalLink size={18} className="ml-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* News Snippet */}
              <Card className="shadow-2xl shadow-slate-200/50 border-none bg-white group hover:translate-y-[-4px] transition-all duration-500 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Megaphone size={28} />
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest border-none">Breaking</Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900">{t.recentBulletin}</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 mb-8 group-hover:bg-white group-hover:border-primary/20 transition-all duration-500">
                    <h4 className="font-black text-slate-900 text-lg mb-2">Winter Formal 2024</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">Voting is now open for the Winter Formal theme! Head over to the announcements page to cast your vote...</p>
                  </div>
                  <Button variant="ghost" className="w-full h-14 font-black rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500" asChild>
                    <Link href="/announcements">{t.viewBoard}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Council Notification */}
            {profile?.role === 'council' && (
              <div className="p-10 rounded-[2.5rem] bg-orange-50 border border-orange-100/50 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-orange-200/20 group">
                <div className="p-6 bg-white rounded-3xl text-orange-600 shadow-xl shadow-orange-500/10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldAlert size={40} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black text-orange-950 mb-1">{t.actionRequired}</h3>
                  <p className="text-orange-800/70 font-bold text-lg">{t.proposalsReview}</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl h-14 px-10 shadow-2xl shadow-orange-500/30 shrink-0" asChild>
                  <Link href="/council">{t.reviewProposals}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4">
            <Card className="shadow-2xl shadow-slate-200/50 border-none bg-white rounded-[2.5rem] h-full overflow-hidden">
              <CardHeader className="p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-slate-900">{t.nextMeeting}</CardTitle>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Attendance Mandatory</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                    <Calendar size={28} />
                  </div>
                </div>
                
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-primary font-black text-2xl leading-none">24</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oct</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-lg leading-tight truncate">Thursday Assembly</h4>
                    <p className="text-sm text-slate-500 font-bold">Room 204 • 2:00 PM</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-10 pb-10">
                <Separator className="bg-slate-100 mb-8" />
                <div className="space-y-6">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Agenda Highlights</h5>
                  <div className="space-y-4">
                    {['Budget Allocation Q4', 'Annual Sports Week Prep', 'Cafeteria Menu Update'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                        <span className="text-base text-slate-700 font-bold group-hover:text-primary transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full h-14 font-black border-slate-200 rounded-2xl mt-12 hover:bg-slate-50 transition-all">
                  {t.addCalendar}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
