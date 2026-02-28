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
  ChevronRight
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
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-white shadow-sm">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
              <GraduationCap size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-headline text-slate-900 leading-tight">MBN School</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Council Hub</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          {profile?.role === 'student' && (
            <div className="mb-6 p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-center justify-between group cursor-pointer hover:bg-accent/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-accent p-2 rounded-lg text-white">
                  <Trophy size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-accent uppercase tracking-tighter">Your Progress</span>
                  <span className="text-sm font-bold text-slate-900">{profile.xp} XP</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-accent opacity-50 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          <div className="flex items-center gap-4 p-2 mb-4">
            <Avatar className="h-11 w-11 border-2 border-slate-100 shadow-sm">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {profile?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{profile?.displayName}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-semibold border-slate-200">
                  <div className="flex items-center gap-2">
                    <Languages size={16} className="text-slate-400" />
                    <span>{language === 'ar' ? 'العربية' : 'Français'}</span>
                  </div>
                  <ChevronRight size={14} className="rotate-90 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[240px]">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className={cn("py-2", language === 'ar' && "bg-primary/5 text-primary font-bold")}>
                  العربية (Arabic)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className={cn("py-2", language === 'fr' && "bg-primary/5 text-primary font-bold")}>
                  Français (French)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 font-bold"
              onClick={() => logout()}
            >
              <LogOut size={18} className="mr-3 rtl:ml-3 rtl:mr-0" />
              {t.signOut}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 blur-[100px] rounded-full -z-10 -translate-x-1/4 translate-y-1/4"></div>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl font-bold font-headline text-slate-900">MBN</span>
          </div>
          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9 border-2 border-slate-100" onClick={() => logout()}>
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};