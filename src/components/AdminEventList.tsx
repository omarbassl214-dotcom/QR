"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QRCodeDisplay from "./QRCodeDisplay";
import StatusToggle from "./StatusToggle";

interface EventData {
    id: string;
    name: string;
    totalGuests: number;
    checkedInGuests: number;
    publicPath: string;
    usherPath: string;
    usherCount: number;
    checkedInGuestNames: string[];
    unarrivedGuestNames: string[];
    usherNames: string[];
}

function AttendanceModal({ 
    isOpen, 
    onClose, 
    title, 
    names, 
    emptyMessage 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    names: string[]; 
    emptyMessage: string;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-admin-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-serif text-white tracking-wide">{title}</h3>
                            <button 
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {names.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {names.map((name, idx) => (
                                        <div key={idx} className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-sans text-sm">
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 font-sans italic">{emptyMessage}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl bg-admin-accent/10 border border-admin-accent/20 text-admin-accent font-bold text-xs uppercase tracking-widest hover:bg-admin-accent/20 transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function AdminEventList({ 
    events, 
    categoryId, 
    categoryName 
}: { 
    events: EventData[], 
    categoryId: string, 
    categoryName: string 
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        names: string[];
        emptyMessage: string;
    }>({
        isOpen: false,
        title: "",
        names: [],
        emptyMessage: ""
    });

    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openModal = (title: string, names: string[], emptyMessage: string) => {
        setModalConfig({ isOpen: true, title, names, emptyMessage });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <h2 className="text-xl font-sans font-medium text-slate-200 tracking-wide">Registry Entries</h2>
                </div>

                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-focus-within:text-admin-accent transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input
                        type="search"
                        placeholder={`Search ${categoryName}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-admin-card/40 border border-admin-border rounded-xl pl-11 pr-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-admin-accent/50 focus:ring-1 focus:ring-admin-accent/30 transition-all font-sans"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8 admin-panel admin-panel-hover rounded-2xl group relative overflow-hidden items-center lg:items-center justify-between"
                    >
                        {/* Hover background glow */}
                        <div className="absolute top-1/2 left-0 w-32 h-32 bg-admin-accent/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="flex items-center gap-6 w-full lg:w-auto relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-admin-accent"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-serif text-white tracking-wide">
                                    {event.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">ID: {event.id}</span>
                                    <span className="text-admin-accent/70 hidden sm:inline">●</span>
                                    <span className="hidden sm:inline opacity-70">Path: {event.publicPath}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:pr-8 sm:border-r border-admin-border w-full sm:w-auto border-b sm:border-b-0 pb-6 sm:pb-0">
                                <div className="flex flex-col items-center sm:items-end min-w-[80px]">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        Total
                                    </p>
                                    <span className="text-2xl font-sans font-light text-slate-400">{event.totalGuests}</span>
                                </div>

                                <div className="hidden sm:block w-px h-8 bg-admin-border/50"></div>

                                <button 
                                    onClick={() => openModal(`Attended - ${event.name}`, event.checkedInGuestNames || [], "No guests have checked in yet.")}
                                    className="flex flex-col items-center sm:items-end min-w-[80px] group/stat"
                                >
                                    <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 group-hover/stat:text-emerald-400 transition-colors">
                                        Attended
                                    </p>
                                    <span className="text-2xl font-sans font-light text-emerald-400">{event.checkedInGuests}</span>
                                    <span className="text-[8px] uppercase tracking-tighter text-emerald-500/40 font-bold mt-1 group-hover/stat:text-emerald-500/80 transition-colors">Click to View</span>
                                </button>

                                <div className="hidden sm:block w-px h-8 bg-admin-border/50"></div>

                                <button 
                                    onClick={() => openModal(`Pending - ${event.name}`, event.unarrivedGuestNames || [], "All guests have arrived!")}
                                    className="flex flex-col items-center sm:items-end min-w-[80px] group/stat"
                                >
                                    <p className="text-[9px] font-bold text-orange-400/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 group-hover/stat:text-orange-400 transition-colors">
                                        Pending
                                    </p>
                                    <span className="text-2xl font-sans font-light text-orange-400">{event.totalGuests - event.checkedInGuests}</span>
                                    <span className="text-[8px] uppercase tracking-tighter text-orange-500/40 font-bold mt-1 group-hover/stat:text-orange-500/80 transition-colors">Click to View</span>
                                </button>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                <StatusToggle categoryId={categoryId} eventId={event.id} />

                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <a href={event.publicPath} target="_blank" rel="noreferrer" className="w-full sm:w-44 h-fit text-[11px] font-sans uppercase tracking-widest font-bold text-admin-accent hover:text-white bg-admin-accent/10 hover:bg-admin-accent/20 border border-admin-accent/30 hover:border-admin-accent/50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn whitespace-nowrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:rotate-12 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        Guest Portal
                                    </a>

                                    <Link href={event.usherPath} className="w-full sm:w-44 h-fit text-[11px] font-sans uppercase tracking-widest font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/usher whitespace-nowrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/usher:scale-110 transition-transform"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        Usher Node
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <Link href={`/admin/${categoryId}/${event.id}/map`} className="w-full sm:w-44 h-fit text-[11px] font-sans uppercase tracking-widest font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/map whitespace-nowrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/map:scale-110 transition-transform"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                        Edit Map
                                    </Link>
                                    
                                    <button 
                                        onClick={() => openModal(`Staff on duty - ${event.name}`, event.usherNames || [], "No staff members on duty yet.")}
                                        className="w-full sm:w-44 px-4 py-2 bg-black/20 rounded-xl border border-white/5 flex flex-col items-center justify-center hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group/usherstat"
                                    >
                                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold group-hover/usherstat:text-emerald-500/70 transition-colors">On The Job</p>
                                        <p className="text-lg font-sans font-light text-emerald-400">{event.usherCount}</p>
                                        <p className="text-[8px] uppercase tracking-tighter text-slate-600 font-bold group-hover/usherstat:text-emerald-500/40 transition-colors">Click to View</p>
                                    </button>
                                </div>
                            </div>
                        
                            <div className="shrink-0 pl-0 sm:pl-8 border-t sm:border-t-0 sm:border-l border-admin-border pt-6 sm:pt-0 w-full sm:w-auto flex flex-row items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        Guest Node
                                    </p>
                                    <div className="bg-white/5 p-1 rounded-lg border border-white/5 group-hover:border-admin-accent/30 transition-colors">
                                        <QRCodeDisplay path={event.publicPath} eventName={event.name} size={64} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        Usher Node
                                    </p>
                                    <div className="bg-white/5 p-1 rounded-lg border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                                        <QRCodeDisplay path={event.usherPath} eventName={`${event.name} - Usher`} size={64} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="p-12 text-center admin-panel rounded-2xl">
                        <p className="text-slate-400 font-sans mb-2">
                            {searchQuery ? "No matching roster found" : "Registry is empty"}
                        </p>
                        <p className="text-sm text-slate-500">
                            {searchQuery ? `Try searching for something else in the ${categoryName} dataset.` : `No active events found in the ${categoryName} dataset.`}
                        </p>
                    </div>
                )}
            </div>
            <AttendanceModal 
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                names={modalConfig.names}
                emptyMessage={modalConfig.emptyMessage}
            />
        </div>
    );
}
