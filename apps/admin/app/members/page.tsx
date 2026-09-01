'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddMemberModal from '../components/AddMemberModal';
import { apiFetch } from '../lib/apiClient';
import {
  IconFingerprint,
  IconMail,
  IconPhone,
  IconPrinter,
  IconEdit,
  IconX,
  IconPlayerPause,
  IconKey,
  IconTrash,
  IconDotsVertical,
  IconSearch,
  IconPlus,
} from '@tabler/icons-react';

export default function MemberDirectoryPage() {
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);

  // Modals & Actions state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);

  // Form states
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState('male');

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState('male');

  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Sorting & Pagination states (default sorted by updated_at desc)
  const [sortColumn, setSortColumn] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Assign Plan Modal state
  const [assignPlanMember, setAssignPlanMember] = useState<any | null>(null);
  const [assignPlanId, setAssignPlanId] = useState<string>('');
  const [assignPaymentMethod, setAssignPaymentMethod] = useState<string>('POS');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (filterGender) queryParams.set('gender', filterGender);
      if (filterStatus) queryParams.set('status', filterStatus);
      queryParams.set('per_page', '500');

      const json = await apiFetch(`/admin/members?${queryParams.toString()}`);
      if (json.success && json.data) {
        const memberList = Array.isArray(json.data) ? json.data : (json.data.data || []);
        const formatted = memberList.map((m: any) => {
          const activePlanObj = m.active_plan?.pricing_plan;
          const rawPlanName = m.computed_plan_name || activePlanObj?.name || m.plan_name || m.plan || '';
          
          // Check if plan is dummy system registration or missing/none
          const isSystemOrNone = !rawPlanName || 
            ['SYSTEM-FR', 'None', 'SYSTEM-RG', 'Registration'].includes(rawPlanName.trim());

          const hasPlan = !isSystemOrNone;
          const planName = hasPlan ? rawPlanName : null;

          // Join Date
          const joinDateFormatted = m.created_at
            ? new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'N/A';

          // Registration Expiry Date
          const expiryDateVal = m.active_plan?.expires_at || m.registration_expiry_date || m.expires_at;
          const regExpiryFormatted = (hasPlan && expiryDateVal)
            ? new Date(expiryDateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'N/A';

          // Last Modified Date & Full Timestamp Tooltip
          const updatedDateVal = m.updated_at || m.created_at;
          let lastModFormatted = 'N/A';
          let lastModFullTooltip = '';
          if (updatedDateVal) {
            const d = new Date(updatedDateVal);
            if (!isNaN(d.getTime())) {
              lastModFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              lastModFullTooltip = `${lastModFormatted}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
            }
          }

          // Registration Status
          let computedStatus = 'Registered';
          const rawStatus = (m.registration_status || m.status || '').toUpperCase();
          if (rawStatus === 'NOT_YET_REGISTERED') {
            computedStatus = 'Not Yet Registered';
          } else if (rawStatus === 'EXPIRED') {
            computedStatus = 'Expired';
          }

          // Biometrics Flag
          const hasBiometrics = Boolean(m.biometric_hash || m.biometricHash || m.biometric_enrolled);

          // Registration Source
          const regSource = m.registration_source || m.registrationSource || 'Self (Web)';

          return {
            id: m.id,
            uuid: m.uuid || `fc-m-${m.id}`,
            firstName: m.first_name || '',
            lastName: m.last_name || '',
            name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Member',
            email: m.email || '',
            phone: m.phone || '',
            gender: m.gender || 'male',
            plan: planName,
            hasPlan: hasPlan,
            status: computedStatus,
            joinDate: joinDateFormatted,
            regExpiry: regExpiryFormatted,
            lastModified: lastModFormatted,
            lastModFullTooltip: lastModFullTooltip,
            rawUpdatedAt: updatedDateVal ? new Date(updatedDateVal).getTime() : 0,
            rawCreatedAt: m.created_at ? new Date(m.created_at).getTime() : 0,
            hasBiometrics: hasBiometrics,
            regSource: regSource,
            photoUrl: m.photo_url || m.photoUrl || null,
          };
        });
        setMembers(formatted);
        setTotalCount(json.data.total || formatted.length);
      }
    } catch (err) {
      console.error('Failed to fetch live members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const json = await apiFetch('/admin/pricing-plans');
      if (json.success && json.data) {
        setPricingPlans(Array.isArray(json.data) ? json.data : (json.data.data || []));
      }
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    }
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterGender, filterStatus]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) return;

    try {
      const json = await apiFetch('/admin/members', {
        method: 'POST',
        body: JSON.stringify({
          first_name: newFirstName,
          last_name: newLastName,
          email: newEmail,
          phone: newPhone,
          gender: newGender,
        }),
      });

      if (json.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setShowAddModal(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
    }
  };

  const handleAssignPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignPlanMember || !assignPlanId) return;

    setIsAssigning(true);
    try {
      const json = await apiFetch('/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          member_id: assignPlanMember.id,
          pricing_plan_id: assignPlanId,
          payment_method: assignPaymentMethod,
        }),
      });

      if (json.success) {
        fetchMembers();
        setAssignPlanMember(null);
      } else {
        alert(json.message || 'Failed to assign plan');
      }
    } catch (err) {
      console.error('Failed to assign plan:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const json = await apiFetch(`/admin/members/${editingMember.uuid || editingMember.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          phone: editPhone,
          gender: editGender,
        }),
      });

      if (json.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to update member:', err);
    }

    setEditingMember(null);
  };

  const handleToggleStatus = async (member: any) => {
    try {
      await apiFetch(`/admin/members/${member.uuid || member.id}/toggle-status`, {
        method: 'POST',
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to toggle member status:', err);
    }
    setOpenDropdownId(null);
  };

  const handleDeleteMember = async (member: any) => {
    if (!confirm(`Are you sure you want to delete member: ${member.name}?`)) return;

    try {
      await apiFetch(`/admin/members/${member.uuid || member.id}`, {
        method: 'DELETE',
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
    setOpenDropdownId(null);
  };

  const handleSimulateFingerprint = (member: any) => {
    alert(`🖐️ Fingerprint scan simulated successfully for Member: ${member.name} (${member.uuid})!`);
    setOpenDropdownId(null);
  };

  const handleResetPassword = (member: any) => {
    alert(`🔑 Password reset link generated for ${member.name} (${member.email}).`);
    setOpenDropdownId(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredMembers.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number | string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const filteredMembers = members.filter(m => {
    const q = search.trim().toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const matchesSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.uuid.toLowerCase().includes(q);

    const matchesPlan = !filterPlan || (m.plan ? m.plan.toLowerCase().includes(filterPlan.toLowerCase()) : false);

    let matchesStatus = true;
    if (filterStatus) {
      const fs = filterStatus.toUpperCase();
      if (fs === 'REGISTERED') {
        matchesStatus = m.status === 'Registered';
      } else if (fs === 'NOT_YET_REGISTERED') {
        matchesStatus = m.status === 'Not Yet Registered';
      } else if (fs === 'EXPIRED') {
        matchesStatus = m.status === 'Expired' || Boolean(m.plan && m.plan.includes('Expired'));
      } else if (fs === 'PAUSED') {
        matchesStatus = Boolean(m.plan && m.plan.includes('(⏸)'));
      } else if (fs === 'BIOMETRICS' || fs === 'REGISTERED_BIOMETRICS') {
        matchesStatus = Boolean(m.hasBiometrics);
      } else if (fs === 'NO_CHECKINS_7_DAYS') {
        matchesStatus = true; // Handled dynamically via API fetch
      }
    }

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let valA: any = a[sortColumn];
    let valB: any = b[sortColumn];

    if (sortColumn === 'updatedAt') {
      valA = a.rawUpdatedAt || 0;
      valB = b.rawUpdatedAt || 0;
    } else if (sortColumn === 'joinDate') {
      valA = a.rawCreatedAt || 0;
      valB = b.rawCreatedAt || 0;
    }

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMembers.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMembers = sortedMembers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Manage Users" subtitle="Dashboard / Manage Users" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1400px]">
          {/* Header Card & Filter Bar matching exact design spec */}
          <div className="p-6 rounded-3xl bg-[#18181b] border border-gray-800 shadow-xl space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Member Directory</h2>
                <p className="text-xs text-gray-400 mt-1">Manage gym memberships and profiles.</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#121217] hover:bg-gray-800 text-white font-extrabold text-xs rounded-xl border border-gray-700 shadow-lg transition flex items-center gap-2 self-start md:self-auto"
              >
                <span className="text-base">+</span> Add New Member
              </button>
            </div>

            {/* Filter controls row matching exact screenshot layout */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-semibold">
                  Total records: <span className="text-white font-bold">{totalCount || filteredMembers.length}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Gender Filter */}
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Statuses</option>
                  <option value="REGISTERED">Registered</option>
                  <option value="NOT_YET_REGISTERED">Not Yet Registered</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="BIOMETRICS">Registered Biometrics</option>
                  <option value="NO_CHECKINS_7_DAYS">No Checkins - Last 7 days</option>
                </select>

                {/* Plans Filter */}
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Plans</option>
                  {pricingPlans.map((p) => (
                    <option key={p.id} value={p.formatted_name || p.name}>
                      {p.filter_label || `${p.category || 'SUBSCRIPTION'} - ${p.name}`}
                    </option>
                  ))}
                </select>

                {/* Print Button */}
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-[#0f0f11] hover:bg-gray-800 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <IconPrinter size={14} /> Print
                </button>

                {/* Search Input */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500">🔍</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members..."
                    className="pl-8 pr-4 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 w-52 md:w-64"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Members Table Card matching screenshot exact columns */}
          <div className="rounded-3xl bg-[#18181b] border border-gray-800 overflow-visible shadow-2xl relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#121217] text-[11px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-800 select-none">
                  <tr>
                    <th className="px-4 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedMembers.length && paginatedMembers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(paginatedMembers.map(m => m.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded border-gray-700 bg-[#0f0f11] text-orange-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('name')}>
                      MEMBER {sortColumn === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-5 py-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('plan')}>
                      PLAN {sortColumn === 'plan' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-5 py-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('status')}>
                      STATUS {sortColumn === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-5 py-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('joinDate')}>
                      JOIN DATE {sortColumn === 'joinDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-5 py-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('regExpiry')}>
                      REG. EXPIRY {sortColumn === 'regExpiry' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-5 py-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('updatedAt')}>
                      MODIFIED {sortColumn === 'updatedAt' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-5 py-4">REG. SOURCE</th>
                    <th className="px-4 py-4 text-center w-12"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-xs font-semibold">Loading members directory...</p>
                      </td>
                    </tr>
                  ) : paginatedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        No members found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedMembers.map((member) => {
                      const isSelected = selectedIds.includes(member.id);
                      const isDropdownOpen = openDropdownId === member.id;

                      // Plan badge style
                      const isExpiredPlan = member.plan ? member.plan.toLowerCase().includes('expired') : false;
                      const planBadgeStyle = isExpiredPlan
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-300 border border-purple-500/20';

                      return (
                        <tr
                          key={member.id}
                          className={`hover:bg-[#202026] transition relative ${isSelected ? 'bg-[#222228]' : ''}`}
                        >
                          {/* Selection Checkbox */}
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(member.id)}
                              className="rounded border-gray-700 bg-[#0f0f11] text-orange-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Member Column */}
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-xs shrink-0 mt-0.5">
                                {member.photoUrl ? (
                                  <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</span>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <span className="font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer text-sm">
                                    {member.name}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-normal text-gray-400 shrink-0">
                                    <span>({(member.gender || 'male').toLowerCase().charAt(0)})</span>
                                    {member.hasBiometrics && (
                                      <IconFingerprint size={14} className="text-emerald-400 shrink-0" title="Biometrics Registered" />
                                    )}
                                  </span>
                                </div>

                                {member.email && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                                    <IconMail size={13} className="text-gray-500 shrink-0" />
                                    <span>{member.email}</span>
                                  </div>
                                )}
                                {member.phone && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                    <IconPhone size={13} className="text-gray-500 shrink-0" />
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Plan Column */}
                          <td className="px-5 py-4">
                            {member.hasPlan && member.plan ? (
                              <span className={`text-[11px] font-bold px-3 py-1 rounded-lg inline-block ${planBadgeStyle}`}>
                                {member.plan}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssignPlanMember(member);
                                  if (pricingPlans.length > 0) setAssignPlanId(String(pricingPlans[0].id));
                                }}
                                className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 inline-block"
                              >
                                + Assign Plan
                              </button>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="px-5 py-4">
                            {member.status === 'Not Yet Registered' ? (
                              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-block">
                                Not Yet Registered
                              </span>
                            ) : member.status === 'Expired' ? (
                              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 inline-block">
                                Expired
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-block">
                                {member.status}
                              </span>
                            )}
                          </td>

                          {/* Join Date Column */}
                          <td className="px-5 py-4 text-gray-300 font-medium text-[11px]">
                            {member.joinDate}
                          </td>

                          {/* Reg Expiry Column */}
                          <td className="px-5 py-4 text-gray-300 font-medium text-[11px]">
                            {member.regExpiry}
                          </td>

                          {/* Last Modified Column */}
                          <td className="px-5 py-4 text-gray-400 font-medium text-[11px]">
                            <span title={member.lastModFullTooltip} className="cursor-pointer hover:text-white transition">
                              {member.lastModified}
                            </span>
                          </td>

                          {/* Reg Source Column */}
                          <td className="px-5 py-4">
                            {member.regSource && member.regSource.toLowerCase().includes('admin') ? (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-purple-600 text-white border border-purple-500 inline-block">
                                {member.regSource}
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block">
                                {member.regSource || 'Self (Web)'}
                              </span>
                            )}
                          </td>

                          {/* 3 Vertical Dots Actions Dropdown */}
                          <td className="px-4 py-4 text-center relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(isDropdownOpen ? null : member.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
                              title="Member Actions"
                            >
                              <IconDotsVertical size={16} />
                            </button>

                            {/* Floating Actions Dropdown Card matching exact design in screenshot */}
                            {isDropdownOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-6 top-10 z-50 w-56 bg-[#18181b] border border-gray-800 rounded-2xl p-2 shadow-2xl text-left space-y-1 text-xs backdrop-blur-xl"
                              >
                                <div className="px-3 py-2 border-b border-gray-800 mb-1">
                                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">
                                    MEMBER ACTIONS
                                  </span>
                                  <span className="font-bold text-white text-xs truncate block mt-0.5">
                                    {member.name}
                                  </span>
                                </div>

                                {/* Edit Member */}
                                <button
                                  onClick={() => {
                                    setEditingMember(member);
                                    setEditFirstName(member.firstName);
                                    setEditLastName(member.lastName);
                                    setEditEmail(member.email);
                                    setEditPhone(member.phone);
                                    setEditGender(member.gender);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-gray-200 hover:text-white font-medium transition"
                                >
                                  <IconEdit size={16} className="text-gray-400" />
                                  <span>Edit Member</span>
                                </button>

                                {/* Simulate Fingerprint */}
                                <button
                                  onClick={() => handleSimulateFingerprint(member)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-emerald-400 font-bold transition"
                                >
                                  <IconFingerprint size={16} className="text-emerald-400 shrink-0" />
                                  <span>Simulate Fingerprint</span>
                                </button>

                                {/* Deactivate / Activate Member */}
                                <button
                                  onClick={() => handleToggleStatus(member)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-amber-400 font-medium transition"
                                >
                                  <IconX size={16} className="text-amber-400" />
                                  <span>Deactivate Member</span>
                                </button>

                                {/* Pause Plan */}
                                <button
                                  onClick={() => {
                                    alert(`Pause Plan triggered for ${member.name}`);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-gray-300 font-medium transition"
                                >
                                  <IconPlayerPause size={16} className="text-gray-400" />
                                  <span>Pause Plan</span>
                                </button>

                                {/* Reset Password */}
                                <button
                                  onClick={() => handleResetPassword(member)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800 text-cyan-400 font-medium transition"
                                >
                                  <IconKey size={16} className="text-cyan-400" />
                                  <span>Reset Password</span>
                                </button>

                                <div className="border-t border-gray-800/80 my-1" />

                                {/* Delete Member */}
                                <button
                                  onClick={() => handleDeleteMember(member)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 font-bold transition"
                                >
                                  <IconTrash size={16} className="text-red-400" />
                                  <span>Delete Member</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-800 bg-[#121217] rounded-b-3xl text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span>
                  Showing <strong className="text-white">{sortedMembers.length > 0 ? startIndex + 1 : 0}</strong> to{' '}
                  <strong className="text-white">{Math.min(startIndex + pageSize, sortedMembers.length)}</strong> of{' '}
                  <strong className="text-white">{sortedMembers.length}</strong> records
                </span>

                <div className="flex items-center gap-2">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-[#0f0f11] border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f0f11] border border-gray-700 disabled:opacity-40 hover:bg-gray-800 text-white transition cursor-pointer disabled:cursor-not-allowed"
                >
                  « First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#0f0f11] border border-gray-700 disabled:opacity-40 hover:bg-gray-800 text-white transition cursor-pointer disabled:cursor-not-allowed"
                >
                  ‹ Prev
                </button>

                <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg bg-[#0f0f11] border border-gray-700 disabled:opacity-40 hover:bg-gray-800 text-white transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Next ›
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f0f11] border border-gray-700 disabled:opacity-40 hover:bg-gray-800 text-white transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Last »
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Register / Edit Member Modal */}
      <AddMemberModal
        show={showAddModal || Boolean(editingMember)}
        memberToEdit={editingMember}
        onHide={() => {
          setShowAddModal(false);
          setEditingMember(null);
        }}
        onSuccess={() => {
          fetchMembers();
        }}
        pricingPlans={pricingPlans}
      />

      {/* Assign Plan Modal */}
      {assignPlanMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#18181b] border border-purple-500/30 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-xl font-extrabold text-white mb-1">Assign Membership Plan</h3>
            <p className="text-xs text-purple-300 font-semibold mb-4">
              Assigning plan for <strong className="text-white">{assignPlanMember.name}</strong>
            </p>
            
            <form onSubmit={handleAssignPlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Select Pricing Plan</label>
                <select
                  required
                  value={assignPlanId}
                  onChange={(e) => setAssignPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-medium"
                >
                  {pricingPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₦{Number(p.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Payment Method</label>
                <select
                  value={assignPaymentMethod}
                  onChange={(e) => setAssignPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="POS">POS Terminal</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setAssignPlanMember(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-extrabold text-white transition flex items-center gap-1.5"
                >
                  {isAssigning ? 'Assigning...' : 'Assign & Activate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
