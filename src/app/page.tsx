import fs from "fs";
export const dynamic = "force-dynamic";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import SyncButton from "@/components/SyncButton";
import DashboardStats from "@/components/DashboardStats";

import { getRegistryIndex } from "@/lib/registry";

export default async function AdminDashboard() {
  const { categories, globalStats } = await getRegistryIndex();

  return (
    <main className="min-h-screen bg-transparent relative z-0 text-slate-200">
      
      {/* Admin Top Navigation */}
      <nav className="w-full border-b border-admin-border bg-admin-card/50 backdrop-blur-md relative z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-admin-accent/20 blur-xl group-hover:bg-admin-accent/40 transition-all duration-700 rounded-full" />
                <Image 
                  src="/images/logo.png" 
                  alt="Perfect Protocol Logo" 
                  width={48} 
                  height={48} 
                  className="relative z-10 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] group-hover:scale-110 transition-transform duration-500 mix-blend-screen"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-medium text-luxury-gold tracking-tight group-hover:text-white transition-colors">Perfect Protocol</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-admin-accent/60 group-hover:text-admin-accent transition-colors font-bold">Registry System</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 ml-2 shrink-0">
             <div className="text-[10px] text-slate-500 font-mono tracking-widest hidden md:block uppercase shrink-0">SYSTEM SECURE</div>
             <Link 
               href="/usher/sign-in" 
               className="mobile-icon-only text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 gap-2 shrink-0"
               title="Usher Login"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               <span className="mobile-text-hidden uppercase tracking-widest font-bold text-[10px]">Usher Login</span>
             </Link>
             <div className="shrink-0">
                <SyncButton />
             </div>
             <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10 relative z-10">
        <header className="pb-6 sm:pb-8 border-b border-admin-border">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase">
                    Protocol Active
                </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-luxury-gold tracking-tight leading-tight">System Overview</h1>
            <p className="text-slate-400 font-sans text-xs sm:text-sm tracking-wide max-w-xl">Centralized command for your exclusive categories. Monitor guest volume and archive completed sessions.</p>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-admin-accent"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            <h2 className="text-lg sm:text-xl font-sans font-medium text-slate-200 tracking-wide">Category Command</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.path}
                className="block admin-panel admin-panel-hover rounded-2xl group overflow-hidden relative min-h-[260px] sm:min-h-[300px] flex flex-col"
              >
                {/* Background Thumbnail Image */}
                <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                  <Image
                    src={category.id === 'weddings' ? '/images/weddings-thumb-v2.png' : '/images/events-thumb-v2.png'}
                    alt={category.name}
                    fill
                    className="object-cover opacity-15 sm:opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* Heavy gradients to preserve text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1726] via-[#0e1726]/90 to-transparent p-6" />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-transparent" />
                </div>

                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-admin-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                
                <div className="p-6 sm:p-8 h-full flex flex-col justify-between relative z-20">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-admin-accent/40 group-hover:bg-admin-accent/20 transition-all duration-300 shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-admin-accent transition-colors"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-serif text-white group-hover:text-admin-accent transition-colors tracking-tight">
                          {category.name}
                        </h3>
                        <p className="text-[9px] text-slate-500 mt-2 font-mono tracking-[0.2em] uppercase bg-white/5 inline-block px-2 py-1 rounded-lg border border-white/5">
                          DATASET: /{category.id}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Managed Volume</p>
                        <p className="text-xl sm:text-2xl font-sans font-light text-admin-accent">{category.guestCount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 sm:mt-12 flex items-center justify-between border-t border-admin-border/50 pt-5 sm:pt-6 group-hover:border-admin-accent/30 transition-colors">
                    <div className="flex gap-4 sm:gap-6">
                        <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-emerald-400/60 font-bold mb-1">Active</span>
                            <span className="text-base sm:text-lg font-sans text-white">{category.activeCount}</span>
                        </div>
                        <div className="w-px h-6 sm:h-8 bg-admin-border self-center" />
                        <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Completed</span>
                            <span className="text-base sm:text-lg font-sans text-slate-300">{category.doneCount}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-[10px] font-medium text-slate-500 group-hover:text-white transition-colors uppercase tracking-[0.2em] mobile-text-hidden">Enter Terminal</span>
                        <div className="text-admin-accent bg-admin-accent/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl transform group-hover:translate-x-1 group-hover:scale-110 transition-all border border-admin-accent/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <DashboardStats 
            totalManaged={globalStats.totalGuests}
            activeNow={globalStats.activeEvents}
            completed={globalStats.doneEvents}
          />
        </div>
      </div>
    </main>
  );
}
