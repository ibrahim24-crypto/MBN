"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  LogOut,
  UserCircle,
  Trophy,
  Languages,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { profile, logout, isSuperAdmin } = useAuth();
  const { t, setLanguage, language } = useLanguage();

  const navItems = [
    { name: t.dashboard, href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'council', 'administration'] },
    { name: t.announcements, href: '/announcements', icon: Megaphone, roles: ['student', 'teacher', 'council', 'administration'] },
    { name: t.councilBoard, href: '/council', icon: ShieldCheck, roles: ['council', 'administration'] },
    { name: t.adminPanel, href: '/admin', icon: Users, roles: ['administration'] },
    { name: t.profile, href: '/profile', icon: UserCircle, roles: ['student', 'teacher', 'council', 'administration'] },
  ];

  const filteredNav = navItems.filter(item => {
    if (isSuperAdmin && item.href === '/admin') return true;
    return profile && item.roles.includes(profile.role);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-80 flex-col border-r border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative z-50">
        <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-[1.25rem] text-white shadow-2xl shadow-primary/40">
              <GraduationCap size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black font-headline text-slate-900 tracking-tighter leading-none">MBN</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black mt-1">Council Hub</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 mt-6">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center justify-between px-5 py-4 rounded-[1.25rem] text-sm font-black transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}>
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon size={20} className={cn(isActive ? "text-primary" : "text-slate-300 group-hover:text-primary transition-colors")} />
                    {item.name}
                  </div>
                  {isActive && (
                    <div className="relative z-10">
                      <ChevronRight size={16} className="text-primary" />
                    </div>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto space-y-6">
          {profile?.role === 'student' && (
            <div className="p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10 group cursor-pointer hover:bg-primary/10 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary p-2 rounded-xl text-white">
                  <Trophy size={16} />
                </div>
                <Sparkles size={14} className="text-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Rank</span>
                <p className="text-xl font-black text-slate-900">{profile.xp} <span className="text-xs text-slate-400 uppercase">XP</span></p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-2">
            <Avatar className="h-12 w-12 border-2 border-white shadow-xl group cursor-pointer hover:scale-110 transition-transform duration-500">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-black text-lg">
                {profile?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-black text-slate-900 truncate tracking-tight">{profile?.displayName}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-black border-slate-200 rounded-2xl h-12 shadow-sm hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <Languages size={18} className="text-slate-400" />
                    <span>{language === 'ar' ? 'العربية' : 'Français'}</span>
                  </div>
                  <ChevronRight size={14} className="rotate-90 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[260px] rounded-2xl p-2 shadow-2xl border-none">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className={cn("rounded-xl py-3 px-4 font-black cursor-pointer", language === 'ar' && "bg-primary/5 text-primary")}>
                  العربية (Arabic)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className={cn("rounded-xl py-3 px-4 font-black cursor-pointer", language === 'fr' && "bg-primary/5 text-primary")}>
                  Français (French)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-white hover:bg-destructive rounded-2xl font-black h-12 transition-all group"
              onClick={() => logout()}
            >
              <LogOut size={18} className="mr-3 rtl:ml-3 rtl:mr-0 group-hover:translate-x-1 transition-transform" />
              {t.signOut}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Modern Background Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full -z-10 -translate-x-1/4 translate-y-1/4"></div>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-6 border-b bg-white shadow-md z-50">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl text-white">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-black font-headline text-slate-900 tracking-tighter">MBN</span>
          </div>
          <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 border-2 border-slate-100" onClick={() => logout()}>
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="font-bold">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
