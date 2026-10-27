'use client';

import React from 'react';

const AMENITIES = [
  {
    title: 'Olympic Strength & Free Weights',
    subtitle: 'Rogue power racks, calibrated plates, and dumbbells up to 60kg.',
    tag: 'Strength Zone',
    image: '/images/amenities/l1.webp',
  },
  {
    title: 'Precision Cardio & HIIT Floor',
    subtitle: 'Technogym treadmills, Concept2 rowers, and curved assault bikes.',
    tag: 'Cardio Suite',
    image: '/images/amenities/l2.webp',
  },
  {
    title: 'Boxing Ring & Combat Studio',
    subtitle: 'Competition boxing ring, Aqua heavy bags, and speedball stations.',
    tag: 'Combat Arena',
    image: '/images/amenities/l4.webp',
  },
  {
    title: 'Interactive Golf Simulator',
    subtitle: 'TrackMan optical launch monitors and virtual championship courses.',
    tag: 'Golf Suite',
    image: '/images/amenities/c1.webp',
  },
  {
    title: 'Hydrotherapy Sauna & Recovery',
    subtitle: 'Infrared cedar sauna, high-pressure steam, and rainfall showers.',
    tag: 'Recovery',
    image: '/images/amenities/l3.webp',
  },
  {
    title: 'Contactless Optical Access Gates',
    subtitle: 'Sub-second QR gate scan and fingerprint access with zero check-in lines.',
    tag: 'Fast-Track Entry',
    image: '/images/amenities/c2.webp',
  },
];

interface AmenitiesGridProps {
  items?: any[];
}

export default function AmenitiesGrid({ items }: AmenitiesGridProps) {
  const displayAmenities = items && items.length > 0
    ? items.map((it, idx) => ({
        title: it.title,
        subtitle: it.description || it.subtitle,
        tag: it.category || it.tag || 'Facility',
        image: it.image || `/images/amenities/${(idx % 6) + 1}.webp`,
      }))
    : AMENITIES;

  return (
    <div className="w-full py-16 px-6 max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
          World-Class Infrastructure
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Elite Amenities Built for Peak Performance
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          Engineered for athletes, beginners, and fitness enthusiasts alike.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAmenities.map((item, idx) => (
          <div
            key={item.title}
            className="group relative rounded-2xl overflow-hidden bg-[#0f0f13] border border-gray-800 hover:border-orange-500/50 transition duration-300 flex flex-col justify-end min-h-[280px]"
          >
            {/* Background Image with Zoom on Hover */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/65 to-transparent" />
            </div>

            {/* Content Card */}
            <div className="relative z-10 p-5 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider font-mono">
                {item.tag}
              </span>
              <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition">
                {item.title}
              </h3>
              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
