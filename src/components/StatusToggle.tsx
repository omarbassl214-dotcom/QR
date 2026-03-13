"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatusToggle({ categoryId, eventId }: { categoryId: string, eventId: string }) {
    const [completed, setCompleted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/event-status?categoryId=${categoryId}&eventId=${eventId}`)
            .then(res => res.json())
            .then(data => setCompleted(!!data.completed))
            .catch(() => setCompleted(false));
    }, [categoryId, eventId]);

    const toggleStatus = async () => {
        if (loading) return;
        setLoading(true);
        const nextState = !completed;
        try {
            const res = await fetch("/api/event-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, eventId, completed: nextState })
            });
            if (res.ok) {
                setCompleted(nextState);
                router.refresh();
            }
        } catch (e) {
            console.error("Toggle error", e);
        } finally {
            setLoading(false);
        }
    };

    if (completed === null) return <div className="w-full sm:w-44 h-[46px] bg-white/5 animate-pulse rounded-xl"></div>;

    return (
        <button
            onClick={toggleStatus}
            disabled={loading}
            className={`w-full sm:w-44 h-fit text-sm font-sans uppercase tracking-widest font-medium px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/status border whitespace-nowrap ${
                completed 
                ? "bg-slate-800/10 text-slate-500 border-white/5 hover:border-white/10" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            }`}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : completed ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover/status:scale-110 transition-transform"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Done
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/status:scale-110 transition-transform"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 6v6l4 2"/></svg>
                    Active
                </>
            )}
        </button>
    );
}
