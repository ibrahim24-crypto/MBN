
"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  ShieldCheck, 
  LogOut,
  UserCircle,
  ChevronRight,
  Command,
  Languages,
  Zap
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';

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
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-950 selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-96 flex-col border-r border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none relative z-50">
        <div className="p-12 flex flex-col items-start gap-8">
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="bg-primary p-4 rounded-[1.75rem] text-white shadow-3xl shadow-primary/40 group-hover:rotate-12 transition-all duration-500">
              <Command size={36} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black font-headline text-slate-900 dark:text-white tracking-tighter leading-none">MBN</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-black mt-2">Executive Hub</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-8 space-y-3 mt-8">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center justify-between px-7 py-5 rounded-[1.5rem] text-base font-black transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-slate-900 dark:bg-primary text-white shadow-3xl shadow-slate-900/30 dark:shadow-primary/20 scale-[1.03] translate-x-1" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}>
                  <div className="flex items-center gap-5 relative z-10">
                    <item.icon size={24} className={cn(isActive ? "text-primary dark:text-white" : "text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors")} />
                    {item.name}
                  </div>
                  {isActive && (
                    <div className="relative z-10 animate-in fade-in slide-in-from-left-2 duration-500">
                      <ChevronRight size={18} className="text-primary dark:text-white" />
                    </div>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-10 mt-auto space-y-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-5 group">
                <Avatar className="h-14 w-14 border-[3px] border-white dark:border-slate-800 shadow-2xl shadow-black/10 cursor-pointer hover:scale-110 transition-transform duration-500">
                  <AvatarImage src={profile?.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-accent text-white font-black text-xl">
                    {profile?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{profile?.displayName}</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.25em]">{profile?.role}</p>
                    <Separator orientation="vertical" className="h-3 mx-1 bg-slate-200 dark:bg-slate-700" />
                    <span className={cn(
                      "text-[10px] font-black flex items-center gap-0.5",
                      (profile?.xp ?? 0) < 0 ? "text-destructive" : "text-primary"
                    )}>
                      {profile?.xp} XP
                    </span>
                  </div>
                </div>
              </div>
              <ThemeToggle />
          </div>

          <div className="flex flex-col gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-black border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl h-14 shadow-sm hover:bg-white dark:hover:bg-slate-800 hover:border-primary transition-all px-6">
                  <div className="flex items-center gap-4">
                    <Languages size={20} className="text-slate-400" />
                    <span className="text-sm dark:text-white">{language === 'ar' ? 'العربية' : 'Français'}</span>
                  </div>
                  <ChevronRight size={16} className="rotate-90 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[300px] rounded-[2rem] p-4 shadow-3xl border-none bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-300">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className={cn("rounded-2xl py-4 px-6 font-black cursor-pointer transition-colors", language === 'ar' ? "bg-primary text-white" : "hover:bg-primary/5 dark:hover:bg-slate-800 hover:text-primary dark:text-slate-300")}>
                  العربية (Arabic)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className={cn("rounded-2xl py-4 px-6 font-black cursor-pointer transition-colors", language === 'fr' ? "bg-primary text-white" : "hover:bg-primary/5 dark:hover:bg-slate-800 hover:text-primary dark:text-slate-300")}>
                  Français (French)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-white hover:bg-destructive rounded-3xl font-black h-14 transition-all group px-6"
              onClick={() => logout()}
            >
              <LogOut size={20} className="mr-4 rtl:ml-4 rtl:mr-0 group-hover:translate-x-1 transition-transform" />
              {t.signOut}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Modern Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-accent/5 blur-[130px] rounded-full -z-10 -translate-x-1/4 translate-y-1/4"></div>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-8 border-b dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
              <Command size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-headline text-slate-900 dark:text-white tracking-tighter leading-none">MBN</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap size={10} className="text-primary fill-primary" />
                <span className="text-[10px] font-black text-primary">{profile?.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-800" onClick={() => logout()}>
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="font-black">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 md:p-24 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
