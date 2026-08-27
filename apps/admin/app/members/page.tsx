'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MemberDirectoryPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [members, setMembers] = useState([
    {
      id: 1,
      uuid: 'fc-m-001',
      firstName: 'Kelechi',
      lastName: 'Oshoname',
      email: 'kelechi@gmail.com',
      phone: '+234 801 234 5678',
      gender: 'male',
      plan: 'Monthly Standard',
      status: 'active',
      joinedAt: '2026-08-01',
    },
    {
      id: 2,
      uuid: 'fc-m-002',
      firstName: 'Gabriel',
      lastName: 'Omokpoga',
      email: 'gabriel@gmail.com',
      phone: '+234 802 987 6543',
      gender: 'male',
      plan: 'Annual VIP',
      status: 'active',
      joinedAt: '2026-07-15',
    },
    {
      id: 3,
      uuid: 'fc-m-003',
      firstName: 'David',
      lastName: 'Ade',
      email: 'david@gmail.com',
      phone: '+234 803 111 2233',
      gender: 'male',
      plan: 'Day Pass',
      status: 'inactive',
      joinedAt: '2026-08-20',
    },
  ]);

  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) return;

    const newMember = {
      id: Date.now(),
      uuid: `fc-m-${Date.now().toString().slice(-4)}`,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      phone: newPhone,
      gender: 'male',
      plan: 'Monthly Standard',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setMembers([newMember, ...members]);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const filteredMembers = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email} ${m.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Gym Member Directory" subtitle="Manage registered gym members, biometric fingerprint enrollment, and active plans" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#18181b] border border-gray-800">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full px-4 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">
                Showing <span className="text-white font-bold">{filteredMembers.length}</span> members
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-bold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
              >
                + Register New Member
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl bg-[#18181b] border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#0f0f11] text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Subscription Plan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#202025] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-sm">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{member.firstName} {member.lastName}</p>
                            <span className="text-xs text-gray-400 font-mono">{member.uuid}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-white">{member.email}</p>
                        <p className="text-xs text-gray-400">{member.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                          {member.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                          member.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{member.joinedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white transition">
                          View Profile
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#18181b] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-xl font-bold text-white mb-4">Register New Member</h3>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-gray-800 hover:bg-gray-700 font-semibold text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl text-xs shadow-lg shadow-orange-500/20"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
