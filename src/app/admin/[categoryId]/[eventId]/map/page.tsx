"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function MapEditorPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.categoryId as string;
    const eventId = params.eventId as string;

    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<{ [key: string]: { x: number, y: number } }>({});
    const [selectedTable, setSelectedTable] = useState<string>("");
    const [saving, setSaving] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load SVG Image Template
        fetch(`/floorplans/${eventId}.svg`)
            .then(res => res.ok ? res.text() : null)
            .then(text => {
                if (text && text.includes("<svg")) setSvgContent(text);
            });

        // Load existing coordinates
        fetch(`/api/map?categoryId=${categoryId}&eventId=${eventId}`)
            .then(res => res.json())
            .then(data => setCoordinates(data || {}));
    }, [categoryId, eventId, categoryId]);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedTable) return alert("Select a table number first to assign coordinates.");
        
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            // Calculate percentage X and Y relative to the image wrapper
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            setCoordinates(prev => ({
                ...prev,
                [selectedTable]: { x, y }
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/map", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, eventId, coordinates })
            });
            if (res.ok) {
                alert("Map saved successfully!");
            } else {
                alert("Failed to save map.");
            }
        } catch (error) {
            console.error("Save error", error);
            alert("Error saving map.");
        } finally {
            setSaving(false);
        }
    };

    if (!svgContent) {
        return <div className="p-12 text-center text-white">Loading Floor Plan Image...</div>;
    }

    return (
        <main className="min-h-screen bg-admin-bg relative z-0 text-slate-200 flex flex-col">
            <nav className="w-full border-b border-admin-border bg-admin-card/50 backdrop-blur-md relative z-10 sticky top-0 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Link href={`/admin/${categoryId}`} className="text-slate-400 hover:text-white group shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                        <h1 className="font-serif text-sm sm:text-lg font-medium text-white tracking-wide truncate">Floor Plan Mapping Tool</h1>
                        <span className="hidden xs:inline-block font-sans text-[10px] tracking-[0.1em] text-slate-500 uppercase rounded-full bg-white/5 border border-white/10 px-2 py-0.5 shrink-0">{eventId}</span>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="px-4 sm:px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] sm:text-xs font-mono tracking-widest uppercase transition-colors shrink-0"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Sidebar - Configuration */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-admin-border bg-white/5 p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto max-h-[40vh] md:max-h-none shrink-0">
                    <div className="space-y-4">
                        <h2 className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.15em] text-slate-400">Map Table Configuration</h2>
                        <p className="hidden sm:block text-xs text-slate-500 leading-relaxed">Type the table number below, then click on the corresponding table on the floor plan image to set its marker location.</p>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Target Table ID</label>
                            <input 
                                type="text"
                                value={selectedTable}
                                onChange={e => setSelectedTable(e.target.value)}
                                placeholder="e.g. 19"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 md:pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-sans uppercase tracking-[0.15em] text-slate-400">Mapped Tables ({Object.keys(coordinates).length})</h3>
                            <button 
                                onClick={() => setCoordinates({})}
                                className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-mono"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                            {Object.entries(coordinates)
                                .sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
                                .map(([key, pos]) => (
                                <div key={key} className="relative group">
                                    <button 
                                        onClick={() => setSelectedTable(key)}
                                        className={`w-full aspect-square rounded-lg border flex items-center justify-center font-mono text-[10px] sm:text-xs ${selectedTable === key ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'}`}
                                    >
                                        {key}
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); const newC = {...coordinates}; delete newC[key]; setCoordinates(newC); }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Preview Overlay */}
                <div className="flex-1 bg-obsidian-dark overflow-auto p-4 sm:p-12 relative flex justify-start md:justify-center w-full min-h-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.02\' fill-rule=\'evenodd\' d=\'M0 0h10v10H0V0zm10 10h10v10H10V10z\'/%3E%3C/svg%3E")' }}>
                    <div 
                        ref={wrapperRef}
                        className="relative inline-block border border-white/10 shadow-2xl cursor-crosshair h-fit shrink-0 overflow-visible"
                        style={{ minWidth: '800px' }} // Slightly reduced min-width for mobile scrollability
                        onClick={handleImageClick}
                    >
                        {/* 1. Underlying Floor Plan */}
                        <div 
                            className="w-full h-auto opacity-50 pointer-events-none"
                            dangerouslySetInnerHTML={{ 
                                __html: svgContent.replace(/<svg/, '<svg style="width: 100%; height: auto; max-block-size: none;"') 
                            }}
                        />

                        {/* 2. Overlaid Markers */}
                        {Object.entries(coordinates).map(([key, pos]) => (
                            <div 
                                key={key}
                                className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none ${selectedTable === key ? 'bg-emerald-500 border-white shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20' : 'bg-slate-800 border-white/30 text-slate-400 z-10'}`}
                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            >
                                <span className={`text-[9px] font-bold ${selectedTable === key ? 'text-white' : ''}`}>{key}</span>
                            </div>
                        ))}

                        {/* Help overlay text */}
                        {!selectedTable && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 bg-black/50 backdrop-blur-sm">
                                <div className="bg-admin-card p-6 rounded-2xl border border-white/10 shadow-2xl text-center mx-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold mx-auto mb-4"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
                                    <h3 className="text-lg text-white font-serif mb-2">Select a Table ID first</h3>
                                    <p className="text-sm text-slate-400 max-w-sm">Use the tools panel to type a Table Number before clicking on the map.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
