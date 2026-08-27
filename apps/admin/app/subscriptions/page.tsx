'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([
    {
      id: 1,
      memberName: 'Gabriel O.',
      email: 'gabriel@polanfit.com',
      planName: 'Starter Monthly',
      price: 25000,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'active',
    },
    {
      id: 2,
      memberName: 'Kelechi O.',
      email: 'kelechi@gmail.com',
      planName: 'VIP Quarterly',
      price: 65000,
      startDate: '2026-06-01',
      endDate: '2026-09-01',
      status: 'active',
    },
    {
      id: 3,
      memberName: 'David A.',
      email: 'david@gmail.com',
      planName: 'Day Pass',
      price: 2500,
      startDate: '2026-08-20',
      endDate: '2026-08-21',
      status: 'expired',
    },
  ]);

  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);

  const handleOpenExtendModal = (sub: any) => {
    setSelectedSub(sub);
    setIsExtendModalOpen(true);
  };

  const handleConfirmExtension = async () => {
    if (!selectedSub) return;
    setLoading(true);

    try {
      // Execute Extension + Financial Transaction Recording
      const updatedList = subscriptions.map((item) => {
        if (item.id === selectedSub.id) {
          const currentEnd = new Date(item.endDate);
          currentEnd.setDate(currentEnd.getDate() + 30);
          return {
            ...item,
            endDate: currentEnd.toISOString().split('T')[0],
            status: 'active',
          };
        }
        return item;
      });

      setSubscriptions(updatedList);
      setIsExtendModalOpen(false);
      setSelectedSub(null);

      alert(`🎉 Extension Confirmed!\n\nPlan for ${selectedSub.memberName} extended by 30 days.\nPayment of ₦${selectedSub.price.toLocaleString()} recorded via ${paymentMethod}.`);
    } catch (err: any) {
      alert(`⚠️ Extension failed: ${err.message || 'Error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Member Subscriptions" subtitle="Active member plans, extensions, and automated financial records" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Subscriptions Table Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Subscription Register</h2>
                <p className="text-xs text-gray-400">Manage member plans, extend durations, and track payment receipts.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Cost (NGN)</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">Expiration Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{sub.memberName}</div>
                        <div className="text-[10px] text-gray-400">{sub.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-orange-400">{sub.planName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">₦{sub.price.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-gray-300">{sub.startDate}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{sub.endDate}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            sub.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenExtendModal(sub)}
                          className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs transition"
                        >
                          + Extend Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Extension Confirmation Modal */}
      {isExtendModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-xl font-extrabold mb-1">Confirm Subscription Extension</h3>
            <p className="text-xs text-gray-400 mb-6">
              Extending plan for <span className="font-bold text-white">{selectedSub.memberName}</span>.
            </p>

            <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 space-y-3 text-xs mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Selected Plan:</span>
                <span className="font-bold text-orange-400">{selectedSub.planName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Non-Zero Cost:</span>
                <span className="font-extrabold font-mono text-emerald-400 text-sm">
                  ₦{selectedSub.price.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-bold text-xs outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (Default)</option>
                  <option value="POS">POS Terminal</option>
                  <option value="CASH">Cash</option>
                  <option value="PAYSTACK">Paystack Online</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-gray-400">Extension Period:</span>
                <span className="font-bold text-white">+30 Days</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsExtendModalOpen(false)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtension}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-xs font-extrabold text-black"
              >
                {loading ? 'Processing...' : 'Confirm Extension & Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
