'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([
    {
      id: 1,
      reference: 'EXT-99214A',
      memberName: 'Gabriel O.',
      amount: 25000,
      paymentMethod: 'BANK_TRANSFER',
      date: '2026-08-27 10:50 AM',
      status: 'approved',
    },
    {
      id: 2,
      reference: 'TXN-88120B',
      memberName: 'Kelechi O.',
      amount: 65000,
      paymentMethod: 'POS',
      date: '2026-08-26 04:15 PM',
      status: 'approved',
    },
    {
      id: 3,
      reference: 'MAN-77211C',
      memberName: 'David A.',
      amount: 2500,
      paymentMethod: 'CASH',
      date: '2026-08-20 09:00 AM',
      status: 'approved',
    },
    {
      id: 4,
      reference: 'PAY-66512D',
      memberName: 'Sarah P.',
      amount: 220000,
      paymentMethod: 'PAYSTACK',
      date: '2026-08-15 02:30 PM',
      status: 'approved',
    },
  ]);

  const [filterMethod, setFilterMethod] = useState('');

  const filteredTransactions = filterMethod
    ? transactions.filter((t) => t.paymentMethod === filterMethod)
    : transactions;

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Financial Transactions Ledger" subtitle="Complete ledger of member payments, bank transfers, POS receipts, and Paystack transactions" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Approved Volume</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">₦312,500</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bank Transfer</span>
              <div className="text-2xl font-black text-white mt-1">₦25,000</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">POS & Cash</span>
              <div className="text-2xl font-black text-white mt-1">₦67,500</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Paystack Online</span>
              <div className="text-2xl font-black text-orange-400 mt-1">₦220,000</div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Transactions Register</h2>
                <p className="text-xs text-gray-400">Filter transactions by payment channel.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs font-semibold outline-none"
                >
                  <option value="">All Payment Channels</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="POS">POS Terminal</option>
                  <option value="CASH">Cash</option>
                  <option value="PAYSTACK">Paystack</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Amount (NGN)</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">{tx.reference}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{tx.memberName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">₦{tx.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-bold">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">{tx.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                          {tx.status}
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
    </div>
  );
}
