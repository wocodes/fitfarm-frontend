'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

interface BankAccount {
  id: number;
  uid: string;
  uuid?: string;
  bankName: string;
  bank_name?: string;
  accountNumber: string;
  account_number?: string;
  accountType: string;
  account_type?: string;
  isActive: boolean;
  is_active?: boolean;
  accountLabel?: string;
  createdAt?: string;
}

interface PaymentType {
  id: number;
  uid: string;
  uuid?: string;
  name: string;
  code: string;
  defaultAmount?: number | null;
  default_amount?: number | null;
  isActive: boolean;
  is_active?: boolean;
  createdAt?: string;
}

interface AuditLog {
  id: number;
  action: string;
  performer: string;
  target: string;
  description: string;
  timestamp: string;
}

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'paymentTypes' | 'audit'>('accounts');
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank Accounts State
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [currentAccountUid, setCurrentAccountUid] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    isActive: true,
  });

  // Payment Types State
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [showPTModal, setShowPTModal] = useState(false);
  const [isEditingPT, setIsEditingPT] = useState(false);
  const [currentPTUid, setCurrentPTUid] = useState<string | null>(null);
  const [ptForm, setPtForm] = useState({
    name: '',
    code: '',
    defaultAmount: '',
    isActive: true,
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      action: 'PLAN_EXTENDED',
      performer: 'Super Admin',
      target: 'Member: Kelechi Sunday',
      description: 'Extended subscription by 30 days. Payment of NGN 25,000 recorded via Bank Transfer.',
      timestamp: '2026-09-01 10:50 AM',
    },
    {
      id: 2,
      action: 'BANK_ACCOUNT_CREATED',
      performer: 'Super Admin',
      target: 'Moniepoint (5274154744)',
      description: 'Added Moniepoint operational collection bank account.',
      timestamp: '2026-09-01 08:30 AM',
    },
    {
      id: 3,
      action: 'TRANSACTION_APPROVED',
      performer: 'Super Admin',
      target: 'Ref: MAN-849201',
      description: 'Approved POS receipt transaction of NGN 40,000.',
      timestamp: '2026-08-31 04:15 PM',
    },
    {
      id: 4,
      action: 'PLAN_PAUSED',
      performer: 'Onome Ataro',
      target: 'Member: David Alaba',
      description: 'Paused active membership upon member medical request.',
      timestamp: '2026-08-30 09:00 AM',
    },
  ]);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, ptRes, auditRes] = await Promise.all([
        apiFetch('/admin/accounts'),
        apiFetch('/admin/payment-types'),
        apiFetch('/admin/audit-logs'),
      ]);

      if (accRes.success && accRes.data) {
        const accList = Array.isArray(accRes.data) ? accRes.data : accRes.data.content || [];
        setAccounts(accList);
      }

      if (ptRes.success && ptRes.data) {
        const ptList = Array.isArray(ptRes.data) ? ptRes.data : ptRes.data.content || [];
        setPaymentTypes(ptList);
      }

      if (auditRes.success && auditRes.data) {
        const rawLogs = auditRes.data.data ? auditRes.data.data : (Array.isArray(auditRes.data) ? auditRes.data : auditRes.data.content || []);
        if (rawLogs.length > 0) {
          const formatted = rawLogs.map((l: any) => ({
            id: l.id,
            action: l.action,
            performer: l.user_name || l.performer || 'System Admin',
            target: l.target_type ? `${l.target_type} #${l.target_id || ''}` : (l.target || 'System'),
            description: l.description || 'Action performed',
            timestamp: l.created_at ? new Date(l.created_at).toLocaleString() : (l.timestamp || 'Just now'),
            previous_state: l.previous_state,
            new_state: l.new_state,
          }));
          setAuditLogs(formatted);
        }
      }
    } catch (err) {
      console.error('Error loading financial accounts data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered lists
  const filteredAccounts = accounts.filter((item) => {
    const search = filterText.toLowerCase();
    const bankName = (item.bankName || item.bank_name || '').toLowerCase();
    const accNo = (item.accountNumber || item.account_number || '').toLowerCase();
    const type = (item.accountType || item.account_type || '').toLowerCase();
    return bankName.includes(search) || accNo.includes(search) || type.includes(search);
  });

  const filteredPTs = paymentTypes.filter((item) => {
    const search = filterText.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const code = (item.code || '').toLowerCase();
    return name.includes(search) || code.includes(search);
  });

  // Account Handlers
  const handleOpenAddAccount = () => {
    setIsEditingAccount(false);
    setCurrentAccountUid(null);
    setAccountForm({ bankName: '', accountNumber: '', accountType: 'Current', isActive: true });
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: BankAccount) => {
    setIsEditingAccount(true);
    setCurrentAccountUid(acc.uid || acc.uuid || String(acc.id));
    setAccountForm({
      bankName: acc.bankName || acc.bank_name || '',
      accountNumber: acc.accountNumber || acc.account_number || '',
      accountType: acc.accountType || acc.account_type || 'Current',
      isActive: acc.isActive ?? acc.is_active ?? true,
    });
    setShowAccountModal(true);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.bankName || !accountForm.accountNumber) {
      alert('Bank name and account number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditingAccount ? `/admin/accounts/${currentAccountUid}` : '/admin/accounts';
      const method = isEditingAccount ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(accountForm),
      });

      if (res.success) {
        setShowAccountModal(false);
        loadData();
      } else {
        alert(res.message || 'Failed to save bank account.');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (acc: BankAccount) => {
    const target = acc.bankName || acc.bank_name;
    const isConfirmed = window.confirm(`Are you sure you want to delete bank account "${target}"?`);
    if (!isConfirmed) return;

    try {
      const uid = acc.uid || acc.uuid || String(acc.id);
      const res = await apiFetch(`/admin/accounts/${uid}`, { method: 'DELETE' });
      if (res.success) {
        loadData();
      } else {
        alert(res.message || 'Failed to delete account.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting account.');
    }
  };

  // Payment Type Handlers
  const handleOpenAddPT = () => {
    setIsEditingPT(false);
    setCurrentPTUid(null);
    setPtForm({ name: '', code: '', defaultAmount: '', isActive: true });
    setShowPTModal(true);
  };

  const handleOpenEditPT = (pt: PaymentType) => {
    setIsEditingPT(true);
    setCurrentPTUid(pt.uid || pt.uuid || String(pt.id));
    setPtForm({
      name: pt.name || '',
      code: pt.code || '',
      defaultAmount: pt.defaultAmount || pt.default_amount ? String(pt.defaultAmount || pt.default_amount) : '',
      isActive: pt.isActive ?? pt.is_active ?? true,
    });
    setShowPTModal(true);
  };

  const handlePTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptForm.name) {
      alert('Payment type name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditingPT ? `/admin/payment-types/${currentPTUid}` : '/admin/payment-types';
      const method = isEditingPT ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...ptForm,
          defaultAmount: ptForm.defaultAmount ? parseFloat(ptForm.defaultAmount) : null,
        }),
      });

      if (res.success) {
        setShowPTModal(false);
        loadData();
      } else {
        alert(res.message || 'Failed to save payment type.');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting payment type.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePT = async (pt: PaymentType) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete payment type "${pt.name}"?`);
    if (!isConfirmed) return;

    try {
      const uid = pt.uid || pt.uuid || String(pt.id);
      const res = await apiFetch(`/admin/payment-types/${uid}`, { method: 'DELETE' });
      if (res.success) {
        loadData();
      } else {
        alert(res.message || 'Failed to delete payment type.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting payment type.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Bank Accounts & Financial Configuration"
          subtitle="Manage corporate bank accounts, payment categories, and view system audit trail logs"
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Control & Tabs Bar */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#070709] border border-gray-800">
                <button
                  onClick={() => setActiveTab('accounts')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'accounts'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🏦 Bank Accounts</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">
                    {accounts.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('paymentTypes')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'paymentTypes'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🧾 Payment Types</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">
                    {paymentTypes.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'audit'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>📜 Audit Trail</span>
                </button>
              </div>

              {/* Action Buttons & Search */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <input
                    type="text"
                    placeholder="Search accounts or payment types..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full md:w-64 pl-3.5 pr-8 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white placeholder-gray-500 text-xs outline-none focus:border-orange-500/50"
                  />
                  {filterText && (
                    <button
                      onClick={() => setFilterText('')}
                      className="absolute right-2.5 top-2 text-xs text-gray-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {activeTab === 'accounts' && (
                  <button
                    onClick={handleOpenAddAccount}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
                  >
                    <span>+ Add Bank Account</span>
                  </button>
                )}

                {activeTab === 'paymentTypes' && (
                  <button
                    onClick={handleOpenAddPT}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
                  >
                    <span>+ Add Payment Type</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TAB 1: BANK ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="overflow-x-auto min-h-[350px]">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-gray-400 text-xs">
                    <div className="inline-block w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading bank accounts...
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <div className="text-4xl">🏦</div>
                    <h3 className="text-sm font-bold text-gray-300">No bank accounts configured</h3>
                    <p className="text-xs text-gray-500">Click "+ Add Bank Account" to configure official collection accounts.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-12">S/N</th>
                        <th className="py-3 px-4">Bank Name</th>
                        <th className="py-3 px-4">Account Number</th>
                        <th className="py-3 px-4">Account Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-medium">
                      {filteredAccounts.map((acc, index) => {
                        const active = acc.isActive ?? acc.is_active ?? true;
                        const bName = acc.bankName || acc.bank_name || 'N/A';
                        const aNum = acc.accountNumber || acc.account_number || 'N/A';
                        const aType = acc.accountType || acc.account_type || 'Current';

                        return (
                          <tr key={acc.id} className="hover:bg-gray-800/30 transition">
                            <td className="py-3.5 px-4 text-gray-500 font-mono">{index + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <span className="text-orange-400">🏦</span>
                              <span>{bName}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-extrabold text-orange-400 text-sm">{aNum}</td>
                            <td className="py-3.5 px-4 text-gray-300">
                              <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 font-semibold">
                                {aType}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  active
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditAccount(acc)}
                                  className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold"
                                  title="Edit Bank Account"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => handleDeleteAccount(acc)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                                  title="Delete Bank Account"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT TYPES */}
          {activeTab === 'paymentTypes' && (
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="overflow-x-auto min-h-[350px]">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-gray-400 text-xs">
                    <div className="inline-block w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading payment types...
                  </div>
                ) : filteredPTs.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <div className="text-4xl">🧾</div>
                    <h3 className="text-sm font-bold text-gray-300">No payment types configured</h3>
                    <p className="text-xs text-gray-500">Click "+ Add Payment Type" to add new fee categories.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-12">S/N</th>
                        <th className="py-3 px-4">Payment Category Name</th>
                        <th className="py-3 px-4">Code Identifier</th>
                        <th className="py-3 px-4">Default Amount (NGN)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-medium">
                      {filteredPTs.map((pt, index) => {
                        const active = pt.isActive ?? pt.is_active ?? true;
                        const amt = pt.defaultAmount || pt.default_amount;

                        return (
                          <tr key={pt.id} className="hover:bg-gray-800/30 transition">
                            <td className="py-3.5 px-4 text-gray-500 font-mono">{index + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-white">{pt.name}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-orange-400">{pt.code}</td>
                            <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                              {amt ? `₦${Number(amt).toLocaleString()}` : 'Custom Fee'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  active
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditPT(pt)}
                                  className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold"
                                  title="Edit Payment Type"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => handleDeletePT(pt)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                                  title="Delete Payment Type"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL LOGS */}
          {activeTab === 'audit' && (
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>📜 Immutable System Audit Log</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] uppercase font-bold">
                      Real-time Tracking
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Security audit log detailing admin state changes, bank edits, subscription extensions, and system backups.
                  </p>
                </div>

                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/audit-logs/export`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-orange-500/10"
                >
                  📥 Export Audit Trail (CSV)
                </a>
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
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{log.performer}</td>
                        <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px]">{log.target}</td>
                        <td className="py-3.5 px-4 text-gray-300 max-w-md">{log.description}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-400 whitespace-nowrap text-[11px]">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal 1: Bank Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">{isEditingAccount ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Bank, Moniepoint"
                  value={accountForm.bankName}
                  onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="1015849302"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono font-bold text-sm outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Account Type</label>
                <select
                  value={accountForm.accountType}
                  onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Operational">Operational</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="accActiveToggle"
                  checked={accountForm.isActive}
                  onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <label htmlFor="accActiveToggle" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  Mark Account as Active for Receiving Payments
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Payment Type Modal */}
      {showPTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">{isEditingPT ? 'Edit Payment Type' : 'Add Payment Type'}</h3>
              <button
                onClick={() => setShowPTModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePTSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Payment Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walk-in Daily Session"
                  value={ptForm.name}
                  onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Code Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. WALK_IN_DAILY"
                  value={ptForm.code}
                  onChange={(e) => setPtForm({ ...ptForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono uppercase font-bold outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Default Amount (NGN - Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={ptForm.defaultAmount}
                  onChange={(e) => setPtForm({ ...ptForm, defaultAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="ptActiveToggle"
                  checked={ptForm.isActive}
                  onChange={(e) => setPtForm({ ...ptForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <label htmlFor="ptActiveToggle" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  Mark Payment Type as Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowPTModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Payment Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
