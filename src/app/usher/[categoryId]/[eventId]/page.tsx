"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function UsherCheckInPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "already" | "error" | "no-identity">("loading");
    const [usherName, setUsherName] = useState<string | null>(null);

    useEffect(() => {
        const storedName = localStorage.getItem("usher_name");
        if (!storedName) {
            setStatus("no-identity");
            // Automatically redirect after a short delay, passing current URL as redirect
            const currentPath = window.location.pathname;
            setTimeout(() => {
                router.push(`/usher/sign-in?redirect=${encodeURIComponent(currentPath)}`);
            }, 2500);
            return;
        }

        setUsherName(storedName);
        performCheckIn(storedName);
    }, []);

    const performCheckIn = async (name: string) => {
        try {
            const response = await fetch("/api/usher-checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId: params.categoryId,
                    eventId: params.eventId,
                    usherName: name
                }),
            });

            const data = await response.json();
            if (data.success) {
                if (data.alreadyDone) {
                    setStatus("already");
                } else {
                    setStatus("success");
                }
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Check-in failed:", error);
            setStatus("error");
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {status === "loading" && (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-6 py-12"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 border-2 border-emerald-500/10 rounded-full"></div>
                                    <div className="absolute inset-0 w-16 h-16 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">Syncing Payload</p>
                                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">Perfect Protocol Secure Node</p>
                                </div>
                            </motion.div>
                        )}

                        {status === "success" && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                    <motion.svg 
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"
                                    >
                                        <path d="M20 6 9 17l-5-5"/>
                                    </motion.svg>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-serif text-white tracking-tight">Access Granted</h2>
                                    <p className="text-slate-400 text-sm font-sans tracking-wide px-2">
                                        Welcome, <span className="text-emerald-400 font-medium">{usherName}</span>. Your arrival has been authorized and logged.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                        Staff On Duty
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {status === "already" && (
                            <motion.div 
                                key="already"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-serif text-white tracking-tight">Active Session</h2>
                                    <p className="text-slate-400 text-sm font-sans tracking-wide">
                                        You are already checked in, <span className="text-blue-400 font-medium">{usherName}</span>. Proceed to your station.
                                    </p>
                                </div>
                                <div className="h-1 w-24 bg-blue-500/10 rounded-full mx-auto relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/40 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </motion.div>
                        )}

                        {status === "no-identity" && (
                            <motion.div 
                                key="no-id"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-serif text-white tracking-tight">Identity Required</h2>
                                    <p className="text-slate-400 text-sm font-sans tracking-wide px-4">
                                        No authorized staff identity found. Redirecting to terminal registration...
                                    </p>
                                </div>
                                <Link href="/usher/sign-in" className="inline-block text-[10px] uppercase tracking-widest text-emerald-400 hover:text-white transition-colors border-b border-emerald-400/30 pb-1 font-bold">
                                    Open Registration
                                </Link>
                            </motion.div>
                        )}

                        {status === "error" && (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-serif text-white tracking-tight">Protocol Error</h2>
                                    <p className="text-slate-400 text-sm font-sans tracking-wide">
                                        System synchronization failed. This node could not reach the primary server.
                                    </p>
                                </div>
                                <button
                                    onClick={() => performCheckIn(usherName!)}
                                    className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans uppercase tracking-widest font-bold py-4 rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98]"
                                >
                                    Retry Authorization
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">Perfect Protocol Infrastructure</p>
                </div>
            </motion.div>
        </main>
    );
}
