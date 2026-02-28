
"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  ShieldCheck, 
  LogOut,
  UserCircle,
  ChevronRight,
  Languages,
  Zap,
  History,
  Menu,
  X,
  AlignLeft
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
import { ThemeToggle } from '@/components/ThemeToggle';
import NextLink from 'next/link';
import Image from 'next/image';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { profile, logout, isSuperAdmin } = useAuth();
  const { t, setLanguage, language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      {/* Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative z-50 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[320px]"
      )}>
        <div className={cn("p-6 flex flex-col items-center gap-6", !isCollapsed && "items-start px-8 pt-10")}>
          <div className="flex items-center gap-4 w-full">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 h-10 w-10 rounded-xl text-slate-500 dark:text-slate-400 transition-all duration-300 shrink-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <Menu size={24} /> : <AlignLeft size={24} />}
            </Button>
            {!isCollapsed && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden">
                <div className="w-8 h-8 relative rounded-lg overflow-hidden shadow-sm bg-white">
                  <Image src="/logo.png" fill alt="MBN Logo" className="object-contain p-0.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black font-headline text-slate-900 dark:text-white tracking-tighter leading-none truncate">MBN COUNCIL</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 font-black mt-1">Moussa Ibn Nousayr</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <nav className={cn("flex-1 px-3 space-y-2 mt-6", !isCollapsed && "px-6")}>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NextLink key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  isCollapsed ? "justify-center" : "justify-between"
                )}>
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors")} />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap">{item.name}</span>}
                  </div>
                  {!isCollapsed && isActive && (
                    <div className="relative z-10 animate-in fade-in slide-in-from-left-2 duration-500">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  )}
                </span>
              </NextLink>
            );
          })}
        </nav>

        <div className={cn(
          "p-4 mt-auto space-y-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 transition-all",
          !isCollapsed && "p-8"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-3 animate-in fade-in duration-500">
               <div className="flex items-center gap-3 group min-w-0">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-lg cursor-pointer hover:scale-110 transition-transform duration-500 shrink-0">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-accent text-white font-black text-lg">
                      {profile?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{profile?.displayName}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        (profile?.xp ?? 0) < 0 ? "text-destructive" : "text-primary"
                      )}>
                        {profile?.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
                <ThemeToggle />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
              <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-md">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback className="text-xs">{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <ThemeToggle />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isCollapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-black border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl h-12 shadow-sm hover:border-primary transition-all px-4">
                    <div className="flex items-center gap-3">
                      <Languages size={16} className="text-slate-400" />
                      <span className="text-xs dark:text-white">{language === 'ar' ? 'العربية' : 'Français'}</span>
                    </div>
                    <ChevronRight size={14} className="rotate-90 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[240px] rounded-2xl p-2 shadow-xl border-none bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-300">
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className={cn("rounded-xl py-3 px-4 font-black cursor-pointer transition-colors", language === 'ar' ? "bg-primary text-white" : "hover:bg-primary/5 dark:hover:bg-slate-800 hover:text-primary dark:text-slate-300")}>
                    العربية (Arabic)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')} className={cn("rounded-xl py-3 px-4 font-black cursor-pointer transition-colors", language === 'fr' ? "bg-primary text-white" : "hover:bg-primary/5 dark:hover:bg-slate-800 hover:text-primary dark:text-slate-300")}>
                    Français (French)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button 
              variant="ghost" 
              className={cn(
                "w-full text-destructive hover:text-white hover:bg-destructive rounded-2xl font-black h-12 transition-all group px-4",
                isCollapsed ? "justify-center p-0" : "justify-start"
              )}
              onClick={() => logout()}
            >
              <LogOut size={18} className={cn(!isCollapsed && "mr-3 rtl:ml-3 rtl:mr-0 group-hover:translate-x-1 transition-transform")} />
              {!isCollapsed && t.signOut}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Modern Background Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full -z-10 -translate-x-1/4 translate-y-1/4"></div>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-6 border-b dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-white">
              <Image src="/logo.png" fill alt="MBN Logo" className="object-contain p-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black font-headline text-slate-900 dark:text-white tracking-tighter leading-none">MBN Council</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap size={10} className="text-primary fill-primary" />
                <span className="text-[10px] font-black text-primary">{profile?.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <Avatar className="h-10 w-10 border-2 border-slate-100 dark:border-slate-800" onClick={() => logout()}>
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="font-black text-xs">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
