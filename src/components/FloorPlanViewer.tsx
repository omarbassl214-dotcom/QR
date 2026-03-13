"use client";

import { useEffect, useState, useRef } from 'react';

type Coordinates = {
    [tableId: string]: { x: number, y: number }
};

export default function FloorPlanViewer({ categoryId, eventId, targetTable }: { categoryId: string, eventId: string, targetTable: number }) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinates>({});
    const [error, setError] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch the SVG
        fetch(`/floorplans/${eventId}.svg`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.text();
            })
            .then(text => {
                if (!text.includes("<svg")) throw new Error("Invalid SVG format");
                setSvgContent(text);
                setError(false);
            })
            .catch(err => {
                console.error("Floor plan load error:", err);
                setError(true);
            });

        // Fetch coordinates
        fetch(`/api/map?categoryId=${categoryId}&eventId=${eventId}`)
            .then(res => res.json())
            .then(data => setCoordinates(data || {}))
            .catch(err => console.error("Map fetch error:", err));
    }, [categoryId, eventId]);

    useEffect(() => {
        if (!svgContent || !wrapperRef.current) return;
        
        // Scroll the wrapper to center the target table if it exists
        const pos = coordinates[targetTable.toString()];
        if (pos) {
            setTimeout(() => {
                if (wrapperRef.current) {
                    const rect = wrapperRef.current.getBoundingClientRect();
                    const targetX = (pos.x / 100) * rect.width;
                    const targetY = (pos.y / 100) * rect.height;
                    
                    if (containerRef.current) {
                        const cRect = containerRef.current.getBoundingClientRect();
                        containerRef.current.scrollTo({
                            left: targetX - cRect.width / 2,
                            top: targetY - cRect.height / 2,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 300);
        }
    }, [svgContent, targetTable, coordinates]);


    if (error) {
        return (
            <div className="text-center space-y-3 p-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                </div>
                <p className="text-slate-300">Floor plan not available</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">The interactive floor plan for this event has not been uploaded yet. Please ensure <code>/floorplans/{eventId}.svg</code> exists.</p>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-mono">Loading Map...</p>
            </div>
        );
    }

    const pos = coordinates[targetTable.toString()];

    return (
        <div 
            ref={containerRef}
            className="w-full h-full min-h-[300px] overflow-auto bg-white/5 rounded-xl border border-white/5 relative bg-obsidian-dark"
            style={{ 
                // Add checkered background to show transparency
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.02\' fill-rule=\'evenodd\' d=\'M0 0h10v10H0V0zm10 10h10v10H10V10z\'/%3E%3C/svg%3E")'
            }}
        >
            <div 
                ref={wrapperRef}
                className="relative inline-block min-w-full"
                style={{
                    // Prevent image from shrinking smaller than its intrinsic width if possible
                    minWidth: "1200px" 
                }}
            >
                {/* 1. Underlying Floor Plan */}
                <div 
                    className="w-full h-auto"
                    dangerouslySetInnerHTML={{ 
                        __html: svgContent.replace(/<svg/, '<svg style="width: 100%; height: auto; max-block-size: none;"') 
                    }}
                />

                {/* 2. Highlight Overlay */}
                {pos && (
                    <div 
                        className="absolute z-10 w-16 h-16 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                        {/* Outer ping */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-emerald-400 opacity-50 animate-ping" style={{ animationDuration: '2s' }}></div>
                        {/* Inner circle */}
                        <div className="absolute w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{targetTable}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
