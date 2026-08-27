'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([
    { id: 1, name: 'Gabriel O.', email: 'gabriel@polanfit.com', role: 'owner', status: 'active' },
    { id: 2, name: 'Kelechi O.', email: 'kelechi@gmail.com', role: 'admin', status: 'active' },
    { id: 3, name: 'Sarah P.', email: 'sarah@gmail.com', role: 'receptionist', status: 'active' },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('receptionist');

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newStaff = {
      id: Date.now(),
      name,
      email,
      role,
      status: 'active',
    };

    setStaff([...staff, newStaff]);
    setIsInviteModalOpen(false);
    setName('');
    setEmail('');
    alert(`🎉 Staff invitation sent to ${email} with role '${role}'.`);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Staff & Admin Management" subtitle="Manage gym administrators, receptionists, trainers, and role access permissions" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Gym Staff Team</h2>
              <p className="text-xs text-gray-400">Team members with login access to this gym's admin console.</p>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
            >
              + Invite Staff Member
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{member.name}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{member.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold uppercase">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-xl font-extrabold mb-4">Invite Staff Member</h3>

            <form onSubmit={handleInviteStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Staff Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="staff@gym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Role Assignment</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                >
                  <option value="receptionist">Receptionist (Check-in Kiosk & Members)</option>
                  <option value="admin">Gym Administrator (Full Access)</option>
                  <option value="trainer">Trainer (Member Health & Schedules)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 font-extrabold text-black text-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
