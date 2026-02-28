"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, GraduationCap, Users, Megaphone, Languages } from 'lucide-react';
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
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin text-primary">
          <GraduationCap size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Languages size={16} />
              Lang
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('ar')}>العربية</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('fr')}>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center bg-gradient-to-b from-background to-secondary/30">
        <div className="mb-8 p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20 animate-in fade-in zoom-in duration-700">
          <GraduationCap size={64} />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary mb-6 tracking-tight">
          {t.title}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          {t.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="h-14 text-lg font-semibold gap-2 shadow-lg hover:shadow-primary/20 transition-all"
            onClick={signInWithGoogle}
          >
            <ShieldCheck size={20} />
            {t.loginWithGoogle}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 text-lg font-semibold"
            asChild
          >
            <Link href="#features">{t.learnMore}</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Megaphone size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-headline">{t.smartBoard}</h3>
            <p className="text-muted-foreground">{t.checkLatest}</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-headline">{t.roleManagement}</h3>
            <p className="text-muted-foreground">{t.activeRoles}</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-headline">{t.xpRewards}</h3>
            <p className="text-semibold mb-3 font-headline">{t.studentGamification}</p>
            <p className="text-muted-foreground">{t.xpIncentive}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MBN School. All rights reserved.</p>
      </footer>
    </div>
  );
}
