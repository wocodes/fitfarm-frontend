'use client';

import React, { useState } from 'react';

interface PlanPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans?: any[];
}

export default function PlanPurchaseModal({ isOpen, onClose, plans }: PlanPurchaseModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const defaultPlans = [
    { id: 1, name: 'Starter Monthly', price: 25000, duration: '30 Days', desc: 'Full gym access & locker room' },
    { id: 2, name: 'VIP Quarterly', price: 65000, duration: '90 Days', desc: 'Gym access, personal trainer consult & sauna' },
    { id: 3, name: 'Annual All-Access', price: 220000, duration: '365 Days', desc: 'Unlimited 365-day access & VIP amenities' },
  ];

  const activePlans = plans && plans.length > 0 ? plans : defaultPlans;

  const handlePaystackCheckout = () => {
    if (!selectedPlanId) return;
    setLoading(true);

    const chosen = activePlans.find((p) => p.id === selectedPlanId);

    setTimeout(() => {
      setLoading(false);
      onClose();
      alert(`💳 Paystack Gateway Initialized!\n\nPlan: ${chosen?.name}\nAmount: ₦${chosen?.price.toLocaleString()}\n\nProceeding to Paystack secure checkout page...`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
        >
          ✕
        </button>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Online Membership Renewal</span>
          <h3 className="text-2xl font-extrabold text-white">Select Membership Plan</h3>
          <p className="text-xs text-gray-400 mt-1">Pay instantly via Paystack card, bank transfer, or USSD.</p>
        </div>

        <div className="space-y-3">
          {activePlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-[#070709] border-gray-800 hover:border-gray-700 text-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white">{plan.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-orange-400">
                      {plan.duration || `${plan.duration_days} Days`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{plan.desc || plan.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-white">₦{plan.price.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white"
          >
            Cancel
          </button>
          <button
            onClick={handlePaystackCheckout}
            disabled={!selectedPlanId || loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Initializing Paystack...' : 'Pay via Paystack →'}
          </button>
        </div>
      </div>
    </div>
  );
}
