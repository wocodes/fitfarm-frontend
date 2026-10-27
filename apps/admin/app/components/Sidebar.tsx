'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleLogout, prefetchApi } from '../lib/apiClient';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  prefetchUrl?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'core',
    title: 'Core',
    items: [
      { label: 'Overview', href: '/', icon: '📊', prefetchUrl: '/admin/dashboard/stats?range=weekly' },
    ],
  },
  {
    id: 'operations',
    title: 'Operations & Access',
    items: [
      { label: 'Gym Members', href: '/members', icon: '👥', prefetchUrl: '/admin/members?page=1&per_page=15' },
      { label: 'Check-in Kiosk', href: '/check-in', icon: '🚪' },
      { label: 'Check-in Logs', href: '/check-ins', icon: '📜', prefetchUrl: '/admin/attendance/logs?page=1' },
      { label: 'QR Generator', href: '/admins/qr-generator', icon: '📱', prefetchUrl: '/admin/checkin/locations' },
    ],
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    items: [
      { label: 'Pricing Plans', href: '/subscription-types', icon: '💳', prefetchUrl: '/admin/pricing-plans' },
      { label: 'Subscriptions', href: '/subscriptions', icon: '📋', prefetchUrl: '/admin/subscriptions?page=1' },
      { label: 'Renewals', href: '/renewals', icon: '🔄', prefetchUrl: '/admin/renewals?page=1' },
      { label: 'Transactions', href: '/transactions', icon: '💰', prefetchUrl: '/admin/transactions?page=1&per_page=15' },
      { label: 'Accounts & Audits', href: '/accounts', icon: '📑', prefetchUrl: '/admin/accounts' },
    ],
  },
  {
    id: 'growth',
    title: 'Growth & Marketing',
    items: [
      { label: 'Campaigns & Ranks', href: '/campaigns', icon: '🏆', prefetchUrl: '/admin/campaigns/active/leaderboard' },
      { label: 'Email Broadcast', href: '/campaigns/email-blast', icon: '📧', prefetchUrl: '/admin/campaigns/logs' },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    items: [
      { label: 'Staff Attendance', href: '/staff-attendance', icon: '⏰', prefetchUrl: '/admin/staff-attendance' },
      { label: 'Manage Admins', href: '/admins', icon: '🛡️', prefetchUrl: '/admin/staff' },
      { label: 'Website CMS & Portal', href: '/cms', icon: '💻', prefetchUrl: '/admin/cms' },
      { label: 'Theme & Branding', href: '/theme', icon: '🎨', prefetchUrl: '/admin/theme' },
      { label: 'Gym Settings', href: '/settings', icon: '⚙️', prefetchUrl: '/admin/settings' },
      { label: 'Contact & Socials', href: '/contact', icon: '🌐', prefetchUrl: '/admin/settings' },
      { label: 'Legal & Policies', href: '/legal', icon: '⚖️', prefetchUrl: '/admin/settings' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Super Admin');
  const [userRole, setUserRole] = useState('Gym Owner (Active)');
  const [userInitials, setUserInitials] = useState('SA');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track open/collapsed state for groups (default all open)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    core: true,
    operations: true,
    billing: true,
    growth: true,
    administration: true,
  });

  // Automatically keep the category containing the active route expanded
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    navGroups.forEach((group) => {
      const hasActive = group.items.some((item) => pathname === item.href);
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('fitcloud_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.name) {
            setUserName(user.name);
            const initials = user.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            setUserInitials(initials || 'SA');
          }
          if (user.role) {
            setUserRole(user.role.replace('ROLE_', '').replace('_', ' '));
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }
  }, []);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 right-5 z-[60] lg:hidden w-14 h-14 rounded-2xl bg-orange-500 text-black shadow-2xl shadow-orange-500/30 flex items-center justify-center text-2xl font-black"
        aria-label="Open navigation menu"
      >
        ☰
      </button>

    <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex-shrink-0 bg-[#0f0f13] border-r border-gray-800/80 flex flex-col h-screen select-none transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:w-64 lg:max-w-none lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Pinned Brand Header */}
      <div className="h-20 px-5 border-b border-gray-800/80 flex items-center justify-between gap-3 flex-shrink-0 bg-[#0f0f13]">
        <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-black text-lg shadow-lg shadow-orange-500/20">
          FC
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">FitFarmHQ</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Admin
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">Gym Management Center</p>
        </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 rounded-lg bg-gray-800 text-gray-300 flex items-center justify-center text-sm"
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>

      {/* Independently Scrollable Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
        {navGroups.map((group) => {
          const isGroupOpen = openGroups[group.id] ?? true;

          return (
            <div key={group.id} className="space-y-1">
              {/* Category Header (Hidden for Core to keep Overview sleek) */}
              {group.title !== 'Core' ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-300 transition-colors group cursor-pointer"
                >
                  <span className="group-hover:text-orange-400 transition-colors">
                    {group.title}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-transform duration-200 ${
                      isGroupOpen ? 'rotate-90' : 'rotate-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : null}

              {/* Group Items */}
              <div className={`space-y-1 ${isGroupOpen ? 'block' : 'hidden'}`}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => {
                        if (item.prefetchUrl) {
                          prefetchApi(item.prefetchUrl);
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-orange-500 text-black font-extrabold shadow-md shadow-orange-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 shadow" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Pinned Footer Info & Sign Out */}
      <div className="p-3.5 border-t border-gray-800/80 space-y-2 flex-shrink-0 bg-[#0f0f13]">
        <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {userInitials}
          </div>
          <div className="truncate flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-emerald-400 font-mono truncate">{userRole}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
}
