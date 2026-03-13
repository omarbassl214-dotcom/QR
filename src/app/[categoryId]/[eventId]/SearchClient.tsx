"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FloorPlanViewer from "@/components/FloorPlanViewer";

export type Guest = {
    id: string;
    firstName: string;
    lastName: string;
    tableNumber: number;
    attended?: boolean;
};

export default function SearchClient({ guests, eventName }: { guests: Guest[]; eventName: string }) {
    const params = useParams();
    const router = useRouter();
    
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [localGuests, setLocalGuests] = useState<Guest[]>(guests);
    const [checkingIn, setCheckingIn] = useState<string | null>(null);
    const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    // Sync if server props change (e.g. router.refresh())
    useEffect(() => {
        setLocalGuests(guests);
    }, [guests]);

    const checkedInCount = localGuests.filter(g => g.attended).length;
    const totalCount = localGuests.length;

    const filteredGuests = useMemo(() => {
        if (!query.trim()) return [];
        
        // Helper to normalize Arabic characters for robust search
        const normalizeArabic = (text: string) => {
            return text
                .replace(/[أإآا]/g, 'ا') // Normalize Alef variations
                .replace(/ة/g, 'ه')     // Normalize Teh Marbuta to Heh
                .replace(/ى/g, 'ي')     // Normalize Alef Maksura to Yeh
                .replace(/[\u064B-\u065F]/g, ''); // Remove Arabic diacritics (Tashkeel)
        };

        const q = normalizeArabic(query.toLowerCase().replace(/\s+/g, ' ').trim());
        
        return localGuests.filter((guest) => {
            const fn = normalizeArabic(guest.firstName.toLowerCase());
            const ln = normalizeArabic(guest.lastName.toLowerCase());
            const fullName = `${fn} ${ln}`.replace(/\s+/g, ' ').trim();
            // Match against normalized first name, last name, or combined full name
            return fn.includes(q) || ln.includes(q) || fullName.includes(q);
        });
    }, [query, localGuests]);

    // Check-in handler
    const handleCheckIn = async (guestId: string) => {
        setCheckingIn(guestId);
        try {
            const res = await fetch("/api/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId: params.categoryId,
                    eventId: params.eventId,
                    guestId
                })
            });

            if (res.ok) {
                // Optimistically update
                setLocalGuests(prev => 
                    prev.map(g => g.id === guestId ? { ...g, attended: true } : g)
                );
                router.refresh(); // Tell Next.js Server Components to re-fetch
            } else {
                console.error("Failed to check in");
            }
        } catch (error) {
            console.error("Error during check-in", error);
        } finally {
            setCheckingIn(null);
        }
    };

    // Animation variants
    const containerVars: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVars: any = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 100, damping: 15 }
        },
        exit: { opacity: 0, y: -20, filter: "blur(10px)", transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full max-w-lg mx-auto p-6 space-y-12 mt-8 mb-20">
            {/* Top Stat Banner */}
            <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center justify-between px-6 py-4 bg-obsidian-light/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg"
            >
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Live Attendance</span>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-sans font-light text-white">{checkedInCount}</span>
                    <span className="text-sm font-sans text-slate-500 mx-1">/</span>
                    <span className="text-sm font-sans text-slate-500">{totalCount}</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-4"
            >
                <p className="text-xs text-gold tracking-[0.2em] font-medium uppercase">Find Your Table</p>
                <h1 className="text-4xl md:text-5xl font-serif text-slate-100 tracking-tight leading-tight max-w-sm mx-auto">
                    {eventName}
                </h1>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-6" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative z-20 group"
            >
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0 rounded-2xl blur opacity-0 transition duration-700 ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}`}></div>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Enter your first or last name..."
                        className="w-full px-6 py-5 bg-obsidian-light/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl focus:outline-none focus:bg-obsidian-light/80 text-lg text-white placeholder-slate-500 transition-all duration-300 ring-0 focus:border-gold/30 font-sans"
                    />
                    <AnimatePresence>
                        {query && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setQuery("")}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-2"
                                aria-label="Clear search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <div className="relative z-10 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {query.trim() === "" ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, filter: "blur(5px)" }}
                            className="text-center p-8 pt-16"
                        >
                            <p className="text-slate-500 font-sans tracking-wide">Enter your name above to reveal your seating arrangement.</p>
                        </motion.div>
                    ) : filteredGuests.length > 0 ? (
                        <motion.div
                            key="results"
                            variants={containerVars}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="space-y-6"
                        >
                            {filteredGuests.map((guest) => (
                                <motion.div
                                    key={guest.id}
                                    variants={itemVars}
                                    layoutId={`card-${guest.id}`}
                                    className="glass-panel glass-panel-hover rounded-2xl p-8 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                        <div className="space-y-1">
                                            <p className="text-gold/80 text-sm font-sans uppercase tracking-[0.15em]">Welcome</p>
                                            <h2 className="text-3xl font-serif text-white tracking-wide">{guest.firstName} <span className="font-light text-slate-300">{guest.lastName}</span></h2>
                                        </div>

                                        <div className="w-full h-px bg-white/10 my-4" />

                                        <div className="flex flex-col w-full max-w-sm mx-auto gap-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="space-y-2 flex-1">
                                                    <p className="text-slate-400 text-sm font-sans uppercase tracking-[0.1em]">Table</p>
                                                    <div className="flex items-center justify-center min-h-[50px]">
                                                        <div className="text-5xl font-sans font-light text-white tracking-tighter drop-shadow-md">
                                                            {guest.tableNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 flex-1 flex flex-col items-center border-l border-white/10 pl-4">
                                                    <p className="text-slate-400 text-[10px] font-sans uppercase tracking-[0.1em] mb-1">Status</p>
                                                    <div className="flex items-center justify-center min-h-[50px] w-full">
                                                        {guest.attended ? (
                                                            <div className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M20 6 9 17l-5-5"/></svg>
                                                                <span className="text-[10px] font-medium text-emerald-400 tracking-wide uppercase">In Venue</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCheckIn(guest.id)}
                                                                disabled={checkingIn === guest.id}
                                                                className="w-full py-2 px-3 rounded-lg bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 transition-all duration-300 flex flex-col items-center justify-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative z-30"
                                                            >
                                                                {checkingIn === guest.id ? (
                                                                    <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold group-hover:scale-110 transition-transform"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                                                                )}
                                                                <span className="text-[10px] font-medium text-gold tracking-wide uppercase">Check In</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => {
                                                    setSelectedTable(guest.tableNumber);
                                                    setIsFloorPlanOpen(true);
                                                }}
                                                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 group mt-2 relative z-30"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white transition-colors"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                                <span className="text-xs font-medium text-slate-300 tracking-widest uppercase">View Floor Plan</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="p-10 text-center glass-panel rounded-2xl border-white/5"
                        >
                            <p className="text-slate-300 text-lg mb-2">No matching reservation found</p>
                            <p className="text-sm text-slate-500">Please speak with an usher for immediate assistance.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {isFloorPlanOpen && selectedTable !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-sm"
                        onClick={() => setIsFloorPlanOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl bg-admin-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/5 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-serif text-xl tracking-wide leading-tight">Floor Plan Tracker</h3>
                                        <p className="text-slate-400 text-xs font-sans uppercase tracking-[0.1em]">{eventName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsFloorPlanOpen(false)}
                                    className="p-3 text-slate-400 hover:text-white hover:bg-white/10 transition-colors rounded-xl"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-hidden bg-admin-bg relative flex flex-col md:flex-row">
                                <div className="flex-1 w-full h-full p-4 md:p-6">
                                    <FloorPlanViewer categoryId={params.categoryId as string} eventId={params.eventId as string} targetTable={selectedTable} />
                                </div>
                                {/* Sidebar for details on desktop, bottom bar on mobile */}
                                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 bg-white/5 p-6 flex flex-col justify-center shrink-0">
                                    <div className="space-y-6 text-center">
                                        <div className="space-y-2">
                                            <p className="text-slate-400 text-xs font-sans uppercase tracking-[0.15em]">Guest Table</p>
                                            <div className="text-6xl font-serif text-white tracking-tighter drop-shadow-md">
                                                {selectedTable}
                                            </div>
                                        </div>
                                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto" />
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[pulse-highlight_2s_infinite]"></div>
                                            <span className="text-emerald-400 text-xs font-sans uppercase tracking-widest font-medium">Auto-Highlighted</span>
                                        </div>
                                        <p className="text-slate-500 text-sm">Follow the highlighted marker on the map to find the assigned table.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

