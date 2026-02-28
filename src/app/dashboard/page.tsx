"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Megaphone, Calendar, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();
  const { t } = useLanguage();

  if (loading) return null;

  return (
    <AppLayout>
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 py-1">
              Welcome Back
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-slate-900">
              {t.welcomeBack} {profile?.displayName?.split(' ')[0]}!
            </h1>
            <p className="text-lg text-slate-500 max-w-xl font-medium leading-relaxed">
              {t.description}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold" asChild>
              <Link href="/profile">View Profile</Link>
            </Button>
            <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="/announcements">
                Check News
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* XP Widget (Student Only) */}
              {profile?.role === 'student' && (
                <Card className="border-none bg-gradient-to-br from-accent to-accent/80 text-white shadow-2xl shadow-accent/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Trophy size={120} />
                  </div>
                  <CardHeader className="relative">
                    <CardTitle className="text-lg font-bold opacity-90">{t.progress}</CardTitle>
                    <CardDescription className="text-white/70 font-medium">Next milestone at {(Math.floor(profile.xp / 100) + 1) * 100} XP</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-5xl font-black mb-4">{profile.xp} <span className="text-xl font-bold opacity-60 uppercase">XP</span></div>
                    <div className="space-y-2">
                      <Progress value={profile.xp % 100} className="h-3 bg-white/20" />
                      <p className="text-xs font-bold text-white/70 tracking-wide uppercase">{t.keepParticipating}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Stats (Administration Only) */}
              {(profile?.role === 'administration' || isSuperAdmin) && (
                <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Users size={120} />
                  </div>
                  <CardHeader className="relative">
                    <CardTitle className="text-lg font-bold opacity-90">{t.activeRoles}</CardTitle>
                    <CardDescription className="text-white/70 font-medium">Manage organization hierarchy</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-4xl font-black mb-6">{t.adminPanel}</div>
                    <Button variant="secondary" className="w-full font-bold rounded-xl" asChild>
                      <Link href="/admin">
                        {t.manageUsers}
                        <ExternalLink size={14} className="ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Announcements Widget */}
              <Card className="shadow-xl border-none bg-white group hover:translate-y-[-4px] transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900">{t.recentBulletin}</CardTitle>
                    <CardDescription className="font-medium">{t.checkLatest}</CardDescription>
                  </div>
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Megaphone size={22} />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                    <h4 className="font-bold text-slate-800 mb-1">New Library Rules</h4>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">The school council has approved new guidelines for library usage starting next week...</p>
                  </div>
                  <Button variant="secondary" className="w-full font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-colors" asChild>
                    <Link href="/announcements">{t.viewBoard}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Council Status */}
            {profile?.role === 'council' && (
              <div className="p-8 rounded-[2rem] bg-orange-50 border border-orange-100 flex items-center gap-6 shadow-sm">
                <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shadow-inner">
                  <ShieldAlert size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900">{t.actionRequired}</h3>
                  <p className="text-orange-700/80 font-medium">{t.proposalsReview}</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-6 shadow-lg shadow-orange-200" asChild>
                  <Link href="/council">{t.reviewProposals}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4">
            <Card className="shadow-xl border-none bg-white h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900">{t.nextMeeting}</CardTitle>
                  <Calendar size={20} className="text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl">
                    <span className="text-primary font-black text-xl leading-none">24</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Oct</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none mb-1">Thursday Assembly</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">2:00 PM • Room 204</p>
                  </div>
                </div>
                <Separator className="bg-slate-100" />
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-700">Agenda Topics</h5>
                  <ul className="space-y-3">
                    {['Budget Allocation', 'Sports Week Prep', 'Winter Cafeteria Menu'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-sm text-slate-600 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full font-bold border-slate-200 rounded-xl mt-4">
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

import { Separator } from '@/components/ui/separator';