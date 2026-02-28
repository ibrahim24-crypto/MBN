
"use client";

import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  ShieldCheck, 
  LogOut,
  UserCircle,
  History
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from '@/components/ThemeToggle';
import NextLink from 'next/link';
import Image from 'next/image';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, isSuperAdmin, loading } = useAuth();
  const { t } = useLanguage();
  
  const logoSrc = "/logo.png";

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/');
    }
  }, [loading, profile, router]);

  const navItems = [
    { name: t.dashboard, href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'council', 'administration'] },
    { name: t.announcements, href: '/announcements', icon: Megaphone, roles: ['student', 'teacher', 'council', 'administration'] },
    { name: t.xpHistory, href: '/xp-log', icon: History, roles: ['student', 'council'] },
    { name: t.councilBoard, href: '/council', icon: ShieldCheck, roles: ['council', 'administration'] },
    { name: t.adminPanel, href: '/admin', icon: Users, roles: ['administration'] },
    { name: t.profile, href: '/profile', icon: UserCircle, roles: ['student', 'teacher', 'council', 'administration'] },
  ];

  const filteredNav = navItems.filter(item => {
    if (isSuperAdmin && item.href === '/admin') return true;
    return profile && item.roles.includes(profile.role);
  });

  if (loading || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 relative animate-pulse">
            <Image src={logoSrc} fill alt="Loading Logo" className="object-contain" unoptimized />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-950 selection:bg-primary/20">
      <TooltipProvider delayDuration={0}>
        <aside className="hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative z-50 w-[112px] transition-all duration-500 ease-in-out">
          <div className="p-8 flex flex-col items-center gap-8 shrink-0">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-2xl border-none group hover:rotate-6 transition-transform">
                <Image 
                  src={logoSrc} 
                  fill 
                  alt="MBN Logo" 
                  className="object-cover" 
                  unoptimized
                />
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-6 mt-12 overflow-y-auto no-scrollbar">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <NextLink href={item.href}>
                      <div className={cn(
                        "flex items-center justify-center rounded-[1.5rem] transition-all group relative overflow-hidden h-16 w-16 mx-auto",
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110" 
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}>
                        <item.icon size={28} className={cn(isActive ? "text-white" : "text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors")} />
                      </div>
                    </NextLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-black text-xs px-5 py-3 rounded-[1rem] border-none shadow-2xl bg-slate-900 text-white translate-x-4">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <div className="p-8 mt-auto flex flex-col items-center gap-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 shrink-0">
            <div className="flex flex-col items-center gap-6 w-full">
              <ThemeToggle />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-16 h-16 justify-center p-0 text-destructive hover:text-white hover:bg-destructive rounded-2xl font-black transition-all shadow-sm"
                    onClick={() => logout()}
                  >
                    <LogOut size={26} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-black text-xs px-4 py-2 rounded-xl bg-destructive text-white border-none shadow-lg translate-x-4">{t.signOut}</TooltipContent>
              </Tooltip>

              <div className="flex items-center justify-center">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-slate-800 shadow-2xl cursor-pointer hover:scale-110 transition-all overflow-hidden">
                  <AvatarImage src={profile?.photoURL || logoSrc} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10"></div>
        
        <header className="md:hidden flex items-center justify-between p-6 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
          <div className="w-14 h-14 relative rounded-xl overflow-hidden shadow-lg">
            <Image src={logoSrc} fill alt="MBN Logo" className="object-cover" unoptimized />
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm" onClick={() => logout()}>
              <AvatarImage src={profile?.photoURL || logoSrc} className="object-cover" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 scroll-smooth no-scrollbar">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
