'use client';

import React from 'react';

interface FooterSectionProps {
  tenantName?: string;
  onOpenPass?: () => void;
  onOpenRenew?: () => void;
  onOpenLogin?: () => void;
  address?: string;
  phone?: string;
  email?: string;
  contactSocials?: any;
}

export default function FooterSection({
  tenantName = 'Your Gym',
  onOpenPass,
  onOpenRenew,
  onOpenLogin,
  address = '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  phone = '+234 812 345 6789',
  email = 'frontdesk@example.com',
  contactSocials,
}: FooterSectionProps) {
  const activeAddress = contactSocials?.address || address;
  const activePhone = contactSocials?.phone || phone;
  const activeEmail = contactSocials?.email || email;

  const socialIg = contactSocials?.social_ig || 'https://instagram.com';
  const socialX = contactSocials?.social_x || 'https://x.com';
  const socialFb = contactSocials?.social_fb || 'https://facebook.com';
  const socialYt = contactSocials?.social_yt || 'https://youtube.com';
  const socialTk = contactSocials?.social_tk || 'https://tiktok.com';
  const socialWa = contactSocials?.social_wa || 'https://wa.me/?text=Hello%20Gym%20Desk,%20I%20have%20an%20inquiry%20regarding%20memberships.';

  const hoursWeekday = contactSocials?.hours_weekday || '06:00 – 22:00';
  const hoursWeekend = contactSocials?.hours_weekend || '07:00 – 21:00';
  const hoursHolidays = contactSocials?.hours_holidays || '08:00 – 18:00';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${tenantName} ${activeAddress}`
  )}`;

  return (
    <footer className="w-full bg-[#070709] border-t border-gray-800/80 pt-16 pb-12 text-gray-400">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand & Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-orange-500/20">
                {tenantName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight leading-none">
                  {tenantName}
                </h3>
                <span className="text-[11px] text-orange-400 font-mono">
                  Smart Pass Member Portal
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              High-performance fitness backed by biometric access gate telemetry, Olympic strength gear, and instant cloud-verified passes.
            </p>

            {/* Operating Live Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Facility Open • Live Optical Access Gates Online</span>
            </div>

            {/* Social Icons Bar */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-bold block">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                {/* Instagram */}
                <a
                  href={socialIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 flex items-center justify-center transition shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href={socialX}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 rounded-xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 flex items-center justify-center transition shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={socialFb}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 flex items-center justify-center transition shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={socialYt}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 flex items-center justify-center transition shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href={socialTk}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 flex items-center justify-center transition shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Physical Address & Location (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Location & Address
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-0.5 text-base">📍</span>
                <div>
                  <p className="font-bold text-gray-200 leading-snug">{activeAddress}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Secure underground member parking available.</p>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121217] hover:bg-orange-500/10 text-orange-400 hover:text-orange-300 border border-orange-500/30 text-[11px] font-bold transition"
                >
                  <span>Get Directions on Google Maps</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <div className="pt-2 space-y-1.5 text-xs">
              <p className="flex items-center gap-2">
                <span className="text-gray-500">📞 Phone:</span>
                <a href={`tel:${activePhone}`} className="text-gray-300 hover:text-white font-mono font-bold">
                  {activePhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-500">✉️ Email:</span>
                <a href={`mailto:${activeEmail}`} className="text-gray-300 hover:text-white font-mono">
                  {activeEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Column 3: Hours & Support (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Operating Hours
            </span>
            <div className="space-y-2 text-xs bg-[#0e0e12] p-3.5 rounded-2xl border border-gray-800/80">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Monday – Friday</span>
                <span className="font-mono text-white font-bold">{hoursWeekday}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Saturday – Sunday</span>
                <span className="font-mono text-white font-bold">{hoursWeekend}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Public Holidays</span>
                <span className="font-mono text-orange-400 font-bold">{hoursHolidays}</span>
              </div>
            </div>

            <div className="pt-1">
              <a
                href={socialWa}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>💬 Front Desk WhatsApp Live</span>
              </a>
            </div>
          </div>

          {/* Column 4: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#schedule" className="hover:text-orange-400 transition">
                  Class Timetable
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-orange-400 transition">
                  Membership Plans
                </a>
              </li>
              <li>
                <a href="#bmi-calculator" className="hover:text-orange-400 transition">
                  BMI Calculator
                </a>
              </li>
              <li>
                <a href="#coaches" className="hover:text-orange-400 transition">
                  Master Coaches
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-orange-400 transition">
                  Member Reviews
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenPass}
                  className="text-orange-400 hover:underline font-bold text-left"
                >
                  Digital QR Pass
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLogin}
                  className="text-gray-400 hover:text-white transition text-left"
                >
                  Member Sign In
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 {tenantName}. Powered by FitFarmHQ SaaS Management System.</p>

          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span>🔒 256-bit SSL Verified</span>
            <span>•</span>
            <span>⚡ Biometric Optical Access Gate Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
