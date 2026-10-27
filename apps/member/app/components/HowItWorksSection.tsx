'use client';

import React from 'react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Plan',
      desc: 'Pick a registration tier, training pack, or day pass. Secure checkout with debit card, USSD, or bank transfer.',
      icon: '💳',
      badge: 'Step 1',
    },
    {
      num: '02',
      title: 'Get Digital Gate Pass',
      desc: 'Your dynamic turnstile QR pass is generated immediately in your member wallet. No plastic cards needed.',
      icon: '📱',
      badge: 'Step 2',
    },
    {
      num: '03',
      title: 'Scan Turnstile & Train',
      desc: 'Hold your pass to the optical scanner or touch the biometric reader. Gates unlock in 0.3s as your workout timer starts.',
      icon: '⚡',
      badge: 'Step 3',
    },
  ];

  return (
    <div className="w-full py-16 px-6 max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
          Seamless Experience
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">
          How Fast-Track Gate Access Works
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          From online sign-up to your first rep in under 60 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 hover:border-orange-500/40 transition relative space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                {step.icon}
              </span>
              <span className="font-mono text-2xl font-black text-gray-700 group-hover:text-orange-500/40 transition">
                {step.num}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono">
                {step.badge}
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1 group-hover:text-orange-400 transition">
                {step.title}
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
