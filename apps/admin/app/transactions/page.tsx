'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';
import * as XLSX from 'xlsx';

interface Transaction {
  id: number;
  uuid?: string;
  reference: string;
  amount: number | string;
  net_amount?: number | string;
  currency?: string;
  payment_method: string;
  status: string;
  recorded_by?: string;
  recordedBy?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  member_id?: number;
  pricing_plan_id?: number;
  member?: {
    id: number;
    uuid?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    registration_source?: string;
  };
  pricing_plan?: {
    id: number;
    name: string;
    category?: string;
    price: number | string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Aggregate Volumes State
  const [summary, setSummary] = useState({
    totalVolume: 0,
    bankTransferVolume: 0,
    posCashVolume: 0,
    paystackVolume: 0,
  });

  // Filter States
  const [filterText, setFilterText] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showEditAmountModal, setShowEditAmountModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Reference Data
  const [membersList, setMembersList] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<string[]>(['Super Admin', 'Sunday Ade', 'Grace Williams', 'Mary Johnson']);

  // Manual Transaction Form Fields
  const [formMemberId, setFormMemberId] = useState('');
  const [formPlanId, setFormPlanId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState('BANK_TRANSFER');
  const [formRef, setFormRef] = useState('');
  const [formStatus, setFormStatus] = useState('successful');
  const [formRecordedBy, setFormRecordedBy] = useState('Super Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Amount Form Fields
  const [newAmount, setNewAmount] = useState('');

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: Extract First Name only
  const getFirstName = (nameStr?: string) => {
    if (!nameStr) return 'Super';
    const clean = nameStr.trim();
    if (!clean) return 'Super';
    return clean.split(' ')[0];
  };

  // Fetch Transactions and Summaries from API
  const fetchTransactions = useCallback(
    async (
      page = 1,
      search = filterText,
      method = filterMethod,
      status = filterStatus,
      start = filterStartDate,
      end = filterEndDate
    ) => {
      setLoading(true);
      let query = `page=${page}&size=${PAGE_SIZE}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (method) query += `&payment_method=${encodeURIComponent(method)}`;
      if (status) query += `&status=${encodeURIComponent(status)}`;
      if (start) query += `&startDate=${encodeURIComponent(start)}`;
      if (end) query += `&endDate=${encodeURIComponent(end)}`;

      try {
        const json = await apiFetch(`/admin/transactions?${query}`);
        if (json.success && json.data) {
          const content = json.data.content || json.data || [];
          const total = json.data.totalElements || content.length || 0;
          setTransactions(content);
          setTotalRows(total);

          const sum = json.summary || json.data.summary;
          if (sum) {
            setSummary({
              totalVolume: Number(sum.totalVolume || 0),
              bankTransferVolume: Number(sum.bankTransferVolume || 0),
              posCashVolume: Number(sum.posCashVolume || 0),
              paystackVolume: Number(sum.paystackVolume || 0),
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    },
    [filterText, filterMethod, filterStatus, filterStartDate, filterEndDate]
  );

  // Fetch Auxiliary Reference Data
  const loadAuxData = async () => {
    try {
      const [membersRes, plansRes, staffRes] = await Promise.all([
        apiFetch('/admin/members?size=200'),
        apiFetch('/admin/pricing-plans'),
        apiFetch('/admin/staff'),
      ]);

      if (membersRes.success && membersRes.data) {
        const mList = Array.isArray(membersRes.data) ? membersRes.data : membersRes.data.content || [];
        setMembersList(mList);
      }

      if (plansRes.success && plansRes.data) {
        const pList = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.data || [];
        setPricingPlans(pList);
      }

      if (staffRes.success && staffRes.data) {
        const sList = Array.isArray(staffRes.data) ? staffRes.data : staffRes.data.data || [];
        const names = sList.map((s: any) => s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim()).filter(Boolean);
        if (names.length > 0) {
          setAdminsList(Array.from(new Set(['Super Admin', ...names])));
        }
      }
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  useEffect(() => {
    loadAuxData();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTransactions(1, filterText, filterMethod, filterStatus, filterStartDate, filterEndDate);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterText, filterMethod, filterStatus, filterStartDate, filterEndDate, fetchTransactions]);

  // Date Formatters
  const formatDateWithTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const dateFormatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${dateFormatted}, ${timeFormatted}`;
    } catch {
      return dateStr;
    }
  };

  // Format Transaction Type Label
  const formatTypeLabel = (row: Transaction) => {
    if (row.pricing_plan?.name) {
      return row.pricing_plan.name;
    }
    if (row.notes) return row.notes;
    return 'Membership Payment';
  };

  // Helper to get full dataset for export
  const fetchAllForExport = async () => {
    let query = `page=1&size=10000`;
    if (filterText) query += `&search=${encodeURIComponent(filterText)}`;
    if (filterMethod) query += `&payment_method=${encodeURIComponent(filterMethod)}`;
    if (filterStatus) query += `&status=${encodeURIComponent(filterStatus)}`;
    if (filterStartDate) query += `&startDate=${encodeURIComponent(filterStartDate)}`;
    if (filterEndDate) query += `&endDate=${encodeURIComponent(filterEndDate)}`;

    const json = await apiFetch(`/admin/transactions?${query}`);
    return json.success && json.data ? json.data.content || json.data : transactions;
  };

  // Export 1: CSV Export
  const handleExportCSV = async () => {
    setShowExportDropdown(false);
    try {
      setIsExporting(true);
      const list: Transaction[] = await fetchAllForExport();

      const headers = ['S/N', 'Reference', 'Payer/Member', 'Email', 'Phone', 'Purpose/Plan', 'Method', 'Amount (NGN)', 'Recorded By', 'Status', 'Transaction Date'];
      const rows = list.map((t, idx) => [
        idx + 1,
        t.reference || `TXN-${t.id}`,
        t.member ? `${t.member.first_name || ''} ${t.member.last_name || ''}`.trim() || t.member.name : 'Guest Payer',
        t.member?.email || '',
        t.member?.phone || '',
        formatTypeLabel(t),
        (t.payment_method || 'CASH').replace(/_/g, ' '),
        t.amount,
        getFirstName(t.recorded_by || t.recordedBy),
        t.status || 'SUCCESS',
        formatDateWithTime(t.created_at || t.updated_at),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FitFarmHQ_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV file.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export 2: Excel (.xlsx) Export
  const handleExportXLSX = async () => {
    setShowExportDropdown(false);
    try {
      setIsExporting(true);
      const list: Transaction[] = await fetchAllForExport();

      const excelRows = list.map((t, idx) => ({
        'S/N': idx + 1,
        'Reference Code': t.reference || `TXN-${t.id}`,
        'Payer / Member': t.member ? `${t.member.first_name || ''} ${t.member.last_name || ''}`.trim() || t.member.name : 'Guest Payer',
        'Member Email': t.member?.email || 'N/A',
        'Member Phone': t.member?.phone || 'N/A',
        'Plan / Purpose': formatTypeLabel(t),
        'Payment Channel': (t.payment_method || 'CASH').replace(/_/g, ' '),
        'Amount (NGN)': Number(t.amount || 0),
        'Recorded By': getFirstName(t.recorded_by || t.recordedBy),
        'Status': (t.status || 'SUCCESS').toUpperCase(),
        'Transaction Date': formatDateWithTime(t.created_at || t.updated_at),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions Ledger');

      XLSX.writeFile(workbook, `FitFarmHQ_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert('Failed to generate Excel (.xlsx) document.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export 3: Print Ledger Report
  const handlePrintLedger = async () => {
    setShowExportDropdown(false);
    try {
      setIsExporting(true);
      const list: Transaction[] = await fetchAllForExport();

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const datePeriodStr =
        filterStartDate || filterEndDate
          ? `Period: ${filterStartDate || 'Beginning'} to ${filterEndDate || 'Today'}`
          : `Printed on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FitFarmHQ — Financial Transactions Audit Ledger</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; background: #fff; }
            h2 { margin-bottom: 4px; color: #000; font-size: 20px; font-weight: 800; }
            .subtitle { color: #555; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 11px; }
            th { background-color: #f8fafc; font-weight: 700; text-transform: uppercase; color: #475569; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            .badge-active { background-color: #dcfce7; color: #15803d; }
            .badge-failed { background-color: #fee2e2; color: #b91c1c; }
          </style>
        </head>
        <body>
          <h2>FitFarmHQ — Financial Transactions Audit Ledger</h2>
          <div class="subtitle">${datePeriodStr} | Total Records: ${list.length} | Total Approved Volume: NGN ${summary.totalVolume.toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Reference</th>
                <th>Payer / Member</th>
                <th>Plan / Purpose</th>
                <th>Method</th>
                <th>Amount (NGN)</th>
                <th>Recorded By</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map((t, idx) => {
                  const memberName = t.member
                    ? `${t.member.first_name || ''} ${t.member.last_name || ''}`.trim() || t.member.name
                    : 'Guest Payer';
                  const isApproved = (t.status || '').toLowerCase() === 'successful' || (t.status || '').toLowerCase() === 'approved';
                  return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${t.reference || `TXN-${t.id}`}</strong></td>
                    <td><strong>${memberName}</strong><br/><span style="color:#666">${t.member?.email || ''}</span></td>
                    <td>${formatTypeLabel(t)}</td>
                    <td>${(t.payment_method || 'CASH').replace(/_/g, ' ')}</td>
                    <td><strong>₦${Number(t.amount).toLocaleString()}</strong></td>
                    <td>${getFirstName(t.recorded_by || t.recordedBy)}</td>
                    <td>${formatDateWithTime(t.created_at || t.updated_at)}</td>
                    <td><span class="badge ${isApproved ? 'badge-active' : 'badge-failed'}">${t.status}</span></td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      alert('Failed to generate print document.');
    } finally {
      setIsExporting(false);
    }
  };

  // Open Record Manual Modal
  const handleOpenRecordModal = () => {
    setFormMemberId('');
    setFormPlanId('');
    setFormAmount('');
    setFormMethod('BANK_TRANSFER');
    setFormRef(`MAN-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormStatus('successful');
    setFormRecordedBy('Super Admin');
    setShowRecordModal(true);
  };

  // Action: Submit Record Manual Transaction
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      alert('Please enter a valid transaction amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const json = await apiFetch('/admin/transactions', {
        method: 'POST',
        body: JSON.stringify({
          member_id: formMemberId ? Number(formMemberId) : null,
          pricing_plan_id: formPlanId ? Number(formPlanId) : null,
          amount: parseFloat(formAmount),
          payment_method: formMethod,
          reference: formRef,
          status: formStatus,
          recorded_by: formRecordedBy || 'Super Admin',
        }),
      });

      if (json.success) {
        alert('🎉 Financial transaction recorded successfully!');
        setShowRecordModal(false);
        fetchTransactions(currentPage);
      } else {
        alert(`⚠️ Failed to record transaction: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Error recording transaction: ${err.message || 'Failed to connect.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Amount Modal
  const handleOpenEditAmountModal = (tx: Transaction) => {
    setSelectedTxn(tx);
    setNewAmount(String(tx.amount || ''));
    setShowEditAmountModal(true);
  };

  // Action: Submit Edit Amount
  const handleEditAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn || !newAmount || Number(newAmount) < 0) return;

    setIsSubmitting(true);
    try {
      const json = await apiFetch(`/admin/transactions/${selectedTxn.id}/amount`, {
        method: 'PUT',
        body: JSON.stringify({ amount: parseFloat(newAmount) }),
      });

      if (json.success) {
        alert('🎉 Transaction amount updated successfully.');
        setShowEditAmountModal(false);
        setSelectedTxn(null);
        fetchTransactions(currentPage);
      } else {
        alert(`⚠️ Failed to update amount: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Update error: ${err.message || 'Failed to update.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Approve Pending Transaction
  const handleApproveStatus = async (tx: Transaction) => {
    const isConfirmed = window.confirm(
      `Approve payment reference ${tx.reference} of NGN ${Number(tx.amount).toLocaleString()}?`
    );
    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/transactions/${tx.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });

      if (json.success) {
        alert('🎉 Transaction approved successfully.');
        fetchTransactions(currentPage);
      } else {
        alert(`⚠️ Approval failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Error: ${err.message || 'Failed to approve.'}`);
    }
  };

  // Action: Reject Pending Transaction
  const handleRejectStatus = async (tx: Transaction) => {
    const isConfirmed = window.confirm(
      `Reject payment reference ${tx.reference} of NGN ${Number(tx.amount).toLocaleString()}?`
    );
    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/transactions/${tx.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (json.success) {
        alert('🎉 Transaction status marked as rejected.');
        fetchTransactions(currentPage);
      } else {
        alert(`⚠️ Action failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Error: ${err.message || 'Failed to reject.'}`);
    }
  };

  // Action: Delete Transaction
  const handleDeleteTransaction = async (tx: Transaction) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete transaction "${tx.reference}" (NGN ${Number(tx.amount).toLocaleString()})?\n\nThis action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/transactions/${tx.id}`, {
        method: 'DELETE',
      });

      if (json.success) {
        alert('🎉 Transaction deleted successfully.');
        fetchTransactions(currentPage);
      } else {
        alert(`⚠️ Delete failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Delete error: ${err.message || 'Failed to delete.'}`);
    }
  };

  // Open Member Profile Modal
  const handleOpenMemberModal = async (member: any) => {
    if (!member) return;
    try {
      const json = await apiFetch(`/admin/members/${member.id || member.uuid}`);
      if (json.success && json.data) {
        setSelectedMember(json.data);
      } else {
        setSelectedMember(member);
      }
    } catch {
      setSelectedMember(member);
    }
    setShowMemberModal(true);
  };

  // Clear Filters
  const handleClearFilters = () => {
    setFilterText('');
    setFilterMethod('');
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
    fetchTransactions(1, '', '', '', '', '');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Financial Transactions Ledger" subtitle="Complete audit ledger of member payments, bank transfers, POS receipts, and online transactions" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Approved Volume</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                ₦{summary.totalVolume.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bank Transfer</span>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                ₦{summary.bankTransferVolume.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">POS & Cash</span>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                ₦{summary.posCashVolume.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Online Payments</span>
              <div className="text-2xl font-black text-orange-400 mt-1 font-mono">
                ₦{summary.paystackVolume.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Bar & Compact Combined Export Dropdown */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f0f13] border border-gray-800">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>💰 Transactions Register</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                  {totalRows} Entries
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Real-time financial audit trail for cash payments, POS slips, bank transfers, and automated online subscriptions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Compact Combined Export Dropdown */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={isExporting}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-bold transition flex items-center gap-2"
                >
                  <span>📥 Export</span>
                  <span className="text-[10px] text-gray-400">▼</span>
                </button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#121217] border border-gray-800 shadow-2xl z-50 py-1.5 text-xs text-gray-200 animate-fadeIn">
                    <button
                      onClick={handleExportCSV}
                      className="w-full px-4 py-2 text-left hover:bg-gray-800/80 transition flex items-center gap-2 font-medium"
                    >
                      <span>📄 Download CSV</span>
                    </button>
                    <button
                      onClick={handleExportXLSX}
                      className="w-full px-4 py-2 text-left hover:bg-gray-800/80 transition flex items-center gap-2 font-medium text-emerald-400"
                    >
                      <span>📊 Download Excel (.xlsx)</span>
                    </button>
                    <div className="my-1 border-t border-gray-800"></div>
                    <button
                      onClick={handlePrintLedger}
                      className="w-full px-4 py-2 text-left hover:bg-gray-800/80 transition flex items-center gap-2 font-medium"
                    >
                      <span>🖨️ Print Report</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleOpenRecordModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
              >
                <span>+ Record Manual Payment</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search reference, member name, email, or phone..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white placeholder-gray-500 text-xs outline-none focus:border-orange-500/50 transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold outline-none focus:border-orange-500/50"
              >
                <option value="">All Statuses</option>
                <option value="successful">Successful / Approved</option>
                <option value="pending">Pending Approval</option>
                <option value="failed">Failed / Rejected</option>
              </select>

              {/* Channel Filter */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold outline-none focus:border-orange-500/50"
              >
                <option value="">All Payment Channels</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="POS">POS Terminal</option>
                <option value="CASH">Cash</option>
                <option value="PAYSTACK">Online Payments</option>
              </select>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-xs text-gray-400">
                  <span>From:</span>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="bg-transparent text-white outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-xs text-gray-400">
                  <span>To:</span>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="bg-transparent text-white outline-none"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              {(filterText || filterMethod || filterStatus || filterStartDate || filterEndDate) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Transactions Data Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="overflow-x-auto min-h-[380px]">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Loading financial ledger transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="text-4xl">💰</div>
                  <h3 className="text-base font-bold text-gray-300">No transaction records found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try adjusting your search criteria or click "+ Record Manual Payment" to log a new entry.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-16">S/N</th>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Payer / Member</th>
                      <th className="py-3.5 px-4">Plan / Purpose</th>
                      <th className="py-3.5 px-4">Method</th>
                      <th className="py-3.5 px-4">Amount (NGN)</th>
                      <th className="py-3.5 px-4">Recorded By</th>
                      <th className="py-3.5 px-4">Transaction Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {transactions.map((tx, index) => {
                      const memberName = tx.member
                        ? `${tx.member.first_name || ''} ${tx.member.last_name || ''}`.trim() || tx.member.name || 'Member'
                        : 'Guest Payer';
                      const statusClean = (tx.status || 'successful').toLowerCase();
                      const isApproved = statusClean === 'successful' || statusClean === 'approved';
                      const isPending = statusClean === 'pending';
                      const adminFirstName = getFirstName(tx.recorded_by || tx.recordedBy);

                      return (
                        <tr key={tx.id} className="hover:bg-gray-800/30 transition">
                          <td className="py-3.5 px-4 text-gray-400 font-mono">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                            {tx.reference || `TXN-${tx.id}`}
                          </td>

                          {/* Payer/Member with Email & Phone Underneath */}
                          <td className="py-3.5 px-4">
                            {tx.member ? (
                              <button
                                onClick={() => handleOpenMemberModal(tx.member)}
                                className="text-left font-bold text-white hover:text-orange-400 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{memberName}</span>
                                  {tx.member?.gender && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 uppercase">
                                      {tx.member.gender.substring(0, 1)}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 font-normal mt-0.5 space-y-0.5">
                                  {tx.member?.email && <div className="text-gray-300">{tx.member.email}</div>}
                                  {tx.member?.phone && <div className="text-gray-500 font-mono">{tx.member.phone}</div>}
                                </div>
                              </button>
                            ) : (
                              <div className="font-bold text-white">{memberName}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-gray-300">
                            <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 font-semibold">
                              {formatTypeLabel(tx)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-bold">
                              {(tx.payment_method || 'CASH').replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 text-sm">
                            ₦{Number(tx.amount || 0).toLocaleString()}
                          </td>

                          {/* Recorded By Column with Admin FIRST Name */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 font-bold text-[11px] flex items-center gap-1.5 w-fit">
                              <span className="text-orange-400">👤</span>
                              <span>{adminFirstName}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-gray-400 font-mono whitespace-nowrap">
                            {formatDateWithTime(tx.created_at || tx.updated_at)}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isPending
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {tx.status || 'SUCCESS'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApproveStatus(tx)}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                                    title="Approve Transaction"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => handleRejectStatus(tx)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                                    title="Reject Transaction"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleOpenEditAmountModal(tx)}
                                className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold"
                                title="Edit Amount"
                              >
                                ✎
                              </button>

                              <button
                                onClick={() => handleDeleteTransaction(tx)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                                title="Delete Transaction"
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

            {/* Pagination Controls */}
            {totalRows > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800/80 text-xs text-gray-400">
                <div>
                  Page <strong className="text-white">{currentPage}</strong> of{' '}
                  <strong className="text-white">{Math.ceil(totalRows / PAGE_SIZE)}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      const newP = Math.max(1, currentPage - 1);
                      setCurrentPage(newP);
                      fetchTransactions(newP);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white font-semibold transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage * PAGE_SIZE >= totalRows}
                    onClick={() => {
                      const newP = currentPage + 1;
                      setCurrentPage(newP);
                      fetchTransactions(newP);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white font-semibold transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal 1: Record Manual Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Record Manual Transaction</h3>
              <button
                onClick={() => setShowRecordModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Select Member (Optional)</label>
                <select
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium outline-none focus:border-orange-500/50"
                >
                  <option value="">Walk-in Guest / Non-member</option>
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name || m.last_name ? `${m.first_name || ''} ${m.last_name || ''}`.trim() : m.name} (
                      {m.email || m.phone || `ID-${m.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Membership Plan (Optional)</label>
                <select
                  value={formPlanId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setFormPlanId(pId);
                    const found = pricingPlans.find((p) => String(p.id) === pId);
                    if (found && found.price) {
                      setFormAmount(String(found.price));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium outline-none focus:border-orange-500/50"
                >
                  <option value="">General Payment / Custom Fee</option>
                  {pricingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} (₦{Number(plan.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Amount (NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="40000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono font-bold outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="POS">POS Terminal</option>
                    <option value="CASH">Cash</option>
                    <option value="PAYSTACK">Online Payments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Recorded By Admin</label>
                <select
                  value={formRecordedBy}
                  onChange={(e) => setFormRecordedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  {adminsList.map((adm) => (
                    <option key={adm} value={adm}>
                      👤 {getFirstName(adm)} ({adm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Reference Code</label>
                <input
                  type="text"
                  required
                  value={formRef}
                  onChange={(e) => setFormRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  <option value="successful">Approved / Successful</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
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
                  {isSubmitting ? 'Recording...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Amount Modal */}
      {showEditAmountModal && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Edit Transaction Amount</h3>
              <button
                onClick={() => setShowEditAmountModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditAmountSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#070709] border border-gray-800 space-y-1">
                <div className="text-gray-400">Reference Code:</div>
                <div className="font-mono font-bold text-orange-400">{selectedTxn.reference}</div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">New Amount (NGN)</label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono font-bold text-base outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowEditAmountModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? 'Saving...' : 'Update Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Member Profile Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Member Profile Overview</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#070709] border border-gray-800">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 font-extrabold text-lg flex items-center justify-center border border-orange-500/30">
                  {(selectedMember.first_name || selectedMember.name || 'M').substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    {selectedMember.first_name || selectedMember.last_name
                      ? `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim()
                      : selectedMember.name}
                  </h4>
                  <p className="text-gray-400 font-mono text-[10px]">
                    UID: {selectedMember.uuid || `ID-${selectedMember.id}`}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#070709] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{selectedMember.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{selectedMember.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gender:</span>
                  <span className="text-white uppercase">{selectedMember.gender || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Registration Source:</span>
                  <span className="text-orange-400 font-medium">{selectedMember.registration_source || 'Admin'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-gray-800">
              <button
                onClick={() => setShowMemberModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
