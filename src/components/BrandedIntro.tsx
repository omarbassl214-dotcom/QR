'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BrandedIntroProps {
    onComplete: () => void;
}

export default function BrandedIntro({ onComplete }: BrandedIntroProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Give transition time before calling onComplete
            setTimeout(onComplete, 1000);
        }, 3500); // Intro duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] bg-[#000000] flex flex-col items-center justify-center p-6 overflow-hidden"
                >
                    <div className="flex flex-col items-center space-y-12">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative w-44 h-44 sm:w-56 sm:h-56"
                        >
                            <div className="absolute inset-0 bg-brand-green/20 blur-[60px] rounded-full animate-pulse" />
                            <Image
                                src="/images/logo.png"
                                alt="Perfect Protocol Logo"
                                fill
                                className="relative z-10 object-contain mix-blend-screen"
                                priority
                            />
                        </motion.div>

                        {/* Text Content */}
                        <div className="text-center space-y-4">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                                className="text-3xl sm:text-4xl font-serif text-white tracking-[0.15em]"
                            >
                                PERFECT PROTOCOL
                            </motion.h2>
                            
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "80%", opacity: 1 }}
                                transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
                                className="h-px bg-gradient-to-r from-transparent via-brand-green/60 to-transparent mx-auto"
                            />

                            <motion.p
                                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                                animate={{ opacity: 1, letterSpacing: "0.6em" }}
                                transition={{ duration: 1.2, delay: 1.5, ease: "easeOut" }}
                                className="text-[11px] sm:text-xs text-white font-medium uppercase"
                            >
                                CHECK-IN LIST
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
