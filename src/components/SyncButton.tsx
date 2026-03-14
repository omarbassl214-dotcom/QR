"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        
        try {
            const res = await fetch("/api/registry-sync", { method: "POST" });
            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${
                isSyncing 
                ? "bg-admin-accent/20 border-admin-accent/50 text-admin-accent animate-pulse cursor-wait" 
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20"
            }`}
            title="Force synchronization of the registry index"
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={isSyncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}
            >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <polyline points="21 3 21 8 16 8" />
            </svg>
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Force Sync"}</span>
            {isSyncing && <span className="sm:hidden">...</span>}
        </button>
    );
}
