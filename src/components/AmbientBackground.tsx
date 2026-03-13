"use client";

import React from "react";
import { motion } from "framer-motion";

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-obsidian">
      {/* Primary Gold Orb */}
      <motion.div 
        className="ambient-orb w-[400px] h-[400px] bg-gold/5 -top-20 -left-20"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 20, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Secondary Emerald Orb */}
      <motion.div 
        className="ambient-orb w-[350px] h-[350px] bg-emerald-500/5 bottom-10 right-10"
        animate={{
          x: [0, -50, 30, 0],
          y: [0, -30, -10, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Tertiary Soft Glow */}
      <motion.div 
        className="ambient-orb w-[500px] h-[300px] bg-gold-muted/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.05, 0.95, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
    </div>
  );
};
