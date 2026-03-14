import fs from "fs";
export const dynamic = "force-dynamic";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AdminEventList from "@/components/AdminEventList";
import { getRegistryIndex } from "@/lib/registry";

export default async function AdminCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const resolvedParams = await params;
    const categoryId = resolvedParams.categoryId;
    
    const { categories, globalStats } = await getRegistryIndex();
    const category = categories.find(c => c.id === categoryId);

    if (!category) {
        return notFound();
    }

    const { activeCount: activeEvents, doneCount: doneEvents, guestCount, events } = category;
    const categoryName = category.name;

    return (
        <main className="min-h-screen bg-transparent relative z-0 text-slate-200">
            
            {/* Admin Top Navigation */}
            <nav className="w-full border-b border-admin-border bg-admin-card/50 backdrop-blur-md relative z-50 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
                        <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white group shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                        <div className="h-6 w-px bg-admin-border mobile-hide"></div>
                        <Link href="/" className="group flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                                <div className="absolute inset-0 bg-admin-accent/20 blur-lg group-hover:bg-admin-accent/40 transition-all duration-700 rounded-full" />
                                <Image 
                                    src="/images/logo.png" 
                                    alt="Perfect Protocol Logo" 
                                    width={40} 
                                    height={40} 
                                    className="relative z-10 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] mix-blend-screen"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-serif text-base sm:text-lg font-medium text-luxury-gold tracking-tight leading-none mb-1 group-hover:text-white transition-colors truncate">Perfect Protocol</span>
                                <span className="text-[8px] uppercase tracking-[0.2em] text-admin-accent/50 font-bold leading-none truncate">{categoryName} Dataset</span>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link 
                            href="/usher/sign-in" 
                            className="mobile-icon-only text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 gap-2 shrink-0"
                            title="Usher Login"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span className="mobile-text-hidden uppercase tracking-widest font-bold text-[10px]">Usher Login</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10 relative z-10">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-admin-border">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-admin-accent/10 border border-admin-accent/20 text-admin-accent text-[10px] sm:text-xs font-mono tracking-widest uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-admin-accent animate-pulse"></div>
                            Live Dataset
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-luxury-gold tracking-tight leading-tight">{categoryName} Roster</h1>
                        <p className="text-slate-400 font-sans text-sm tracking-wide max-w-xl">Manage individual event instances, access entry portals, and generate access QR codes.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="admin-panel px-4 py-3 sm:px-6 sm:py-4 rounded-xl text-left sm:text-right min-w-[120px]">
                            <p className="text-[9px] sm:text-xs uppercase tracking-widest text-slate-400 mb-1">Total {categoryId === "weddings" ? "Weddings" : "Events"}</p>
                            <p className="text-2xl sm:text-3xl font-sans font-light text-white">{events.length}</p>
                        </div>
                        <div className="admin-panel px-4 py-3 sm:px-6 sm:py-4 rounded-xl text-left sm:text-right min-w-[120px] border-l-2 border-l-emerald-500/30">
                            <p className="text-[9px] sm:text-xs uppercase tracking-widest text-emerald-400/70 mb-1">Active</p>
                            <p className="text-2xl sm:text-3xl font-sans font-light text-white">{activeEvents}</p>
                        </div>
                        <div className="admin-panel px-4 py-3 sm:px-6 sm:py-4 rounded-xl text-left sm:text-right min-w-[120px] border-l-2 border-l-slate-500/30">
                            <p className="text-[9px] sm:text-xs uppercase tracking-widest text-slate-500 mb-1">Marked Done</p>
                            <p className="text-2xl sm:text-3xl font-sans font-light text-white">{doneEvents}</p>
                        </div>
                    </div>
                </header>

                <AdminEventList events={events} categoryId={categoryId} categoryName={categoryName} />
            </div>
        </main>
    );
}
