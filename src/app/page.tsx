"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, GraduationCap, Users, Megaphone, Languages, Sparkles } from 'lucide-react';
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
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t, setLanguage } = useLanguage();
  const router = useRouter();
  
  const logoSrc = "/logo.png";

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
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[70%] h-[70%] bg-primary/5 blur-[200px] rounded-full"></div>
      </div>

      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 group hover:rotate-6 transition-transform">
            <Image 
              src={logoSrc} 
              fill 
              alt="MBN Logo" 
              className="object-cover" 
              unoptimized
            />
          </div>
          <span className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">MBN Hub</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full px-5 py-6 h-auto hover:bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 transition-all font-bold">
              <Languages size={18} />
              {t.language === 'ar' ? 'العربية' : 'Français'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-[1.5rem] shadow-2xl border-none p-3 min-w-[160px]">
            <DropdownMenuItem className="rounded-xl px-5 py-3 font-bold cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setLanguage('ar')}>العربية</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-5 py-3 font-bold cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setLanguage('fr')}>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-32 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge variant="secondary" className="mb-8 rounded-full px-6 py-2 bg-primary/10 text-primary border-primary/20 font-black tracking-[0.2em] uppercase text-[11px] shadow-sm">
            <Sparkles size={14} className="mr-2 inline-block text-accent" />
            Moussa Ibn Nousayr Hub
          </Badge>
          <h1 className="text-6xl md:text-9xl font-black font-headline text-slate-900 mb-10 tracking-tight leading-[0.85] text-balance">
            {t.title} <span className="text-primary">.</span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-500 max-w-3xl mb-16 leading-relaxed font-medium mx-auto px-4">
            {t.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl mx-auto items-center justify-center">
            <Button 
              size="lg" 
              className="h-20 px-12 text-xl font-black gap-4 rounded-[2.5rem] shadow-2xl shadow-primary/40 hover:scale-[1.05] hover:shadow-primary/50 transition-all w-full sm:w-auto"
              onClick={signInWithGoogle}
            >
              <ShieldCheck size={28} />
              {t.loginWithGoogle}
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-40 px-6 relative bg-slate-50/50 backdrop-blur-3xl border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: Megaphone, title: t.smartBoard, desc: t.checkLatest, color: 'primary' },
            { icon: Users, title: t.roleManagement, desc: t.activeRoles, color: 'accent' },
            { icon: ShieldCheck, title: t.xpRewards, desc: t.studentGamification, extra: t.xpIncentive, color: 'emerald' }
          ].map((feature, i) => (
            <div key={i} className="p-12 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:translate-y-[-12px] transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/5 transition-colors"></div>
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-700 shadow-lg shadow-black/5",
                feature.color === 'primary' ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" :
                feature.color === 'accent' ? "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white" :
                "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
              )}>
                <feature.icon size={40} />
              </div>
              <h3 className="text-3xl font-black mb-6 font-headline text-slate-900 leading-tight">{feature.title}</h3>
              <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">{feature.desc}</p>
              {feature.extra && (
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-slate-100">{feature.extra}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="py-24 px-8 text-center bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-lg overflow-hidden shadow-sm">
              <Image src={logoSrc} fill alt="MBN Logo" className="object-cover" unoptimized />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tighter uppercase">MBN Hub</span>
          </div>
          <p className="text-slate-400 font-bold text-lg">&copy; {new Date().getFullYear()} Moussa Ibn Nousayr. Elevating every voice.</p>
        </div>
      </footer>
    </div>
  );
}
