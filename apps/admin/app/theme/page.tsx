'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ThemeSettingsPage() {
  const [primaryColor, setPrimaryColor] = useState('#fa6a2e');
  const [accentColor, setAccentColor] = useState('#1e293b');
  const [bgColor, setBgColor] = useState('#0f0f11');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [darkMode, setDarkMode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#18181b]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg">
            FC
          </Link>
          <div>
            <h1 className="font-bold text-white leading-tight text-base">Theme & White-Label Customization</h1>
            <span className="text-xs text-gray-400">PolanFit Arena • Gym Admin Center</span>
          </div>
        </div>

        <Link href="/" className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition">
          ← Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Color & Typography Controls */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-[#18181b] border border-gray-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">Brand Palette & Styling</h2>
                <p className="text-xs text-gray-400">Customizations automatically apply to both your Member App & Admin Center.</p>
              </div>

              {saveSuccess && (
                <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1.5 rounded-xl">
                  ✓ Theme saved successfully!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-6">
              {/* Color Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                    Background Base Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">
                    Primary Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="Inter">Inter (Clean Modern)</option>
                    <option value="Roboto">Roboto (Google Standard)</option>
                    <option value="Outfit">Outfit (Geometric Premium)</option>
                    <option value="Poppins">Poppins (Friendly Round)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="darkToggle"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0f0f11] border-gray-700 text-orange-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="darkToggle" className="text-xs text-white font-medium cursor-pointer">
                    Enable Dark Mode UI by default
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl text-xs shadow-lg shadow-orange-500/20 transition"
              >
                Save & Apply Theme Settings
              </button>
            </form>
          </div>

          {/* Right Column: Live Interactive Component Preview */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-[#18181b] border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Live UI Preview</span>
              <span className="text-xs font-mono text-orange-400">Real-Time</span>
            </h2>

            <div
              style={{ backgroundColor: bgColor, color: textColor, fontFamily }}
              className="p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl"
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-black text-xs"
                  >
                    PF
                  </div>
                  <span className="font-bold text-sm">PolanFit Arena</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400">
                  Active
                </span>
              </div>

              {/* Preview Card */}
              <div
                style={{ backgroundColor: accentColor }}
                className="p-4 rounded-xl space-y-2 text-white"
              >
                <div className="text-xs font-bold">Monthly Standard Plan</div>
                <div className="text-xl font-extrabold" style={{ color: primaryColor }}>
                  ₦25,000 / mo
                </div>
                <p className="text-[11px] text-gray-300">Includes 10 challenge points per check-in scan.</p>
              </div>

              {/* Preview Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-2.5 rounded-xl font-bold text-black text-xs shadow-md"
                >
                  Member Checkout
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: accentColor }}
                  className="w-full py-2.5 rounded-xl font-bold text-white text-xs border border-gray-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
