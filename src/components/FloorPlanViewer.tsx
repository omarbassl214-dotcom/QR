"use client";

import { useEffect, useState, useRef } from 'react';

type Coordinates = {
    [tableId: string]: { x: number, y: number }
};

export default function FloorPlanViewer({ categoryId, eventId, targetTable }: { categoryId: string, eventId: string, targetTable: number }) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinates>({});
    const [error, setError] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadFloorPlan = async () => {
            try {
                // Try SVG first
                const svgRes = await fetch(`/floorplans/${eventId}.svg`);
                if (svgRes.ok) {
                    const text = await svgRes.text();
                    if (text.includes("<svg")) {
                        setSvgContent(text);
                        setError(false);
                        return;
                    }
                }

                // Try PNG fallback
                const pngRes = await fetch(`/floorplans/${eventId}.png`, { method: 'HEAD' });
                if (pngRes.ok) {
                    setImageUrl(`/floorplans/${eventId}.png`);
                    setError(false);
                    return;
                }

                // Try JPG fallback
                const jpgRes = await fetch(`/floorplans/${eventId}.jpg`, { method: 'HEAD' });
                if (jpgRes.ok) {
                    setImageUrl(`/floorplans/${eventId}.jpg`);
                    setError(false);
                    return;
                }

                // Try PDF fallback (latest resort)
                const pdfRes = await fetch(`/floorplans/${eventId}.pdf`, { method: 'HEAD' });
                if (pdfRes.ok) {
                    setImageUrl(`/floorplans/${eventId}.pdf`);
                    setError(false);
                    return;
                }

                throw new Error("No floor plan found");
            } catch (err) {
                console.error("Floor plan load error:", err);
                setError(true);
            }
        };

        loadFloorPlan();

        // Fetch coordinates
        fetch(`/api/map?categoryId=${categoryId}&eventId=${eventId}&t=${Date.now()}`, { cache: "no-store", headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } })
            .then(res => res.json())
            .then(data => setCoordinates(data || {}))
            .catch(err => console.error("Map fetch error:", err));
    }, [categoryId, eventId]);


    if (error) {
        return (
            <div className="text-center space-y-3 p-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                </div>
                <p className="text-white">Floor plan not available</p>
                <p className="text-sm text-white max-w-sm mx-auto">The interactive floor plan for this event has not been uploaded yet. Please ensure <code>/floorplans/{eventId}.svg</code>, <code>.png</code>, or <code>.pdf</code> exists.</p>
            </div>
        );
    }

    if (!svgContent && !imageUrl) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                <p className="text-sm text-white uppercase tracking-widest font-mono">Loading Map...</p>
            </div>
        );
    }

    const pos = coordinates[targetTable.toString()];

    return (
        <div 
            ref={containerRef}
            className="w-full h-full min-h-[300px] overflow-auto bg-white/5 rounded-xl border border-white/5 relative bg-obsidian-dark flex items-center justify-center"
            style={{ 
                // Add checkered background to show transparency
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.02\' fill-rule=\'evenodd\' d=\'M0 0h10v10H0V0zm10 10h10v10H10V10z\'/%3E%3C/svg%3E")'
            }}
        >
            <div 
                ref={wrapperRef}
                className="relative inline-block w-full max-w-full h-auto"
            >
                {/* 1. Underlying Floor Plan */}
                {svgContent ? (
                    <div 
                        className="w-full h-auto flex items-center justify-center"
                        dangerouslySetInnerHTML={{ 
                            __html: svgContent.replace(/<svg/, '<svg style="width: 100%; height: auto; max-block-size: none; display: block;"') 
                        }}
                    />
                ) : imageUrl?.endsWith('.pdf') ? (
                    <iframe
                        src={imageUrl}
                        className="w-full h-full min-h-[70vh] border-0"
                        title="Floor Plan PDF"
                    />
                ) : (
                    <img 
                        src={imageUrl!} 
                        alt="Floor Plan"
                        className="w-full h-auto"
                        style={{ display: 'block' }}
                    />
                )}

                {/* 2. Highlight Overlay */}
                {pos && (
                    <div 
                        className="absolute z-10 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                        {/* Outer ping */}
                        <div className="absolute inset-0 rounded-full border-2 sm:border-[3px] border-brand-green/60 opacity-50 animate-ping" style={{ animationDuration: '2s' }}></div>
                        {/* Inner circle */}
                        <div className="absolute w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-brand-green border-[1.5px] sm:border-2 border-white shadow-[0_0_10px_rgba(0,107,63,0.8)] sm:shadow-[0_0_20px_rgba(0,107,63,0.8)] flex items-center justify-center">
                            <span className="text-white text-[9px] sm:text-xs font-bold leading-none">{targetTable}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
