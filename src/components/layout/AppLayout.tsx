
"use client";

import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  ShieldCheck, 
  History,
  User as UserIcon
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NextLink from 'next/link';
import Image from 'next/image';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isSuperAdmin, loading } = useAuth();
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
  ];

  const filteredNav = navItems.filter(item => {
    if (isSuperAdmin && item.href === '/admin') return true;
    return profile && item.roles.includes(profile.role);
  });

  if (loading || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 relative rounded-2xl overflow-hidden shadow-2xl animate-pulse">
            <Image src={logoSrc} fill alt="Loading Logo" className="object-cover" unoptimized />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-950 selection:bg-primary/20">
      <TooltipProvider delayDuration={0}>
        <aside className="hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative z-50 w-28 transition-all duration-500 ease-in-out">
          <div className="flex flex-col items-center py-8 gap-8 h-full overflow-y-auto no-scrollbar">
            
            {/* Logo Button - Unified at top */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NextLink href="/dashboard" className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-lg border-none group hover:scale-105 transition-all shrink-0 active:scale-95">
                  <Image 
                    src={logoSrc} 
                    fill 
                    alt="MBN Logo" 
                    className="object-cover" 
                    unoptimized
                  />
                </NextLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-black text-xs px-4 py-2 rounded-xl border-none shadow-2xl bg-slate-900 text-white translate-x-2">
                MBN Hub
              </TooltipContent>
            </Tooltip>
            
            <nav className="flex-1 px-4 space-y-4 flex flex-col items-center">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NextLink href={item.href}>
                        <div className={cn(
                          "flex items-center justify-center rounded-2xl transition-all group relative overflow-hidden h-14 w-14",
                          isActive 
                            ? "bg-primary text-white shadow-lg shadow-primary/30" 
                            : "text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-primary/5"
                        )}>
                          <item.icon size={24} className={cn(isActive ? "text-white" : "transition-colors")} />
                        </div>
                      </NextLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-black text-xs px-4 py-2 rounded-xl border-none shadow-2xl bg-slate-900 text-white translate-x-2">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {/* Profile fused with logo at bottom */}
            <div className="px-4 pb-6 mt-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <NextLink href="/profile">
                    <Avatar className="h-14 w-14 border-4 border-slate-50 dark:border-slate-800 shadow-xl cursor-pointer hover:scale-110 transition-all overflow-hidden rounded-2xl">
                      <AvatarImage src={profile?.photoURL || logoSrc} className="object-cover" />
                      <AvatarFallback className="bg-primary text-white font-black">
                        <UserIcon size={24} />
                      </AvatarFallback>
                    </Avatar>
                  </NextLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-black text-xs px-4 py-2 rounded-xl border-none shadow-2xl bg-slate-900 text-white translate-x-2">
                  {t.profile}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>
      </TooltipProvider>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10"></div>
        
        <header className="md:hidden flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
          <div className="w-12 h-12 relative rounded-xl overflow-hidden shadow-lg" onClick={() => router.push('/dashboard')}>
            <Image src={logoSrc} fill alt="MBN Logo" className="object-cover" unoptimized />
          </div>
          <div className="flex items-center gap-4">
             <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm rounded-xl" onClick={() => router.push('/profile')}>
              <AvatarImage src={profile?.photoURL || logoSrc} className="object-cover" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
          <div className="max-w-[90%] mx-auto w-full flex flex-col items-center">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
