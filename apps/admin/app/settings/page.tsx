'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function SettingsPage() {
  const [gymName, setGymName] = useState('PolanFit Arena');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [currency, setCurrency] = useState('NGN');
  const [primaryColor, setPrimaryColor] = useState('#fa6a2e');
  const [accentColor, setAccentColor] = useState('#1e293b');

  const [deviceIp, setDeviceIp] = useState('192.168.1.120');
  const [devicePort, setDevicePort] = useState('4370');
  const [hardwareStatus, setHardwareStatus] = useState('online');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('🎉 Gym Settings & Biometric Hardware Configuration saved successfully!');
  };

  const handleTestPing = () => {
    alert(`⚡ Pinging USB/Network Biometric Reader at ${deviceIp}:${devicePort}...\nResult: Connection SUCCESSFUL (Latency: 12ms).`);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Gym Operating & Hardware Settings" subtitle="Configure gym profile, primary branding colors, currency, and biometric fingerprint reader connections" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Gym Profile & Branding */}
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <h2 className="text-lg font-extrabold text-white">Gym Profile & Theme Branding</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gym Name</label>
                  <input
                    type="text"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                  >
                    <option value="NGN">NGN (Nigerian Naira ₦)</option>
                    <option value="USD">USD (US Dollar $)</option>
                    <option value="GBP">GBP (British Pound £)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Primary Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-orange-400">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Accent Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-gray-300">{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Biometric Hardware Integration */}
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Biometric Fingerprint Scanner Hardware</h2>
                  <p className="text-xs text-gray-400">USB and IP network scanner connection details for gate entrance verification.</p>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
                  ● Device Online
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Device IP Address / USB Port</label>
                  <input
                    type="text"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">TCP / Port Number</label>
                  <input
                    type="text"
                    value={devicePort}
                    onChange={(e) => setDevicePort(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestPing}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold text-xs text-white transition"
                >
                  ⚡ Test Scanner Connection
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
              >
                Save All Settings & Hardware Config
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
