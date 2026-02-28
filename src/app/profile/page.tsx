
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Mail, 
  ShieldCheck, 
  Zap,
  ShieldAlert,
  Award,
  TrendingUp,
  Activity,
  Star,
  ExternalLink
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center gap-10">
          <header className="space-y-4 text-center w-full">
            <Skeleton className="h-6 w-24 rounded-full mx-auto" />
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </header>
          <div className="flex flex-col items-center gap-10 w-full">
            <Skeleton className="w-full max-w-md h-[500px] rounded-[3rem]" />
            <Skeleton className="w-full max-w-4xl h-[400px] rounded-[3.5rem]" />
            <div className="grid grid-cols-1 gap-8 w-full max-w-4xl">
              <Skeleton className="h-[300px] rounded-[3rem]" />
              <Skeleton className="h-[300px] rounded-[3rem]" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) return null;

  const currentLevel = Math.floor(Math.abs(profile.xp) / 100) + 1;
  const progressToNext = Math.abs(profile.xp % 100);

  return (
    <AppLayout>
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700 text-center">
        <Badge className="bg-primary/10 text-primary border-primary/20 font-black mb-3 px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] shadow-sm">
          Moussa Ibn Nousayr Hub
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-none">
          User <span className="text-primary">Profile</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-2xl mx-auto leading-relaxed">
          Monitor your school impact, track your earned XP, and manage your council identity within the MBN community.
        </p>
      </header>

      <div className="flex flex-col items-center gap-12 pb-20 max-w-4xl mx-auto">
        
        {/* Profile Identity Card - No sticky, part of vertical flow */}
        <Card className="border-none shadow-2xl shadow-slate-200/60 dark:shadow-black/60 bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden w-full max-w-md group/card transition-all duration-500 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="h-32 bg-gradient-to-br from-primary via-primary/90 to-accent w-full relative">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[2px]"></div>
          </div>
          <CardContent className="relative flex flex-col items-center -mt-16 text-center pb-10 px-8">
            <div className="relative mb-6">
              <Avatar className="h-32 w-32 border-[6px] border-white dark:border-slate-900 shadow-2xl group-hover/card:scale-105 transition-transform duration-700">
                <AvatarImage 
                  src={profile.photoURL || "/logo.png"} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white font-black uppercase">
                  {profile.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-3 right-3 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full animate-pulse shadow-lg"></span>
            </div>
            
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                {profile.displayName}
              </h2>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 border-none rounded-full">
                {profile.role}
              </Badge>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-primary shadow-md group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Institutional Email</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{profile.email}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full rounded-xl h-12 font-black gap-2 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all text-xs">
                Edit Information
                <ExternalLink size={12} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats Card - Adaptive Width */}
        <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/90 rounded-[3.5rem] overflow-hidden relative group p-8 md:p-12 transition-all duration-500 hover:shadow-primary/10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] dark:opacity-[0.1] group-hover:scale-125 group-hover:-rotate-6 transition-all duration-1000">
            <Activity size={320} className="text-primary blur-sm" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">
              <div className="space-y-2">
                <Badge className="bg-primary text-white border-none font-black px-4 py-2 rounded-full flex items-center gap-2 w-fit shadow-xl shadow-primary/20">
                  <Trophy size={14} className="fill-white" />
                  Performance
                </Badge>
                <CardTitle className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Academic <span className="text-primary">Impact</span></CardTitle>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 pr-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:scale-105">
                 <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-primary/20">
                    {currentLevel}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Level</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">MBN Level {currentLevel}</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              <div className="space-y-8 text-center md:text-left">
                <div className="relative">
                  <div className="flex items-baseline justify-center md:justify-start gap-4 mb-4">
                    <span className={cn(
                      "text-8xl md:text-9xl font-black font-headline tracking-tighter leading-none",
                      profile.xp < 0 ? "text-destructive" : "text-primary"
                    )}>{profile.xp}</span>
                    <span className="text-4xl font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">XP</span>
                  </div>

                  {/* Progress bar */}
                  {profile.xp >= 0 && (
                    <div className="max-w-md mx-auto md:mx-0 space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progress to Level {currentLevel + 1}</span>
                        <span>{progressToNext}%</span>
                      </div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressToNext}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {profile.xp < 0 ? (
                    <div className="flex items-center gap-3 text-destructive font-black text-xs bg-destructive/5 border border-destructive/10 w-fit px-6 py-3 rounded-2xl shadow-sm animate-pulse mx-auto md:mx-0 mt-6">
                      <ShieldAlert size={18} />
                      DISCIPLINARY ACTION LOGGED
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-primary font-black text-xs bg-primary/5 border border-primary/10 w-fit px-6 py-3 rounded-2xl shadow-sm mx-auto md:mx-0 mt-6">
                      <TrendingUp size={18} />
                      STANDING: EXEMPLARY
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-10 bg-slate-200/50 dark:bg-slate-800" />
            
            <div className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl group/badge transition-all hover:scale-[1.02] w-fit">
              <div className="p-4 bg-primary/5 rounded-2xl text-primary transition-colors group-hover/badge:bg-primary group-hover/badge:text-white">
                <Zap size={28} className="fill-current opacity-80" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xl leading-none mb-1">Council Influence</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Participation determines voting weight.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Cards - Still stacked on mobile, adaptive side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden group/sec hover:shadow-2xl transition-all">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ShieldCheck size={20} />
                </div>
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Google Auth</span>
                </div>
                <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[9px] tracking-widest px-2 py-0.5">ACTIVE</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden group/mile hover:shadow-2xl transition-all">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Award size={20} />
                </div>
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-6">
               <div className="flex items-center gap-4 group/item cursor-pointer">
                 <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 shadow-sm transition-all group-hover/item:scale-110">
                   <Star size={20} className="fill-current" />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-black text-slate-900 dark:text-white text-md leading-none mb-1">Pioneer</h4>
                   <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Contribution</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}

