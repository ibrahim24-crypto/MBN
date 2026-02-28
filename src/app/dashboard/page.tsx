"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Megaphone, Calendar, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile, loading, isSuperAdmin } = useAuth();

  if (loading) return null;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Welcome back, {profile?.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at MBN today.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* XP Widget (Student Only) */}
          {profile?.role === 'student' && (
            <Card className="col-span-1 border-none bg-accent text-white shadow-xl shadow-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Progress</CardTitle>
                <Trophy className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{profile.xp} XP</div>
                <Progress value={profile.xp % 100} className="h-2 bg-white/20 mb-1" />
                <p className="text-xs text-white/70">Keep participating to earn more rewards!</p>
              </CardContent>
            </Card>
          )}

          {/* Admin Stats (Administration Only) */}
          {(profile?.role === 'administration' || isSuperAdmin) && (
            <Card className="col-span-1 border-none bg-primary text-white shadow-xl shadow-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Base</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">Active Roles</div>
                <p className="text-xs text-white/70">Management console is ready.</p>
                <Button variant="secondary" size="sm" className="mt-4 w-full" asChild>
                  <Link href="/admin">Manage Users</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Announcements Widget */}
          <Card className="shadow-md border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Bulletin</CardTitle>
              <Megaphone className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">New Post</div>
              <p className="text-xs text-muted-foreground mt-1">Check the latest council updates.</p>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/announcements">View Board</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Schedule/Event (Mock) */}
          <Card className="shadow-md border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Thursday, 2 PM</div>
              <p className="text-xs text-muted-foreground mt-1">School Library, Room 204</p>
              <Button variant="ghost" size="sm" className="mt-4 w-full">Add to Calendar</Button>
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
              <h3 className="font-bold text-orange-800">Council Action Required</h3>
              <p className="text-sm text-orange-600">3 new proposals need your review before the next meeting.</p>
            </div>
            <Button className="ml-auto bg-orange-600 hover:bg-orange-700" asChild>
              <Link href="/council">Review Proposals</Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}