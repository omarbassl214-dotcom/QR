"use client";

import { useRef, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeDisplay({ 
    path, 
    eventName, 
    size = 120 
}: { 
    path: string; 
    eventName: string;
    size?: number;
}) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [fullUrl, setFullUrl] = useState("");

    useEffect(() => {
        // Generate the absolute URL on the client side
        setFullUrl(`${window.location.origin}${path}`);
    }, [path]);

    const downloadQRCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!qrRef.current) return;
        const canvas = qrRef.current.querySelector("canvas");
        if (!canvas) return;

        const pngUrl = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${eventName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (!fullUrl) return null;

    return (
        <div className="flex flex-col items-center gap-3" onClick={(e) => e.preventDefault()}>
            <div
                ref={qrRef}
                className="p-3 bg-white rounded-xl shadow-sm border border-slate-100"
            >
                <QRCodeCanvas
                    value={fullUrl}
                    size={size}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"}
                    level={"Q"}
                />
            </div>
            <button
                onClick={downloadQRCode}
                className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-admin-accent/70"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                Download PNG
            </button>
        </div>
    );
}
