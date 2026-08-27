'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RegisterModal from './components/RegisterModal';
import SignInModal from './components/SignInModal';

export default function FitCloudLandingPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'biometrics' | 'subscriptions' | 'audit' | 'multitenant'>('biometrics');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the hardware fingerprint scanning work?',
      a: 'FitCloud integrates directly with USB and IP-networked biometric fingerprint scanners. When a member scans their finger at the gym entrance, FitCloud validates their active plan, expiration date, and remaining sessions in under 50ms before triggering turnstiles or access gates.'
    },
    {
      q: 'What is the difference between the Free Tier and Annual Plan?',
      a: 'The Free Tier has $0 upfront setup fee and $0 monthly cost—FitCloud automatically splits 1% on incoming member Paystack transactions. The Annual Plan is a flat $299/year license key with 0% transaction splitting fee.'
    },
    {
      q: 'Can I customize the portal with my gym logo and theme colors?',
      a: 'Yes! Every gym tenant gets a dedicated admin dashboard and public member portal with custom branding, logo uploads, primary/accent colors, and custom subdomain (e.g. yourgym.fitcloud.io).'
    },
    {
      q: 'Does FitCloud track audit logs when plans are paused or updated?',
      a: 'Absolutely. FitCloud maintains an immutable audit log detailing every member plan pause, unpause, profile update, transaction approval, and staff activity—recording previous vs new states, admin names, and timestamps.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-orange-500 selection:text-black">
      {/* 1. Header & Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0a0c]/80 border-b border-gray-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Version Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-xl text-black shadow-lg shadow-orange-500/25">
              FC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  FitCloud
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  SaaS v2.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Gym Management System</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-orange-400 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-orange-400 transition-colors">Why FitCloud</a>
            <a href="#hardware" className="hover:text-orange-400 transition-colors">Hardware</a>
            <a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-orange-400 transition-colors">FAQs</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSignInOpen(true)}
              className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="text-xs sm:text-sm font-bold text-black px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold mb-8 animate-pulse">
            <span>🖐️ Biometric Scan & Multi-Tenant Gym Operating System</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto">
            The Intelligent Cloud Platform for <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">Modern Fitness Centers</span>
          </h1>

          {/* Hero Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Automate member hardware check-ins, membership renewals, subscription pause/resume controls, and Paystack revenue splitting—all from one unified, branded dashboard.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-base transition shadow-xl shadow-orange-500/25 transform hover:-translate-y-0.5"
            >
              Start Free Setup Now →
            </button>
            <Link
              href="/setup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 hover:border-gray-700 font-bold text-base transition flex items-center justify-center gap-2"
            >
              <span>⚡ Live Setup Wizard</span>
            </Link>
          </div>

          {/* 3. Live Glassmorphic Dashboard Interactive Preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-gray-800/60 to-gray-900/90 border border-gray-700/60 shadow-2xl backdrop-blur-2xl">
              <div className="rounded-2xl bg-[#0f0f13] border border-gray-800 p-4 sm:p-6 text-left">
                {/* Mock Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs font-mono text-gray-400">polanfit.fitcloud.io/admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold text-emerald-400">Hardware Terminal Connected</span>
                  </div>
                </div>

                {/* Key Metrics Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
                    <span className="text-xs text-gray-400 font-medium">Active Members</span>
                    <p className="text-2xl font-black text-white mt-1">1,482</p>
                    <span className="text-[10px] text-emerald-400 font-bold">+12% this month</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
                    <span className="text-xs text-gray-400 font-medium">Monthly Revenue</span>
                    <p className="text-2xl font-black text-white mt-1">₦4,850,000</p>
                    <span className="text-[10px] text-orange-400 font-bold">100% Split Verified</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
                    <span className="text-xs text-gray-400 font-medium">Today's Check-ins</span>
                    <p className="text-2xl font-black text-white mt-1">349</p>
                    <span className="text-[10px] text-emerald-400 font-bold">98% Hardware Scans</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
                    <span className="text-xs text-gray-400 font-medium">Scan Latency</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">42 ms</p>
                    <span className="text-[10px] text-gray-400">Ultra-fast response</span>
                  </div>
                </div>

                {/* Live Biometric Check-In Feed Preview */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Check-In Terminal Feed</span>
                    <span className="text-[11px] text-orange-400 font-mono">Auto-refreshed</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#141419] border border-gray-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-base">🖐️</span>
                        <div>
                          <p className="font-bold text-white">Emmanuel Chinazaekpere <span className="text-gray-400 font-normal text-[11px]">(m)</span></p>
                          <p className="text-[10px] text-gray-400">Plan: Monthly Standard • Valid until Nov 2026</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">ACCESS GRANTED</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#141419] border border-gray-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-base">🖐️</span>
                        <div>
                          <p className="font-bold text-white">Opetemi Afolabi <span className="text-gray-400 font-normal text-[11px]">(f)</span></p>
                          <p className="text-[10px] text-gray-400">Plan: Quarterly Gold • Valid until Dec 2026</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">ACCESS GRANTED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stats Counter Bar */}
      <section className="py-12 border-y border-gray-800/80 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-orange-400">99.99%</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Uptime SLA Guarantee</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">&lt;50ms</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Biometric Hardware Response</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-orange-400">100%</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Automated Revenue Split</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">250+</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Fitness Centers Powered</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pros & Key Benefits Section */}
      <section id="benefits" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Why Gym Owners Choose FitCloud</h2>
            <p className="text-3xl sm:text-5xl font-extrabold tracking-tight">Everything You Need to Scale Your Gym Operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit Card 1 */}
            <div className="p-8 rounded-3xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                🖐️
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automated Biometric Scans</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connect physical fingerprint turnstiles directly to your cloud portal. Verify member plans and expiration dates instantly without manual staff intervention.
              </p>
            </div>

            {/* Benefit Card 2 */}
            <div className="p-8 rounded-3xl bg-[#121217] border border-gray-800 hover:border-amber-500/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                🚀
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Custom Subdomains & Theme</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Provide your gym with its own branded subdomain (<code className="text-orange-400">yourgym.fitcloud.io</code>), logo, and primary color palette matching your brand identity.
              </p>
            </div>

            {/* Benefit Card 3 */}
            <div className="p-8 rounded-3xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                💳
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Zero-Upfront Split Payments</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Launch with $0 setup cost. FitCloud automatically splits 1% on incoming member Paystack subscription payments directly to the SaaS platform.
              </p>
            </div>

            {/* Benefit Card 4 */}
            <div className="p-8 rounded-3xl bg-[#121217] border border-gray-800 hover:border-amber-500/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Audit Logs & Plan Tracking</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Track full audit trails for plan pause/resume actions, member profile modifications, and manual payment approvals—complete with member names and previous state values.
              </p>
            </div>

            {/* Benefit Card 5 */}
            <div className="p-8 rounded-3xl bg-[#121217] border border-gray-800 hover:border-orange-500/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                📱
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dedicated Portals</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Tailored web interfaces for Central SaaS Admins, Gym Branch Managers, Desk Receptionists, and Members to view attendance and subscription status.
              </p>
            </div>

            {/* Benefit Card 6 */}
            <div className="p-8 rounded-3xl bg-[#121217] border border-gray-800 hover:border-amber-500/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                🔒
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Role Security</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Granular permission controls for Super Admins, Alpha Admins, and Staff Admins—securing sensitive biometric simulation and administrative features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Feature Showcase Section */}
      <section id="features" className="py-24 bg-gray-950/60 border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Capabilities Preview</h2>
            <p className="text-3xl sm:text-4xl font-extrabold">Explore Powerful Platform Features</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { id: 'biometrics', label: '🖐️ Biometric Scanning' },
              { id: 'subscriptions', label: '⚡ Pause/Resume Control' },
              { id: 'audit', label: '📝 Detailed Audit Logs' },
              { id: 'multitenant', label: '🚀 Multi-Tenant Setup' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                    : 'bg-[#121217] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Display Card */}
          <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-[#121217] border border-gray-800 shadow-2xl">
            {activeTab === 'biometrics' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Instant Hardware Fingerprint Validation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  When a gym member places their finger on the entrance hardware scanner, FitCloud performs an instant lookup, validates plan status (ACTIVE vs PAUSED), verifies expiration dates, and emits turnstile trigger signals in under 50ms.
                </p>
                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  [HARDWARE-SCAN] Member UID: fc-m-088 | Status: ACTIVE | Access Granted | Latency: 38ms
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Automated Date Extension on Plan Resumption</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  When a gym member requests a plan pause (e.g. travel or medical leave), FitCloud freezes their expiration timer. Upon resuming, the system automatically extends their plan expiration date by the exact number of paused days.
                </p>
                <div className="p-4 rounded-2xl bg-black/50 border border-orange-500/30 text-orange-400 text-xs font-mono">
                  [PLAN-RESUME] Member: Opetemi Afolabi | Paused Delta: 14 Days | Expiration extended to Dec 15, 2026
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Complete Audit Logs with Previous & New Values</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Every administrative action is recorded with full accountability—capturing the staff admin username, affected member name, member UID, previous value/state, and new value.
                </p>
                <div className="p-4 rounded-2xl bg-black/50 border border-gray-700 text-gray-300 text-xs font-mono">
                  [AUDIT-LOG] Admin: Kelechi Sunday | Action: UPDATE_MEMBER | Member: Javier Abiodun (ID: fc-m-012) | Diff: phone: '08011112222' -&gt; '08139291535'
                </div>
              </div>
            )}

            {activeTab === 'multitenant' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Automated Gym Provisioning Wizard</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Provision a new gym facility in under 2 minutes. Enter gym name, set primary and accent colors, create admin credentials, and select your pricing tier.
                </p>
                <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 text-amber-400 text-xs font-mono">
                  [PROVISION-SUCCESS] Tenant: PolanFit Gym | Subdomain: polanfit.fitcloud.io | Database Schema: Isolated
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Transparent Pricing</h2>
            <p className="text-3xl sm:text-5xl font-extrabold tracking-tight">Choose Your Operating Model</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Option 1: Free Tier */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#121217] border-2 border-orange-500 relative flex flex-col justify-between shadow-2xl shadow-orange-500/10">
              <span className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-orange-500 text-black font-extrabold text-xs uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Option 1</span>
                <h3 className="text-3xl font-black text-white mt-1">Free Setup Tier</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-gray-400 text-sm">upfront cost</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">1% automated transaction split fee via Paystack.</p>

                <ul className="mt-8 space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> $0 Upfront Hardware Setup Cost
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Unlimited Members & Staff Accounts
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Automated Paystack Split Payment
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Full Audit Log & Biometrics
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black transition text-sm shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5"
              >
                Start Your Full 30-Day Free Trial →
              </button>
            </div>

            {/* Option 2: Annual Enterprise */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#121217] border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Option 2</span>
                <h3 className="text-3xl font-black text-white mt-1">Annual Enterprise</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">$299</span>
                  <span className="text-gray-400 text-sm">/ year</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">0% transaction split fee. Flat annual license key.</p>

                <ul className="mt-8 space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> Zero Transaction Split Fee
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
                </ul>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black transition text-sm shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5"
              >
                Start Your Full 30-Day Free Trial →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section id="faq" className="py-24 bg-gray-950/60 border-t border-gray-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Got Questions?</h2>
            <p className="text-3xl sm:text-4xl font-extrabold">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#121217] border border-gray-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-6 text-left font-bold text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <span className="text-orange-400 text-xl font-mono">{openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-gray-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 border border-orange-500/30 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Ready to Upgrade Your Gym System?</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Join hundreds of modern fitness facilities operating on FitCloud SaaS today.
            </p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="mt-8 px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black text-lg transition shadow-2xl shadow-orange-500/30 transform hover:-translate-y-0.5"
            >
              Get Started Free in 2 Minutes →
            </button>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="py-12 border-t border-gray-800 bg-[#070709] text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-xs">
              FC
            </div>
            <span className="font-bold text-white text-sm">FitCloud SaaS</span>
            <span>© 2026 FitCloud Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <Link href="/setup" className="hover:text-white transition">Setup Wizard</Link>
            <Link href="/super-admin" className="hover:text-white transition">Super Admin</Link>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
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
