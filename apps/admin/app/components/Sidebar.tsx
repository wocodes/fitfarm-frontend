'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/', icon: '📊' },
    { label: 'Gym Members', href: '/members', icon: '👥' },
    { label: 'Pricing Plans', href: '/subscription-types', icon: '💳' },
    { label: 'Subscriptions', href: '/subscriptions', icon: '📋' },
    { label: 'Renewals', href: '/renewals', icon: '🔄' },
    { label: 'Check-in Kiosk', href: '/check-in', icon: '🚪' },
    { label: 'Check-in Logs', href: '/check-ins', icon: '📜' },
    { label: 'Staff Attendance', href: '/staff-attendance', icon: '⏰' },
    { label: 'Transactions', href: '/transactions', icon: '💰' },
    { label: 'Accounts & Audits', href: '/accounts', icon: '📑' },
    { label: 'Staff Users', href: '/admins', icon: '🛡️' },
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

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800/80">
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            GO
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">Gabriel O.</p>
            <p className="text-[10px] text-emerald-400 font-mono">Gym Owner (Active)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
