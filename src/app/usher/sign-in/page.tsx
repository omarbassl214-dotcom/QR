"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function SignInForm() {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedName, setSavedName] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");

    useEffect(() => {
        const storedName = localStorage.getItem("usher_name");
        if (storedName) {
            setSavedName(storedName);
            setName(storedName);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        localStorage.setItem("usher_name", name.trim());
        
        setTimeout(() => {
            setIsSubmitting(false);
            setSavedName(name.trim());
            
            // If there's a redirect path, go there immediately
            if (redirectPath) {
                router.push(redirectPath);
            }
        }, 800);
    };

    const handleClear = () => {
        localStorage.removeItem("usher_name");
        setSavedName(null);
        setName("");
    };

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
                {!savedName ? (
                    <motion.form 
                        key="entry"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSubmit} 
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="w-full bg-white text-black font-sans uppercase tracking-widest font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Save Identity
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </>
                            )}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div 
                        key="saved"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="text-center space-y-6 py-4"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="emerald" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Registered As</p>
                            <h2 className="text-2xl font-serif text-white">{savedName}</h2>
                        </div>
                        
                        <div className="pt-4 space-y-3">
                            <p className="text-[11px] text-slate-500 px-4">
                                You are ready. Simply scan the <span className="text-emerald-400">Usher Node</span> QR code at the event to check in instantly.
                            </p>
                            <button
                                onClick={handleClear}
                                className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline underline-offset-4"
                            >
                                Change Identity
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function UsherSignInPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Staff Portal
                    </div>
                    <h1 className="text-4xl font-serif text-white tracking-tight mb-3">Usher Identity</h1>
                    <p className="text-slate-400 text-sm font-sans tracking-wide">Enter your name to register this device for check-ins.</p>
                </div>

                <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                    <SignInForm />
                </Suspense>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Portal
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
