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
import { History, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // Process data for the chart
  const chartData = useMemoFirebase(() => {
    if (!logs || logs.length === 0) return [];
    
    // Initial XP is 100 for students (as defined in AuthContext)
    const initialXP = 100;
    
    // Sort logs chronologically to calculate running total
    const chronologicalLogs = [...logs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let runningTotal = initialXP;
    const history = chronologicalLogs.map((log) => {
      runningTotal += log.amount;
      return {
        date: format(new Date(log.timestamp), 'MMM dd'),
        fullDate: format(new Date(log.timestamp), 'PPP'),
        xp: runningTotal,
        change: log.amount
      };
    });

    // Add the starting point
    return [
      { 
        date: 'Start', 
        fullDate: 'Initial Enrollment', 
        xp: initialXP, 
        change: 0 
      },
      ...history
    ];
  }, [logs]);

  const chartConfig = {
    xp: {
      label: "XP Total",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <AppLayout>
      <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 w-full px-4">
        <div className="flex items-center gap-4 mb-4">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-sm">
              <History size={32} />
           </div>
           <Badge className="bg-primary/10 text-primary font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px] shadow-sm border-none">
             BETA V 2 Identity Feed
           </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-tight">
          {t.xpHistory}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-bold mt-4 max-w-2xl">
          Visualizing your growth and contributions to the Lycée community.
        </p>
      </header>

      {/* CHART SECTION */}
      <div className="w-full mb-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center gap-3">
              <Activity className="text-primary" size={20} />
              <CardTitle className="text-xl font-black tracking-tight uppercase text-slate-400 text-[11px] tracking-widest">
                Trend Analysis
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 h-[350px]">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center opacity-20">
                <Clock className="animate-spin" size={48} />
              </div>
            ) : chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        labelKey="fullDate"
                        indicator="dot"
                        className="rounded-xl border-none shadow-2xl bg-slate-900 text-white font-black" 
                      />
                    } 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorXp)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">
                Insufficient Data for Analytics
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 mb-24 mx-4">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="border-none">
              <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-[0.3em] text-[9px]">{t.timestamp}</TableHead>
              <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-[0.3em] text-[9px]">{t.reason}</TableHead>
              <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-[0.3em] text-[9px] text-right">{t.amount}</TableHead>
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
                  <TableCell className="py-8 px-10 text-slate-500 dark:text-slate-400 font-black text-[11px] uppercase tracking-wider">
                    {format(new Date(log.timestamp), 'MMM dd, p')}
                  </TableCell>
                  <TableCell className="py-8 px-10">
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {log.reason}
                    </span>
                  </TableCell>
                  <TableCell className="py-8 px-10 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-sm border-2",
                      log.amount > 0 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                        : "bg-destructive/5 text-destructive border-destructive/10 dark:bg-destructive/10 dark:border-destructive/20"
                    )}>
                      {log.amount > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
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
