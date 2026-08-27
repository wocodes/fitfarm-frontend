'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function AccountsAuditPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 1,
      action: 'PLAN_EXTENDED',
      performer: 'Gabriel O. (Admin)',
      target: 'Member: Gabriel O.',
      description: "Extended subscription by 30 days until 2026-09-26. Payment of NGN 25,000 recorded via BANK_TRANSFER.",
      timestamp: '2026-08-27 10:50 AM',
    },
    {
      id: 2,
      action: 'PLAN_ASSIGNED',
      performer: 'Gabriel O. (Admin)',
      target: 'Member: Kelechi O.',
      description: "Assigned 'VIP Quarterly' plan for price NGN 65,000.",
      timestamp: '2026-08-26 04:15 PM',
    },
    {
      id: 3,
      action: 'PLAN_PAUSED',
      performer: 'Gabriel O. (Admin)',
      target: 'Member: David A.',
      description: "Paused active subscription upon member request.",
      timestamp: '2026-08-20 09:00 AM',
    },
  ]);

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="System Accounts & Audit Trail" subtitle="Immutable system event history detailing plan pauses, extensions, staff actions, and state changes" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Account Balance Banner */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gym Financial Balance</span>
              <h2 className="text-2xl font-black text-emerald-400 mt-1">₦312,500.00</h2>
              <p className="text-xs text-gray-400 mt-0.5">Total processed member subscriptions and manual transaction receipts.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                ✓ Audit Trail Active & Immutable
              </span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div>
              <h3 className="text-lg font-extrabold">System Audit Logs</h3>
              <p className="text-xs text-gray-400">Recording who performed what action, timestamp, target member, and changed values.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Performer Name</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Event Description</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">{log.action}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{log.performer}</td>
                      <td className="py-3.5 px-4 text-gray-300">{log.target}</td>
                      <td className="py-3.5 px-4 text-gray-300 max-w-md">{log.description}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">{log.timestamp}</td>
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
