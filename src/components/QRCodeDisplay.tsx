"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

export default function QRCodeDisplay({ path, eventName, size = 150 }: { path: string, eventName: string, size?: number }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

    const downloadQR = () => {
        // Create a temporary high-def canvas for downloading only
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 1024;
        tempCanvas.height = 1024;
        
        // Use a hidden div to render the high-res QR momentarily
        const tempDiv = document.createElement("div");
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);

        // We use the same qrcode.react logic but at a much higher resolution
        // Note: In a real app we'd just use a library function, but here we can 
        // simply grab the existing canvas and re-draw it at scale or use a hidden component.
        // For simplicity and 100% reliability, we grab the CURRENT canvas and draw it 
        // onto a LARGE canvas with imageSmoothingEnabled = false.
        
        const originalCanvas = canvasRef.current?.querySelector("canvas");
        if (!originalCanvas) return;

        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(originalCanvas, 0, 0, 1024, 1024);
            
            const url = tempCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = url;
            link.download = `${eventName}-qr-hd.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        document.body.removeChild(tempDiv);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div ref={canvasRef} className="p-3 bg-white rounded-xl shadow-2xl border border-white/10">
                <QRCodeCanvas 
                    value={fullUrl} 
                    size={size}
                    level="H"
                    includeMargin={true}
                    style={{ imageRendering: "pixelated" }}
                />
            </div>
            <button 
                onClick={downloadQR}
                className="group/dl text-[10px] font-bold text-black uppercase tracking-widest bg-brand-green hover:bg-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-2"
            >
                <span>Download HD PNG</span>
                <svg className="w-3 h-3 transition-transform group-hover/dl:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>
        </div>
    );
}
