"use client";

import AnimatedNumber from "./AnimatedNumber";

interface DashboardStatsProps {
  totalManaged: number;
  activeNow: number;
  completed: number;
}

export default function DashboardStats({ totalManaged, activeNow, completed }: DashboardStatsProps) {
  return (
    <section className="mt-16 pt-12 border-t border-admin-border relative overflow-hidden">
      {/* Background glow for the stats section */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-admin-accent/5 blur-[100px] rounded-full pointer-events-none -mb-48 -mr-48"></div>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-admin-accent/10 border border-admin-accent/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-admin-accent"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
        </div>
        <h2 className="text-xl font-sans font-medium text-slate-200 tracking-wide">Live System Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="admin-panel p-8 rounded-2xl border-l-4 border-l-admin-accent/40 group hover:border-l-admin-accent transition-all duration-500">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Global Guest Volume</p>
              <div className="text-admin-accent/50 group-hover:text-admin-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-sans font-light text-white tracking-tight">
                <AnimatedNumber value={totalManaged} />
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Verified Records</span>
           </div>
        </div>

        <div className="admin-panel p-8 rounded-2xl border-l-4 border-l-emerald-500/30 group hover:border-l-emerald-500 transition-all duration-500">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-emerald-500/70">Protocol Active Now</p>
              <div className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              </div>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-sans font-light text-white tracking-tight">
                <AnimatedNumber value={activeNow} />
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Live Sessions</span>
           </div>
        </div>

        <div className="admin-panel p-8 rounded-2xl border-l-4 border-l-slate-500/30 group hover:border-l-slate-400 transition-all duration-500">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Archived Success</p>
              <div className="text-slate-500/50 group-hover:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-sans font-light text-white tracking-tight">
                <AnimatedNumber value={completed} />
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Marked Done</span>
           </div>
        </div>
      </div>
    </section>
  );
}
