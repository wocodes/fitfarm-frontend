'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<any[]>([
    {
      id: 1,
      memberName: 'Gabriel O.',
      email: 'gabriel@polanfit.com',
      planName: 'Starter Monthly',
      expiresAt: '2026-08-31',
      daysLeft: 4,
      status: 'expiring_soon',
    },
    {
      id: 2,
      memberName: 'David A.',
      email: 'david@gmail.com',
      planName: 'Day Pass',
      expiresAt: '2026-08-21',
      daysLeft: -6,
      status: 'expired',
    },
  ]);

  const handleRenewNow = (item: any) => {
    alert(`🎉 Renewal Initiated for ${item.memberName}!\nRedirecting to plan extension modal.`);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Membership Renewals" subtitle="Subscriptions expiring within 7 days or requiring immediate renewal" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold">Renewals Queue</h2>
              <p className="text-xs text-gray-400">Track members whose plans are about to expire and renew with one click.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Expiration Date</th>
                    <th className="py-3 px-4">Days Remaining</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {renewals.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{item.memberName}</div>
                        <div className="text-[10px] text-gray-400">{item.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-orange-400">{item.planName}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{item.expiresAt}</td>
                      <td className="py-3.5 px-4 font-bold">
                        {item.daysLeft > 0 ? (
                          <span className="text-amber-400">{item.daysLeft} days left</span>
                        ) : (
                          <span className="text-red-400">Expired {Math.abs(item.daysLeft)} days ago</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.daysLeft > 0
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {item.daysLeft > 0 ? 'Expiring Soon' : 'Expired'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRenewNow(item)}
                          className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-md"
                        >
                          Renew Now →
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
    </div>
  );
}
