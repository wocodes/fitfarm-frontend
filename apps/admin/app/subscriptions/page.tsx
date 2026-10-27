'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
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

export default function SubscriptionsPage() {
  const [data, setData] = useState<MemberPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [totalUnfilteredRows, setTotalUnfilteredRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Filter States
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Bulk Selection State
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

  // Action Loading States
  const [isReconcilingPlans, setIsReconcilingPlans] = useState(false);

  // Reference Data
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<MemberPlan | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Form States
  const [assignData, setAssignData] = useState({
    memberId: '',
    pricingPlanId: '',
    startDate: '',
    endDate: '',
    paymentMethod: 'BANK_TRANSFER',
  });

  const [editData, setEditData] = useState({ startDate: '', endDate: '' });
  const [bulkEditData, setBulkEditData] = useState({ startDate: '', endDate: '' });

  // Extension Modal Form States
  const [extendDuration, setExtendDuration] = useState<number>(1);
  const [calculatedNewEndDate, setCalculatedNewEndDate] = useState<string>('');
  const [extendPaymentMethod, setExtendPaymentMethod] = useState('BANK_TRANSFER');

  // Open Actions Dropdown Index
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Fetch Member Plans from Backend
  const loadMemberPlans = useCallback(
    async (
      page = 1,
      search = filterText,
      status = filterStatus,
      planId = filterPlan,
      start = filterStartDate,
      end = filterEndDate
    ) => {
      setLoading(true);
      let query = `page=${page}&size=${PAGE_SIZE}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (status === 'EXPIRING_SOON') {
        query += `&expiringSoon=true`;
      } else if (status) {
        query += `&status=${encodeURIComponent(status)}`;
      }
      if (planId) query += `&pricingPlanId=${encodeURIComponent(planId)}`;
      if (start) query += `&startDate=${encodeURIComponent(start)}`;
      if (end) query += `&endDate=${encodeURIComponent(end)}`;

      try {
        const json = await apiFetch(`/admin/subscriptions?${query}`);
        if (json.success && json.data) {
          const content = json.data.content || json.data || [];
          const total = json.data.totalElements || content.length || 0;
          setData(content);
          setTotalRows(total);
          if (!search && !status && !planId && !start && !end) {
            setTotalUnfilteredRows(total);
          }
        }
      } catch (err) {
        console.error('Failed to load member plans:', err);
      } finally {
        setLoading(false);
      }
    },
    [filterText, filterStatus, filterPlan, filterStartDate, filterEndDate]
  );

  // Fetch Reference Data (Pricing Plans & Members List)
  const loadReferenceData = async () => {
    try {
      const [plansRes, membersRes] = await Promise.all([
        apiFetch('/admin/pricing-plans'),
        apiFetch('/admin/members?per_page=1000'),
      ]);

      if (plansRes.success && plansRes.data) {
        setPricingPlans(Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.data || []);
      }
      if (membersRes.success && membersRes.data) {
        setMembersList(Array.isArray(membersRes.data) ? membersRes.data : membersRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reference data:', err);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadMemberPlans(1, filterText, filterStatus, filterPlan, filterStartDate, filterEndDate);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterText, filterStatus, filterPlan, filterStartDate, filterEndDate, loadMemberPlans]);

  // Date Formatter
  const formatDateWithTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const dateFormatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${dateFormatted} ${timeFormatted}`;
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

  const getDurationDays = (plan: any) => {
    let duration = plan.duration_days ? Number(plan.duration_days) : 30;
    const planName = (plan.name || '').toLowerCase();
    if (duration === 1 || planName.includes('daily') || planName.includes('day')) {
      return 0;
    } else if (planName.includes('annual') || planName.includes('yearly') || planName.includes('year')) {
      return 365;
    } else if (planName.includes('quarterly') || planName.includes('quarter')) {
      return 90;
    } else if (planName.includes('weekly') || planName.includes('week')) {
      return 7;
    }
    return duration;
  };

  // Plan Selection Handler in Assign Modal
  const handleAssignPlanChange = (planId: string) => {
    const plan = pricingPlans.find((p) => String(p.id) === planId);
    if (plan) {
      const today = assignData.startDate ? new Date(assignData.startDate) : new Date();
      const startDateStr = formatDateTimeLocal(today);
      const duration = getDurationDays(plan);
      const endD = new Date(today);
      endD.setDate(today.getDate() + duration);

      if (duration === 0) {
        endD.setHours(22, 0, 0, 0);
      }
      const endDateStr = formatDateTimeLocal(endD);

      setAssignData((prev) => ({
        ...prev,
        pricingPlanId: planId,
        startDate: prev.startDate || startDateStr,
        endDate: endDateStr,
      }));
    } else {
      setAssignData((prev) => ({ ...prev, pricingPlanId: planId }));
    }
  };

  // Action: Assign Plan Submit
  const handleAssignPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.memberId || !assignData.pricingPlanId) {
      alert('Please select both a member and a pricing plan.');
      return;
    }

    try {
      const json = await apiFetch('/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          member_id: assignData.memberId,
          pricing_plan_id: assignData.pricingPlanId,
          starts_at: assignData.startDate,
          payment_method: assignData.paymentMethod,
        }),
      });

      if (json.success) {
        alert('🎉 Subscription plan assigned successfully!');
        setShowAssignModal(false);
        setAssignData({ memberId: '', pricingPlanId: '', startDate: '', endDate: '', paymentMethod: 'BANK_TRANSFER' });
        loadMemberPlans(currentPage);
      } else {
        alert(`⚠️ Failed to assign plan: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Exception: ${err.message || 'Failed to connect to API server.'}`);
    }
  };

  // Action: Extend Plan Submit
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const unitPrice = selectedPlan.pricing_plan?.price ? Number(selectedPlan.pricing_plan.price) : 0;
    const totalCost = unitPrice * extendDuration;

    const isConfirmed = window.confirm(
      `Confirm Extension for ${selectedPlan.member?.name || 'Member'}?\n\n` +
        `Plan: ${selectedPlan.pricing_plan?.name}\n` +
        `Duration: +${extendDuration} period(s)\n` +
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
        alert(`🎉 Subscription extended successfully!\n\nNew expiration date: ${formatDateWithTime(calculatedNewEndDate)}`);
        setShowExtendModal(false);
        setSelectedPlan(null);
        loadMemberPlans(currentPage);
      } else {
        alert(`⚠️ Extension failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Extension error: ${err.message || 'Failed to update.'}`);
    }
  };

  // Action: Edit Dates Submit
  const handleUpdateDatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const json = await apiFetch(`/admin/subscriptions/${selectedPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          startDate: editData.startDate,
          endDate: editData.endDate,
        }),
      });

      if (json.success) {
        alert('🎉 Subscription dates updated successfully!');
        setShowEditModal(false);
        setSelectedPlan(null);
        loadMemberPlans(currentPage);
      } else {
        alert(`⚠️ Update failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Update error: ${err.message || 'Error updating dates.'}`);
    }
  };

  // Action: Delete Plan
  const handleDeletePlan = async (plan: MemberPlan) => {
    const memberName = plan.member ? `${plan.member.first_name || ''} ${plan.member.last_name || ''}`.trim() || plan.member.name : 'Member';
    const isConfirmed = window.confirm(`Are you sure you want to delete the plan "${plan.pricing_plan?.name}" for ${memberName}?`);
    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/subscriptions/${plan.id}`, {
        method: 'DELETE',
      });

      if (json.success) {
        alert('🎉 Member plan deleted successfully.');
        loadMemberPlans(currentPage);
      } else {
        alert(`⚠️ Delete failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Delete error: ${err.message || 'Failed to delete.'}`);
    }
  };

  // Action: Reconcile Plan Statuses
  const handleReconcilePlanStatuses = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reconcile plan statuses? Active plans past expiration will be marked EXPIRED, and future end-date plans will be set to ACTIVE.'
    );
    if (!confirmed) return;

    try {
      setIsReconcilingPlans(true);
      const json = await apiFetch('/admin/subscriptions/reconcile-statuses', {
        method: 'POST',
      });

      if (json.success) {
        alert(`🎉 ${json.message || 'Plan statuses reconciled successfully!'}`);
        loadMemberPlans(currentPage);
      } else {
        alert(`⚠️ Reconcile failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Reconcile error: ${err.message || 'Error running reconciliation.'}`);
    } finally {
      setIsReconcilingPlans(false);
    }
  };

  // Action: Bulk Update Dates Submit
  const handleBulkUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRowIds.length === 0) return;

    try {
      const json = await apiFetch('/admin/subscriptions/bulk-update', {
        method: 'PUT',
        body: JSON.stringify({
          planIds: selectedRowIds,
          startDate: bulkEditData.startDate,
          endDate: bulkEditData.endDate,
        }),
      });

      if (json.success) {
        alert('🎉 Bulk update completed successfully!');
        setShowBulkEditModal(false);
        setSelectedRowIds([]);
        loadMemberPlans(currentPage);
      } else {
        alert(`⚠️ Bulk update failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Bulk update error: ${err.message || 'Failed.'}`);
    }
  };

  // Action: Clear Filters
  const handleClearFilters = () => {
    setFilterText('');
    setFilterStatus('');
    setFilterPlan('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
    loadMemberPlans(1, '', '', '', '', '');
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

  // Selection Checkbox Handler
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(data.map((row) => row.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedRowIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Member Subscriptions" subtitle="Active member plans, extensions, status reconciliations, and financial ledgers" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Control Header & Actions Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f0f13] border border-gray-800">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>📋 Member Plans Directory</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                  {totalRows} Total
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Manage member plan assignments, duration extensions, date adjustments, and financial tracking.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {selectedRowIds.length > 0 && (
                <button
                  onClick={() => setShowBulkEditModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-2"
                >
                  <span>✏️ Bulk Edit Dates ({selectedRowIds.length})</span>
                </button>
              )}

              <button
                onClick={handleReconcilePlanStatuses}
                disabled={isReconcilingPlans}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-2"
              >
                <span>🔄 {isReconcilingPlans ? 'Reconciling...' : 'Reconcile Plan Statuses'}</span>
              </button>

              <button
                onClick={() => setShowAssignModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
              >
                <span>+ Assign Plan</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[260px]">
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search member name, UID, phone, or email..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white placeholder-gray-500 text-xs outline-none focus:border-orange-500/50 transition"
                />
              </div>

              {/* Status Filter Dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold outline-none focus:border-orange-500/50"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Plans</option>
                <option value="paused">Paused Plans</option>
                <option value="expired">Expired Plans</option>
                <option value="EXPIRING_SOON">Expiring Soon (7 Days)</option>
              </select>

              {/* Pricing Plan Dropdown */}
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
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs outline-none"
                  title="Start Date From"
                />
                <span className="text-gray-500 text-xs">to</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs outline-none"
                  title="End Date To"
                />
              </div>

              {/* Reset Filters */}
              {(filterText || filterStatus || filterPlan || filterStartDate || filterEndDate) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Records Counter Summary */}
            <div className="text-xs text-gray-400 flex items-center justify-between pt-2 border-t border-gray-800/60">
              <div>
                {filterText || filterStatus || filterPlan || filterStartDate || filterEndDate ? (
                  <span>
                    Showing <strong className="text-white">{totalRows}</strong> of <strong className="text-white">{totalUnfilteredRows}</strong> matching plans
                  </span>
                ) : (
                  <span>
                    Total records: <strong className="text-white">{totalRows}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="overflow-x-auto min-h-[380px]">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Loading subscription records...
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="text-4xl">📄</div>
                  <h3 className="text-base font-bold text-gray-300">No member plans found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try adjusting your search criteria or assign a new plan to a member using the + Assign Plan button.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRowIds.length === data.length && data.length > 0}
                          onChange={handleToggleSelectAll}
                          className="rounded bg-gray-900 border-gray-700 text-orange-500"
                        />
                      </th>
                      <th className="py-3.5 px-4 w-16">S/N</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Plan & Category</th>
                      <th className="py-3.5 px-4">Start Date</th>
                      <th className="py-3.5 px-4">End Date</th>
                      <th className="py-3.5 px-4">Last Modified</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
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
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRowIds.includes(row.id)}
                              onChange={() => handleToggleSelectRow(row.id)}
                              className="rounded bg-gray-900 border-gray-700 text-orange-500"
                            />
                          </td>

                          <td className="py-3.5 px-4 text-gray-400 font-mono">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>

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
                            <div className="flex items-center gap-1.5">
                              {row.status === 'paused' || row.status === 'PAUSED' ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                  ⏸️ {planTitle}
                                </span>
                              ) : (
                                <span className="font-semibold text-orange-400">{planTitle}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400">{planCategory}</div>
                          </td>

                          <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap">
                            {formatDateWithTime(row.starts_at)}
                          </td>

                          <td className="py-3.5 px-4 text-gray-300 font-mono whitespace-nowrap">
                            {formatDateWithTime(row.expires_at)}
                          </td>

                          <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                            {formatDateWithTime(row.updated_at || row.created_at || '')}
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

                          {/* Actions Menu */}
                          <td className="py-3.5 px-4 text-right relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
                              className="w-8 h-8 rounded-lg bg-gray-800/60 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition"
                              title="Actions"
                            >
                              ⋮
                            </button>

                            {openDropdownId === row.id && (
                              <div
                                className="absolute right-4 top-12 z-50 w-48 bg-[#18181b] border border-gray-800 rounded-2xl p-2 shadow-2xl text-left animate-fadeIn space-y-1"
                                onMouseLeave={() => setOpenDropdownId(null)}
                              >
                                <div className="px-3 py-1.5 border-b border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  Plan Actions
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedPlan(row);
                                    setShowViewModal(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-xs text-gray-200 hover:text-white transition"
                                >
                                  <span>👁️ View Details</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedPlan(row);
                                    setEditData({ startDate: row.starts_at, endDate: row.expires_at });
                                    setShowEditModal(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-xs text-gray-200 hover:text-white transition"
                                >
                                  <span>✏️ Edit Dates</span>
                                </button>

                                {row.status !== 'expired' && row.status !== 'EXPIRED' && (
                                  <button
                                    onClick={() => {
                                      setSelectedPlan(row);
                                      setExtendDuration(1);
                                      const isQ = isQuarterlyPlan(row);
                                      setCalculatedNewEndDate(calculateNewEndDate(row.expires_at, 1, isQ));
                                      setShowExtendModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-500/10 text-xs text-emerald-400 hover:text-emerald-300 transition"
                                  >
                                    <span>📅 Extend Plan</span>
                                  </button>
                                )}

                                <div className="border-t border-gray-800 my-1"></div>

                                <button
                                  onClick={() => {
                                    handleDeletePlan(row);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-xs text-red-400 hover:text-red-300 transition"
                                >
                                  <span>🗑️ Delete Plan</span>
                                </button>
                              </div>
                            )}
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
                      loadMemberPlans(newP);
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
                      loadMemberPlans(newP);
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

      {/* Modal 1: Assign Plan Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Assign New Member Plan</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignPlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Select Member</label>
                <select
                  value={assignData.memberId}
                  onChange={(e) => setAssignData({ ...assignData, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none focus:border-orange-500/50"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name || m.last_name ? `${m.first_name || ''} ${m.last_name || ''}`.trim() : m.name} (
                      {m.phone || m.email || `ID: ${m.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Select Pricing Plan</label>
                <select
                  value={assignData.pricingPlanId}
                  onChange={(e) => handleAssignPlanChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none focus:border-orange-500/50"
                  required
                >
                  <option value="">-- Choose Plan --</option>
                  {pricingPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — NGN {Number(p.price).toLocaleString()} ({p.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={assignData.startDate}
                    onChange={(e) => setAssignData({ ...assignData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Calculated Expiration</label>
                  <input
                    type="datetime-local"
                    value={assignData.endDate}
                    onChange={(e) => setAssignData({ ...assignData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Payment Method</label>
                <select
                  value={assignData.paymentMethod}
                  onChange={(e) => setAssignData({ ...assignData, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (Default)</option>
                  <option value="POS">POS Terminal</option>
                  <option value="CASH">Cash</option>
                  <option value="PAYSTACK">Online Payment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  Assign & Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Extend Plan Modal */}
      {showExtendModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Extend Subscription Duration</h3>
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
                  <span className="text-gray-400">Subscriber:</span>
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
                  Extension Duration ({isQuarterlyPlan(selectedPlan) ? 'Quarter(s)' : 'Month(s)'})
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
                  Confirm Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Dates Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Edit Plan Dates</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDatesSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={editData.startDate ? editData.startDate.substring(0, 16) : ''}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={editData.endDate ? editData.endDate.substring(0, 16) : ''}
                  onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  Save Date Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: View Details Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Subscriber Plan Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Subscriber Name:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedPlan.member
                      ? `${selectedPlan.member.first_name || ''} ${selectedPlan.member.last_name || ''}`.trim() || selectedPlan.member.name
                      : 'Member'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member UID:</span>
                  <span className="font-mono text-orange-400">{selectedPlan.member?.uuid || `ID-${selectedPlan.member_id}`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-gray-200">{selectedPlan.member?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-gray-200">{selectedPlan.member?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plan Name:</span>
                  <span className="font-bold text-orange-400">{selectedPlan.pricing_plan?.name || 'Standard Plan'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plan Category:</span>
                  <span className="text-gray-300">{selectedPlan.pricing_plan?.category || 'SUBSCRIPTION'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Price Rate:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    NGN {Number(selectedPlan.pricing_plan?.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-gray-300">{selectedPlan.pricing_plan?.duration_days || 30} days</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Start Date:</span>
                  <span className="text-white font-mono">{formatDateWithTime(selectedPlan.starts_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Expiration Date:</span>
                  <span className="text-white font-mono">{formatDateWithTime(selectedPlan.expires_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedPlan.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {selectedPlan.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-gray-800">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Member Profile Modal */}
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

      {/* Modal 6: Bulk Edit Dates Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Bulk Edit Member Plan Dates</h3>
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Updating dates for <strong className="text-white">{selectedRowIds.length} selected member plan(s)</strong>.
            </p>

            <form onSubmit={handleBulkUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">New Start Date</label>
                <input
                  type="datetime-local"
                  value={bulkEditData.startDate}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">New End Date</label>
                <input
                  type="datetime-local"
                  value={bulkEditData.endDate}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowBulkEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 font-bold text-white shadow-lg shadow-purple-500/20"
                >
                  Apply Bulk Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
