'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, TrendingUp, Orbit, Zap } from 'lucide-react';

interface PreloaderProps {
  onComplete?: () => void;
  minDuration?: number; // duration in ms
  initialText?: string;
  subTexts?: string[];
  badgeText?: string;
  title?: string;
}

export default function Preloader({
  onComplete,
  minDuration = 1800,
  initialText = 'Loading your experience...',
  badgeText = 'FINORA PORTFOLIO TERMINAL',
  title = 'Investment Intelligence',
  subTexts = [
    'Synthesizing portfolio holdings...',
    'Decrypting asset valuations...',
    'Calculating live unrealized gains...',
    'Your wealth terminal is ready.',
  ],
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const allTexts = [initialText, ...subTexts];

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 30; // 30ms tick

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDuration) * 100));
      setProgress(pct);

      // Cycle status text based on progress
      const textStep = Math.min(
        allTexts.length - 1,
        Math.floor((pct / 100) * allTexts.length)
      );
      setCurrentTextIndex(textStep);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsDone(true);
          if (onComplete) onComplete();
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [minDuration]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060913] text-white selection:bg-cyan-500/30 overflow-hidden"
        >
          {/* Ambient Cosmic Radial Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Center Preloader Container */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center space-y-6">
            {/* Animated Cyber Core Loader Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30"
              />

              {/* Pulsing Glowing Ring */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute inset-2 rounded-full border border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              />

              {/* Central Core Finora Symbol */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-cyan-500/25">
                <span className="font-black text-2xl font-mono text-white tracking-wider">
                  F
                </span>
              </div>

              {/* Orbiting Satellite Light */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
            </div>

            {/* Brand Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{badgeText}</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-2">
                {title}
              </h2>
            </div>

            {/* High-Tech Progress Bar */}
            <div className="w-full space-y-2">
              <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Numeric Percentage & Status */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">OPTIMIZING ENGINE</span>
                <span className="font-bold text-cyan-300 text-sm">{progress}%</span>
              </div>
            </div>

            {/* Animated Sequential Status Text */}
            <div className="h-8 flex items-center justify-center">
              <motion.p
                key={currentTextIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-mono text-slate-300 tracking-wide"
              >
                {allTexts[currentTextIndex]}
              </motion.p>
            </div>

            {/* Skip Option */}
            <button
              onClick={() => {
                setIsDone(true);
                if (onComplete) onComplete();
              }}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors pt-2"
            >
              Skip Intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
