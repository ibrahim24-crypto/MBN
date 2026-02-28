
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
  ShieldCheck,
  LogOut,
  Settings
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, loading, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center gap-10 w-full max-w-4xl">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="w-full max-w-md h-[450px] rounded-2xl" />
          <Skeleton className="w-full h-[350px] rounded-2xl" />
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
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden w-full max-w-md group transition-all duration-1000 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-12 adaptive-card mx-auto">
          <div className="h-40 bg-gradient-to-br from-primary via-primary/90 to-accent w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
            <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:scale-125 transition-transform duration-1000">
               <User size={300} className="text-white" />
            </div>
          </div>
          
          <CardContent className="relative flex flex-col items-center -mt-20 text-center pb-10 px-10">
            <div className="relative mb-8">
              <Avatar className="h-40 w-40 border-[8px] border-white dark:border-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-1000 rounded-2xl">
                <AvatarImage 
                  src={profile.photoURL || "/logo.png"} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-6xl bg-primary text-white font-black">
                  {profile.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-emerald-500 border-[5px] border-white dark:border-slate-900 rounded-full shadow-xl flex items-center justify-center">
                 <CheckCircle2 size={18} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none text-balance">
                {profile.displayName}
              </h2>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-[0.3em] text-[10px] font-black px-6 py-2.5 rounded-full shadow-sm">
                  {profile.role}
                </Badge>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group/item hover:bg-white dark:hover:bg-slate-800 transition-all duration-700 shadow-sm">
                <div className="p-4 bg-primary/10 rounded-xl text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm">
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

        {/* Settings Card - Merged Theme and Language and Logout */}
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden w-full max-w-3xl adaptive-card mx-auto p-4 animate-in fade-in slide-in-from-bottom-12 delay-300">
          <CardHeader className="p-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-xl text-primary">
                <Settings size={32} />
              </div>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Hub Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">{t.languageSetting}</label>
                <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                  <SelectTrigger className="w-full h-16 rounded-2xl border-slate-200 dark:border-slate-800 font-black px-6 text-lg shadow-sm hover:border-primary transition-all">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-none p-4 min-w-[200px]">
                    <SelectItem value="ar" className="rounded-xl px-6 py-4 font-black text-lg cursor-pointer">العربية</SelectItem>
                    <SelectItem value="fr" className="rounded-xl px-6 py-4 font-black text-lg cursor-pointer">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Theme</label>
                <div className="flex items-center gap-4 h-16 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="flex-1 font-bold text-slate-600 dark:text-slate-400">Toggle dark/light mode</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-slate-800">
              <Button 
                variant="destructive" 
                className="w-full h-16 rounded-2xl font-black text-lg gap-4 shadow-xl shadow-destructive/20 hover:scale-[1.01] transition-all"
                onClick={() => logout()}
              >
                <LogOut size={24} />
                {t.signOut}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* XP Dashboard Card - Only for roles that use XP */}
        {hasXP && (
          <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden relative group p-10 md:p-14 transition-all duration-700 w-full max-w-3xl adaptive-card mx-auto animate-in fade-in slide-in-from-bottom-12 delay-150">
            <div className="absolute -top-20 -right-20 p-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Trophy size={400} className="text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col gap-8 mb-12 text-center md:text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Zap size={24} />
                    </div>
                    <CardTitle className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t.xpDashboard}</CardTitle>
                  </div>
                  <p className="text-lg text-slate-400 font-bold max-w-lg">{t.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-10">
                <div className="relative text-center md:text-left">
                  <div className="flex items-baseline justify-center md:justify-start gap-5 mb-6">
                    <span className={cn(
                      "text-[8rem] font-black font-headline tracking-tighter leading-none",
                      profile.xp < 0 ? "text-destructive" : "text-primary"
                    )}>{profile.xp}</span>
                    <span className="text-4xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{t.xp}</span>
                  </div>

                  {profile.xp >= 0 && (
                    <div className="max-w-xl space-y-6">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <span>{t.milestoneProgress}</span>
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full">{Math.round(progressToTarget)}%</span>
                      </div>
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200/50 dark:border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                          style={{ width: `${progressToTarget}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">{t.targetXPReminder}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
