"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export const AmbientBackground: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-obsidian">
      {/* Premium Marble Texture Base */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 scale-110"
        style={{ backgroundImage: "url('/images/marble-bg.png')" }}
      />

      {/* Deep Obsidian Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-obsidian via-obsidian/90 to-obsidian/60" />

      {/* Static Subdued Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-green/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-green/3 blur-[100px] rounded-full" />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  );
};
