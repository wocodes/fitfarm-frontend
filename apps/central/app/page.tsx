'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RegisterModal from './components/RegisterModal';
import SignInModal from './components/SignInModal';
import { ADMIN_APP_URL } from './lib/config';

export default function FitFarmHQHomePage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'biometrics' | 'subscriptions' | 'audit' | 'multitenant'>('biometrics');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Scroll-triggered reveal animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Live Hardware Terminal Simulation State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [todayCheckins, setTodayCheckins] = useState(348);
  const [activeMembersCount] = useState(1482);
  const [simulatedLogs, setSimulatedLogs] = useState([
    {
      id: 1,
      member: 'Emmanuel Chinazaekpere',
      gender: 'm',
      plan: 'Quarterly Diamond VIP',
      expiry: 'Dec 18, 2026',
      gate: 'Turnstile 01 (Left)',
      time: 'Just now',
      latency: '34ms',
      status: 'GRANTED',
    },
    {
      id: 2,
      member: 'Opetemi Afolabi',
      gender: 'f',
      plan: 'Annual Unlimited Access',
      expiry: 'Jan 25, 2027',
      gate: 'Turnstile 02 (Center)',
      time: '2 mins ago',
      latency: '28ms',
      status: 'GRANTED',
    },
    {
      id: 3,
      member: 'Kelechi Sunday',
      gender: 'm',
      plan: 'Monthly Standard Pass',
      expiry: 'Nov 30, 2026',
      gate: 'Fast-Track Optical Gate',
      time: '5 mins ago',
      latency: '41ms',
      status: 'GRANTED',
    },
  ]);

  // Interactive Revenue Split Calculator State
  const [memberVolume, setMemberVolume] = useState<number>(350);
  const [averagePlanPrice, setAveragePlanPrice] = useState<number>(35000); // ₦35,000 / mo
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  const grossMonthly = memberVolume * averagePlanPrice;
  const saasSplit1Pct = Math.round(grossMonthly * 0.01);
  const gymNetPayout = grossMonthly - saasSplit1Pct;

  // Simulate Member Tap on Gate
  const handleSimulateTap = () => {
    if (isScanning) return;
    setIsScanning(true);

    setTimeout(() => {
      const demoMembers = [
        { name: 'Dr. Chinedu Okafor', plan: 'Executive VIP All-Access', gate: 'Gate 01 (Optical)', expiry: 'Mar 14, 2027' },
        { name: 'Amina Bello', plan: 'Strength & Conditioning Pass', gate: 'Gate 02 (Flap)', expiry: 'Oct 02, 2026' },
        { name: 'Tunde Bakare', plan: 'Morning Peak Unlimited', gate: 'Turnstile 03', expiry: 'Jan 10, 2027' },
        { name: 'Fatima Aliyu', plan: 'Pilates & Boxing Bundle', gate: 'Gate 01 (Optical)', expiry: 'Dec 05, 2026' },
      ];

      const pick = demoMembers[Math.floor(Math.random() * demoMembers.length)];
      const latencyNum = Math.floor(Math.random() * 15) + 22; // 22ms - 37ms

      const newLog = {
        id: Date.now(),
        member: pick.name,
        gender: Math.random() > 0.5 ? 'm' : 'f',
        plan: pick.plan,
        expiry: pick.expiry,
        gate: pick.gate,
        time: 'Just now',
        latency: `${latencyNum}ms`,
        status: 'GRANTED',
      };

      setSimulatedLogs((prev) => [newLog, ...prev.slice(0, 3)]);
      setTodayCheckins((prev) => prev + 1);
      setScanResult(newLog);
      setIsScanning(false);

      setTimeout(() => setScanResult(null), 4000);
    }, 900);
  };

  const faqs = [
    {
      q: 'How does physical biometric turnstile integration work?',
      a: 'FitFarmHQ integrates directly with standard IP-networked and USB biometric terminals (ZKTeco, Hikvision, optical speed gates, and RFID readers). When a member scans their finger or dynamic QR pass, our cloud validates their active plan, branch permissions, and remaining sessions in <50ms before pulsing the gate relay to open.',
    },
    {
      q: 'What is the difference between the Free Setup Tier and Annual Enterprise?',
      a: 'The Free Setup Tier has $0 upfront cost, $0 setup fee, and $0 monthly base subscription—FitFarmHQ automatically splits 1% on incoming member Paystack subscription payments. The Annual Enterprise Plan is a flat $299/year license key with 0% transaction split fee, ideal for large gyms with high membership volume.',
    },
    {
      q: 'Can every gym tenant have their own logo, theme colors, and custom domain?',
      a: 'Yes! Every gym tenant gets an isolated admin dashboard and public member portal. You can upload custom logos, set primary brand colors, adjust custom fonts, and run on your own custom subdomain (e.g. yourgym.fitcloud.io or yourgym.com).',
    },
    {
      q: 'Does FitFarmHQ automatically extend membership expiration when a plan is paused?',
      a: 'Yes. When a member requests a freeze (travel, injury, or medical leave), FitFarmHQ locks their gate pass and freezes their timer. Upon resumption, the system automatically shifts their expiration date forward by the exact number of paused days, with full audit trail logging.',
    },
    {
      q: 'Are audit logs immutable and timestamped?',
      a: 'Absolutely. FitFarmHQ maintains an immutable security audit log recording every member plan pause/resume, profile edit, gate override, transaction verification, and staff action—including previous vs new state values, staff user IDs, and timestamps.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-orange-500 selection:text-black relative noise-overlay">
      {/* Background Ambient Radial Glow & Matrix Grid */}
      <div className="fixed inset-0 bg-tech-grid pointer-events-none opacity-30 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-radial-gradient pointer-events-none z-0" />

      {/* Floating Ambient Orbs for depth */}
      <div className="fixed top-[15%] left-[10%] w-[400px] h-[400px] rounded-full bg-orange-500/[0.04] blur-[120px] pointer-events-none z-0 animate-float-orb" />
      <div className="fixed top-[40%] right-[5%] w-[350px] h-[350px] rounded-full bg-amber-500/[0.03] blur-[100px] pointer-events-none z-0 animate-float-orb-slow" />
      <div className="fixed bottom-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.025] blur-[100px] pointer-events-none z-0 animate-float-orb-fast" />

      {/* 1. Modern Floating Header Dock */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl backdrop-blur-2xl bg-[#0a0a0c]/85 border border-white/[0.08] shadow-2xl px-5 py-3 flex items-center justify-between transition-all">
          {/* Brand Logo & Telemetry Indicator */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-xl text-black shadow-lg shadow-orange-500/25 group-hover:scale-105 transition">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    FitFarmHQ
                  </span>
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    CLOUD
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Gym operations, simplified</p>
              </div>
            </Link>

            {/* Edge Gateway Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cloud hosted • Secure by default</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-gray-300">
            <a href="#hardware" className="hover:text-orange-400 transition-colors">Turnstiles & Hardware</a>
            <a href="#demo" className="hover:text-orange-400 transition-colors">Live Simulation</a>
            <a href="#calculator" className="hover:text-orange-400 transition-colors">Revenue Calculator</a>
            <a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-orange-400 transition-colors">FAQs</a>
          </nav>

          {/* Action Hub */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSignInOpen(true)}
              className="text-xs font-bold text-gray-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.06] transition"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="text-xs font-extrabold text-black px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden z-10">
        {/* Hero-local ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-orange-500/[0.08] via-amber-500/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-[300px] h-[300px] bg-amber-500/[0.06] rounded-full blur-[100px] pointer-events-none animate-float-orb-slow" />
        <div className="absolute top-40 left-[5%] w-[250px] h-[250px] bg-orange-600/[0.05] rounded-full blur-[80px] pointer-events-none animate-float-orb" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Glowing Pill Tag */}
          <div className="reveal-up inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/[0.08] border border-orange-500/25 text-orange-400 text-xs font-bold font-mono mb-10 shadow-lg shadow-orange-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 dot-pulse" />
            <span>Optical Turnstiles • Smart Passes • Instant Paystack Split</span>
          </div>

          {/* Main Headline */}
          <h1 className="reveal-up text-4xl sm:text-6xl lg:text-[5.2rem] font-heading font-black tracking-[-0.03em] leading-[1.06] max-w-5xl mx-auto">
            The Intelligent Cloud OS for{' '}
            <span className="text-gradient-animated">
              Modern Fitness Centers
            </span>
          </h1>

          {/* Subheadline */}
          <p className="reveal-up delay-100 mt-7 text-base sm:text-xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Unify high-speed turnstiles, encrypted biometric member entry, automated subscription freeze/resume controls, and Paystack revenue splitting—all from one branded multi-tenant dashboard.
          </p>

          {/* CTAs */}
          <div className="reveal-up delay-200 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-sm sm:text-base transition-all duration-300 shadow-xl shadow-orange-500/25 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30 active:translate-y-0"
            >
              🚀 Launch Your Gym in 2 Minutes →
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 border border-white/[0.1] hover:border-orange-500/40 font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>🖐️ Test Turnstile Simulator</span>
            </a>
            <Link
              href="/setup"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-white border border-white/[0.06] font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
            >
              <span>⚡ Setup Wizard</span>
            </Link>
          </div>

          <div className="reveal-up delay-300 mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-gray-500 font-mono">
            <span>✓ No credit card required</span>
            <span>✓ 30-day trial</span>
            <span>✓ Cancel anytime</span>
          </div>

          {/* 3. HERO CENTERPIECE: Live Hardware Terminal & Biometric Gate Simulator */}
          <div id="demo" className="reveal-scale delay-200 mt-20 relative max-w-5xl mx-auto scroll-mt-28">
            {/* Outer glow ring */}
            <div className="absolute -inset-px rounded-[1.6rem] bg-gradient-to-b from-orange-500/20 via-white/[0.06] to-transparent pointer-events-none" />
            <div className="relative p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.1] shadow-2xl shadow-black/40 backdrop-blur-2xl gradient-border-glow">
              <div className="rounded-2xl bg-[#0b0b0f] border border-gray-800/80 p-5 sm:p-7 text-left space-y-6">
                {/* Simulated Terminal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-800 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">terminal.fitcloud.io/gate-01-optical</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-mono font-bold uppercase">
                      Hardware Active
                    </span>
                  </div>

                  {/* Simulate Gate Tap Action Button */}
                  <button
                    onClick={handleSimulateTap}
                    disabled={isScanning}
                    className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 shadow-lg ${
                      isScanning
                        ? 'bg-amber-500 text-black animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    }`}
                  >
                    <span>🖐️</span>
                    <span>{isScanning ? 'Validating Biometric Scan...' : 'Simulate Member Gate Tap'}</span>
                  </button>
                </div>

                {/* Key Telemetry Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#121217] border border-gray-800">
                    <span className="text-[11px] text-gray-400 font-medium">Active Subscriptions</span>
                    <p className="text-2xl font-black text-white mt-1">{activeMembersCount}</p>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">● 92% Good Standing</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#121217] border border-gray-800">
                    <span className="text-[11px] text-gray-400 font-medium">Today's Check-ins</span>
                    <p className="text-2xl font-black text-white mt-1">{todayCheckins}</p>
                    <span className="text-[10px] text-orange-400 font-bold font-mono">⚡ +1 Tap Just Now</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#121217] border border-gray-800">
                    <span className="text-[11px] text-gray-400 font-medium">Turnstile Gate Response</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">28 ms</p>
                    <span className="text-[10px] text-gray-400 font-mono">Sub-50ms Optical Relay</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#121217] border border-gray-800">
                    <span className="text-[11px] text-gray-400 font-medium">Paystack Revenue Split</span>
                    <p className="text-2xl font-black text-white mt-1">₦4,850,000</p>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">1% Automated SaaS Split</span>
                  </div>
                </div>

                {/* Interactive Scan Chamber & Live Terminal Stream */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left: Interactive Hardware Scanner Visualizer */}
                  <div className="md:col-span-4 p-5 rounded-2xl bg-[#121217] border border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Laser scanning beam overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent h-16 w-full animate-laser pointer-events-none" />
                    )}

                    <div className="relative mb-4">
                      <div
                        className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl transition-all duration-300 ${
                          isScanning
                            ? 'bg-amber-500/20 border-2 border-amber-400 scale-105 shadow-2xl shadow-amber-500/30'
                            : scanResult
                            ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-105 shadow-2xl shadow-emerald-500/30'
                            : 'bg-black/50 border border-gray-800'
                        }`}
                      >
                        {isScanning ? '⚡' : scanResult ? '🔓' : '🖐️'}
                      </div>
                      <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase ${
                            isScanning
                              ? 'bg-amber-400 text-black animate-pulse'
                              : scanResult
                              ? 'bg-emerald-400 text-black'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {isScanning ? 'Reading Biometrics...' : scanResult ? 'Turnstile Unlocked' : 'Standby For Tap'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-2">ZKTeco Optical Turnstile 01</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Tap the green button above to trigger an optical gate relay.</p>
                  </div>

                  {/* Right: Live Terminal Event Feed */}
                  <div className="md:col-span-8 p-4 rounded-2xl bg-[#121217] border border-gray-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800/80">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                        Hardware Event Stream
                      </span>
                      <span className="text-[11px] text-orange-400 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                        Live Optical Relay
                      </span>
                    </div>

                    <div className="space-y-2">
                      {simulatedLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-[#0b0b0f] border border-gray-800/80 flex items-center justify-between text-xs hover:border-gray-700 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {log.gender === 'f' ? '👩' : '👨'}
                            </span>
                            <div>
                              <p className="font-bold text-white flex items-center gap-2">
                                <span>{log.member}</span>
                                <span className="text-[10px] text-gray-500 font-mono">({log.gate})</span>
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {log.plan} • Valid until {log.expiry}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold block">
                              ACCESS GRANTED
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">
                              {log.latency} • {log.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient section divider */}
      <div className="section-divider relative z-10" />

      {/* 4. Telemetry SLA Strip */}
      <section className="py-16 bg-[#0a0a0e]/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="reveal-up">
              <p className="text-3xl sm:text-5xl font-heading font-black text-orange-400">99.99%</p>
              <p className="text-xs text-gray-400 font-mono font-medium mt-2">Uptime SLA</p>
            </div>
            <div className="reveal-up delay-100">
              <p className="text-3xl sm:text-5xl font-heading font-black text-amber-400">&lt;35ms</p>
              <p className="text-xs text-gray-400 font-mono font-medium mt-2">Access-check latency</p>
            </div>
            <div className="reveal-up delay-200">
              <p className="text-3xl sm:text-5xl font-heading font-black text-emerald-400">1%</p>
              <p className="text-xs text-gray-400 font-mono font-medium mt-2">Paystack platform fee</p>
            </div>
            <div className="reveal-up delay-300">
              <p className="text-3xl sm:text-5xl font-heading font-black text-orange-400">24/7</p>
              <p className="text-xs text-gray-400 font-mono font-medium mt-2">Audit trail & backups</p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider relative z-10" />

      {/* 5. HARDWARE ECOSYSTEM & INTEGRATIONS */}
      <section id="hardware" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="reveal-up text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 font-mono">
              Hardware Compatibility
            </h2>
            <p className="reveal-up delay-100 text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
              Seamlessly Connect Any{' '}
              <span className="text-gradient-animated">Physical Access Gate</span>
            </p>
            <p className="reveal-up delay-200 text-sm text-gray-400 mt-5 leading-relaxed">
              No proprietary lock-in. FitFarmHQ pairs natively with industry-standard turnstiles, biometric fingerprint units, optical laser barcode readers, and RFID keycards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚀',
                title: 'High-Speed Optical Turnstiles',
                desc: 'Flap barriers, tripod barriers, and swing speed gates with dual-direction optical sensors and dry contact relay triggers.',
                badge: 'TCP/IP & Relay',
              },
              {
                icon: '🖐️',
                title: 'Biometric Fingerprint & Vein',
                desc: 'LiveID & SilkID optical fingerprint sensors with 360-degree recognition, spoof detection, and sub-second template matching.',
                badge: 'USB & Networked',
              },
              {
                icon: '📱',
                title: 'Encrypted Dynamic Barcode / QR',
                desc: 'Rotating barcode pass verification. Prevents member screenshot sharing by refreshing optical security tokens every 30 seconds.',
                badge: 'Laser & 2D Imager',
              },
              {
                icon: '💳',
                title: 'RFID & NFC Smart Proximity',
                desc: 'Compatible with 13.56MHz Mifare classic cards, key fobs, silicone fitness wristbands, and Apple/Google Wallet NFC tags.',
                badge: '13.56MHz / 125KHz',
              },
              {
                icon: '🔒',
                title: 'Automated Smart Locker Suites',
                desc: 'Automatically allocate a digital locker cabinet on successful turnstile entry and release it on gym checkout.',
                badge: 'Relay Controller',
              },
              {
                icon: '🖥️',
                title: 'Front Desk Kiosk & Cashier POS',
                desc: 'Web-based cashier terminal for front-desk attendants to register members, issue smart passes, and take cash payments.',
                badge: 'Web Bluetooth & USB',
              },
            ].map((hw, idx) => (
              <div
                key={idx}
                className={`reveal-up delay-${(idx % 3) * 100 + 100} hw-card p-7 rounded-3xl bg-[#0c0c10] border border-white/[0.06] group shadow-lg`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-orange-500/[0.08] border border-orange-500/15 text-orange-400 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-orange-500/15 transition-all duration-300">
                    {hw.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.03] text-gray-500 border border-white/[0.06] text-[10px] font-mono font-bold group-hover:text-orange-400 group-hover:border-orange-500/20 transition">
                    {hw.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-50 transition">{hw.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{hw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider relative z-10" />

      {/* 6. INTERACTIVE REVENUE SPLIT CALCULATOR */}
      <section id="calculator" className="py-28 bg-[#090910]/80 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="reveal-up text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 font-mono">
              Transparent Economics
            </h2>
            <p className="reveal-up delay-100 text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
              Interactive Revenue{' '}
              <span className="text-gradient-animated">Split Calculator</span>
            </p>
            <p className="reveal-up delay-200 text-sm text-gray-400 mt-5 leading-relaxed">
              Launch with $0 upfront cost. FitFarmHQ only charges a 1% automated transaction split when your members pay for plans through Paystack.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Console */}
            <div className="reveal-left lg:col-span-7 p-8 rounded-3xl bg-[#0e0e13] border border-white/[0.08] space-y-8 shadow-2xl">
              {/* Slider 1: Member Count */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300 uppercase font-mono">Active Gym Members</span>
                  <span className="text-lg font-black text-orange-400 font-mono">{memberVolume} Members</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="25"
                  value={memberVolume}
                  onChange={(e) => setMemberVolume(Number(e.target.value))}
                  className="w-full accent-orange-500 h-2 bg-gray-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>50 Members</span>
                  <span>1,000 Members</span>
                  <span>2,500+ Members</span>
                </div>
              </div>

              {/* Slider 2: Average Monthly Fee */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300 uppercase font-mono">Average Monthly Membership Price</span>
                  <span className="text-lg font-black text-amber-400 font-mono">₦{averagePlanPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="120000"
                  step="5000"
                  value={averagePlanPrice}
                  onChange={(e) => setAveragePlanPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-gray-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>₦10,000 / mo</span>
                  <span>₦60,000 / mo</span>
                  <span>₦120,000 / mo</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-400 space-y-1 font-mono">
                <p>💡 <span className="text-white font-bold">100% Automated Paystack Settlement:</span> 99% of member fees transfer instantly to your gym bank account. Zero manual invoicing.</p>
              </div>
            </div>

            {/* Calculated Breakdown Cards */}
            <div className="reveal-right lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-[#14141a] border border-white/[0.08] shadow-xl space-y-2">
                <span className="text-[11px] text-gray-400 font-mono font-bold uppercase">Estimated Gross Monthly Revenue</span>
                <p className="text-3xl sm:text-4xl font-black text-white font-heading">
                  ₦{grossMonthly.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Collected from {memberVolume} paying members every month</p>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-xl space-y-2">
                <span className="text-[11px] text-emerald-400 font-mono font-bold uppercase">Your Gym Net Revenue (99%)</span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-heading">
                  ₦{gymNetPayout.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-400/80">Direct instant deposit into your registered bank account</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#121217] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">FitFarmHQ Platform Split (1%):</span>
                <span className="font-bold text-orange-400 text-sm">₦{saasSplit1Pct.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider relative z-10" />

      {/* 7. INTERACTIVE CAPABILITIES PREVIEW TABS */}
      <section id="features" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="reveal-up text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 font-mono">
              Engineered for Enterprise
            </h2>
            <p className="reveal-up delay-100 text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
              Explore Powerful{' '}
              <span className="text-gradient-animated">Platform Capabilities</span>
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { id: 'biometrics', label: '🖐️ Optical Biometrics' },
              { id: 'subscriptions', label: '⚡ Smart Pause/Resume' },
              { id: 'audit', label: '📝 Immutable Audit Logs' },
              { id: 'multitenant', label: '🚀 Isolated Multi-Tenancy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                    : 'bg-[#121217] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display Card */}
          <div className="reveal-scale max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-[#0c0c10] border border-white/[0.08] shadow-2xl gradient-border-glow">
            {activeTab === 'biometrics' && (
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  ● Real-Time Hardware Relay
                </div>
                <h3 className="text-2xl font-bold text-white">Instant Hardware Fingerprint & QR Validation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  When a gym member taps their finger or presents their dynamic encrypted QR code, FitFarmHQ verifies active subscription tier, branch validity, and expiration in under 35ms.
                </p>
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  [HARDWARE-SCAN] Member UID: fc-m-088 | Status: ACTIVE | Access Granted | Latency: 28ms | Gate: Optical SpeedGate 01
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold">
                  ● Automatic Date Shift
                </div>
                <h3 className="text-2xl font-bold text-white">Automated Expiration Extension on Plan Resume</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  When a member pauses their membership (travel, injury, or medical leave), their access pass is instantly locked. Upon resuming, FitFarmHQ calculates the exact paused duration and shifts their expiration date forward.
                </p>
                <div className="p-4 rounded-2xl bg-black/60 border border-orange-500/30 text-orange-400 text-xs font-mono">
                  [PLAN-RESUME] Member: Opetemi Afolabi | Paused Delta: 14 Days | Expiration extended from Dec 01 to Dec 15, 2026
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                  ● Cryptographic Integrity
                </div>
                <h3 className="text-2xl font-bold text-white">Comprehensive Audit Trails with State Diffs</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Every single administrative action is immutably recorded—capturing the staff admin username, affected member name, member UID, previous value/state, and new value.
                </p>
                <div className="p-4 rounded-2xl bg-black/60 border border-gray-700 text-gray-300 text-xs font-mono">
                  [AUDIT-LOG] Admin: Kelechi Sunday | Action: UPDATE_MEMBER | Member: Javier Abiodun (ID: fc-m-012) | Diff: phone: &apos;08011112222&apos; -&gt; &apos;08139291535&apos;
                </div>
              </div>
            )}

            {activeTab === 'multitenant' && (
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                  ● 2-Minute Provisioning
                </div>
                <h3 className="text-2xl font-bold text-white">Dedicated Subdomain, Branding & Portal</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Provision a new gym facility in under 2 minutes. Enter gym name, set primary and accent colors, create admin credentials, and enjoy completely isolated member passes and databases.
                </p>
                <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 text-amber-400 text-xs font-mono">
                  [PROVISION-SUCCESS] Tenant: FitFarmHQ Demo Gym | Subdomain: demo.fitfarmhq.com | Database Schema: Isolated | Color: #fa6a2e
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="section-divider relative z-10" />

      {/* 8. TRANSPARENT PRICING */}
      <section id="pricing" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="reveal-up text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 font-mono">
              Transparent Licensing
            </h2>
            <p className="reveal-up delay-100 text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
              Choose Your Gym{' '}
              <span className="text-gradient-animated">Operating Model</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Option 1: Free Tier */}
            <div className="reveal-left pricing-featured p-8 sm:p-10 rounded-3xl bg-[#0e0e13] relative flex flex-col justify-between shadow-2xl shadow-orange-500/10">
              <span className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-wider font-mono">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">Option 1</span>
                <h3 className="text-3xl font-black text-white mt-1 font-heading">Free Setup Tier</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white font-heading">$0</span>
                  <span className="text-gray-400 text-sm font-mono">upfront cost</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">1% automated transaction split fee via Paystack. Zero monthly subscription.</p>

                <ul className="mt-8 space-y-3.5 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> $0 Upfront Hardware Setup Cost
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Unlimited Members & Staff Accounts
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Automated Paystack 1% Split Payment
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Optical Turnstiles & Biometrics Included
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Full Audit Logs & Smart Pass Engine
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black transition text-sm shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Free in 2 Minutes →
              </button>
            </div>

            {/* Option 2: Annual Enterprise */}
            <div className="reveal-right p-8 sm:p-10 rounded-3xl bg-[#0e0e13] border border-white/[0.08] flex flex-col justify-between hover:border-gray-600 transition-all duration-400">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Option 2</span>
                <h3 className="text-3xl font-black text-white mt-1 font-heading">Annual Enterprise</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white font-heading">$299</span>
                  <span className="text-gray-400 text-sm font-mono">/ year</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">0% transaction split fee. Flat annual license key for high-volume facilities.</p>

                <ul className="mt-8 space-y-3.5 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> 0% Transaction Split Fee
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Unlimited Locations & Branches
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Priority 24/7 Technical Support
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Custom Domain SSL Configuration
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Dedicated Turnstile Hardware Engineer
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="mt-8 w-full py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] font-extrabold transition text-sm hover:border-orange-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Enterprise License →
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider relative z-10" />

      {/* 9. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-28 bg-[#08080c] relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="reveal-up text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 font-mono">
              Got Questions?
            </h2>
            <p className="reveal-up delay-100 text-3xl sm:text-5xl font-heading font-extrabold tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`reveal-up delay-${idx * 100} rounded-2xl bg-[#0e0e13] border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.12]`}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-6 text-left font-bold text-white flex items-center justify-between gap-4"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <span className="text-orange-400 text-2xl font-mono flex-shrink-0">
                    {openFaqIndex === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/[0.06] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider relative z-10" />

      {/* 10. CLOSING HERO CTA */}
      <section className="py-24 relative overflow-hidden z-10">
        {/* Ambient glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="reveal-scale p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-orange-500/15 via-amber-500/[0.06] to-orange-600/10 border border-orange-500/25 backdrop-blur-2xl shadow-2xl gradient-border-glow">
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight">
              Ready to Upgrade Your Gym Operating System?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Launch your gym with a branded portal, automated access control, and clear pricing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black text-base transition shadow-2xl shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started Free in 2 Minutes →
              </button>
              <a
                href={ADMIN_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#121217] hover:bg-[#181820] text-gray-200 border border-white/[0.1] font-bold text-base transition"
              >
                Owner Sign In ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-12 border-t border-white/[0.08] bg-[#050507] text-gray-500 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-sm">
              ⚡
            </div>
            <span className="font-heading font-bold text-white text-sm">FitFarmHQ</span>
            <span>© 2026 FitFarmHQ. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <Link href="/setup" className="hover:text-white transition">Setup Wizard</Link>
            <Link href="/super-admin" className="hover:text-white transition">Super Admin</Link>
            <a href={ADMIN_APP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Admin Console</a>
          </div>
        </div>
      </footer>

      {/* Account Registration & Sign-In Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToSignIn={() => {
          setIsRegisterOpen(false);
          setIsSignInOpen(true);
        }}
      />

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToRegister={() => {
          setIsSignInOpen(false);
          setIsRegisterOpen(true);
        }}
      />
    </div>
  );
}
