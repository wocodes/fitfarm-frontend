'use client';

import React, { useState, useMemo } from 'react';

interface MembershipPlansSectionProps {
  plans: any[];
  currencySymbol?: string;
  onSelectPlan: (planId: number) => void;
}

export default function MembershipPlansSection({
  plans,
  currencySymbol = '₦',
  onSelectPlan,
}: MembershipPlansSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'MEMBERSHIP' | 'TRAINING' | 'EXTRAS'>('MEMBERSHIP');
  const [trainingSubFilter, setTrainingSubFilter] = useState<'ALL' | 'GENERIC' | 'EXCLUSIVE'>('ALL');

  // Categorize plans intelligently
  const categorizedPlans = useMemo(() => {
    const membership: any[] = [];
    const training: any[] = [];
    const extras: any[] = [];

    plans.forEach((plan) => {
      const rawCategory = (plan.category || '').toUpperCase();
      const rawName = (plan.name || '').toUpperCase();

      if (rawName.includes('EXTRAS') || rawCategory.includes('EXTRA')) {
        extras.push(plan);
      } else if (rawCategory === 'GENERIC' || rawCategory === 'EXCLUSIVE' || rawName.includes('GENERIC') || rawName.includes('EXCLUSIVE') || rawName.includes('SESSIONS')) {
        training.push({
          ...plan,
          subCategory: rawCategory === 'EXCLUSIVE' || rawName.includes('EXCLUSIVE') ? 'EXCLUSIVE' : 'GENERIC',
        });
      } else {
        membership.push(plan);
      }
    });

    return { membership, training, extras };
  }, [plans]);

  // Active list based on selected category & subfilter
  const currentList = useMemo(() => {
    if (activeCategory === 'MEMBERSHIP') {
      return categorizedPlans.membership;
    }
    if (activeCategory === 'EXTRAS') {
      return categorizedPlans.extras;
    }
    if (trainingSubFilter === 'ALL') {
      return categorizedPlans.training;
    }
    return categorizedPlans.training.filter((p) => p.subCategory === trainingSubFilter);
  }, [activeCategory, trainingSubFilter, categorizedPlans]);

  return (
    <div id="pricing" className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
          Membership Tiers
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Choose the Perfect Plan for Your Goals
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          Compact, flexible options for access, private training, and specialized fitness amenities.
        </p>
      </div>

      {/* Main Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveCategory('MEMBERSHIP')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeCategory === 'MEMBERSHIP'
              ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
              : 'bg-[#121217] border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
          }`}
        >
          <span>📋</span>
          <span>Registration & Subscriptions</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeCategory === 'MEMBERSHIP' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'
          }`}>
            {categorizedPlans.membership.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('TRAINING')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeCategory === 'TRAINING'
              ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
              : 'bg-[#121217] border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
          }`}
        >
          <span>🏋️</span>
          <span>Training Plans</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeCategory === 'TRAINING' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'
          }`}>
            {categorizedPlans.training.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('EXTRAS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
            activeCategory === 'EXTRAS'
              ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
              : 'bg-[#121217] border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
          }`}
        >
          <span>🥊</span>
          <span>Extras & Amenities</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeCategory === 'EXTRAS' ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'
          }`}>
            {categorizedPlans.extras.length}
          </span>
        </button>
      </div>

      {/* Sub-filter for Training Plans (Generic vs Exclusive) */}
      {activeCategory === 'TRAINING' && (
        <div className="flex items-center justify-center gap-2 pt-1 animate-fadeIn">
          <span className="text-xs text-gray-400 font-semibold mr-1">Filter Training:</span>
          {(['ALL', 'GENERIC', 'EXCLUSIVE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTrainingSubFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                trainingSubFilter === filter
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {filter === 'ALL' ? 'All Sessions' : filter === 'GENERIC' ? 'Generic Training' : 'Exclusive 1-on-1'}
            </button>
          ))}
        </div>
      )}

      {/* Compact Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {currentList.map((plan) => {
          const price = Number(plan.price || 0);
          const duration = plan.duration_days
            ? `${plan.duration_days} Days`
            : plan.duration || '30 Days';

          const isRegistration = (plan.name || '').toUpperCase().includes('REGISTRATION');
          const isMonthly = (plan.name || '').toUpperCase() === 'MONTHLY';
          const isPopular = isMonthly || plan.is_featured;

          // Clean display name
          let displayName = plan.name;
          if (plan.formatted_name) {
            displayName = plan.formatted_name;
          }

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl bg-[#0f0f13] border transition flex flex-col justify-between relative group ${
                isPopular
                  ? 'border-orange-500/80 shadow-xl shadow-orange-500/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black text-[9px] uppercase tracking-wider shadow-md">
                  POPULAR
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono">
                      {plan.category || 'PLAN'}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5 group-hover:text-orange-400 transition">
                      {displayName}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-mono whitespace-nowrap">
                    {duration}
                  </span>
                </div>

                <div className="pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {isRegistration ? 'one-time' : `/${duration.toLowerCase()}`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {plan.description || (
                    isRegistration
                      ? 'One-time biometric fingerprint enrollment & digital turnstile gate access setup.'
                      : `Includes full gym facilities, gate check-in telemetry, and locker access for ${duration}.`
                  )}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-800/80">
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md ${
                    isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-black shadow-orange-500/20'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  <span>Choose Plan</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
