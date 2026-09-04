'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '../lib/apiClient';
import { applyTheme, broadcastThemeChange, ThemeSettings } from '../lib/theme';

const PRESET_THEMES = [
  {
    name: 'PolanFit Sunset',
    desc: 'Signature energetic neon orange & charcoal',
    primary: '#fa6a2e',
    accent: '#1e293b',
    bg: '#0a0a0c',
  },
  {
    name: 'Cyber Emerald',
    desc: 'High-tech performance green & deep slate',
    primary: '#10b981',
    accent: '#064e3b',
    bg: '#06130d',
  },
  {
    name: 'Electric Azure',
    desc: 'Modern athletic blue & obsidian',
    primary: '#3b82f6',
    accent: '#1e3a8a',
    bg: '#080d1a',
  },
  {
    name: 'Royal Violet',
    desc: 'Luxury boutique fitness purple & nightfall',
    primary: '#8b5cf6',
    accent: '#4c1d95',
    bg: '#0d0818',
  },
  {
    name: 'Crimson Apex',
    desc: 'Aggressive bodybuilding red & dark onyx',
    primary: '#ef4444',
    accent: '#7f1d1d',
    bg: '#140808',
  },
  {
    name: 'Amber Gold',
    desc: 'Premium gold tier & warm dark granite',
    primary: '#f59e0b',
    accent: '#78350f',
    bg: '#120d05',
  },
];

export default function ThemeSettingsPage() {
  const [primaryColor, setPrimaryColor] = useState('#fa6a2e');
  const [accentColor, setAccentColor] = useState('#1e293b');
  const [bgColor, setBgColor] = useState('#0a0a0c');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [darkMode, setDarkMode] = useState(true);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current theme on mount
  useEffect(() => {
    apiClient
      .get('/theme')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const t: ThemeSettings = res.data.data;
          if (t.primary_color) setPrimaryColor(t.primary_color);
          if (t.accent_color) setAccentColor(t.accent_color);
          if (t.bg_color) setBgColor(t.bg_color);
          if (t.text_color) setTextColor(t.text_color);
          if (t.font_family) setFontFamily(t.font_family);
          applyTheme(t);
        }
      })
      .catch((err) => {
        console.error('Failed to load theme:', err);
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSelectPreset = (preset: typeof PRESET_THEMES[0]) => {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    setBgColor(preset.bg);

    // Live preview immediately
    applyTheme({
      primary_color: preset.primary,
      accent_color: preset.accent,
      bg_color: preset.bg,
    });
  };

  const handleCustomPrimaryChange = (val: string) => {
    setPrimaryColor(val);
    applyTheme({ primary_color: val, accent_color: accentColor, bg_color: bgColor });
  };

  const handleCustomAccentChange = (val: string) => {
    setAccentColor(val);
    applyTheme({ primary_color: primaryColor, accent_color: val, bg_color: bgColor });
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSaveSuccess(false);

    const payload: ThemeSettings = {
      primary_color: primaryColor,
      accent_color: accentColor,
      bg_color: bgColor,
      text_color: textColor,
      font_family: fontFamily,
      dark_mode: darkMode,
    };

    try {
      const res = await apiClient.post('/theme', payload);
      if (res.data?.success) {
        broadcastThemeChange(payload);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(res.data?.message || 'Failed to save theme.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error saving theme.');
      // Still apply locally
      broadcastThemeChange(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#18181b]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-orange-500/20"
          >
            FC
          </Link>
          <div>
            <h1 className="font-bold text-white leading-tight text-base">Theme & White-Label Customization</h1>
            <span className="text-xs text-gray-400">Gym Branding Engine • Public Site & Admin Center</span>
          </div>
        </div>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition"
        >
          ← Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls & Presets */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-[#18181b] border border-gray-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">Brand Palette & Styling</h2>
                <p className="text-xs text-gray-400">
                  Changes sync in real-time across your public website, member gate pass, and admin dashboard.
                </p>
              </div>

              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fadeIn">
                  ✓ Theme saved & synced!
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                🎨 Curated Theme Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_THEMES.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/15'
                          : 'border-gray-800 bg-[#0f0f13] hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="font-extrabold text-xs text-white truncate">{preset.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Form */}
            <form onSubmit={handleSaveTheme} className="space-y-6 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0f0f13] border border-gray-800">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#18181b] border border-gray-700 text-xs font-mono text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                    Accent / Secondary Color
                  </label>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0f0f13] border border-gray-800">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => handleCustomAccentChange(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => handleCustomAccentChange(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#18181b] border border-gray-700 text-xs font-mono text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Typography Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                  Portal & Dashboard Typography
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f13] border border-gray-800 text-white text-xs outline-none focus:border-orange-500"
                >
                  <option value="Inter">Inter (Ultra Clean & Modern)</option>
                  <option value="Outfit">Outfit (Punchy & Bold)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sleek SaaS)</option>
                  <option value="Cabinet Grotesk">Cabinet Grotesk (High-Contrast Fitness)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-sm transition shadow-xl shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>{loading ? 'Saving & Syncing...' : 'Save & Apply Theme Settings'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#18181b] border border-gray-800 space-y-6 shadow-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono">
                  Live Preview
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">Real-Time UI Preview</h3>
                <p className="text-xs text-gray-400">Previewing how elements appear to members and staff.</p>
              </div>

              {/* Simulated Card */}
              <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Turnstile Gate Pass</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-orange-500" />
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-orange-500 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20"
                >
                  📱 Open Entrance Pass
                </button>
              </div>

              {/* Simulated Stats Metric */}
              <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Today's Check-Ins</span>
                  <p className="text-2xl font-black text-white mt-1">128</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
              </div>

              {/* Public Site Link */}
              <div className="pt-2 border-t border-gray-800">
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-400 hover:underline flex items-center justify-between font-bold"
                >
                  <span>View Member Portal in New Tab</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
