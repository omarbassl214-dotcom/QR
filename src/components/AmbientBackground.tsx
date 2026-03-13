"use client";

import React from "react";
import { motion } from "framer-motion";

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-obsidian">
      {/* Primary Gold Orb */}
      <motion.div 
        className="ambient-orb w-[600px] h-[600px] bg-gold/5 -top-20 -left-20"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, 60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Secondary Emerald Orb */}
      <motion.div 
        className="ambient-orb w-[500px] h-[500px] bg-emerald-500/5 bottom-10 right-10"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, -40, -20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Tertiary Soft Glow */}
      <motion.div 
        className="ambient-orb w-[800px] h-[400px] bg-gold-muted/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.1, 0.9, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
    </div>
  );
};
