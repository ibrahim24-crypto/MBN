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
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'council', 'administration'] },
  { name: 'Announcements', href: '/announcements', icon: Megaphone, roles: ['student', 'teacher', 'council', 'administration'] },
  { name: 'Council Board', href: '/council', icon: ShieldCheck, roles: ['council', 'administration'] },
  { name: 'Admin Panel', href: '/admin', icon: Users, roles: ['administration'] },
  { name: 'Profile', href: '/profile', icon: UserCircle, roles: ['student', 'teacher', 'council', 'administration'] },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { profile, logout, isSuperAdmin } = useAuth();

  const filteredNav = navItems.filter(item => {
    if (isSuperAdmin && item.href === '/admin') return true;
    return profile && item.roles.includes(profile.role);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <span className="text-2xl font-bold font-headline text-primary tracking-tight">MBN</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon size={18} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          {profile?.role === 'student' && (
            <div className="mb-4 px-3 py-2 bg-accent/10 rounded-lg flex items-center gap-2 text-accent">
              <Trophy size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">{profile.xp} XP</span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.displayName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{profile?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-md text-white">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl font-bold font-headline text-primary">MBN</span>
          </div>
          <Avatar className="h-8 w-8" onClick={() => logout()}>
            <AvatarImage src={profile?.photoURL} />
            <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};