'use client';

import React, { useState } from 'react';

interface Trainer {
  id: string;
  name: string;
  title: string;
  image: string;
  certifications: string[];
  experience: string;
  transformations: string;
  specialties: string[];
  quote: string;
}

const TRAINERS: Trainer[] = [
  {
    id: 't1',
    name: 'Marcus Vance',
    title: 'Head Strength & Conditioning',
    image: '/images/team/1.webp',
    certifications: ['CSCS Certified', 'USAW Level 2', 'EXOS Specialist'],
    experience: '11+ Years Experience',
    transformations: '420+ Member Transformations',
    specialties: ['Hypertrophy', 'Olympic Barbell', 'Powerlifting PRs'],
    quote: 'Discipline and mechanical efficiency beat random intensity every single time.',
  },
  {
    id: 't2',
    name: 'Elena Rostova',
    title: 'Olympic Lifting & Biomechanics',
    image: '/images/team/2.webp',
    certifications: ['NASM-CES', 'FMS Level 2', 'B.Sc Exercise Science'],
    experience: '8+ Years Experience',
    transformations: '310+ Member Transformations',
    specialties: ['Spine & Hip Mobility', 'Postural Restoration', 'Kettlebell Lab'],
    quote: 'True power comes from joints that move freely without pain or restriction.',
  },
  {
    id: 't3',
    name: 'David Chen',
    title: 'Head Combat & Sparring Coach',
    image: '/images/team/3.webp',
    certifications: ['Golden Gloves Boxing', 'Muay Thai Kru', 'ISSA Elite'],
    experience: '12+ Years Experience',
    transformations: '260+ Ring & Fighter Clients',
    specialties: ['Striking Power', 'Footwork Mechanics', 'Metabolic Endurance'],
    quote: 'You do not rise to the occasion; you sink to the level of your daily training.',
  },
  {
    id: 't4',
    name: 'Sarah Jenkins',
    title: 'Functional Conditioning & Nutrition',
    image: '/images/team/4.webp',
    certifications: ['Precision Nutrition L2', 'ACE-CPT', 'CrossFit L2'],
    experience: '7+ Years Experience',
    transformations: '390+ Member Transformations',
    specialties: ['Fat Loss Protocols', 'MetCon Circuitry', 'Competition Prep'],
    quote: 'Fuel your body like the elite machine you expect it to perform as.',
  },
];

interface TrainersShowcaseSectionProps {
  tenantName?: string;
  trainers?: Trainer[];
  onBookTrainer?: (trainerName: string) => void;
}

export default function TrainersShowcaseSection({
  tenantName = 'Your Gym',
  trainers,
  onBookTrainer,
}: TrainersShowcaseSectionProps) {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const displayTrainers = trainers && trainers.length > 0 ? trainers : TRAINERS;

  const handleConsult = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    if (onBookTrainer) {
      onBookTrainer(trainer.name);
    } else {
      // Default to WhatsApp inquiry for this specific coach
      const msg = encodeURIComponent(`Hello ${tenantName} Front Desk, I would like to book a 1-on-1 personal training consultation with coach ${trainer.name}.`);
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  return (
    <section className="w-full py-16 px-6 max-w-6xl mx-auto space-y-10" id="coaches">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
            Elite Coaching Staff
          </span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
          Train With Certified Master Coaches
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Our world-class coaches combine clinical biomechanics, sports science, and relentless motivation to help you achieve your personal best.
        </p>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayTrainers.map((trainer) => (
          <div
            key={trainer.id}
            className="group rounded-3xl bg-[#0e0e12] border border-gray-800/80 hover:border-orange-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-orange-500/10"
          >
            {/* Portrait Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-900">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-black/30"></div>

              {/* Top Experience Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-orange-400">
                  {trainer.experience}
                </span>
              </div>

              {/* Bottom Details Over Image */}
              <div className="absolute bottom-3 inset-x-4">
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  {trainer.name}
                </h3>
                <p className="text-xs font-semibold text-orange-400">
                  {trainer.title}
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                {/* Certifications Tags */}
                <div className="flex flex-wrap gap-1">
                  {trainer.certifications.slice(0, 2).map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-gray-800/80 text-[10px] font-bold text-gray-300 border border-gray-700/60"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                {/* Specialties */}
                <div className="text-[11px] text-gray-400 space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 font-bold block">
                    Specialties:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.specialties.map((spec, idx) => (
                      <span key={idx} className="text-gray-300 font-medium text-[10px] bg-[#14141a] px-2 py-0.5 rounded-md">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <p className="text-[11px] text-gray-400 italic border-l-2 border-orange-500/50 pl-2 leading-relaxed pt-1">
                  "{trainer.quote}"
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-2 border-t border-gray-800/60">
                <button
                  onClick={() => handleConsult(trainer)}
                  className="w-full py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black font-extrabold text-xs transition border border-orange-500/30 flex items-center justify-center gap-1.5"
                >
                  <span>Book 1-on-1 Session</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
