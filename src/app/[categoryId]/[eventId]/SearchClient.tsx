"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FloorPlanViewer from "@/components/FloorPlanViewer";

export type Guest = {
    id: string;
    firstName: string;
    lastName: string;
    name?: string;
    tableNumber: number;
    familyGroup?: string;
    attended?: boolean;
};

export default function SearchClient({ guests, eventName }: { guests: Guest[]; eventName: string }) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromAdmin = searchParams.get("from") === "admin";

    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [localGuests, setLocalGuests] = useState<Guest[]>(guests);
    const [checkingIn, setCheckingIn] = useState<string | null>(null);
    const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    // Fix typing lag by deferring the intensive filter operation
    const deferredQuery = useDeferredValue(query);

    // Sync if server props change (e.g. router.refresh())
    useEffect(() => {
        setLocalGuests(guests);
    }, [guests]);

    const checkedInCount = localGuests.filter(g => g.attended).length;
    const totalCount = localGuests.length;



    // Helper to get display name for a guest (supports both name formats)
    const getDisplayName = (guest: Guest) => {
        if (guest.name) return guest.name;
        return `${guest.firstName} ${guest.lastName}`.trim();
    };

    const filteredGuests = useMemo(() => {
        if (!deferredQuery.trim()) return [];
        
        // Helper to normalize Arabic characters for robust search
        const normalizeArabic = (text: string) => {
            return text
                .replace(/[أإآا]/g, 'ا') // Normalize Alef variations
                .replace(/ة/g, 'ه')     // Normalize Teh Marbuta to Heh
                .replace(/ى/g, 'ي')     // Normalize Alef Maksura to Yeh
                .replace(/[\u064B-\u065F]/g, ''); // Remove Arabic diacritics (Tashkeel)
        };

        const q = normalizeArabic(deferredQuery.toLowerCase().replace(/\s+/g, ' ').trim());
        
        // Find direct matches
        const directMatches = localGuests.filter((guest) => {
            const displayName = guest.name || `${guest.firstName} ${guest.lastName}`.trim();
            const normalized = normalizeArabic(displayName.toLowerCase()).replace(/\s+/g, ' ').trim();
            return normalized.startsWith(q);
        });

        // Expand to include family members
        const matchedFamilyGroups = new Set<string>();
        const matchedIds = new Set<string>();
        
        directMatches.forEach(g => {
            matchedIds.add(g.id);
            if (g.familyGroup) matchedFamilyGroups.add(g.familyGroup);
        });

        // Add family members who weren't in the direct matches
        if (matchedFamilyGroups.size > 0) {
            localGuests.forEach(g => {
                if (g.familyGroup && matchedFamilyGroups.has(g.familyGroup) && !matchedIds.has(g.id)) {
                    directMatches.push(g);
                    matchedIds.add(g.id);
                }
            });
        }

        return directMatches;
    }, [deferredQuery, localGuests]);

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

    // Lightweight Animation variants for mobile
    const containerVars: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { duration: 0.15 }
        }
    };

    const itemVars: any = {
        hidden: { opacity: 0, y: 10 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
        },
        exit: { opacity: 0, transition: { duration: 0.1 } }
    };

    // Cap the maximum number of rendered guests to prevent the phone's DOM from freezing.
    const MAX_RENDER_LIMIT = 40;
    const paginatedGuests = filteredGuests.slice(0, MAX_RENDER_LIMIT);

    return (
        <div className="relative w-full h-full min-h-screen">
            {/* Admin-only Back Button */}
            {fromAdmin && (
                <button 
                    onClick={() => router.back()}
                    className="absolute top-4 sm:top-6 left-4 sm:left-6 z-50 p-3 sm:p-4 bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors shadow-xl"
                    aria-label="Return to Admin Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
            )}

            <div className="w-full max-w-lg mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 pt-16 sm:pt-20 mb-20">

                {/* Top Stat Banner (Simplified CSS) */}
            <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 bg-[#111111] border border-white/5 rounded-2xl shadow-md"
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white">Live Attendance</span>
                </div>
                <div className="text-right">
                    <span className="text-xl sm:text-2xl font-sans font-light text-white">{checkedInCount}</span>
                    <span className="text-xs sm:text-sm font-sans text-white/50 mx-1">/</span>
                    <span className="text-xs sm:text-sm font-sans text-white/50">{totalCount}</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4 px-2"
            >
                <div className="flex justify-center mb-2">
                    <Image 
                        src="/images/logo.png" 
                        alt="Perfect Protocol Logo" 
                        width={64} 
                        height={64} 
                        className="object-contain"
                        priority
                    />
                </div>
                <p className="text-[9px] sm:text-[10px] text-white tracking-[0.3em] font-medium uppercase opacity-80">Perfect Protocol Presents</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight max-w-sm mx-auto">
                    {eventName}
                </h1>
                <div className="w-12 h-px bg-white/20 mx-auto mt-4 sm:mt-6" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-20 group"
            >
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Enter your name..."
                        className={`w-full px-5 py-4 sm:px-6 sm:py-5 bg-[#111111] border rounded-2xl focus:outline-none focus:bg-[#1a1a1a] text-base sm:text-lg text-white placeholder-white/40 transition-colors ring-0 font-sans ${isFocused ? 'border-brand-green/60' : 'border-white/5'}`}
                    />
                    <AnimatePresence>
                        {query && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setQuery("")}
                                className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2"
                                aria-label="Clear search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
            )}

            <div className="relative z-10 min-h-[40vh]">
                <AnimatePresence mode="popLayout">
                    {viewMode === "guests" && (
                    query.trim() === "" ? null : filteredGuests.length > 0 ? (
                        <motion.div
                            key="results"
                            variants={containerVars}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="space-y-4 sm:space-y-6"
                        >
                            {(() => {
                                // Group results by familyGroup for display
                                const familyGroups: Record<string, Guest[]> = {};
                                const soloGuests: Guest[] = [];
                                
                                paginatedGuests.forEach(guest => {
                                    if (guest.familyGroup) {
                                        if (!familyGroups[guest.familyGroup]) familyGroups[guest.familyGroup] = [];
                                        familyGroups[guest.familyGroup].push(guest);
                                    } else {
                                        soloGuests.push(guest);
                                    }
                                });

                                const renderGuestCard = (guest: Guest) => {
                                    const displayName = getDisplayName(guest);
                                    const isFreeSeat = !guest.tableNumber || guest.tableNumber === 0;

                                    return (
                                        <div
                                            key={guest.id}
                                            className="bg-[#111111] rounded-2xl p-6 sm:p-8 relative border border-white/5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                                <div className="space-y-1">
                                                    <p className="text-white/50 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em]">Guest Identity</p>
                                                    <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">{displayName}</h2>
                                                </div>

                                                <div className="w-full h-px bg-white/5 my-2 sm:my-4" />

                                                <div className="flex flex-col w-full max-w-xs sm:max-w-sm mx-auto gap-3 sm:gap-4">
                                                    <div className="grid grid-cols-2 gap-4 items-center">
                                                        <div className="space-y-1 sm:space-y-2">
                                                            {isFreeSeat ? (
                                                                <>
                                                                    <p className="text-white/40 text-[10px] sm:text-xs font-sans uppercase tracking-[0.1em]">Seating</p>
                                                                    <div className="flex items-center justify-center">
                                                                        <div className="text-lg sm:text-xl font-sans font-medium text-amber-400 tracking-tight bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20">
                                                                            جلوس حر
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="text-white/40 text-[10px] sm:text-xs font-sans uppercase tracking-[0.1em]">Table</p>
                                                                    <div className="flex items-center justify-center">
                                                                        <div className="text-4xl sm:text-5xl font-sans font-light text-white tracking-tighter">
                                                                            {guest.tableNumber}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="space-y-1 sm:space-y-2 flex flex-col items-center border-l border-white/5 pl-4">
                                                            <p className="text-white/50 text-[10px] font-sans uppercase tracking-[0.1em]">Status</p>
                                                            <div className="flex items-center justify-center w-full min-h-[44px]">
                                                                {guest.attended ? (
                                                                    <div className="w-full py-2 px-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-0.5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 6 9 17l-5-5"/></svg>
                                                                        <span className="text-[9px] font-bold text-white tracking-widest uppercase">Venue In</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleCheckIn(guest.id)}
                                                                        disabled={checkingIn === guest.id}
                                                                        className="w-full py-2 px-2 rounded-xl bg-brand-green/20 hover:bg-brand-green border border-brand-green/30 transition-colors flex flex-col items-center justify-center gap-0.5 group disabled:opacity-50"
                                                                    >
                                                                        {checkingIn === guest.id ? (
                                                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                                                                        )}
                                                                        <span className="text-[9px] font-bold text-white tracking-widest uppercase">Arrival</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {!isFreeSeat && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTable(Number(guest.tableNumber));
                                                                setIsFloorPlanOpen(true);
                                                            }}
                                                            className="w-full py-3 sm:py-4 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-3"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                                            <span className="text-[10px] sm:text-xs font-bold text-white/70 tracking-[0.2em] uppercase">Digital Roadmap</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                };

                                return (
                                    <>
                                        {/* Family Groups */}
                                        {Object.entries(familyGroups).map(([groupName, members]) => (
                                            <div key={groupName} className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {/* Family Header */}
                                                <div className="px-5 py-4 sm:px-6 sm:py-5 bg-white/[0.03] border-b border-white/5 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-serif text-white">{groupName}</h3>
                                                        <p className="text-[10px] text-white/40 font-sans uppercase tracking-widest">{members.length} members</p>
                                                    </div>
                                                </div>
                                                {/* Family Members List */}
                                                <div className="p-3 sm:p-4 space-y-4">
                                                    {members.map(member => renderGuestCard(member))}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Solo Guests (no family group) */}
                                        {soloGuests.map(guest => renderGuestCard(guest))}
                                    </>
                                );
                            })()}
                            {filteredGuests.length > MAX_RENDER_LIMIT && (
                                <div className="text-center py-6">
                                    <p className="text-white/40 text-[10px] font-sans uppercase tracking-[0.2em] animate-pulse">
                                        +{filteredGuests.length - MAX_RENDER_LIMIT} more results hidden. Keep typing to filter.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-10 text-center bg-[#111111] rounded-2xl border border-white/5"
                        >
                            <p className="text-white text-lg mb-2">No matching reservation found</p>
                            <p className="text-sm text-white/50">Please speak with an usher for immediate assistance.</p>
                        </motion.div>
                    ))}

                    {viewMode === "tables" && (
                        <motion.div
                            key="tables-view"
                            variants={containerVars}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="grid grid-cols-2 gap-4"
                        >
                            {tableGroups.map(group => {
                                const progress = Math.min((group.checkedIn / group.total) * 100, 100);
                                const isFull = group.checkedIn === group.total;
                                return (
                                    <motion.div
                                        key={`table-${group.tableNumber}`}
                                        variants={itemVars}
                                        className={`bg-[#111111] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between border ${isFull ? 'border-brand-green/30' : 'border-white/5'}`}
                                        onClick={() => {
                                            setSelectedTableDetails(group.tableNumber);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="flex flex-col space-y-3 relative z-10">
                                            <div className="space-y-1">
                                                <p className="text-white/40 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em]">Table</p>
                                                <h3 className="text-4xl font-serif text-white tracking-tighter">
                                                    {group.tableNumber}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-brand-green' : 'bg-white/30'}`} />
                                                    <span className="text-[10px] sm:text-xs font-bold font-sans text-white/80 tracking-widest uppercase">
                                                        {group.checkedIn} / {group.total}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mt-1">
                                                <div 
                                                    className={`h-full transition-all duration-300 ${isFull ? 'bg-brand-green' : 'bg-white/40'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Table Details Modal */}
            <AnimatePresence>
                {selectedTableDetails !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4"
                        onClick={() => setSelectedTableDetails(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-white/5 bg-[#181818] shrink-0 gap-4">
                                <div>
                                    <h3 className="text-white font-serif text-3xl leading-tight">Table {selectedTableDetails}</h3>
                                    <p className="text-white/50 text-xs font-sans mt-1">
                                        {activeTableRecord?.checkedIn || 0} / {activeTableRecord?.total || 0} Guests Checked In
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setSelectedTable(Number(selectedTableDetails));
                                            setIsFloorPlanOpen(true);
                                        }}
                                        className="h-12 sm:h-auto flex-1 sm:flex-none px-4 py-2 flex items-center justify-center gap-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                        <span>View Map</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedTableDetails(null)}
                                        className="h-12 w-12 sm:h-10 sm:w-10 flex shrink-0 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4 overflow-y-auto space-y-3">
                                {activeTableGuests.length === 0 ? (
                                    <div className="py-12 text-center text-white/50 italic">No guests assigned to this table.</div>
                                ) : (
                                    activeTableGuests.map(guest => (
                                        <div key={guest.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <h4 className="text-white font-serif text-lg">{getDisplayName(guest)}</h4>
                                            </div>
                                            <button
                                                onClick={() => handleCheckIn(guest.id)}
                                                disabled={checkingIn === guest.id}
                                                className={`h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                                    guest.attended 
                                                    ? 'bg-brand-green text-white shadow-[0_0_15px_rgba(0,107,63,0.5)] border border-brand-green' 
                                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                                }`}
                                            >
                                                {checkingIn === guest.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : guest.attended ? (
                                                    "Checked In"
                                                ) : (
                                                    "Check In"
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Extremely lightweight FloorPlan modal overlay */}
            <AnimatePresence>
                {isFloorPlanOpen && selectedTable !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-2 sm:p-4"
                        onClick={() => setIsFloorPlanOpen(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[85vh] md:h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#181818] shrink-0 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-serif text-lg leading-tight">Floor Plan Tracker</h3>
                                        <p className="text-white/40 text-[10px] font-sans uppercase tracking-[0.1em]">{eventName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsFloorPlanOpen(false)}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-hidden bg-black relative flex flex-col md:flex-row pb-safe">
                                <div className="flex-1 w-full h-full p-2 md:p-6 overflow-hidden">
                                    <FloorPlanViewer categoryId={params.categoryId as string} eventId={params.eventId as string} targetTable={selectedTable} />
                                </div>
                                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/5 bg-[#111111] p-4 flex flex-col justify-center shrink-0">
                                    <div className="space-y-4 text-center">
                                        <div className="space-y-1">
                                            <p className="text-white/50 text-[10px] font-sans uppercase tracking-[0.15em]">Guest Table</p>
                                            <div className="text-5xl font-serif text-white tracking-tighter">
                                                {selectedTable}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </div>
    );
}
