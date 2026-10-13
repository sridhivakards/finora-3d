'use client';

import React, { useRef, useState } from 'react';
import { Wifi, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface InteractiveCreditCardProps {
  variant: 'traditional' | 'finora';
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
  footerNote: string;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
}

export default function InteractiveCreditCard({
  variant,
  title,
  subtitle,
  badge,
  children,
  footerNote,
  cardNumber = '•••• •••• •••• 1840',
  holderName,
  expiry = '09/28',
}: InteractiveCreditCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const isFinora = variant === 'finora';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-14 to +14 deg)
    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotX, y: rotY });

    // Specular glare follows cursor (0% to 100%)
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: '1100px' }}
      className="w-full flex justify-center py-4 select-none"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${glare.opacity > 0 ? '10px' : '0px'})`,
          transition: glare.opacity === 0 ? 'transform 0.5s ease-out' : 'none',
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full rounded-3xl p-6 sm:p-8 transition-shadow duration-300 overflow-hidden cursor-pointer ${
          isFinora
            ? 'bg-gradient-to-br from-[#0c142b] via-[#0f1d44] to-[#091124] border border-cyan-400/40 shadow-2xl hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)]'
            : 'bg-gradient-to-br from-[#131118] via-[#1a141c] to-[#0e0c12] border border-rose-500/25 shadow-2xl hover:shadow-[0_20px_50px_rgba(244,63,94,0.15)]'
        }`}
      >
        {/* Dynamic Specular Holographic Glare Overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle 350px at ${glare.x}% ${glare.y}%, ${
              isFinora ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 113, 133, 0.28)'
            }, transparent 70%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Ambient Corner Radial Mesh */}
        <div
          className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            isFinora ? 'bg-cyan-500/15' : 'bg-rose-500/10'
          }`}
        />

        {/* Card Header: Chip, Contactless, Badge */}
        <div className="relative z-10 flex items-center justify-between mb-5">
          {/* Metallic EMV Microchip & Contactless Wave */}
          <div className="flex items-center gap-3">
            {/* Chip */}
            <div
              className={`w-11 h-8 rounded-md p-0.5 border shadow-inner flex flex-col justify-between ${
                isFinora
                  ? 'bg-gradient-to-br from-cyan-200 via-sky-400 to-indigo-600 border-cyan-300/50 shadow-cyan-500/40'
                  : 'bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 border-amber-400/60 shadow-amber-900/50'
              }`}
            >
              <div className="w-full h-1 border-b border-black/30 opacity-70" />
              <div className="flex justify-between h-2 px-1">
                <div className="w-2 h-full border border-black/30 rounded-xs" />
                <div className="w-2 h-full border border-black/30 rounded-xs" />
              </div>
              <div className="w-full h-1 border-t border-black/30 opacity-70" />
            </div>

            {/* Contactless Signal */}
            <div
              className={`rotate-90 ${
                isFinora ? 'text-cyan-300' : 'text-slate-500'
              }`}
            >
              <Wifi className="w-5 h-5" />
            </div>
          </div>

          {/* Card Category Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isFinora
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {isFinora ? <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
            <span>{badge}</span>
          </div>
        </div>

        {/* Card Title & Subtitle */}
        <div className="relative z-10 mb-4">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Card Body / Telemetry Content */}
        <div className="relative z-10 my-4">{children}</div>

        {/* Embossed Card Number & Footer */}
        <div className="relative z-10 pt-4 mt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="font-mono tracking-widest text-slate-400 text-sm font-semibold">
            {cardNumber}
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                CARDHOLDER
              </span>
              <span className="font-bold text-slate-200">
                {holderName || (isFinora ? 'DHILIKESH // FINORA OS' : 'LEGACY BANK USER')}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                EXPIRES
              </span>
              <span className="font-bold text-slate-200">{expiry}</span>
            </div>
          </div>
        </div>

        {/* Final Takeaway Note */}
        <p
          className={`relative z-10 mt-3 text-xs leading-relaxed ${
            isFinora ? 'text-cyan-200/90' : 'text-slate-400'
          }`}
        >
          {footerNote}
        </p>
      </div>
    </div>
  );
}
