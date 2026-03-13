import fs from "fs";
import path from "path";
import Link from "next/link";
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
        <main className="min-h-screen bg-admin-bg relative z-0 text-slate-200">
            {/* Decorative ambient background */}
            <div className="absolute top-0 right-0 w-2/3 h-96 bg-admin-accent-glow blur-[120px] rounded-full opacity-20 pointer-events-none -translate-y-1/2"></div>
            
            {/* Admin Top Navigation */}
            <nav className="w-full border-b border-admin-border bg-admin-card/50 backdrop-blur-md relative z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                        <div className="h-6 w-px bg-admin-border"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-admin-accent/20 border border-admin-accent/30 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-admin-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <span className="font-serif text-lg font-medium text-white tracking-wide">Perfect Protocol</span>
                            <span className="font-sans text-xs tracking-[0.15em] uppercase text-slate-500 hidden sm:inline ml-2">/ Datasets / {categoryName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/usher/sign-in" 
                            className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Usher Login
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-admin-border">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-admin-accent/10 border border-admin-accent/20 text-admin-accent text-xs font-mono tracking-widest uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-admin-accent animate-pulse"></div>
                            Live Dataset
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight">{categoryName} Roster</h1>
                        <p className="text-slate-400 font-sans text-sm tracking-wide max-w-xl">Manage individual event instances, access entry portals, and generate access QR codes.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="admin-panel px-6 py-4 rounded-xl text-right min-w-[140px]">
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Total {categoryId === "weddings" ? "Weddings" : "Events"}</p>
                            <p className="text-3xl font-sans font-light text-white">{events.length}</p>
                        </div>
                        <div className="admin-panel px-6 py-4 rounded-xl text-right min-w-[140px] border-l-2 border-l-emerald-500/30">
                            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-1">Active</p>
                            <p className="text-3xl font-sans font-light text-white">{activeEvents}</p>
                        </div>
                        <div className="admin-panel px-6 py-4 rounded-xl text-right min-w-[140px] border-l-2 border-l-slate-500/30">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Marked Done</p>
                            <p className="text-3xl font-sans font-light text-white">{doneEvents}</p>
                        </div>
                    </div>
                </header>

                <AdminEventList events={events} categoryId={categoryId} categoryName={categoryName} />
            </div>
        </main>
    );
}
