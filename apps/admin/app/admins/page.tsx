'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconKey,
  IconShieldLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
  IconShieldCheck,
  IconUserCheck,
  IconUsers,
  IconPhone,
  IconMail,
  IconAlertTriangle,
  IconRefresh,
  IconUserPlus,
  IconLockCheck,
  IconSparkles,
} from '@tabler/icons-react';

interface AdminUser {
  id: number | string;
  uid?: string;
  username?: string;
  email: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
  gender?: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  status?: string;
  created_at?: string;
  updatedAt?: string;
}

interface PermissionItem {
  id: string;
  key: string;
  label: string;
  description: string;
  category?: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Form states
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [selectedAdminPermissions, setSelectedAdminPermissions] = useState<AdminUser | null>(null);
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<AdminUser | null>(null);

  // Add Form Values
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    password: '',
    role: 'ROLE_ADMIN',
  });
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit Form Values
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    gender: 'Male',
    role: 'ROLE_ADMIN',
  });

  // Reset Password Values
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Active Permissions toggle list
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper for notification auto-clear
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Fetch system permissions strictly from backend database API
  const loadPermissionsFromDatabase = async () => {
    try {
      const json = await apiFetch('/admin/permissions');
      if (json.data && Array.isArray(json.data)) {
        const mapped: PermissionItem[] = json.data.map((p: any) => ({
          id: p.key || p.id,
          key: p.key || p.id,
          label: p.label || p.name || p.key,
          description: p.description || '',
          category: p.category || 'General',
        }));
        setAvailablePermissions(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch system permissions from backend:', err);
    }
  };

  // 2. Load admins strictly from backend API
  const loadAdminsFromDatabase = async () => {
    setLoading(true);
    try {
      const json = await apiFetch('/admin/staff');
      if (json.data && Array.isArray(json.data)) {
        setAdmins(json.data);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      console.error('Failed to fetch admin users from backend:', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissionsFromDatabase();
    loadAdminsFromDatabase();
  }, []);

  // Filtered admins list
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const name = admin.name || admin.fullName || '';
      const email = admin.email || admin.username || '';
      const phone = admin.phone || admin.phoneNumber || '';
      const role = admin.role || (admin.roles ? admin.roles.join(' ') : '');

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);

      const matchesRole = !roleFilter || role.toLowerCase().includes(roleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [admins, searchQuery, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = admins.length;
    const superAdmins = admins.filter(a => (a.role || '').toLowerCase().includes('super')).length;
    const active = admins.filter(a => (a.status || 'Active') === 'Active').length;
    const customPermissions = admins.filter(a => (a.permissions || []).length > 0).length;
    return { total, superAdmins, active, customPermissions };
  }, [admins]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize phone number (digits only)
    const sanitizedPhone = addForm.phone.replace(/\D/g, '');
    if (sanitizedPhone.length !== 11) {
      showToast('Phone number must be exactly 11 digits (e.g. 08012345678)', 'error');
      return;
    }

    const nameParts = addForm.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      showToast('Please provide both First Name and Last Name (e.g. John Doe)', 'error');
      return;
    }

    if (addForm.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: addForm.fullName.trim(),
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim(),
        username: addForm.email.trim(),
        phone: sanitizedPhone,
        phoneNumber: sanitizedPhone,
        gender: addForm.gender,
        password: addForm.password,
        role: addForm.role,
        roles: [addForm.role],
        permissions: ['MANAGE_MEMBERS', 'MANAGE_CHECKINS', 'VIEW_TRANSACTIONS'],
      };

      const result = await apiFetch('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result && result.data) {
        setAdmins([result.data, ...admins]);
      } else {
        loadAdminsFromDatabase();
      }

      showToast(`🎉 New Admin '${addForm.fullName}' registered successfully!`);
      setShowAddModal(false);
      setAddForm({
        fullName: '',
        email: '',
        phone: '',
        gender: 'Male',
        password: '',
        role: 'ROLE_ADMIN',
      });
    } catch (err) {
      showToast('Failed to register admin. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleEditClick = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditForm({
      fullName: admin.name || admin.fullName || '',
      phone: admin.phone || admin.phoneNumber || '',
      gender: admin.gender || 'Male',
      role: admin.role || 'ROLE_ADMIN',
    });
    setShowEditModal(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setIsSubmitting(true);
    try {
      await apiFetch(`/admin/staff/${editingAdmin.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.fullName,
          fullName: editForm.fullName,
          phone: editForm.phone,
          phoneNumber: editForm.phone,
          gender: editForm.gender,
          role: editForm.role,
        }),
      });

      // Update state locally
      setAdmins(prev =>
        prev.map(a =>
          a.id === editingAdmin.id
            ? {
                ...a,
                name: editForm.fullName,
                phone: editForm.phone,
                gender: editForm.gender,
                role: editForm.role,
              }
            : a
        )
      );

      showToast(`Admin '${editForm.fullName}' updated successfully!`);
      setShowEditModal(false);
      setEditingAdmin(null);
    } catch (err) {
      showToast('Failed to update admin details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteClick = async (admin: AdminUser) => {
    const adminName = admin.name || admin.fullName || admin.email;
    const isSuper = (admin.role || '').toLowerCase().includes('super');

    if (isSuper && admins.filter(a => (a.role || '').toLowerCase().includes('super')).length <= 1) {
      showToast('Action Blocked: Cannot delete the primary Super Admin account.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete admin account: ${adminName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiFetch(`/admin/staff/${admin.id}`, {
        method: 'DELETE',
      });

      setAdmins(prev => prev.filter(a => a.id !== admin.id));
      showToast(`Admin '${adminName}' has been removed.`);
    } catch (err) {
      showToast('Failed to delete admin account.', 'error');
    }
  };

  // Handle Reset Password Click
  const handleResetPasswordClick = (admin: AdminUser) => {
    setResetPasswordAdmin(admin);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  // Submit Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordAdmin) return;

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(`/admin/staff/${resetPasswordAdmin.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      showToast(`🔑 Password reset successfully for ${resetPasswordAdmin.name || resetPasswordAdmin.email}`);
      setShowResetPasswordModal(false);
      setResetPasswordAdmin(null);
      setNewPassword('');
    } catch (err) {
      showToast('Failed to reset password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Permissions Modal
  const handlePermissionsClick = (admin: AdminUser) => {
    setSelectedAdminPermissions(admin);
    setActivePermissions(admin.permissions || ['MANAGE_MEMBERS', 'MANAGE_CHECKINS']);
    setShowPermissionsModal(true);
  };

  // Toggle Permission Switch
  const togglePermission = (permKey: string) => {
    setActivePermissions(prev =>
      prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]
    );
  };

  // Submit Permissions Update
  const handleSavePermissions = async () => {
    if (!selectedAdminPermissions) return;

    setIsSubmitting(true);
    try {
      await apiFetch(`/admin/staff/${selectedAdminPermissions.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: activePermissions }),
      });

      setAdmins(prev =>
        prev.map(a =>
          a.id === selectedAdminPermissions.id
            ? { ...a, permissions: activePermissions }
            : a
        )
      );

      showToast(`🛡️ Permissions updated for ${selectedAdminPermissions.name || selectedAdminPermissions.email}`);
      setShowPermissionsModal(false);
      setSelectedAdminPermissions(null);
    } catch (err) {
      showToast('Failed to update permissions.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Assign Basic Permissions
  const handleBulkAssign = async () => {
    if (!confirm('Assign default basic permissions (Members, Check-ins, Transactions, Pricing) to all non-super admins?')) {
      return;
    }

    const defaultPerms = ['MANAGE_MEMBERS', 'MANAGE_CHECKINS', 'VIEW_TRANSACTIONS', 'MANAGE_PRICING'];
    setIsSubmitting(true);
    try {
      await apiFetch('/admin/staff/bulk-permissions', {
        method: 'POST',
      });

      setAdmins(prev =>
        prev.map(a => {
          if ((a.role || '').toLowerCase().includes('super')) return a;
          return { ...a, permissions: defaultPerms };
        })
      );

      showToast('⚡ Basic permissions bulk assigned to all regular admins.');
    } catch (err) {
      showToast('Failed to bulk assign permissions.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Manage Admins & Staff"
          subtitle="Control administrator accounts, roles, access levels, and granular database permissions"
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Notification Toast */}
          {notification && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl transition-all ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-3 font-semibold text-xs">
                {notification.type === 'success' ? <IconCheck size={18} /> : <IconAlertTriangle size={18} />}
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white">
                <IconX size={16} />
              </button>
            </div>
          )}

          {/* Stats Bar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Admins</p>
                <h3 className="text-2xl font-extrabold mt-1 text-white">{stats.total}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <IconUsers size={20} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Super Admins</p>
                <h3 className="text-2xl font-extrabold mt-1 text-purple-400">{stats.superAdmins}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <IconShieldCheck size={20} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Staff</p>
                <h3 className="text-2xl font-extrabold mt-1 text-emerald-400">{stats.active}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <IconUserCheck size={20} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Custom Access</p>
                <h3 className="text-2xl font-extrabold mt-1 text-amber-400">{stats.customPermissions}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <IconShieldLock size={20} />
              </div>
            </div>
          </div>

          {/* Action Bar (Search, Filters, Buttons) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admins by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f0f13] border border-gray-800 text-white text-xs placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0f0f13] border border-gray-800 text-white text-xs font-semibold focus:border-orange-500 outline-none"
              >
                <option value="">All Roles</option>
                <option value="super">Super Admin</option>
                <option value="admin">Regular Admin</option>
                <option value="receptionist">Receptionist</option>
                <option value="trainer">Trainer</option>
              </select>

              <button
                onClick={loadAdminsFromDatabase}
                title="Reload Admins List"
                className="p-2.5 rounded-xl bg-[#0f0f13] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition"
              >
                <IconRefresh size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBulkAssign}
                disabled={isSubmitting}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold text-xs transition flex items-center gap-2"
              >
                <IconShieldLock size={15} />
                <span>Bulk Assign Access</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
              >
                <IconPlus size={16} />
                <span>Register New Admin</span>
              </button>
            </div>
          </div>

          {/* Admin Directory Data Table OR New Tenant Empty State */}
          <div className="rounded-3xl bg-[#0f0f13] border border-gray-800 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-20 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <IconRefresh size={20} className="animate-spin text-orange-500" />
                  <span className="text-sm font-semibold">Loading admin directory from database...</span>
                </div>
              </div>
            ) : filteredAdmins.length === 0 ? (
              /* NEW TENANT / ZERO ADMINS SLEEK EMPTY STATE */
              <div className="py-16 px-6 text-center max-w-2xl mx-auto space-y-6">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-2xl shadow-orange-500/20">
                    <IconUserPlus size={36} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <IconSparkles size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white">No Team Administrators Registered Yet</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                    Welcome to your FitFarmHQ Gym Center! As a tenant, you can invite your team members—such as front-desk receptionists, billing managers, and trainers—to collaborate with role-based security.
                  </p>
                </div>

                {/* Descriptive feature callouts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                  <div className="p-3.5 rounded-2xl bg-[#070709] border border-gray-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                      <IconShieldCheck size={15} />
                      <span>Role Security</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Enforce Super Admin, Regular Admin, or Receptionist access.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#070709] border border-gray-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                      <IconLockCheck size={15} />
                      <span>DB Permissions</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Toggle granular access to check-ins, pricing, and finances.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#070709] border border-gray-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <IconUsers size={15} />
                      <span>Team Workflows</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Audit staff attendance, check-ins, and member upgrades.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black text-xs transition shadow-xl shadow-orange-500/20 flex items-center gap-2"
                  >
                    <IconPlus size={16} />
                    <span>Register Your First Admin</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#070709] border-b border-gray-800 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-4 w-12 text-center">#</th>
                      <th className="py-4 px-5">Admin User</th>
                      <th className="py-4 px-5">Contact Details</th>
                      <th className="py-4 px-4">Gender</th>
                      <th className="py-4 px-5">Role & Access Level</th>
                      <th className="py-4 px-5">Active Database Permissions</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {filteredAdmins.map((admin, idx) => {
                      const name = admin.name || admin.fullName || 'Admin User';
                      const email = admin.email || admin.username || 'N/A';
                      const phone = admin.phone || admin.phoneNumber || 'N/A';
                      const gender = admin.gender || 'Male';
                      const role = admin.role || 'ROLE_ADMIN';
                      const isSuper = role.toLowerCase().includes('super');
                      const perms = admin.permissions || [];
                      const initials = name
                        .split(' ')
                        .map((n) => n.charAt(0))
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={admin.id} className="hover:bg-gray-800/30 transition">
                          {/* S/N */}
                          <td className="py-4 px-4 text-center font-bold text-gray-500">{idx + 1}</td>

                          {/* Admin User */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                  isSuper
                                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                                    : 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                                }`}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer text-sm">
                                    {name}
                                  </span>
                                  <span className="text-[10px] font-semibold text-gray-400">
                                    ({gender.toLowerCase().charAt(0)})
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-500 font-mono">{email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td className="py-4 px-5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-mono">
                                <IconPhone size={13} className="text-gray-500" />
                                <span>{phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                                <IconMail size={13} className="text-gray-500" />
                                <span>{email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Gender */}
                          <td className="py-4 px-4 font-semibold text-gray-300">{gender}</td>

                          {/* Role Badge */}
                          <td className="py-4 px-5">
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase border inline-block ${
                                isSuper
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                              }`}
                            >
                              {role.replace('ROLE_', '').replace('_', ' ')}
                            </span>
                          </td>

                          {/* Active Permissions Summary */}
                          <td className="py-4 px-5">
                            {isSuper ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                Full System Access (All DB Perms)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                                {perms.length} Granular {perms.length === 1 ? 'Permission' : 'Permissions'}
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditClick(admin)}
                                title="Edit Admin Details"
                                className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition"
                              >
                                <IconEdit size={15} />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPasswordClick(admin)}
                                title="Reset Password"
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition"
                              >
                                <IconKey size={15} />
                              </button>

                              {/* Manage Permissions (For Non-Super Admins) */}
                              {!isSuper && (
                                <button
                                  onClick={() => handlePermissionsClick(admin)}
                                  title="Manage Database Permissions"
                                  className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition"
                                >
                                  <IconShieldLock size={15} />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteClick(admin)}
                                title="Delete Admin Account"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                              >
                                <IconTrash size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* REGISTER NEW ADMIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-extrabold">Register New Administrator</h3>
                <p className="text-xs text-gray-400">Create a new admin user with database role permissions.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Must include First Name & Last Name</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Email / Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@gym.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08012345678"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">11 digits (e.g. 08012345678)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gender</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Initial Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showAddPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Admin Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                  >
                    <option value="ROLE_ADMIN">Regular Admin</option>
                    <option value="ROLE_SUPER_ADMIN">Super Admin (Full Access)</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Trainer">Trainer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold text-black text-xs transition"
                >
                  {isSubmitting ? 'Registering...' : 'Register Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-extrabold">Edit Admin: {editingAdmin.name || editingAdmin.email}</h3>
                <p className="text-xs text-gray-400">Update personal profile and contact details.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                  >
                    <option value="ROLE_ADMIN">Regular Admin</option>
                    <option value="ROLE_SUPER_ADMIN">Super Admin</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Trainer">Trainer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 font-extrabold text-black text-xs transition"
                >
                  {isSubmitting ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPasswordModal && resetPasswordAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-extrabold">Reset Password</h3>
                <p className="text-xs text-gray-400">
                  Target: <span className="text-orange-400 font-bold">{resetPasswordAdmin.name || resetPasswordAdmin.email}</span>
                </p>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showResetPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 font-extrabold text-black text-xs transition"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PERMISSIONS MODAL (DYNAMIC DATABASE PERMISSIONS) */}
      {showPermissionsModal && selectedAdminPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-extrabold">Manage Database Permissions</h3>
                <p className="text-xs text-gray-400">
                  Configure dynamic database permission toggles for <span className="text-purple-400 font-bold">{selectedAdminPermissions.name || selectedAdminPermissions.email}</span>
                </p>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {availablePermissions.map((perm) => {
                const permKey = perm.key || perm.id;
                const isChecked = activePermissions.includes(permKey);
                return (
                  <div
                    key={permKey}
                    onClick={() => togglePermission(permKey)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isChecked
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-[#070709] border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{perm.label}</h4>
                        {perm.category && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                            {perm.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{perm.description}</p>
                    </div>

                    <div
                      className={`w-10 h-5 rounded-full transition relative p-0.5 ${
                        isChecked ? 'bg-purple-500' : 'bg-gray-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition transform ${
                          isChecked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-500 font-extrabold text-white text-xs transition"
              >
                {isSubmitting ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
