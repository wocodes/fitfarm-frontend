'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

interface MemberPlan {
  id: number;
  member_id: number;
  pricing_plan_id: number;
  starts_at: string;
  expires_at: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  member?: {
    id: number;
    uuid?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    address?: string;
    registration_source?: string;
  };
  pricing_plan?: {
    id: number;
    name: string;
    plan_name?: string;
    category?: string;
    price: string | number;
    duration_days: number;
  };
}

export default function RenewalsPage() {
  const [data, setData] = useState<MemberPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Filter States
  const [filterText, setFilterText] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [isPrinting, setIsPrinting] = useState(false);

  // Reference Data
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);

  // Modals state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<MemberPlan | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Extension Modal Form States
  const [extendDuration, setExtendDuration] = useState<number>(1);
  const [calculatedNewEndDate, setCalculatedNewEndDate] = useState<string>('');
  const [extendPaymentMethod, setExtendPaymentMethod] = useState('BANK_TRANSFER');

  // Load Renewals Log from Backend API
  const loadRenewedPlans = useCallback(
    async (
      page = 1,
      search = filterText,
      planId = filterPlan,
      start = filterStartDate,
      end = filterEndDate
    ) => {
      setLoading(true);
      let query = `page=${page}&size=${PAGE_SIZE}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (planId) query += `&pricingPlanId=${encodeURIComponent(planId)}`;
      if (start) query += `&startDate=${encodeURIComponent(start)}`;
      if (end) query += `&endDate=${encodeURIComponent(end)}`;

      try {
        const json = await apiFetch(`/admin/renewals?${query}`);
        if (json.success && json.data) {
          const content = json.data.content || json.data || [];
          const total = json.data.totalElements || content.length || 0;
          setData(content);
          setTotalRows(total);
        }
      } catch (err) {
        console.error('Failed to load renewals list:', err);
      } finally {
        setLoading(false);
      }
    },
    [filterText, filterPlan, filterStartDate, filterEndDate]
  );

  // Load Pricing Plans for Filter Dropdown
  const loadPricingPlans = async () => {
    try {
      const res = await apiFetch('/admin/pricing-plans');
      if (res.success && res.data) {
        const plans = Array.isArray(res.data) ? res.data : res.data.data || [];
        setPricingPlans(plans);
      }
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    }
  };

  useEffect(() => {
    loadPricingPlans();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadRenewedPlans(1, filterText, filterPlan, filterStartDate, filterEndDate);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterText, filterPlan, filterStartDate, filterEndDate, loadRenewedPlans]);

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

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Duration Helper
  const isQuarterlyPlan = (plan: MemberPlan | null) => {
    if (!plan) return false;
    const name = (plan.pricing_plan?.name || '').toLowerCase();
    return name.includes('quarter');
  };

  const calculateNewEndDate = (currentEndDateStr: string, periods: number, isQuarterly: boolean) => {
    if (!currentEndDateStr) return '';
    const date = new Date(currentEndDateStr);
    if (isQuarterly) {
      date.setMonth(date.getMonth() + periods * 3);
    } else {
      date.setMonth(date.getMonth() + periods);
    }
    return formatDateTimeLocal(date);
  };

  // Open Extension Modal
  const handleOpenExtendModal = (plan: MemberPlan) => {
    setSelectedPlan(plan);
    setExtendDuration(1);
    const isQ = isQuarterlyPlan(plan);
    setCalculatedNewEndDate(calculateNewEndDate(plan.expires_at, 1, isQ));
    setShowExtendModal(true);
  };

  // Action: Confirm Extension
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const unitPrice = selectedPlan.pricing_plan?.price ? Number(selectedPlan.pricing_plan.price) : 0;
    const totalCost = unitPrice * extendDuration;

    const isConfirmed = window.confirm(
      `Confirm Renewal/Extension for ${
        selectedPlan.member
          ? `${selectedPlan.member.first_name || ''} ${selectedPlan.member.last_name || ''}`.trim() || selectedPlan.member.name
          : 'Member'
      }?\n\n` +
        `Plan: ${selectedPlan.pricing_plan?.name}\n` +
        `Extension Duration: +${extendDuration} period(s)\n` +
        `Total Price: NGN ${totalCost.toLocaleString()}\n` +
        `Payment Method: ${extendPaymentMethod}`
    );

    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/subscriptions/${selectedPlan.id}/extend`, {
        method: 'POST',
        body: JSON.stringify({
          extension_days: isQuarterlyPlan(selectedPlan) ? extendDuration * 90 : extendDuration * 30,
          payment_method: extendPaymentMethod,
        }),
      });

      if (json.success) {
        alert(`🎉 Subscription renewed successfully!\n\nNew expiration date: ${formatDateWithTime(calculatedNewEndDate)}`);
        setShowExtendModal(false);
        setSelectedPlan(null);
        loadRenewedPlans(currentPage);
      } else {
        alert(`⚠️ Renewal failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Renewal error: ${err.message || 'Failed to update.'}`);
    }
  };

  // Action: Print List Report
  const handlePrintList = async () => {
    try {
      setIsPrinting(true);
      let query = `page=1&size=10000`;
      if (filterText) query += `&search=${encodeURIComponent(filterText)}`;
      if (filterPlan) query += `&pricingPlanId=${encodeURIComponent(filterPlan)}`;
      if (filterStartDate) query += `&startDate=${encodeURIComponent(filterStartDate)}`;
      if (filterEndDate) query += `&endDate=${encodeURIComponent(filterEndDate)}`;

      const res = await apiFetch(`/admin/renewals?${query}`);

      if (res.success && res.data) {
        const items: MemberPlan[] = res.data.content || res.data || [];
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
            <title>Member Renewals & Extensions Log</title>
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
              .badge-expired { background-color: #fee2e2; color: #b91c1c; }
            </style>
          </head>
          <body>
            <h2>FitFarmHQ — Member Renewals & Extensions Log</h2>
            <div class="subtitle">${datePeriodStr} | Total Records: ${items.length}</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member Name</th>
                  <th>Email & Phone</th>
                  <th>Pricing Plan</th>
                  <th>Renewal / Extension Date</th>
                  <th>Plan Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map((m, idx) => {
                    const memberName = m.member
                      ? `${m.member.first_name || ''} ${m.member.last_name || ''}`.trim() || m.member.name
                      : 'Member';
                    return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><strong>${memberName}</strong></td>
                      <td>${m.member?.email || 'N/A'}<br/><span style="color:#666">${m.member?.phone || ''}</span></td>
                      <td><strong>${m.pricing_plan?.name || 'Plan'}</strong></td>
                      <td>${formatDateWithTime(m.updated_at || m.starts_at)}</td>
                      <td>${formatDateOnly(m.starts_at)} to ${formatDateOnly(m.expires_at)}</td>
                      <td><span class="badge ${m.status === 'active' || m.status === 'ACTIVE' ? 'badge-active' : 'badge-expired'}">${m.status}</span></td>
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
      } else {
        alert('Failed to fetch renewals log for printing.');
      }
    } catch (err) {
      alert('Failed to generate print document.');
    } finally {
      setIsPrinting(false);
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

  // Action: Clear Filters
  const handleClearFilters = () => {
    setFilterText('');
    setFilterPlan('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
    loadRenewedPlans(1, '', '', '', '');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Membership Renewals" subtitle="Track member renewals, expiring subscriptions, and historical extensions" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Control Header & Actions Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f0f13] border border-gray-800">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>🔄 Plan Renewals & Extensions Log</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                  {totalRows} Total Records
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                View members who renewed, extended, or require subscription renewal within a specified date range.
              </p>
            </div>

            <button
              onClick={handlePrintList}
              disabled={isPrinting}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-bold transition flex items-center gap-2"
            >
              <span>🖨️ {isPrinting ? 'Preparing Report...' : 'Print Report List'}</span>
            </button>
          </div>

          {/* Filter Toolbar Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[260px]">
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search member name, email, phone, or plan..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white placeholder-gray-500 text-xs outline-none focus:border-orange-500/50 transition"
                />
              </div>

              {/* Pricing Plan Filter */}
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold outline-none focus:border-orange-500/50"
              >
                <option value="">All Pricing Plans</option>
                {pricingPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (₦{Number(plan.price).toLocaleString()})
                  </option>
                ))}
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
              {(filterText || filterPlan || filterStartDate || filterEndDate) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Renewals Data Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="overflow-x-auto min-h-[380px]">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Loading renewal records...
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="text-4xl">🔄</div>
                  <h3 className="text-base font-bold text-gray-300">No renewal records found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try adjusting your search criteria or date filters to view past plan renewals.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-16">S/N</th>
                      <th className="py-3.5 px-4">Member Name</th>
                      <th className="py-3.5 px-4">Pricing Plan</th>
                      <th className="py-3.5 px-4">Renewal / Extension Date</th>
                      <th className="py-3.5 px-4">Plan Period</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {data.map((row, index) => {
                      const memberName = row.member
                        ? `${row.member.first_name || ''} ${row.member.last_name || ''}`.trim() || row.member.name || 'Member'
                        : 'Member Plan';
                      const planTitle = row.pricing_plan?.name || 'Standard Plan';
                      const planCategory = row.pricing_plan?.category || 'SUBSCRIPTION';

                      return (
                        <tr key={row.id} className="hover:bg-gray-800/30 transition">
                          <td className="py-3.5 px-4 text-gray-400 font-mono">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>

                          {/* Member Info with Email & Phone Underneath */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleOpenMemberModal(row.member)}
                              className="text-left font-bold text-white hover:text-orange-400 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span>{memberName}</span>
                                {row.member?.gender && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 uppercase">
                                    {row.member.gender.substring(0, 1)}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 font-normal mt-0.5 space-y-0.5">
                                {row.member?.email && <div className="text-gray-300">{row.member.email}</div>}
                                {row.member?.phone && <div className="text-gray-500 font-mono">{row.member.phone}</div>}
                              </div>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-orange-400">{planTitle}</div>
                            <div className="text-[10px] text-gray-400">{planCategory}</div>
                          </td>

                          <td className="py-3.5 px-4 text-gray-300 font-mono whitespace-nowrap">
                            {formatDateWithTime(row.updated_at || row.starts_at)}
                          </td>

                          <td className="py-3.5 px-4 text-gray-300 text-[11px] whitespace-nowrap">
                            <span>{formatDateOnly(row.starts_at)}</span>
                            <span className="text-gray-500 mx-1.5">to</span>
                            <span className="font-semibold text-white font-mono">{formatDateOnly(row.expires_at)}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                row.status === 'active' || row.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : row.status === 'paused' || row.status === 'PAUSED'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenExtendModal(row)}
                              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-white text-xs transition shadow-md shadow-orange-500/20"
                            >
                              Renew Now →
                            </button>
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
                      loadRenewedPlans(newP);
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
                      loadRenewedPlans(newP);
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

      {/* Extend Plan Modal */}
      {showExtendModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Renew Subscription Plan</h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#070709] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member Name:</span>
                  <span className="font-bold text-white">
                    {selectedPlan.member
                      ? `${selectedPlan.member.first_name || ''} ${selectedPlan.member.last_name || ''}`.trim() || selectedPlan.member.name
                      : 'Member'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Plan:</span>
                  <span className="font-bold text-orange-400">{selectedPlan.pricing_plan?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plan Rate:</span>
                  <span className="font-bold text-white font-mono">
                    NGN {Number(selectedPlan.pricing_plan?.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                  Renewal Duration ({isQuarterlyPlan(selectedPlan) ? 'Quarter(s)' : 'Month(s)'})
                </label>
                <select
                  value={extendDuration}
                  onChange={(e) => {
                    const dur = Number(e.target.value);
                    setExtendDuration(dur);
                    const isQ = isQuarterlyPlan(selectedPlan);
                    setCalculatedNewEndDate(calculateNewEndDate(selectedPlan.expires_at, dur, isQ));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  <option value={1}>+1 Period (Default)</option>
                  <option value={2}>+2 Periods</option>
                  <option value={3}>+3 Periods</option>
                  <option value={6}>+6 Periods</option>
                  <option value={12}>+12 Periods (Full Year)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Total Amount Due:</span>
                  <span className="text-base font-extrabold font-mono">
                    NGN {(Number(selectedPlan.pricing_plan?.price || 0) * extendDuration).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-emerald-500/20">
                  <span>New Expiration Date:</span>
                  <span className="font-mono text-white">{formatDateWithTime(calculatedNewEndDate)}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Payment Method</label>
                <select
                  value={extendPaymentMethod}
                  onChange={(e) => setExtendPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="POS">POS Terminal</option>
                  <option value="CASH">Cash</option>
                  <option value="PAYSTACK">Online Payment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/20"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
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
