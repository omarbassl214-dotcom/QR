"use client";

import React from "react";
import { motion } from "framer-motion";

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-obsidian">
      {/* Premium Marble Texture Base */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-110"
        style={{ backgroundImage: "url('/images/marble-bg.png')" }}
      />

      {/* Deep Obsidian Gradient Overlay for Legibility */}
      <div className="absolute inset-0 bg-gradient-to-tr from-obsidian via-obsidian/80 to-obsidian/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,11,0.8)_100%)]" />

      {/* Extremely Muted Ambient Glows (Maintaining Depth without Distraction) */}
      <motion.div 
        className="ambient-orb w-[600px] h-[600px] bg-gold/5 top-[-10%] left-[-10%]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Noise Texture Overlay for High-End Finish */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  );
};
