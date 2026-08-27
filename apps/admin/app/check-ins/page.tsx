'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function CheckInLogsPage() {
  const [logs, setLogs] = useState<any[]>([
    { id: 1, memberName: 'Gabriel O.', planName: 'Starter Monthly', checkInTime: '2026-08-27 10:45 AM', method: 'Fingerprint', gate: 'Main Entrance Gate A' },
    { id: 2, memberName: 'Kelechi O.', planName: 'VIP Quarterly', checkInTime: '2026-08-27 09:30 AM', method: 'QR Code', gate: 'Main Entrance Gate A' },
    { id: 3, memberName: 'David A.', planName: 'Day Pass', checkInTime: '2026-08-27 08:15 AM', method: 'Manual Staff Override', gate: 'Front Desk Counter' },
    { id: 4, memberName: 'Sarah P.', planName: 'Annual All-Access', checkInTime: '2026-08-26 06:40 PM', method: 'Fingerprint', gate: 'Main Entrance Gate B' },
  ]);

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Attendance Logs" subtitle="Historical record of member entrance check-ins, entrance gates, and verification methods" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Member Check-In History</h2>
                <p className="text-xs text-gray-400">All entrance scans and receptionist manual check-in overrides.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Check-In Timestamp</th>
                    <th className="py-3 px-4">Scan Method</th>
                    <th className="py-3 px-4">Entrance Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{log.memberName}</td>
                      <td className="py-3.5 px-4 font-semibold text-orange-400">{log.planName}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{log.checkInTime}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                          {log.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{log.gate}</td>
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
