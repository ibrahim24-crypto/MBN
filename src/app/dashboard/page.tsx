"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Megaphone, Calendar, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();
  const { t } = useLanguage();

  if (loading) return null;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {t.welcomeBack} {profile?.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* XP Widget (Student Only) */}
          {profile?.role === 'student' && (
            <Card className="col-span-1 border-none bg-accent text-white shadow-xl shadow-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.progress}</CardTitle>
                <Trophy className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{profile.xp} XP</div>
                <Progress value={profile.xp % 100} className="h-2 bg-white/20 mb-1" />
                <p className="text-xs text-white/70">{t.keepParticipating}</p>
              </CardContent>
            </Card>
          )}

          {/* Admin Stats (Administration Only) */}
          {(profile?.role === 'administration' || isSuperAdmin) && (
            <Card className="col-span-1 border-none bg-primary text-white shadow-xl shadow-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.activeRoles}</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{t.adminPanel}</div>
                <p className="text-xs text-white/70">{t.manageUsers}</p>
                <Button variant="secondary" size="sm" className="mt-4 w-full" asChild>
                  <Link href="/admin">{t.manageUsers}</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Announcements Widget */}
          <Card className="shadow-md border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.recentBulletin}</CardTitle>
              <Megaphone className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{t.newAnnouncement}</div>
              <p className="text-xs text-muted-foreground mt-1">{t.checkLatest}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/announcements">{t.viewBoard}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Schedule/Event (Mock) */}
          <Card className="shadow-md border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.nextMeeting}</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Thursday, 2 PM</div>
              <p className="text-xs text-muted-foreground mt-1">School Library, Room 204</p>
              <Button variant="ghost" size="sm" className="mt-4 w-full">{t.addCalendar}</Button>
            </CardContent>
          </Card>
        </div>

        {/* Council Status */}
        {profile?.role === 'council' && (
          <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-bold text-orange-800">{t.actionRequired}</h3>
              <p className="text-sm text-orange-600">{t.proposalsReview}</p>
            </div>
            <Button className="ml-auto bg-orange-600 hover:bg-orange-700 rtl:mr-auto rtl:ml-0" asChild>
              <Link href="/council">{t.reviewProposals}</Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
