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
  Star, 
  Megaphone, 
  Settings, 
  Key, 
  Bell, 
  UserCheck,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;

  const currentLevel = Math.floor(profile.xp / 100) + 1;
  const xpToNextLevel = (currentLevel * 100) - profile.xp;
  const progressPercent = profile.xp % 100;

  return (
    <AppLayout>
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <Badge className="bg-primary/10 text-primary font-bold mb-3 px-4 py-1 rounded-full">User Hub</Badge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-slate-900">
          Your Profile
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-2">Manage your identity and track your council contributions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Identity Card */}
        <Card className="lg:col-span-4 border-none shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden sticky top-8">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 w-full relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          </div>
          <CardContent className="relative flex flex-col items-center -mt-16 text-center pb-10 px-8">
            <Avatar className="h-32 w-32 border-[6px] border-white shadow-xl mb-4 group transition-transform hover:scale-105 duration-500">
              <AvatarImage src={profile.photoURL} className="object-cover" />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white font-black">
                {profile.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 mb-6">
              <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                {profile.displayName}
              </h2>
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 uppercase tracking-widest text-[10px] font-black px-3 py-1 border-none">
                {profile.role}
              </Badge>
            </div>
            
            <div className="w-full space-y-3">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md hover:border-transparent transition-all duration-300">
                <div className="p-2.5 bg-white rounded-xl text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Official Email</span>
                  <span className="text-sm font-bold text-slate-700 truncate">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md hover:border-transparent transition-all duration-300">
                <div className="p-2.5 bg-white rounded-xl text-slate-400 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Key size={18} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Unique Token</span>
                  <span className="text-xs font-mono font-bold text-slate-400 truncate tracking-tighter">{profile.id}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-8 rounded-xl font-bold h-12 border-slate-200 gap-2 hover:bg-slate-50 transition-colors">
              <Settings size={18} />
              Account Settings
            </Button>
          </CardContent>
        </Card>

        {/* Main Profile Sections */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          {/* XP Dashboard (Student Specific) */}
          {profile.role === 'student' && (
            <Card className="border-none shadow-2xl shadow-accent/10 bg-gradient-to-br from-accent to-accent/90 text-white rounded-[2.5rem] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Trophy size={200} />
              </div>
              <CardHeader className="relative z-10 p-8 md:p-10 pb-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black flex items-center gap-2">
                      <Zap size={24} className="text-white fill-white" />
                      XP Dashboard
                    </CardTitle>
                    <CardDescription className="text-white/70 font-bold">Your engagement score & rank</CardDescription>
                  </div>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white font-black px-4 py-1.5 border-none backdrop-blur-md">
                    Level {currentLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-8 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <span className="text-7xl font-black tracking-tighter">{profile.xp}</span>
                      <span className="text-2xl font-bold text-white/50 ml-3 uppercase">Total XP</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{xpToNextLevel} XP to Level {currentLevel + 1}</span>
                      </div>
                      <Progress value={progressPercent} className="h-4 bg-white/20 border-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center text-center gap-2 group/item hover:bg-white/20 transition-all">
                      <Star className="text-yellow-300 fill-yellow-300 mb-1 group-hover/item:scale-110 transition-transform" size={24} />
                      <span className="text-xs font-black uppercase tracking-wider">Early Access</span>
                      <Badge variant="outline" className="text-[9px] font-black border-white/20 text-white bg-white/10">UNLOCKED</Badge>
                    </div>
                    <div className="p-5 rounded-3xl bg-black/5 backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center text-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                      <Megaphone className="text-white mb-1" size={24} />
                      <span className="text-xs font-black uppercase tracking-wider">First Post</span>
                      <Badge variant="outline" className="text-[9px] font-black border-white/20 text-white">LOCKED</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity & Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <UserCheck size={20} className="text-primary" />
                  Privileges
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Security permissions & status</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700">Verified Account</span>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px]">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-primary" />
                      <span className="text-sm font-bold text-slate-700">Email Alerts</span>
                    </div>
                    <Badge className="bg-primary/5 text-primary border-primary/10 font-black text-[9px]">ON</Badge>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50 flex gap-4">
                   <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-amber-800 leading-relaxed">
                     Your role is assigned by Administration. For changes, please contact our support team.
                   </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Star size={20} className="text-primary" />
                  Recent Badges
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">Milestones achieved this year</CardLevel>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                 <div className="space-y-6">
                   {[
                     { name: 'Pioneer', desc: 'Joined during launch week', date: 'Oct 2023', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
                     { name: 'Active Student', desc: '100+ XP Milestone', date: 'Nov 2023', icon: Trophy, color: 'text-blue-500 bg-blue-50' }
                   ].map((badge, i) => (
                     <div key={i} className="flex items-center gap-5 group cursor-pointer">
                       <div className={`p-4 rounded-2xl ${badge.color} group-hover:scale-110 transition-transform duration-300`}>
                         <badge.icon size={22} />
                       </div>
                       <div className="flex-1 space-y-0.5">
                         <h4 className="font-black text-slate-900 text-sm">{badge.name}</h4>
                         <p className="text-xs font-medium text-slate-400">{badge.desc}</p>
                       </div>
                       <span className="text-[10px] font-black text-slate-300 uppercase">{badge.date}</span>
                     </div>
                   ))}
                   
                   <Separator className="bg-slate-100" />
                   
                   <Button variant="ghost" className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary hover:bg-primary/5">
                     View All Achievements
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
