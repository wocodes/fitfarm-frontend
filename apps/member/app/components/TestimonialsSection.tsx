'use client';

import React from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  achievement: string;
  comment: string;
  duration: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Alexander Cole',
    role: 'VIP Annual Member',
    avatar: '/images/testimonial/1.webp',
    rating: 5,
    achievement: '🔥 Lost 14kg & Built 5kg Muscle',
    comment:
      'The speed of the access gates is insane. Having my pass right on my phone with zero plastic cards or delays makes training at 6 AM completely frictionless. The coaching here is genuinely elite.',
    duration: 'Member for 14 Months',
  },
  {
    id: '2',
    name: 'Sophia Laurent',
    role: 'Strength & Conditioning Member',
    avatar: '/images/testimonial/2.webp',
    rating: 5,
    achievement: '🏋️ Deadlift PR: 70kg → 145kg',
    comment:
      'I was intimidated by free weights until Coach Marcus walked me through barbell mechanics. The atmosphere is supportive and motivating. Best gym in town by a mile.',
    duration: 'Member for 9 Months',
  },
  {
    id: '3',
    name: 'Michael Henderson',
    role: 'Combat & HIIT Enthusiast',
    avatar: '/images/testimonial/3.webp',
    rating: 5,
    achievement: '⚡ 180 Workouts Logged Streak',
    comment:
      'From the boxing ring to the ice recovery plunge, every corner of this facility is world class. The live portal attendance stats and timer keep me accountable every day.',
    duration: 'Member for 2 Years',
  },
  {
    id: '4',
    name: 'Amara Obi',
    role: 'Functional & Yoga Member',
    avatar: '/images/testimonial/4.webp',
    rating: 5,
    achievement: '🧘 Cured Lower Back Stiffness',
    comment:
      'The combination of intense morning HIIT followed by Elena’s recovery yoga completely healed my posture. Renewing online takes 5 seconds flat.',
    duration: 'Member for 7 Months',
  },
];

interface TestimonialsSectionProps {
  tenantName?: string;
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({
  tenantName = 'Your Gym',
  testimonials,
}: TestimonialsSectionProps) {
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : TESTIMONIALS;

  return (
    <section className="w-full py-16 px-6 max-w-6xl mx-auto space-y-12" id="reviews">
      {/* Top Trust Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-[#0e0e12] border border-gray-800/80">
        <div className="text-center space-y-0.5">
          <span className="text-3xl font-black text-white font-mono tracking-tight">4.9 / 5</span>
          <div className="flex justify-center text-orange-400 text-xs gap-0.5">
            {'★'.repeat(5)}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Verified Member Rating</p>
        </div>

        <div className="text-center space-y-0.5 border-l border-gray-800">
          <span className="text-3xl font-black text-orange-400 font-mono tracking-tight">1,200+</span>
          <p className="text-xs font-bold text-gray-200">Active Access Gate Taps</p>
          <p className="text-[11px] text-gray-400 font-medium">Monthly Visits</p>
        </div>

        <div className="text-center space-y-0.5 border-l border-gray-800">
          <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">98.4%</span>
          <p className="text-xs font-bold text-gray-200">Retention Rate</p>
          <p className="text-[11px] text-gray-400 font-medium">Consistently Active</p>
        </div>

        <div className="text-center space-y-0.5 border-l border-gray-800">
          <span className="text-3xl font-black text-white font-mono tracking-tight">100%</span>
          <p className="text-xs font-bold text-gray-200">Digital Gate Passes</p>
          <p className="text-[11px] text-gray-400 font-medium">Zero Lost RFID Cards</p>
        </div>
      </div>

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
            Real Transformations
          </span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
          Loved by High-Performing Members
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          See how our community uses {tenantName} to build strength, smash personal records, and achieve long-term vitality.
        </p>
      </div>

      {/* Testimonials 4-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayTestimonials.map((t) => (
          <div
            key={t.id}
            className="group rounded-3xl bg-[#0e0e12] border border-gray-800/80 hover:border-orange-500/40 p-6 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-orange-500/5 relative overflow-hidden"
          >
            {/* Header: Member Info & Rating */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition">
                      {t.name}
                    </h3>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full font-bold">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{t.duration}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex text-orange-400 text-xs tracking-tight">
                {'★'.repeat(t.rating)}
              </div>
            </div>

            {/* Achievement Tag */}
            <div>
              <span className="px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs font-extrabold inline-block">
                {t.achievement}
              </span>
            </div>

            {/* Quote Body */}
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{t.comment}"
            </p>

            {/* Bottom Subtle Bar */}
            <div className="pt-2 border-t border-gray-800/50 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <span>{tenantName} Community</span>
              <span>Encrypted Gate Telemetry</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
