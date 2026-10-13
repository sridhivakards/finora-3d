'use client';

import React, { useEffect, useRef } from 'react';

interface GlitterWarpProps {
  colors?: string[];
  speed?: number;
  particleCount?: number;
  glitterFrequency?: number;
  warpFactor?: number;
  className?: string;
  isFixed?: boolean;
  children?: React.ReactNode;
}

export default function GlitterWarp({
  colors = ['#06b6d4', '#22d3ee', '#6366f1', '#8b5cf6', '#f59e0b', '#38bdf8'],
  speed = 1.0,
  particleCount = 280,
  glitterFrequency = 0.04,
  warpFactor = 1.2,
  className = '',
  isFixed = false,
  children,
}: GlitterWarpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = isFixed ? window.innerWidth : canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = isFixed ? window.innerHeight : canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = isFixed ? window.innerWidth : canvas.offsetWidth || window.innerWidth;
      height = canvas.height = isFixed ? window.innerHeight : canvas.offsetHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (isFixed) {
        mouseRef.current.targetX = e.clientX / window.innerWidth;
        mouseRef.current.targetY = e.clientY / window.innerHeight;
      } else {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.targetX = (e.clientX - rect.left) / width;
        mouseRef.current.targetY = (e.clientY - rect.top) / height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize Warp Star & Glitter particles
    interface Particle {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      color: string;
      size: number;
      glitterPhase: number;
      glitterSpeed: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2.2,
        y: (Math.random() - 0.5) * height * 2.2,
        z: Math.random() * 1000 + 1,
        prevZ: 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 1.8 + 0.6,
        glitterPhase: Math.random() * Math.PI * 2,
        glitterSpeed: Math.random() * 0.08 + 0.03,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015 * speed;

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const centerX = width * (0.5 + (mouseRef.current.x - 0.5) * 0.25);
      const centerY = height * (0.5 + (mouseRef.current.y - 0.5) * 0.25);

      // Deep space background with subtle trail blur
      ctx.fillStyle = 'rgba(6, 9, 19, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Radial warp glow at center
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.6
      );
      radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.09)');
      radialGlow.addColorStop(0.35, 'rgba(99, 102, 241, 0.06)');
      radialGlow.addColorStop(0.75, 'rgba(139, 92, 246, 0.025)');
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render each warp star / glitter particle
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.prevZ = p.z;
        p.z -= 4.5 * speed * warpFactor;
        p.glitterPhase += p.glitterSpeed;

        // Reset particle if it passes the viewer
        if (p.z <= 0) {
          p.z = 1000;
          p.prevZ = 1000;
          p.x = (Math.random() - 0.5) * width * 2.2;
          p.y = (Math.random() - 0.5) * height * 2.2;
        }

        // Perspective 3D projection
        const k = 420 / p.z;
        const px = p.x * k + centerX;
        const py = p.y * k + centerY;

        const prevK = 420 / p.prevZ;
        const prevPx = p.x * prevK + centerX;
        const prevPy = p.y * prevK + centerY;

        // Only draw if inside screen bounds
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          // Calculate glitter twinkle intensity (sine wave oscillation)
          const twinkle = (Math.sin(p.glitterPhase) + 1) * 0.5;
          const alpha = Math.min(1, Math.max(0.15, (1 - p.z / 1000) * 0.9 + twinkle * 0.4));
          const currentSize = p.size * (1 - p.z / 1200) * (1 + twinkle * 0.6);

          // Draw Warp Motion Streak
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = alpha * 0.65;
          ctx.lineWidth = Math.max(0.6, currentSize * 0.85);
          ctx.stroke();

          // Draw Glitter Core Star with Cross Shimmer on peak twinkle
          ctx.beginPath();
          ctx.arc(px, py, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = twinkle > 0.7 ? 12 : 4;
          ctx.fill();

          // Diamond shimmer flare on high glitter
          if (twinkle > 0.75) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px - currentSize * 3, py);
            ctx.lineTo(px + currentSize * 3, py);
            ctx.moveTo(px, py - currentSize * 3);
            ctx.lineTo(px, py + currentSize * 3);
            ctx.stroke();
          }

          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, speed, particleCount, glitterFrequency, warpFactor, isFixed]);

  if (isFixed) {
    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
        style={{ display: 'block' }}
      />
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
