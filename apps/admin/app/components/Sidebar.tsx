'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleLogout } from '../lib/apiClient';

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Super Admin');
  const [userRole, setUserRole] = useState('Gym Owner (Active)');
  const [userInitials, setUserInitials] = useState('SA');

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

  const navItems = [
    { label: 'Overview', href: '/', icon: '📊' },
    { label: 'Gym Members', href: '/members', icon: '👥' },
    { label: 'Pricing Plans', href: '/subscription-types', icon: '💳' },
    { label: 'Subscriptions', href: '/subscriptions', icon: '📋' },
    { label: 'Renewals', href: '/renewals', icon: '🔄' },
    { label: 'Check-in Kiosk', href: '/check-in', icon: '🚪' },
    { label: 'Check-in Logs', href: '/check-ins', icon: '📜' },
    { label: 'QR Generator', href: '/admins/qr-generator', icon: '📱' },
    { label: 'Campaigns & Leaderboard', href: '/campaigns', icon: '🏆' },
    { label: 'Email Blast Broadcast', href: '/campaigns/email-blast', icon: '📧' },
    { label: 'Staff Attendance', href: '/staff-attendance', icon: '⏰' },
    { label: 'Transactions', href: '/transactions', icon: '💰' },
    { label: 'Accounts & Audits', href: '/accounts', icon: '📑' },
    { label: 'Manage Admins', href: '/admins', icon: '🛡️' },
    { label: 'Contact & Socials', href: '/contact', icon: '🌐' },
    { label: 'Legal & Policies', href: '/legal', icon: '⚖️' },
    { label: 'Gym Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0f0f13] border-r border-gray-800/80 flex flex-col justify-between min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-gray-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-black text-lg shadow-lg shadow-orange-500/20">
            FC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">FitCloud</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Gym Management Center</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-md shadow-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Sign Out */}
      <div className="p-4 border-t border-gray-800/80 space-y-2">
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {userInitials}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-emerald-400 font-mono truncate">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
