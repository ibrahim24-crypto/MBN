
"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  ShieldCheck, 
  LogOut,
  UserCircle,
  History,
  Menu,
  AlignLeft,
  ChevronRight
} from 'lucide-react';
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
  const { profile, logout, isSuperAdmin } = useAuth();
  const { t, setLanguage, language } = useLanguage();
  // Sidebar starts collapsed for the icons-only experience
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    { name: t.dashboard, href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'council', 'administration'] },
    { name: t.announcements, href: '/announcements', icon: Megaphone, roles: ['student', 'teacher', 'council', 'administration'] },
    { name: t.xpHistory, href: '/xp-log', icon: History, roles: ['student', 'teacher', 'council', 'administration'] },
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
      <TooltipProvider delayDuration={0}>
        {/* Sidebar */}
        <aside className={cn(
          "hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative z-50 transition-all duration-500 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-[300px]"
        )}>
          <div className="p-6 flex flex-col items-center gap-8">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 h-12 w-12 rounded-2xl text-slate-500 dark:text-slate-400 transition-all duration-300"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <Menu size={24} /> : <AlignLeft size={24} />}
            </Button>

            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 bg-white">
                <Image src="/logo.png" fill alt="MBN Logo" className="object-contain p-1.5" />
              </div>
              {!isCollapsed && (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <span className="text-sm font-black font-headline text-slate-900 dark:text-white tracking-tighter leading-none block">MBN COUNCIL</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 font-black mt-1 block">Moussa Ibn Nousayr</span>
                </div>
              )}
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-4 mt-8">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              const content = (
                <NextLink href={item.href}>
                  <div className={cn(
                    "flex items-center rounded-2xl transition-all group relative overflow-hidden h-14",
                    isCollapsed ? "justify-center w-14" : "px-4 gap-4 w-full",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}>
                    <item.icon size={22} className={cn(isActive ? "text-white" : "text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors")} />
                    {!isCollapsed && <span className="font-black text-sm tracking-tight">{item.name}</span>}
                  </div>
                </NextLink>
              );

              return isCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-black text-xs px-4 py-2 rounded-xl border-none shadow-2xl">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{content}</div>
              );
            })}
          </nav>

          <div className="p-6 mt-auto flex flex-col items-center gap-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className={cn("flex flex-col items-center gap-4 w-full", !isCollapsed && "items-start")}>
              <ThemeToggle />
              
              {!isCollapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-black border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl h-12 shadow-sm hover:border-primary transition-all px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs dark:text-white">{language === 'ar' ? 'العربية' : 'Français'}</span>
                      </div>
                      <ChevronRight size={14} className="rotate-90 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[240px] rounded-2xl p-2 shadow-xl border-none bg-white dark:bg-slate-900">
                    <DropdownMenuItem onClick={() => setLanguage('ar')} className={cn("rounded-xl py-3 px-4 font-black cursor-pointer", language === 'ar' ? "bg-primary text-white" : "hover:bg-primary/5 dark:hover:bg-slate-800")}>
                      العربية (Arabic)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('fr')} className={cn("rounded-xl py-3 px-4 font-black cursor-pointer", language === 'fr' ? "bg-primary text-white" : "hover:bg-primary/5 dark:hover:bg-slate-800")}>
                      Français (French)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full text-destructive hover:text-white hover:bg-destructive rounded-2xl font-black h-12 transition-all",
                      isCollapsed ? "justify-center p-0 w-12" : "justify-start px-4"
                    )}
                    onClick={() => logout()}
                  >
                    <LogOut size={20} className={!isCollapsed ? "mr-3" : ""} />
                    {!isCollapsed && t.signOut}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right" className="font-black text-xs">{t.signOut}</TooltipContent>}
              </Tooltip>

              <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "w-full")}>
                <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-xl cursor-pointer hover:scale-110 transition-all">
                  <AvatarImage src={profile?.photoURL || "/logo.png"} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-black truncate">{profile?.displayName}</p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{profile?.xp} XP</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
          <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-white shadow-md">
            <Image src="/logo.png" fill alt="MBN Logo" className="object-contain p-1" />
          </div>
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <Avatar className="h-10 w-10 border-2 border-slate-100" onClick={() => logout()}>
              <AvatarImage src={profile?.photoURL || "/logo.png"} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
