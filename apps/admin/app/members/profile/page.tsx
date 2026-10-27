'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MemberProfileContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid') || searchParams.get('id') || 'fc-m-001';

  const member = {
    uuid: uid,
    firstName: 'John',
    lastName: 'Oshoname',
    formattedName: 'John D.',
    email: 'kelechi@gmail.com',
    phone: '+234 801 234 5678',
    gender: 'Male',
    dateOfBirth: '1995-06-15',
    status: 'active',
    planName: 'Monthly Standard Subscription',
    planExpiresAt: '2026-09-15',
    bloodGroup: 'O+',
    genotype: 'AA',
    emergencyContactName: 'John Doe',
    emergencyContactPhone: '+234 809 999 8888',
    totalCheckIns: 18,
    totalPoints: 180,
    checkInHistory: [
      { id: 1, date: '2026-08-25 10:45 AM', method: 'QR Code Access Gate' },
      { id: 2, date: '2026-08-24 09:15 AM', method: 'Fingerprint Scanner' },
      { id: 3, date: '2026-08-22 08:30 AM', method: 'Manual Front Desk' },
      { id: 4, date: '2026-08-20 11:00 AM', method: 'Geofence Auto-Entry' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#18181b]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/members" className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg">
            FC
          </Link>
          <div>
            <h1 className="font-bold text-white leading-tight text-base">Member Profile</h1>
            <span className="text-xs text-orange-400 font-mono">UUID: {member.uuid}</span>
          </div>
        </div>

        <Link href="/members" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl transition">
          ← Back to Members Directory
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-8">
        {/* Member Profile Banner */}
        <div className="p-6 rounded-3xl bg-[#18181b] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl font-extrabold text-black shadow-xl shadow-orange-500/20">
              {member.firstName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white">{member.firstName} {member.lastName}</h2>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase">
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Display Privacy Format: <span className="text-orange-400 font-bold">{member.formattedName}</span></p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-300">
                <span>📧 {member.email}</span>
                <span>📞 {member.phone}</span>
                <span>👤 {member.gender}</span>
              </div>
            </div>
          </div>

          {/* Member QR Code Badge */}
          <div className="p-4 rounded-2xl bg-[#0f0f11] border border-gray-800 text-center space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Access QR Code</span>
            <div className="w-24 h-24 bg-white text-black rounded-xl mx-auto flex items-center justify-center font-mono font-bold text-[10px] p-2">
              [{member.uuid}]
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Info Card */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Subscription</h3>
            <div className="text-xl font-bold text-orange-400">{member.planName}</div>
            <div className="text-xs text-gray-400">Expiration Date: <span className="text-white font-semibold">{member.planExpiresAt}</span></div>
            <div className="pt-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold block text-center">
                Valid Active Membership
              </span>
            </div>
          </div>

          {/* Gamification Points */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Challenge Points</h3>
            <div className="text-3xl font-extrabold text-green-400">{member.totalPoints} pts</div>
            <div className="text-xs text-gray-400">Total Verified Check-ins: <span className="text-white font-bold">{member.totalCheckIns}</span></div>
            <div className="pt-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-semibold block text-center">
                🏆 September Leaderboard #1 Rank
              </span>
            </div>
          </div>

          {/* Health & HMO Profile */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Medical & HMO Profile</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0f0f11] border border-gray-800">
                <span className="text-gray-500 block">Blood Group</span>
                <span className="font-bold text-white text-sm">{member.bloodGroup}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0f0f11] border border-gray-800">
                <span className="text-gray-500 block">Genotype</span>
                <span className="font-bold text-white text-sm">{member.genotype}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 pt-1">
              Emergency Contact: <span className="text-white font-semibold">{member.emergencyContactName}</span> ({member.emergencyContactPhone})
            </div>
          </div>
        </div>

        {/* Check-in History */}
        <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white">Recent Attendance Logs</h3>
          <div className="divide-y divide-gray-800/60">
            {member.checkInHistory.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="font-semibold text-gray-200">{log.date}</div>
                <span className="px-3 py-1 rounded-full bg-gray-800 text-orange-400 font-medium">
                  {log.method}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MemberProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f11] text-white p-10">Loading profile...</div>}>
      <MemberProfileContent />
    </Suspense>
  );
}
