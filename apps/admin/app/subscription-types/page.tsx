'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

interface PricingPlan {
  id: number;
  name: string;
  plan_name?: string;
  category?: string;
  description?: string;
  price: number | string;
  duration_days: number;
  is_active: boolean;
  active?: boolean;
}

export default function SubscriptionTypesPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDurationDays, setFormDurationDays] = useState('30');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Pricing Plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const json = await apiFetch('/admin/pricing-plans');
      if (json.success && json.data) {
        const planList = Array.isArray(json.data) ? json.data : json.data.data || [];
        setPlans(planList);
      }
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filtered Items Memo
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        `${plan.name || ''} ${plan.plan_name || ''} ${plan.category || ''} ${plan.price} ${plan.duration_days}`
          .toLowerCase()
          .includes(filterText.toLowerCase());

      const activeState = plan.is_active ?? plan.active ?? true;

      if (filterStatus === 'ACTIVE') return matchesSearch && activeState;
      if (filterStatus === 'DISABLED') return matchesSearch && !activeState;
      return matchesSearch;
    });
  }, [plans, filterText, filterStatus]);

  // Open Create Modal
  const handleOpenAddModal = () => {
    setFormName('');
    setFormPrice('');
    setFormDurationDays('30');
    setFormDescription('');
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name || '');
    setFormPrice(String(plan.price || ''));
    setFormDurationDays(String(plan.duration_days || '30'));
    setFormDescription(plan.description || '');
    setFormIsActive(plan.is_active ?? plan.active ?? true);
    setIsEditModalOpen(true);
  };

  // Submit Create Plan
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) {
      alert('Please provide a plan name and price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const json = await apiFetch('/admin/pricing-plans', {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          price: parseFloat(formPrice),
          duration_days: parseInt(formDurationDays),
          description: formDescription,
          is_active: formIsActive,
        }),
      });

      if (json.success) {
        alert('🎉 Pricing plan created successfully!');
        setIsAddModalOpen(false);
        fetchPlans();
      } else {
        alert(`⚠️ Failed to create plan: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Creation error: ${err.message || 'Failed to connect to API server.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Plan
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setIsSubmitting(true);
    try {
      const json = await apiFetch(`/admin/pricing-plans/${editingPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formName,
          price: parseFloat(formPrice),
          duration_days: parseInt(formDurationDays),
          description: formDescription,
          is_active: formIsActive,
          active: formIsActive,
        }),
      });

      if (json.success) {
        alert('🎉 Pricing plan updated successfully!');
        setIsEditModalOpen(false);
        setEditingPlan(null);
        fetchPlans();
      } else {
        alert(`⚠️ Failed to update plan: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Update error: ${err.message || 'Failed to update plan.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Toggle Active Status
  const handleToggleStatus = async (plan: PricingPlan) => {
    const currentState = plan.is_active ?? plan.active ?? true;
    const actionText = currentState ? 'disable' : 'enable';
    const isConfirmed = window.confirm(`Are you sure you want to ${actionText} the plan "${plan.name}"?`);
    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/pricing-plans/${plan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          is_active: !currentState,
          active: !currentState,
        }),
      });

      if (json.success) {
        alert(`🎉 Plan ${plan.name} has been ${actionText}d.`);
        fetchPlans();
      } else {
        alert(`⚠️ Action failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Error: ${err.message || 'Failed to toggle status.'}`);
    }
  };

  // Action: Delete Plan
  const handleDeletePlan = async (plan: PricingPlan) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the plan "${plan.name}"?\n\nExisting member subscriptions on this plan will not be removed, but new subscriptions cannot select it.`
    );
    if (!isConfirmed) return;

    try {
      const json = await apiFetch(`/admin/pricing-plans/${plan.id}`, {
        method: 'DELETE',
      });

      if (json.success) {
        alert('🎉 Pricing plan deleted successfully.');
        fetchPlans();
      } else {
        alert(`⚠️ Delete failed: ${json.message || 'Error occurred.'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Delete error: ${err.message || 'Failed to delete.'}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Membership Pricing Plans" subtitle="Configure gym plan tiers, prices, subscription fees, and access durations" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Actions Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f0f13] border border-gray-800">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>💳 Gym Membership Plans</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                  {plans.length} Tiers
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Active plans are available for member subscription, manual admin assignments, and kiosk check-ins.
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
            >
              <span>+ Create Membership Plan</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search plan name, duration, price, or description..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white placeholder-gray-500 text-xs outline-none focus:border-orange-500/50 transition"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold outline-none focus:border-orange-500/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Plans Only</option>
                <option value="DISABLED">Disabled Plans Only</option>
              </select>

              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>

          {/* Plan Directory Data Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Loading membership plans...
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="text-4xl">💳</div>
                  <h3 className="text-base font-bold text-gray-300">No membership plans found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try adjusting your search filter or click "+ Create Membership Plan" to set up a new plan structure.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-16">S/N</th>
                      <th className="py-3.5 px-4">Plan Name</th>
                      <th className="py-3.5 px-4">Rate (NGN)</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {filteredPlans.map((plan, index) => {
                      const isActive = plan.is_active ?? plan.active ?? true;
                      return (
                        <tr key={plan.id} className="hover:bg-gray-800/30 transition">
                          <td className="py-4 px-4 text-gray-400 font-mono">{index + 1}</td>

                          <td className="py-4 px-4 font-extrabold text-white text-sm">
                            <div className="flex items-center gap-2">
                              <span>{plan.name}</span>
                              {plan.plan_name && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                                  {plan.plan_name}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm">
                            ₦{Number(plan.price).toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-gray-300 font-semibold">
                            <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-200 border border-gray-700">
                              {plan.duration_days} Days
                            </span>
                          </td>

                          <td className="py-4 px-4 text-gray-400 max-w-xs truncate">
                            {plan.description || 'Standard gym membership plan'}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(plan)}
                                className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs transition"
                              >
                                Edit Plan
                              </button>

                              <button
                                onClick={() => handleToggleStatus(plan)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                                  isActive
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }`}
                                title={isActive ? 'Disable plan from selection' : 'Enable plan for selection'}
                              >
                                {isActive ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                onClick={() => handleDeletePlan(plan)}
                                className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition"
                                title="Delete Plan"
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
        </main>
      </div>

      {/* Modal 1: Create Membership Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Create Membership Plan</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Subscription"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Price (NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="40000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono font-bold outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Duration (Days)</label>
                  <select
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none focus:border-orange-500/50"
                  >
                    <option value="1">1 Day (Daily)</option>
                    <option value="7">7 Days (Weekly)</option>
                    <option value="30">30 Days (Monthly)</option>
                    <option value="60">60 Days (Bi-Monthly)</option>
                    <option value="90">90 Days (Quarterly)</option>
                    <option value="180">180 Days (Bi-Annual)</option>
                    <option value="365">365 Days (Annual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Standard monthly access to gym facilities."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-orange-500"
                />
                <label htmlFor="create-active" className="text-gray-300 font-semibold cursor-pointer">
                  Plan is Active (Available for member subscription)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  {isSubmitting ? 'Saving...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Membership Plan Modal */}
      {isEditModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Edit Plan: {editingPlan.name}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Price (NGN)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono font-bold outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-orange-500"
                />
                <label htmlFor="edit-active" className="text-gray-300 font-semibold cursor-pointer">
                  Plan is Active (Members can select this plan)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
