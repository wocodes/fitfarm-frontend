'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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

  // Form State for new member
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
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#18181b]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg">
            FC
          </Link>
          <div>
            <h1 className="font-bold text-white leading-tight text-base">Member Directory</h1>
            <span className="text-xs text-gray-400">PolanFit Arena • Gym Admin Center</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition">
            ← Dashboard
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-bold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
          >
            + Register New Member
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
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

          <div className="text-xs text-gray-400 font-medium">
            Showing <span className="text-white font-bold">{filteredMembers.length}</span> members
          </div>
        </div>

        {/* Member Table */}
        <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-sm border border-orange-500/30">
                        {m.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/members/profile?uid=${m.uuid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white hover:text-orange-400 transition flex items-center gap-1.5"
                        >
                          <span>{m.firstName} {m.lastName.charAt(0)}.</span>
                          <span className="text-xs text-gray-500 font-normal">↗</span>
                        </Link>
                        <div className="text-xs text-gray-500">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 font-mono text-xs">{m.phone}</td>
                  <td className="py-3.5 px-4 font-semibold text-orange-400">{m.plan}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      m.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-400">{m.joinedAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/members/profile?uid=${m.uuid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-lg transition"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white">Register New Member</h2>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  required
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
