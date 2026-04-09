"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    checkedInGuestsInfo: { id: string, name: string }[];
    unarrivedGuestNames: string[];
    usherNames: string[];
}

function AttendanceModal({ 
    isOpen, 
    onClose, 
    title, 
    names, 
    guests,
    emptyMessage,
    onAction,
    actionLabel,
    isUpdating
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    names?: string[]; 
    guests?: { id: string, name: string }[];
    emptyMessage: string;
    onAction?: (guestId: string) => void;
    actionLabel?: string;
    isUpdating?: string | null;
}) {
    const sortedGuests = guests ? [...guests].sort((a, b) => a.name.localeCompare(b.name)) : undefined;
    const sortedNames = names ? [...names].sort((a, b) => a.localeCompare(b)) : undefined;

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
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-serif text-white tracking-wide">{title}</h3>
                                {onAction && guests && guests.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (confirm("🚨 WARNING: This will permanently clear ALL check-ins for this event. Are you sure?")) {
                                                (window as any).__hardReset?.();
                                            }
                                        }}
                                        className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Hard Reset All
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/5 text-white hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {(sortedGuests && sortedGuests.length > 0) ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {sortedGuests.map((guest) => (
                                         <div key={guest.id} className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-sans text-sm flex items-center justify-between">
                                            <span>{guest.name}</span>
                                            {onAction && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onAction(guest.id); }}
                                                    disabled={isUpdating === guest.id}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-white/20 transition-all text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                                                >
                                                    {isUpdating === guest.id ? "..." : actionLabel || "Action"}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (sortedNames && sortedNames.length > 0) ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {sortedNames.map((name, idx) => (
                                         <div key={idx} className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-sans text-sm flex items-center justify-between">
                                            <span>{name}</span>
                                            {onAction && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onAction(name); }}
                                                    disabled={isUpdating === name}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-white/20 transition-all text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                                                >
                                                    {isUpdating === name ? "..." : actionLabel || "Remove"}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-white font-sans italic">{emptyMessage}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl bg-admin-accent/10 border border-admin-accent/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-admin-accent/20 transition-all"
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

function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    eventName,
    isDeleting 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    eventName: string;
    isDeleting: boolean;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-serif text-white tracking-wide">Delete Registry Entry?</h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    You are about to delete <span className="text-white font-bold">{eventName}</span>. 
                                    This will permanently remove all guest lists and free up space in the live database. 
                                    This action <span className="text-red-400 underline decoration-red-400/30 underline-offset-4">cannot</span> be undone.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button 
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Confirm Delete"
                                    )}
                                </button>
                            </div>
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
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        names: string[];
        guests: { id: string, name: string }[];
        emptyMessage: string;
        type: "attended" | "pending" | "staff" | null;
        activeEventId: string | null;
    }>({
        isOpen: false,
        title: "",
        names: [],
        guests: [],
        emptyMessage: "",
        type: null,
        activeEventId: null
    });

    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openModal = (title: string, names: string[], emptyMessage: string, guests: { id: string, name: string }[] = [], type: any = null, eventId: string | null = null) => {
        setModalConfig({ isOpen: true, title, names, emptyMessage, guests, type, activeEventId: eventId });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleUndoCheckin = async (guestId: string) => {
        if (!modalConfig.activeEventId) return;
        setIsUpdating(guestId);
        try {
            const response = await fetch("/api/checkin/undo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    categoryId, 
                    eventId: modalConfig.activeEventId, 
                    guestId 
                }),
            });
            if (response.ok) {
                // Update local modal state to remove the guest
                setModalConfig(prev => ({
                    ...prev,
                    guests: prev.guests.filter(g => g.id !== guestId)
                }));
                router.refresh();
            } else {
                alert("Failed to undo check-in");
            }
        } catch (error) {
            console.error("Undo error:", error);
            alert("An error occurred");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleRemoveUsher = async (usherName: string) => {
        if (!modalConfig.activeEventId) return;
        setIsUpdating(usherName);
        try {
            const response = await fetch("/api/usher/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    categoryId, 
                    eventId: modalConfig.activeEventId, 
                    usherName 
                }),
            });
            if (response.ok) {
                setModalConfig(prev => ({
                    ...prev,
                    names: prev.names.filter(n => n !== usherName)
                }));
                router.refresh();
            } else {
                alert("Failed to remove usher");
            }
        } catch (error) {
            console.error("Remove usher error:", error);
            alert("An error occurred");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleHardReset = async () => {
        if (!modalConfig.activeEventId) return;
        try {
            const response = await fetch(`/api/admin/hard-reset?categoryId=${categoryId}&eventId=${modalConfig.activeEventId}`);
            if (response.ok) {
                setModalConfig(prev => ({ ...prev, guests: [], names: [], isOpen: false }));
                router.refresh();
            } else {
                alert("Failed to perform hard reset");
            }
        } catch (error) {
            console.error("Hard reset error:", error);
            alert("An error occurred");
        }
    };

    // Expose hard reset for modal
    if (typeof window !== "undefined") {
        (window as any).__hardReset = handleHardReset;
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        const { id } = deleteConfirm;
        setIsDeleting(id);
        try {
            const response = await fetch("/api/admin/delete-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, eventId: id }),
            });
            if (response.ok) {
                router.refresh();
            } else {
                alert("Failed to delete event");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting");
        } finally {
            setIsDeleting(null);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <h2 className="text-xl font-sans font-medium text-white tracking-wide">Registry Entries</h2>
                </div>

                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-focus-within:text-white transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input
                        type="search"
                        placeholder={`Search ${categoryName}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-admin-card/40 border border-admin-border rounded-xl pl-11 pr-10 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all font-sans"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredEvents.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: events.indexOf(event) * 0.05 }}
                        className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8 admin-panel admin-panel-hover rounded-2xl group relative overflow-hidden items-center lg:items-center justify-between"
                    >
                        {/* Hover background glow */}
                        <div className="absolute top-1/2 left-0 w-32 h-32 bg-admin-accent/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {/* Delete Button */}
                        <button
                            onClick={() => setDeleteConfirm({ id: event.id, name: event.name })}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all z-20 opacity-0 group-hover:opacity-100"
                            title="Delete Registry Entry"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>

                        <div className="flex items-center gap-6 w-full lg:w-auto relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-serif text-white tracking-wide">
                                    {event.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-mono text-white">
                                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">ID: {event.id}</span>
                                    <span className="text-white hidden sm:inline">●</span>
                                    <span className="hidden sm:inline opacity-70">Path: {event.publicPath}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full lg:w-auto mt-6 lg:mt-0 relative z-10 min-w-0">
                            <div className="grid grid-cols-1 sm:flex sm:flex-row items-center gap-4 sm:gap-6 sm:pr-8 sm:border-r border-admin-border w-full sm:w-auto border-b sm:border-b-0 pb-6 sm:pb-0">
                                <button 
                                    onClick={() => {
                                        const allNames = [
                                            ...(event.unarrivedGuestNames || []),
                                            ...(event.checkedInGuestsInfo || []).map(g => g.name)
                                        ];
                                        openModal(`Total Roster - ${event.name}`, allNames, "No guests found.");
                                    }}
                                    className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center min-w-[80px] w-full sm:w-auto group/stat px-4 sm:px-0"
                                >
                                    <p className="text-[10px] sm:text-[9px] font-bold text-white uppercase tracking-widest sm:mb-1.5 flex items-center gap-1.5 group-hover/stat:text-white transition-colors">
                                        Total
                                    </p>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl sm:text-2xl font-sans font-light text-white">{event.totalGuests}</span>
                                        <span className="text-[8px] uppercase tracking-tighter text-white font-bold hidden sm:block group-hover/stat:text-white transition-colors">View</span>
                                    </div>
                                </button>

                                <div className="hidden sm:block w-px h-8 bg-admin-border/50"></div>

                                <button 
                                    onClick={() => openModal(`Attended - ${event.name}`, [], "No guests have checked in yet.", event.checkedInGuestsInfo || [], "attended", event.id)}
                                    className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center min-w-[80px] w-full sm:w-auto group/stat px-4 sm:px-0"
                                >
                                    <p className="text-[10px] sm:text-[9px] font-bold text-white uppercase tracking-widest sm:mb-1.5 flex items-center gap-1.5 group-hover/stat:text-white transition-colors">
                                        Attended
                                    </p>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl sm:text-2xl font-sans font-light text-white">{event.checkedInGuests}</span>
                                        <span className="text-[8px] uppercase tracking-tighter text-white font-bold hidden sm:block group-hover/stat:text-white transition-colors">View</span>
                                    </div>
                                </button>

                                <div className="hidden sm:block w-px h-8 bg-admin-border/50"></div>

                                <button 
                                    onClick={() => openModal(`Pending - ${event.name}`, event.unarrivedGuestNames || [], "All guests have arrived!")}
                                    className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center min-w-[80px] w-full sm:w-auto group/stat px-4 sm:px-0"
                                >
                                    <p className="text-[10px] sm:text-[9px] font-bold text-white uppercase tracking-widest sm:mb-1.5 flex items-center gap-1.5 group-hover/stat:text-white transition-colors">
                                        Pending
                                    </p>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl sm:text-2xl font-sans font-light text-white">{event.totalGuests - event.checkedInGuests}</span>
                                        <span className="text-[8px] uppercase tracking-tighter text-white font-bold hidden sm:block group-hover/stat:text-white transition-colors">View</span>
                                    </div>
                                </button>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                <div className="w-full sm:w-auto">
                                    <StatusToggle categoryId={categoryId} eventId={event.id} />
                                </div>

                                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 w-full sm:w-auto">
                                    <Link href={`${event.publicPath}?from=admin`} className="w-full sm:w-44 h-fit text-[11px] font-sans uppercase tracking-widest font-bold text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white px-4 py-3 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn whitespace-nowrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:rotate-12 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        Portal
                                    </Link>

                                    <Link href={event.usherPath} className="w-full sm:w-44 h-fit text-[11px] font-sans uppercase tracking-widest font-bold text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white px-4 py-3 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/usher whitespace-nowrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/usher:scale-110 transition-transform"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        Usher
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 w-full sm:w-auto">
                                    <Link href={`/admin/${categoryId}/${event.id}/map`} className="w-full sm:w-44 h-fit text-[11px] font-sans uppercase tracking-widest font-bold text-white hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-3 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/map whitespace-nowrap text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/map:scale-110 transition-transform"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                        View Floor Plan
                                    </Link>
                                    
                                    <button 
                                        onClick={() => openModal(`Staff on duty - ${event.name}`, event.usherNames || [], "No staff members on duty yet.", [], "staff", event.id)}
                                        className="w-full sm:w-44 px-3 py-1.5 bg-black/20 rounded-xl border border-white/5 flex flex-row sm:flex-col items-center justify-between sm:justify-center hover:bg-white/5 hover:border-white/20 transition-all group/usherstat"
                                    >
                                        <p className="text-[9px] uppercase tracking-widest text-white font-bold group-hover/usherstat:text-white transition-colors">Staff</p>
                                        <p className="text-base sm:text-lg font-sans font-light text-white">{event.usherCount}</p>
                                        <p className="text-[8px] uppercase tracking-tighter text-white font-bold group-hover/usherstat:text-white transition-colors hidden sm:block">View</p>
                                    </button>
                                </div>
                            </div>
                        
                            <div className="shrink-0 sm:pl-8 border-t sm:border-t-0 sm:border-l border-admin-border pt-6 sm:pt-0 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-8 sm:gap-6">
                                <div className="flex flex-col items-center">
                                    <p className="text-[9px] font-bold text-brand-green uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        Guest Portal
                                    </p>
                                    <div className="rounded-xl transition-all duration-500 scale-100 group-hover:scale-[1.02]">
                                        <QRCodeDisplay path={event.publicPath} eventName={event.name} size={150} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <p className="text-[9px] font-bold text-brand-green uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        Usher Portal
                                    </p>
                                    <div className="rounded-xl transition-all duration-500 scale-100 group-hover:scale-[1.02]">
                                        <QRCodeDisplay path={event.usherPath} eventName={`${event.name} - Usher`} size={150} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="p-12 text-center admin-panel rounded-2xl">
                        <p className="text-white font-sans mb-2">
                            {searchQuery ? "No matching roster found" : "Registry is empty"}
                        </p>
                        <p className="text-sm text-white">
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
                guests={modalConfig.guests}
                emptyMessage={modalConfig.emptyMessage}
                onAction={modalConfig.type === "attended" ? handleUndoCheckin : (modalConfig.type === "staff" ? handleRemoveUsher : undefined)}
                actionLabel="Remove"
                isUpdating={isUpdating}
            />

            <DeleteConfirmationModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                eventName={deleteConfirm?.name || ""}
                isDeleting={!!isDeleting}
            />
        </div>
    );
}
