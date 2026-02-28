"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mail, Calendar, ShieldCheck, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;

  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Account settings and engagement rewards.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <Card className="col-span-1 border-none shadow-md overflow-hidden">
          <div className="h-24 bg-primary/10 w-full" />
          <CardContent className="relative flex flex-col items-center -mt-12 text-center pb-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg mb-4">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback className="text-2xl bg-primary text-white">
                {profile.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile.displayName}</h2>
            <Badge variant="secondary" className="mt-2 uppercase tracking-widest text-[10px]">
              {profile.role}
            </Badge>
            
            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-left px-4">
                <div className="p-2 bg-muted rounded-md text-muted-foreground">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">Email</span>
                  <span>{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-left px-4">
                <div className="p-2 bg-muted rounded-md text-muted-foreground">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase">UID</span>
                  <span className="font-mono text-[10px] truncate max-w-[150px]">{profile.uid}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP & Achievements */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {profile.role === 'student' && (
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-accent" />
                  MBN Student Rewards
                </CardTitle>
                <CardDescription>Earn XP by engaging with the school council.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-bold text-accent">{profile.xp}</span>
                    <span className="text-muted-foreground ml-2">XP Total</span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Level {Math.floor(profile.xp / 100) + 1}
                  </div>
                </div>
                <Progress value={profile.xp % 100} className="h-3 bg-accent/10" />
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-muted/50 border flex flex-col items-center text-center">
                    <Star className="text-yellow-500 mb-2" size={20} />
                    <span className="text-sm font-bold">First Entry</span>
                    <span className="text-[10px] text-muted-foreground">+100 XP (Collected)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-dashed opacity-50 flex flex-col items-center text-center">
                    <Megaphone className="text-primary mb-2" size={20} />
                    <span className="text-sm font-bold">Feedback</span>
                    <span className="text-[10px] text-muted-foreground">+50 XP (Locked)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>Manage your digital identity at MBN.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your role is assigned by the school administration. If you believe your role is incorrect, please contact <strong>ibrahimezzine09@gmail.com</strong>.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Two-Factor Enabled</Badge>
                <Badge variant="outline">Google Account Linked</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}