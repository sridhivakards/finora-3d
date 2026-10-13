'use client';

import React, { useState } from 'react';
import { Quote } from 'lucide-react';

interface QuoteItem {
  quote: string;
  author: string;
  tag: string;
  highlight: string;
}

const MOTIVATIONAL_QUOTES: QuoteItem[] = [
  {
    quote: 'Do not save what is left after spending, but spend what is left after saving.',
    author: 'Warren Buffett',
    tag: 'Discipline',
    highlight: '₹ Compounding Habit',
  },
  {
    quote: 'Wealth is what you do not see. It is the expenses avoided and the assets quietly compounded.',
    author: 'Morgan Housel',
    tag: 'Psychology',
    highlight: 'Hidden Wealth',
  },
  {
    quote: 'A budget is not a restriction; it is the blueprint for your financial freedom.',
    author: 'Finora Wisdom',
    tag: 'Mindset',
    highlight: 'Financial Freedom',
  },
  {
    quote: 'Beware of little expenses; a small leak will sink a great ship. Track every single Rupee.',
    author: 'Benjamin Franklin',
    tag: 'Leak Detection',
    highlight: 'Micro Spending',
  },
  {
    quote: 'The goal is not to look rich to others. The goal is to be genuinely wealthy in complete peace.',
    author: 'Naval Ravikant',
    tag: 'Peace of Mind',
    highlight: 'Quiet Wealth',
  },
  {
    quote: 'Compound interest is the eighth wonder of the world. He who understands it, earns it.',
    author: 'Albert Einstein',
    tag: 'Mathematics',
    highlight: 'Long-term Compounding',
  },
];

export default function BendingMarquee() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className="relative py-10 overflow-hidden border-y border-slate-800/80 bg-gradient-to-b from-[#080d1e]/80 via-[#070b18]/90 to-[#080d1e]/80 backdrop-blur-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inline styles for seamless freeze-on-hover marquee */}
      <style jsx>{`
        @keyframes bendingMarqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: bendingMarqueeScroll 40s linear infinite;
        }
        .marquee-track.is-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Curved Perspective Bending Ambient Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-32 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-32 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />


      {/* 3D Bending Perspective Marquee Stage */}
      <div
        className="w-full relative overflow-hidden py-4 select-none"
        style={{
          perspective: '1200px',
        }}
      >
        {/* Left & Right Edge Vignette Gradient Fades */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-[#060913] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-[#060913] to-transparent z-10 pointer-events-none" />

        {/* Marquee Row with Perspective Bending Tilt */}
        <div
          className="w-full"
          style={{
            transform: 'rotateX(8deg) rotateY(-2deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className={`marquee-track ${isHovered ? 'is-paused' : ''}`}>
            {/* Duplicated array for seamless infinite looping */}
            {[...MOTIVATIONAL_QUOTES, ...MOTIVATIONAL_QUOTES].map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative flex flex-col justify-between w-[380px] sm:w-[420px] p-5 rounded-2xl bg-gradient-to-br from-[#0c1326]/90 via-[#0a0f20]/95 to-[#080d1a] border border-slate-800/90 hover:border-cyan-500/50 shadow-xl hover:shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                {/* Quote Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Quote className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
                    {item.highlight}
                  </span>
                </div>

                {/* Quote Body */}
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Footer */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">— {item.author}</span>
                  <span className="text-[10px] font-mono text-cyan-400">Finora Principle</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
