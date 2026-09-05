'use client';

import React, { useState } from 'react';

interface FaqLocationSectionProps {
  tenantName?: string;
  faqs?: { q: string; a: string }[];
  contactSocials?: any;
}

const DEFAULT_FAQS = [
  {
    q: 'Do I need a physical keycard or RFID fob?',
    a: 'No! Your digital entrance pass with an encrypted high-contrast QR barcode is saved directly on your phone. You can also register your biometric fingerprint at the front desk for instant contactless entry.',
  },
  {
    q: 'How do I renew or upgrade my membership plan?',
    a: 'Simply click "Renew / Upgrade Online" on your dashboard or select any plan on this page. Payments are verified instantly via Paystack (card, bank transfer, USSD) and your turnstile access extends immediately.',
  },
  {
    q: 'Can I pause or freeze my membership if I travel?',
    a: 'Yes, Quarterly and Annual members can pause their subscription for up to 30 days per year. Just notify our front desk team or contact support.',
  },
  {
    q: 'Are boxing and golf simulator facilities included in standard memberships?',
    a: 'Standard memberships cover unlimited gym floor, strength, and cardio access. Boxing group classes, 1-on-1 sparring, and our TrackMan golf simulator suite can be added directly under the Extras & Amenities tab.',
  },
];

export default function FaqLocationSection({
  tenantName = 'PolanFit Arena',
  faqs,
  contactSocials,
}: FaqLocationSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const displayFaqs = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <div className="w-full py-16 px-6 max-w-6xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Accordion */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Everything you need to know about gate passes, billing, and gym rules.
            </p>
          </div>

          <div className="space-y-3">
            {displayFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0f0f13] border border-gray-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:text-orange-400 transition"
                  >
                    <span>{faq.q}</span>
                    <span className="text-sm font-mono text-orange-400 ml-2">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Front Desk & Support Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0f0f13] border border-gray-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl">
              🏢
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Front Desk Support
              </span>
              <h3 className="text-base font-extrabold text-white">{tenantName}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800/80 space-y-2.5 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Operating Hours:</span>
              <span className="font-mono text-white">
                {contactSocials?.hours_weekday || '06:00 AM – 10:00 PM'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Turnstile Inquiries:</span>
              <span className="text-emerald-400 font-bold">Fast-Track Live</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Locker & Towel Service:</span>
              <span className="text-white">Included in VIP</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href={contactSocials?.social_wa || 'https://wa.me/?text=Hello%20PolanFit%20Gym%20Desk,%20I%20have%20an%20inquiry%20about%20memberships.'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>💬</span>
              <span>Chat with Front Desk on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
