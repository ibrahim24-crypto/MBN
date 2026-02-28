
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center gap-10 w-full max-w-4xl">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="w-full max-w-md h-[450px] rounded-[3.5rem]" />
          <Skeleton className="w-full h-[350px] rounded-[3.5rem]" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) return null;

  const currentLevel = Math.floor(Math.abs(profile.xp) / 100) + 1;
  const progressToNext = Math.abs(profile.xp % 100);

  return (
    <AppLayout>
      <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <Badge className="bg-primary/10 text-primary border-primary/20 font-black mb-3 px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] shadow-sm">
          Moussa Ibn Nousayr Hub
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-none">
          MBN <span className="text-primary">Identity</span>
        </h1>
      </header>

      <div className="flex flex-col items-center gap-12 pb-20 w-full max-w-4xl">
        
        {/* Profile Identity Card */}
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden w-full max-w-md group transition-all duration-500 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-8">
          <div className="h-32 bg-gradient-to-br from-primary via-primary/90 to-accent w-full relative">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
          </div>
          <CardContent className="relative flex flex-col items-center -mt-16 text-center pb-10 px-8">
            <div className="relative mb-6">
              <Avatar className="h-32 w-32 border-[6px] border-white dark:border-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                <AvatarImage 
                  src={profile.photoURL || "/logo.png"} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-4xl bg-primary text-white font-black">
                  {profile.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg cursor-help"></span>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-xl font-bold">
                    <p className="text-xs">Active Student</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {profile.displayName}
              </h2>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1.5 rounded-full">
                {profile.role}
              </Badge>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 hover:bg-white transition-all">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">School Email</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{profile.email}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full rounded-2xl h-14 font-black gap-2 text-slate-400 hover:text-primary transition-all">
                Edit Profile
                <ExternalLink size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats Card */}
        <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/90 rounded-[3.5rem] overflow-hidden relative group p-8 md:p-12 transition-all duration-500 w-full animate-in fade-in slide-in-from-bottom-8 delay-100">
          <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
            <Activity size={320} className="text-primary blur-sm" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">
              <div className="space-y-2">
                <Badge className="bg-primary text-white border-none font-black px-4 py-2 rounded-full flex items-center gap-2 w-fit shadow-xl shadow-primary/20">
                  <Trophy size={14} />
                  Academic Engagement
                </Badge>
                <CardTitle className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Engagement <span className="text-primary">Metrics</span></CardTitle>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 pr-10 rounded-[2rem] border border-slate-100 shadow-xl">
                 <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-black text-3xl">
                    {currentLevel}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank Tier</span>
                    <span className="text-xl font-black">Level {currentLevel}</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="relative text-center md:text-left">
                  <div className="flex items-baseline justify-center md:justify-start gap-4 mb-4">
                    <span className={cn(
                      "text-8xl md:text-9xl font-black font-headline tracking-tighter leading-none",
                      profile.xp < 0 ? "text-destructive" : "text-primary"
                    )}>{profile.xp}</span>
                    <span className="text-4xl font-black text-slate-300 uppercase tracking-widest">XP</span>
                  </div>

                  {profile.xp >= 0 && (
                    <div className="max-w-md space-y-4">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progress to Level {currentLevel + 1}</span>
                        <span>{progressToNext}%</span>
                      </div>
                      <div className="relative">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                            style={{ width: `${progressToNext}%` }}
                          />
                        </div>
                        {progressToNext > 80 && (
                          <div className="absolute inset-0 rounded-full animate-pulse bg-primary/20 blur-md -z-10" />
                        )}
                      </div>
                    </div>
                  )}

                  {profile.xp < 0 ? (
                    <div className="flex items-center gap-3 text-destructive font-black text-xs bg-destructive/5 border border-destructive/10 w-fit px-6 py-3 rounded-2xl animate-pulse">
                      <ShieldAlert size={18} />
                      DISCIPLINARY ACTION ACTIVE
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-primary font-black text-xs bg-primary/5 border border-primary/10 w-fit px-6 py-3 rounded-2xl">
                      <TrendingUp size={18} />
                      STATUS: EXEMPLARY
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 shadow-xl group/badge transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/5 rounded-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Zap size={28} className="fill-current opacity-80" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl leading-none mb-1 text-slate-900 dark:text-white">Community Impact</h4>
                      <p className="text-sm font-medium text-slate-500">Contribution to school spirit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievement Gallery */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden w-full p-2 animate-in fade-in slide-in-from-bottom-8 delay-200">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Award size={20} />
              </div>
              Achievement Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center group transition-all hover:bg-white">
                  <div className="mx-auto p-4 rounded-2xl bg-yellow-50 text-yellow-600 shadow-sm transition-all group-hover:scale-110 w-fit mb-4">
                    <Star size={28} className="fill-current" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1">MBN Pioneer</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Early Adopter</p>
                </div>

                <div className="p-6 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-40 grayscale">
                  <div className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Coming Soon</p>
                </div>
             </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
