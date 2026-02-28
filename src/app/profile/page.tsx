
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Mail, 
  ShieldCheck, 
  Zap,
  ShieldAlert,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;

  const currentLevel = Math.floor(Math.abs(profile.xp) / 100) + 1;

  return (
    <AppLayout>
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <Badge className="bg-primary/10 text-primary font-bold mb-3 px-4 py-1 rounded-full">User Hub</Badge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-slate-900 dark:text-white">
          Your Profile
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">Manage your identity and track your school contributions at Moussa Ibn Nousayr.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Profile Identity Card */}
        <Card className="lg:col-span-4 border-none shadow-2xl shadow-slate-200/60 dark:shadow-black/40 bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden sticky top-8 w-fit max-w-full mx-auto adaptive-card">
          <div className="h-40 bg-gradient-to-br from-primary via-primary/80 to-accent w-full relative">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px]"></div>
          </div>
          <CardContent className="relative flex flex-col items-center -mt-20 text-center pb-12 px-8">
            <Avatar className="h-40 w-40 border-[8px] border-white dark:border-slate-900 shadow-2xl mb-6 group transition-transform hover:scale-105 duration-500">
              <AvatarImage src={profile.photoURL} className="object-cover" />
              <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-accent text-white font-black">
                {profile.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 mb-8">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {profile.displayName}
              </h2>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] font-black px-4 py-1.5 border-none">
                {profile.role}
              </Badge>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:border-transparent transition-all duration-300">
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl text-primary shadow-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail size={22} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">School Email</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200 truncate">{profile.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Profile Sections */}
        <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          {/* Restyled Performance Statistics Card */}
          <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden relative group p-10 transition-all duration-500 hover:shadow-primary/10 w-fit max-w-full adaptive-card">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
              <Activity size={300} className="text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 mb-12">
                <div className="space-y-2">
                  <Badge className="bg-primary text-white border-none font-black px-4 py-1.5 rounded-full flex items-center gap-2 w-fit shadow-lg shadow-primary/20">
                    <Trophy size={14} className="fill-white" />
                    School Performance
                  </Badge>
                  <CardTitle className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Impact Score</CardTitle>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 pr-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-105">
                   <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-black text-3xl shadow-xl">
                      {currentLevel}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Tier {currentLevel}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12 items-center">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className={cn(
                        "text-9xl font-black tracking-tighter leading-none transition-all duration-500",
                        profile.xp < 0 ? "text-destructive drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                      )}>{profile.xp}</span>
                      <span className="text-4xl font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">XP</span>
                    </div>
                    {profile.xp < 0 ? (
                      <div className="flex items-center gap-2 text-destructive font-bold text-sm bg-destructive/5 border border-destructive/10 w-fit px-4 py-2 rounded-xl">
                        <ShieldAlert size={16} />
                        Disciplinary Penalty Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 border border-primary/10 w-fit px-4 py-2 rounded-xl">
                        <TrendingUp size={16} />
                        Standing: Excellent
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-12 bg-slate-100 dark:bg-slate-800" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary">
                       <Zap size={24} className="fill-primary/20" />
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 dark:text-white text-lg">Council Influence</h4>
                       <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your points determine your role within the council.</p>
                    </div>
                 </div>
              </div>
            </div>
          </Card>

          {/* Activity & Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/40 bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden w-fit max-w-full adaptive-card">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <ShieldCheck size={24} className="text-primary" />
                  Security
                </CardTitle>
                <CardDescription className="font-medium text-slate-500 dark:text-slate-400">Account status</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Google Auth</span>
                    </div>
                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[10px]">VERIFIED</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/40 bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden w-fit max-w-full adaptive-card">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <Award size={24} className="text-primary" />
                  Milestones
                </CardTitle>
                <CardDescription className="font-medium text-slate-500 dark:text-slate-400">Achievements</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-8">
                 <div className="space-y-8">
                   {[
                     { name: 'Pioneer', desc: 'Launch member', color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10' },
                   ].map((badge, i) => (
                     <div key={i} className="flex items-center gap-5 group">
                       <div className={cn("p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm", badge.color)}>
                         <Award size={22} />
                       </div>
                       <div className="flex-1">
                         <h4 className="font-black text-slate-900 dark:text-white text-base">{badge.name}</h4>
                         <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{badge.desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
