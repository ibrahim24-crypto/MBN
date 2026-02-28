
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Trophy, 
  Mail, 
  ShieldAlert,
  Award,
  CheckCircle2,
  Zap,
  Languages,
  User,
  ShieldCheck
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

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

  const hasXP = profile.role === 'student' || profile.role === 'council';
  const progressToTarget = Math.min(Math.max((profile.xp / 200) * 100, 0), 100);

  return (
    <AppLayout>
      <header className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <Badge className="bg-primary/10 text-primary border-primary/20 font-black mb-4 px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px] shadow-sm">
          <ShieldCheck size={14} className="mr-2 inline-block text-accent" />
          Moussa Ibn Nousayr Hub
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-tight">
          {t.mbnIdentity}
        </h1>
      </header>

      <div className="flex flex-col items-center gap-12 pb-32 w-full max-w-4xl">
        
        {/* Profile Identity Card */}
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden w-full max-w-md group transition-all duration-1000 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-12 adaptive-card mx-auto">
          <div className="h-48 bg-gradient-to-br from-primary via-primary/90 to-accent w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
            <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:scale-125 transition-transform duration-1000">
               <User size={300} className="text-white" />
            </div>
          </div>
          
          <CardContent className="relative flex flex-col items-center -mt-24 text-center pb-14 px-12">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125 opacity-50 animate-pulse"></div>
              <Avatar className="h-44 w-44 border-[10px] border-white dark:border-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-1000">
                <AvatarImage 
                  src={profile.photoURL || "/logo.png"} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-6xl bg-primary text-white font-black">
                  {profile.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute bottom-6 right-6 w-10 h-10 bg-emerald-500 border-[5px] border-white dark:border-slate-900 rounded-full shadow-xl cursor-help flex items-center justify-center animate-bounce-slow">
                       <CheckCircle2 size={18} className="text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-2xl font-black bg-emerald-500 text-white border-none px-6 py-3 shadow-2xl">
                    <p className="text-xs uppercase tracking-widest">{t.activeMember}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none text-balance">
                {profile.displayName}
              </h2>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-[0.3em] text-[10px] font-black px-6 py-2.5 rounded-full shadow-sm">
                  {profile.role}
                </Badge>
              </div>
            </div>
            
            <div className="w-full space-y-6">
              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group/item hover:bg-white dark:hover:bg-slate-800 transition-all duration-700 shadow-sm">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm">
                  <Mail size={24} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{t.schoolEmail}</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{profile.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Dashboard Card - Only for roles that use XP */}
        {hasXP && (
          <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-[4rem] overflow-hidden relative group p-10 md:p-16 transition-all duration-700 w-full max-w-3xl adaptive-card mx-auto animate-in fade-in slide-in-from-bottom-12 delay-150">
            <div className="absolute -top-20 -right-20 p-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Trophy size={400} className="text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col gap-8 mb-16 text-center md:text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Zap size={24} />
                    </div>
                    <CardTitle className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t.xpDashboard}</CardTitle>
                  </div>
                  <p className="text-xl text-slate-400 font-bold max-w-lg">{t.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-12">
                <div className="relative text-center md:text-left">
                  <div className="flex items-baseline justify-center md:justify-start gap-5 mb-6">
                    <span className={cn(
                      "text-[10rem] font-black font-headline tracking-tighter leading-none",
                      profile.xp < 0 ? "text-destructive" : "text-primary"
                    )}>{profile.xp}</span>
                    <span className="text-5xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{t.xp}</span>
                  </div>

                  {profile.xp >= 0 ? (
                    <div className="max-w-xl space-y-6">
                      <div className="flex justify-between text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <span>{t.milestoneProgress}</span>
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full">{Math.round(progressToTarget)}%</span>
                      </div>
                      <div className="relative">
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200/50 dark:border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                            style={{ width: `${progressToTarget}%` }}
                          />
                        </div>
                        {progressToTarget > 80 && (
                          <div className="absolute inset-0 rounded-full animate-pulse bg-primary/20 blur-xl -z-10" />
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center md:text-left">{t.targetXPReminder}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-destructive font-black uppercase tracking-[0.2em] text-sm bg-destructive/10 px-8 py-4 rounded-3xl w-fit shadow-lg shadow-destructive/10 animate-pulse border border-destructive/20">
                      <ShieldAlert size={20} />
                      {t.disciplinaryPenalty}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Achievement Gallery - Only for roles that use XP */}
        {hasXP && (
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden w-full max-w-3xl adaptive-card mx-auto p-4 animate-in fade-in slide-in-from-bottom-12 delay-300">
            <CardHeader className="p-12 pb-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-accent/10 rounded-2xl text-accent">
                      <Award size={32} />
                    </div>
                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {t.achievements}
                    </CardTitle>
                 </div>
              </div>
              <p className="text-lg text-slate-400 font-bold px-1">{t.xpIncentive}</p>
            </CardHeader>
            <CardContent className="px-12 pb-12">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="p-12 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 group hover:bg-white dark:hover:bg-slate-800 hover:border-primary/20 transition-all duration-700 shadow-sm">
                    <div className="p-8 rounded-[2rem] bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-700">
                      <CheckCircle2 size={40} />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t.noAchievements}</p>
                  </div>

                  <div className="p-12 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center opacity-20 grayscale pointer-events-none">
                     <Zap size={40} className="text-slate-300 mb-6" />
                     <div className="h-2 w-20 bg-slate-200 rounded-full" />
                  </div>

                  <div className="p-12 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center opacity-20 grayscale pointer-events-none">
                     <Award size={40} className="text-slate-300 mb-6" />
                     <div className="h-2 w-20 bg-slate-200 rounded-full" />
                  </div>
               </div>
            </CardContent>
          </Card>
        )}

        {/* Language Selection Card */}
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden w-full max-w-3xl adaptive-card mx-auto p-4 animate-in fade-in slide-in-from-bottom-12 delay-450">
          <CardHeader className="p-12 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <Languages size={32} />
              </div>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.languageSetting}
              </CardTitle>
            </div>
            <p className="text-lg text-slate-400 font-bold px-1">{t.changeLanguage}</p>
          </CardHeader>
          <CardContent className="px-12 pb-12">
            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
              <SelectTrigger className="w-full h-20 rounded-[2rem] border-slate-200 dark:border-slate-800 font-black px-10 text-xl shadow-sm hover:border-primary transition-all">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="rounded-[2rem] shadow-2xl border-none p-4 min-w-[200px]">
                <SelectItem value="ar" className="rounded-2xl px-6 py-4 font-black text-lg cursor-pointer">العربية</SelectItem>
                <SelectItem value="fr" className="rounded-2xl px-6 py-4 font-black text-lg cursor-pointer">Français</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
