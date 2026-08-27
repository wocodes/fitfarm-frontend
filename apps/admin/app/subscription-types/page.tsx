'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<any[]>([
    { id: 1, name: 'Day Pass', price: 2500, duration_days: 1, description: 'Single day workout access', is_active: true },
    { id: 2, name: 'Starter Monthly', price: 25000, duration_days: 30, description: 'Full access to gym equipment & lockers', is_active: true },
    { id: 3, name: 'VIP Quarterly', price: 65000, duration_days: 90, description: 'Gym access, personal trainer consult & sauna', is_active: true },
    { id: 4, name: 'Annual All-Access', price: 220000, duration_days: 365, description: 'Unlimited 365-day access & VIP amenities', is_active: true },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [description, setDescription] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const newPlan = {
      id: Date.now(),
      name,
      price: parseFloat(price),
      duration_days: parseInt(durationDays),
      description,
      is_active: true,
    };

    setPlans([newPlan, ...plans]);
    setIsAddModalOpen(false);
    setName('');
    setPrice('');
    setDescription('');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Membership Pricing Plans" subtitle="Manage gym membership tiers, prices, and plan durations" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Active Gym Plans</h2>
              <p className="text-xs text-gray-400">Members can subscribe or extend using these plan structures.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <span>+ Create Membership Plan</span>
            </button>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between hover:border-orange-500/50 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {plan.duration_days} Days
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white mt-4">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{plan.description || 'Standard gym plan'}</p>

                  <div className="mt-6 pt-4 border-t border-gray-800/80">
                    <span className="text-2xl font-black text-white">₦{plan.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400"> / {plan.duration_days} days</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold text-xs text-white transition">
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-xl font-extrabold mb-4">Create Membership Plan</h3>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Monthly Access"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Price (NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Include perks, locker access, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-extrabold text-black"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
