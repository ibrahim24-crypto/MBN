
"use client";

import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface XPLogEntry {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export default function XPLogPage() {
  const { profile } = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();

  const xpLogsQuery = useMemoFirebase(() => {
    if (!db || !profile) return null;
    return query(
      collection(db, 'users', profile.id, 'xp_logs'),
      orderBy('timestamp', 'desc')
    );
  }, [db, profile]);

  const { data: logs, isLoading } = useCollection<XPLogEntry>(xpLogsQuery);

  return (
    <AppLayout>
      <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-1000 w-full">
        <div className="flex items-center gap-4 mb-4">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-sm">
              <History size={32} />
           </div>
           <Badge className="bg-primary/10 text-primary font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px] shadow-sm border-none">
             Activity Feed
           </Badge>
        </div>
        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-tight">
          {t.xpHistory}
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-bold mt-4 max-w-2xl">
          Track every point you've earned or lost in the school community.
        </p>
      </header>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[4rem] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="border-none">
              <TableHead className="py-8 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{t.timestamp}</TableHead>
              <TableHead className="py-8 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">{t.reason}</TableHead>
              <TableHead className="py-8 px-12 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] text-right">{t.amount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-40 text-slate-400 font-black">
                  <div className="animate-pulse flex flex-col items-center gap-6">
                     <Clock className="animate-spin text-primary" size={48} />
                     <span className="uppercase tracking-[0.3em]">{t.fetchingHistory || "Syncing Records..."}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !logs || logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-48 text-slate-400 font-black">
                   <div className="flex flex-col items-center gap-10 opacity-30 grayscale">
                      <History size={100} />
                      <p className="text-2xl uppercase tracking-[0.2em]">{t.noLogs}</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <TableCell className="py-10 px-12 text-slate-500 dark:text-slate-400 font-black text-sm uppercase tracking-wider">
                    {format(new Date(log.timestamp), 'PPP p')}
                  </TableCell>
                  <TableCell className="py-10 px-12">
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                      {log.reason}
                    </span>
                  </TableCell>
                  <TableCell className="py-10 px-12 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xl shadow-lg border-2",
                      log.amount > 0 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                        : "bg-destructive/5 text-destructive border-destructive/10 dark:bg-destructive/10 dark:border-destructive/20"
                    )}>
                      {log.amount > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                      {log.amount > 0 ? '+' : ''}{log.amount} XP
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}
