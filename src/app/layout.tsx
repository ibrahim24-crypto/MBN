
"use client";

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';

function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const { isRtl, language } = useLanguage();

  useEffect(() => {
    // Theme initialization to prevent flash and ensure persistence
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <html lang={language} dir={isRtl ? 'rtl' : 'ltr'} className="no-scrollbar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <title>{language === 'ar' ? 'ثانوية موسى بن نصير' : 'Lycée Moussa Ibn Nousayr Hub'}</title>
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <FirebaseClientProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <RootLayoutInner>{children}</RootLayoutInner>
    </LanguageProvider>
  );
}
