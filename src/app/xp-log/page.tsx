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
import { History, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';
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
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4 mb-3">
           <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <History size={28} />
           </div>
           <Badge className="bg-primary/10 text-primary font-bold px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">Activity Feed</Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-slate-900 dark:text-white">
          {t.xpHistory}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">Track every point you've earned or lost in the school community.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-none shadow-2xl shadow-slate-200/60 dark:shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="border-none">
              <TableHead className="py-6 px-10 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.timestamp}</TableHead>
              <TableHead className="py-6 px-10 font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.reason}</TableHead>
              <TableHead className="py-6 px-10 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">{t.amount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-24 text-slate-400 font-bold">
                  <div className="animate-pulse flex flex-col items-center gap-4">
                     <Clock className="animate-spin" size={32} />
                     Fetching history...
                  </div>
                </TableCell>
              </TableRow>
            ) : !logs || logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-32 text-slate-400 font-bold">
                   <div className="flex flex-col items-center gap-6 opacity-40">
                      <History size={64} />
                      <p className="text-xl">{t.noLogs}</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell className="py-8 px-10 text-slate-500 dark:text-slate-400 font-bold">
                    {format(new Date(log.timestamp), 'PPP p')}
                  </TableCell>
                  <TableCell className="py-8 px-10">
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200 leading-tight">
                      {log.reason}
                    </span>
                  </TableCell>
                  <TableCell className="py-8 px-10 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-lg shadow-sm border",
                      log.amount > 0 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                        : "bg-destructive/5 text-destructive border-destructive/10 dark:bg-destructive/10 dark:border-destructive/20"
                    )}>
                      {log.amount > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      {log.amount > 0 ? '+' : ''}{log.amount} XP
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-12 p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 dark:border-primary/20 flex items-center justify-between group overflow-hidden relative">
         <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
            <Zap size={200} />
         </div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Total Impact</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold">Consistency is key to climbing the ranks.</p>
         </div>
         <div className="text-4xl font-black text-primary relative z-10">
            {profile?.xp} XP
         </div>
      </div>
    </AppLayout>
  );
}
