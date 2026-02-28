"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, GraduationCap, Users, Megaphone, Languages, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t, setLanguage } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-bounce text-primary">
          <GraduationCap size={64} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-accent/5 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full"></div>
      </div>

      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-black font-headline tracking-tighter">MBN COUNCIL</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full px-4 hover:bg-white/50 backdrop-blur-sm">
              <Languages size={16} />
              {t.language === 'ar' ? 'العربية' : 'Français'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl border-none p-2">
            <DropdownMenuItem className="rounded-xl px-4 py-2 font-bold cursor-pointer" onClick={() => setLanguage('ar')}>العربية</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-4 py-2 font-bold cursor-pointer" onClick={() => setLanguage('fr')}>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-black tracking-wider uppercase text-[10px]">
            <Sparkles size={12} className="mr-2 inline-block" />
            Empowering Student Voice
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black font-headline text-slate-900 mb-8 tracking-tight max-w-4xl leading-[0.95]">
            {t.title} <span className="text-primary">.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium">
            {t.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <Button 
              size="lg" 
              className="h-16 px-8 text-lg font-black gap-3 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
              onClick={signInWithGoogle}
            >
              <ShieldCheck size={24} />
              {t.loginWithGoogle}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 px-8 text-lg font-black rounded-2xl border-2 hover:bg-slate-50 transition-all"
              asChild
            >
              <Link href="#features" className="gap-2">
                {t.learnMore}
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 hover:translate-y-[-8px] transition-all duration-500 group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Megaphone size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 font-headline text-slate-900">{t.smartBoard}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{t.checkLatest}</p>
          </div>
          
          <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 hover:translate-y-[-8px] transition-all duration-500 group">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-500">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 font-headline text-slate-900">{t.roleManagement}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{t.activeRoles}</p>
          </div>
          
          <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 hover:translate-y-[-8px] transition-all duration-500 group">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 font-headline text-slate-900">{t.xpRewards}</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-4">{t.studentGamification}</p>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t.xpIncentive}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary" />
            <span className="font-black text-slate-900">MBN SCHOOL</span>
          </div>
          <p className="text-slate-400 font-medium">&copy; {new Date().getFullYear()} MBN School. Designed for excellence.</p>
          <div className="flex gap-6 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
