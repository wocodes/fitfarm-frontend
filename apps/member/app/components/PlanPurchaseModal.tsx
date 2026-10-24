'use client';

import React, { useState, useEffect } from 'react';
import { memberApiFetch, getMemberToken } from '../lib/api';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface PlanPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans?: any[];
  currentUser?: any;
  initialSelectedPlanId?: number | null;
  onSuccess?: () => void;
  onRequireAuth?: () => void;
}

export default function PlanPurchaseModal({
  isOpen,
  onClose,
  plans,
  currentUser,
  initialSelectedPlanId,
  onSuccess,
  onRequireAuth,
}: PlanPurchaseModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const defaultPlans = [
    { id: 1, name: 'Starter Monthly', price: 25000, duration_days: 30, description: 'Full gym access & locker room' },
    { id: 2, name: 'VIP Quarterly', price: 65000, duration_days: 90, description: 'Gym access, personal trainer consult & sauna' },
    { id: 3, name: 'Annual All-Access', price: 220000, duration_days: 365, description: 'Unlimited 365-day access & VIP amenities' },
  ];

  const activePlans = plans && plans.length > 0 ? plans : defaultPlans;

  useEffect(() => {
    if (initialSelectedPlanId) {
      setSelectedPlanId(initialSelectedPlanId);
    } else if (activePlans.length > 0 && selectedPlanId === null) {
      setSelectedPlanId(activePlans[0].id);
    }
  }, [initialSelectedPlanId, activePlans]);

  // Load Paystack Inline script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!document.getElementById('paystack-inline-js')) {
      const script = document.createElement('script');
      script.id = 'paystack-inline-js';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const chosenPlan = activePlans.find((p) => p.id === selectedPlanId) || activePlans[0];

  const handleCheckout = async () => {
    if (!chosenPlan) return;
    setStatusMsg(null);

    // Check if user is authenticated
    const token = getMemberToken();
    if (!token || !currentUser) {
      if (onRequireAuth) {
        onClose();
        onRequireAuth();
      } else {
        setStatusMsg({ type: 'error', text: 'Please sign in or create an account first to purchase a membership plan.' });
      }
      return;
    }

    setLoading(true);

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey) {
      setStatusMsg({ type: 'error', text: 'Online payments are not configured. Please contact the gym.' });
      setLoading(false);
      return;
    }

    if (!window.PaystackPop) {
      setStatusMsg({ type: 'error', text: 'The payment provider could not be loaded. Please refresh and try again.' });
      setLoading(false);
      return;
    }

    const amountInKobo = Math.round(Number(chosenPlan.price || 0) * 100);
    const reference = 'FCM_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);

    const recordPurchase = async (ref: string) => {
      try {
        const res = await memberApiFetch('/member/plans/purchase', {
          method: 'POST',
          body: JSON.stringify({
            pricing_plan_id: chosenPlan.id,
            payment_reference: ref,
            amount: Number(chosenPlan.price || 0),
            channel: 'paystack',
          }),
        });

        if (res.success) {
          setStatusMsg({ type: 'success', text: `🎉 ${res.message || 'Subscription activated successfully!'}` });
          if (onSuccess) onSuccess();
          setTimeout(() => {
            onClose();
          }, 2500);
        } else {
          setStatusMsg({ type: 'error', text: res.message || 'Could not verify purchase.' });
        }
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.message || 'Error activating plan.' });
      } finally {
        setLoading(false);
      }
    };

    if (window.PaystackPop) {
      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: currentUser.email || 'member@polanfit.com',
          amount: amountInKobo,
          currency: chosenPlan.currency || 'NGN',
          ref: reference,
          metadata: {
            member_id: currentUser.id || currentUser.uuid,
            plan_id: chosenPlan.id,
            plan_name: chosenPlan.name,
          },
          callback: function (response: any) {
            recordPurchase(response.reference || reference);
          },
          onClose: function () {
            setLoading(false);
          },
        });
        handler.openIframe();
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: err?.message || 'Unable to open the payment window.' });
        setLoading(false);
      }
    }
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
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] uppercase font-bold tracking-wider mb-2">
            💳 Instant Online Renewal
          </div>
          <h3 className="text-2xl font-extrabold text-white">Select Membership Plan</h3>
          <p className="text-xs text-gray-400 mt-1">
            Secure checkout via Paystack debit card, bank transfer, or USSD.
          </p>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {activePlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const price = Number(plan.price || plan.subscription_fee || 0);
            const duration = plan.duration_days ? `${plan.duration_days} Days` : plan.duration || '30 Days';

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-[#070709] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-600'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{plan.name}</h4>
                    <p className="text-xs text-gray-400">{plan.description || `${duration} access`}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-white">
                    ₦{price.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-gray-400 font-mono">/ {duration}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-gray-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Total Due Today:</span>
            <span className="font-black text-xl text-white">
              ₦{Number(chosenPlan?.price || 25000).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-sm transition shadow-xl shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>🔒</span>
            <span>{loading ? 'Processing Checkout...' : `Pay ₦${Number(chosenPlan?.price || 25000).toLocaleString()} via Paystack`}</span>
          </button>

          <p className="text-[10px] text-center text-gray-500 font-medium">
            256-bit SSL encrypted • Instant turnstile gate pass activation upon payment
          </p>
        </div>
      </div>
    </div>
  );
}
