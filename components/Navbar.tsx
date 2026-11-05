'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E6E5DC] shadow-subtle py-3.5'
          : 'bg-[#F7F6F0]/80 backdrop-blur-xs py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#244C3B] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              F
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight text-[#1D2923] block leading-none">
                FINORA
              </span>
              <span className="text-[10px] font-sans text-[#777E77] tracking-wider uppercase mt-1 block">
                Financial OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#777E77]">
            <a href="#features" className="hover:text-[#1D2923] transition-colors">
              Features
            </a>
            <a href="#methodology" className="hover:text-[#1D2923] transition-colors">
              Methodology
            </a>
            <a href="#security" className="hover:text-[#1D2923] transition-colors">
              Security
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-medium text-[#1D2923] hover:text-[#244C3B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#1D2923] hover:bg-[#F0F1E9]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#E6E5DC] space-y-2 pb-2">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#1D2923] hover:bg-[#F0F1E9]"
            >
              Features
            </a>
            <a
              href="#methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#1D2923] hover:bg-[#F0F1E9]"
            >
              Methodology
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center px-4 py-2 text-xs font-medium border border-[#E6E5DC] rounded-lg text-[#1D2923] bg-[#FFFFFF]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full text-center px-4 py-2 bg-[#244C3B] text-white text-xs font-medium rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
