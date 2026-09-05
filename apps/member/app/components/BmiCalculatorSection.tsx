'use client';

import React, { useState, useMemo } from 'react';

interface BmiCalculatorSectionProps {
  tenantName?: string;
  onExplorePlans?: () => void;
}

export default function BmiCalculatorSection({
  tenantName = 'PolanFit Arena',
  onExplorePlans,
}: BmiCalculatorSectionProps) {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Metric state
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weightKg, setWeightKg] = useState<number>(75);

  // Imperial state
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);
  const [weightLbs, setWeightLbs] = useState<number>(165);

  // Dynamic BMI Calculation
  const bmiResult = useMemo(() => {
    let bmi = 0;
    if (unitSystem === 'metric') {
      const heightM = heightCm / 100;
      if (heightM > 0) {
        bmi = weightKg / (heightM * heightM);
      }
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      if (totalInches > 0) {
        bmi = (weightLbs / (totalInches * totalInches)) * 703;
      }
    }
    const rounded = parseFloat(bmi.toFixed(1));

    let category = 'Normal';
    let colorClass = 'text-emerald-400';
    let bgBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
    let percentage = 0;
    let advice = 'You are in an optimal healthy weight range. Maintain strength with progressive overload and athletic conditioning.';
    let recommendedTier = 'Monthly All-Access Strength & Cardio';

    if (rounded < 18.5) {
      category = 'Underweight';
      colorClass = 'text-amber-400';
      bgBadge = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      percentage = Math.min(25, (rounded / 18.5) * 25);
      advice = 'Focus on nutrient-dense surplus caloric intake and compound hypertrophy lifting to build lean functional muscle.';
      recommendedTier = 'Hypertrophy & Strength Starter';
    } else if (rounded >= 18.5 && rounded <= 24.9) {
      category = 'Normal / Athletic';
      colorClass = 'text-emerald-400';
      bgBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      percentage = 25 + ((rounded - 18.5) / (24.9 - 18.5)) * 25;
      advice = 'Superb body composition! Focus on conditioning, increasing PR lifts, and explosive functional power.';
      recommendedTier = 'VIP All-Access + Recovery Suite';
    } else if (rounded >= 25 && rounded <= 29.9) {
      category = 'Overweight';
      colorClass = 'text-orange-400';
      bgBadge = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
      percentage = 50 + ((rounded - 25) / (29.9 - 25)) * 25;
      advice = 'A structured calorie deficit combined with high-intensity interval training (HIIT) and resistance sessions will shred fat rapidly.';
      recommendedTier = 'Fat Shred & MetCon Conditioning';
    } else {
      category = 'Obese';
      colorClass = 'text-red-400';
      bgBadge = 'bg-red-500/15 border-red-500/30 text-red-400';
      percentage = Math.min(100, 75 + ((rounded - 30) / 15) * 25);
      advice = 'Start with low-impact cardio, joint-friendly resistance machines, and dedicated coaching to achieve a safe transformation.';
      recommendedTier = '1-on-1 Personal Coaching & Transformation Plan';
    }

    return {
      bmi: rounded || 0,
      category,
      colorClass,
      bgBadge,
      percentage: Math.min(100, Math.max(0, percentage)),
      advice,
      recommendedTier,
    };
  }, [unitSystem, heightCm, weightKg, heightFeet, heightInches, weightLbs]);

  return (
    <section className="w-full py-16 px-6 max-w-6xl mx-auto" id="bmi-calculator">
      <div className="rounded-3xl bg-gradient-to-b from-[#121217] to-[#0a0a0c] border border-gray-800/90 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                  Telemetry & Health Metrics
                </span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Body Mass Index (BMI) Calculator
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Measure your body composition ratio and receive instant personalized training targets for {tenantName}.
              </p>
            </div>

            {/* Unit System Switcher */}
            <div className="flex items-center gap-2 bg-[#070709] p-1.5 rounded-2xl border border-gray-800 w-fit">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  unitSystem === 'metric'
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Metric (cm / kg)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  unitSystem === 'imperial'
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Imperial (ft / lbs)
              </button>
            </div>

            {/* Inputs */}
            {unitSystem === 'metric' ? (
              <div className="space-y-4">
                {/* Height Slider */}
                <div className="space-y-2 bg-[#070709] p-4 rounded-2xl border border-gray-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-300">Height:</span>
                    <span className="font-mono text-orange-400 font-extrabold text-sm">{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>120 cm</span>
                    <span>170 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>

                {/* Weight Slider */}
                <div className="space-y-2 bg-[#070709] p-4 rounded-2xl border border-gray-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-300">Weight:</span>
                    <span className="font-mono text-orange-400 font-extrabold text-sm">{weightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>40 kg</span>
                    <span>100 kg</span>
                    <span>180 kg</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Imperial Height */}
                <div className="grid grid-cols-2 gap-3 bg-[#070709] p-4 rounded-2xl border border-gray-800/80">
                  <div>
                    <label className="text-xs text-gray-400 font-bold block mb-1">Height (Feet)</label>
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="w-full bg-[#121217] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold block mb-1">Height (Inches)</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="w-full bg-[#121217] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Imperial Weight */}
                <div className="space-y-2 bg-[#070709] p-4 rounded-2xl border border-gray-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-300">Weight (Lbs):</span>
                    <span className="font-mono text-orange-400 font-extrabold text-sm">{weightLbs} lbs</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="350"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>90 lbs</span>
                    <span>220 lbs</span>
                    <span>350 lbs</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Telemetry Result Card */}
          <div className="lg:col-span-6 bg-[#070709] border border-gray-800 rounded-3xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                Telemetry Output
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${bmiResult.bgBadge}`}>
                {bmiResult.category}
              </span>
            </div>

            {/* Huge BMI Number */}
            <div className="text-center py-4">
              <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold block mb-1">
                Your Calculated BMI
              </span>
              <div className="text-6xl font-black text-white font-mono tracking-tighter">
                {bmiResult.bmi}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Standard Body Mass Index Score
              </span>
            </div>

            {/* Gauge Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden p-0.5 relative">
                <div className="absolute inset-0 flex">
                  <div className="w-1/4 bg-amber-500/40 border-r border-black/40"></div>
                  <div className="w-1/4 bg-emerald-500/40 border-r border-black/40"></div>
                  <div className="w-1/4 bg-orange-500/40 border-r border-black/40"></div>
                  <div className="w-1/4 bg-red-500/40"></div>
                </div>
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-300 rounded-full transition-all duration-300 relative z-10 shadow-lg shadow-orange-500/50"
                  style={{ width: `${bmiResult.percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span className="text-amber-400">Underweight (&lt;18.5)</span>
                <span className="text-emerald-400">Normal (18.5-24.9)</span>
                <span className="text-orange-400">Overweight (25-29.9)</span>
                <span className="text-red-400">Obese (30+)</span>
              </div>
            </div>

            {/* Advice Box */}
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-gray-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span>💡</span>
                <span>Coaching Recommendation</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {bmiResult.advice}
              </p>
              <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Best Matching Plan:</span>
                <span className="text-orange-400 font-bold">{bmiResult.recommendedTier}</span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => {
                if (onExplorePlans) {
                  onExplorePlans();
                } else {
                  const plansEl = document.getElementById('plans');
                  if (plansEl) plansEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <span>Explore Matching Membership Plans</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
