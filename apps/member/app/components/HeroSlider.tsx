'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface HeroSliderProps {
  tenantName: string;
  campaignTitle?: string;
  isAuthenticated: boolean;
  onOpenPass: () => void;
  onOpenRenew: () => void;
  onOpenRegister: () => void;
}

const SLIDES = [
  {
    src: '/images/hero/1.webp',
    tagline: 'High-Performance Training Arena',
  },
  {
    src: '/images/hero/2.webp',
    tagline: 'Turnstile Digital QR Entry & Live Telemetry',
  },
  {
    src: '/images/hero/3.webp',
    tagline: 'World-Class Strength & Conditioning Equipment',
  },
  {
    src: '/images/hero/4.webp',
    tagline: 'Expert Coaches & Exclusive Training Packages',
  },
  {
    src: '/images/hero/5.webp',
    tagline: 'Track Progress & Level Up Your Fitness',
  },
];

export default function HeroSlider({
  tenantName,
  campaignTitle = 'Active Fitness Challenge',
  isAuthenticated,
  onOpenPass,
  onOpenRenew,
  onOpenRegister,
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div
      className="relative min-h-[600px] md:min-h-[680px] w-full flex items-center justify-center overflow-hidden"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Smooth Crossfade */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <img
              src={slide.src}
              alt={slide.tagline}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-7000 ease-out"
            />
          </div>
        );
      })}

      {/* Balanced Ambient Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/20 to-[#0a0a0c]/60 pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-black/20 pointer-events-none" />

      {/* Deep Bottom Transition Fade / Dissolve into Page Body */}
      <div className="absolute bottom-0 inset-x-0 h-48 z-20 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/85 to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="relative z-30 max-w-5xl w-full mx-auto px-6 pt-28 pb-16 sm:pt-36 sm:pb-20 text-center space-y-6">
        {/* Campaign Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-orange-500/10 animate-fadeIn">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>🔥 {campaignTitle}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl mx-auto drop-shadow-2xl">
          Push Beyond Limits at{' '}
          <span className="brand-text-gradient font-black">
            {tenantName}
          </span>
        </h1>

        {/* Dynamic Tagline from Current Slide */}
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-medium leading-relaxed drop-shadow-md">
          {SLIDES[currentIndex].tagline} — Scan your digital QR pass at turnstile kiosks, track workout progress, and manage memberships online.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenPass}
                className="px-7 py-4 brand-btn-gradient font-extrabold text-black rounded-xl shadow-xl shadow-orange-500/25 text-sm transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>📱</span>
                <span>Open Entrance QR Pass</span>
              </button>
              <button
                onClick={onOpenRenew}
                className="px-7 py-4 bg-gray-900/90 hover:bg-gray-800 font-bold text-white rounded-xl text-sm border border-gray-700/80 backdrop-blur-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>💳</span>
                <span>Renew Membership Online</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenRegister}
                className="px-7 py-4 brand-btn-gradient font-extrabold text-black rounded-xl shadow-xl shadow-orange-500/25 text-sm transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>🚀</span>
                <span>Register & Get Digital Pass</span>
              </button>
              <a
                href="#pricing"
                className="px-7 py-4 bg-gray-900/90 hover:bg-gray-800 font-bold text-white rounded-xl text-sm border border-gray-700/80 backdrop-blur-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>💳</span>
                <span>View Membership Plans</span>
              </a>
            </>
          )}
        </div>

        {/* Slide Indicators & Navigation Controls */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <button
            onClick={prevSlide}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-gray-700/60 text-gray-400 hover:text-white flex items-center justify-center text-xs backdrop-blur-sm transition"
            aria-label="Previous Slide"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index
                  ? 'w-8 brand-btn-gradient'
                  : 'w-2 bg-gray-600/60 hover:bg-gray-400'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-gray-700/60 text-gray-400 hover:text-white flex items-center justify-center text-xs backdrop-blur-sm transition"
            aria-label="Next Slide"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
