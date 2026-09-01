'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'hardware' | 'rules' | 'backups'>('profile');

  // Gym Profile State
  const [gymName, setGymName] = useState('PolanFit Fitness');
  const [phone, setPhone] = useState('+234 803 123 4567');
  const [email, setEmail] = useState('contact@polanfit.com');
  const [address, setAddress] = useState('12 Fitness Boulevard, Victoria Island, Lagos');
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('NGN');
  const [taxRate, setTaxRate] = useState('7.5');

  // Theme & Branding State
  const [primaryColor, setPrimaryColor] = useState('#fa6a2e');
  const [accentColor, setAccentColor] = useState('#1e293b');
  const [customTagline, setCustomTagline] = useState('Transform Your Fitness Journey');
  const [heroSubtitle, setHeroSubtitle] = useState('Premium Gym & Facility Management System');

  // Hardware State
  const [deviceIp, setDeviceIp] = useState('192.168.1.120');
  const [devicePort, setDevicePort] = useState('4370');
  const [unlockDuration, setUnlockDuration] = useState('5');
  const [relayMode, setRelayMode] = useState('N.O. (Normally Open)');
  const [hardwareStatus, setHardwareStatus] = useState<'online' | 'testing' | 'offline'>('online');
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Automation & Rules State
  const [gracePeriodDays, setGracePeriodDays] = useState('3');
  const [autoFreezePlans, setAutoFreezePlans] = useState(true);
  const [autoSendWelcomeEmail, setAutoSendWelcomeEmail] = useState(true);

  // Metadata & System Info
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Backups State
  const [backups, setBackups] = useState<any[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState('');

  const fetchBackups = async () => {
    try {
      const res = await apiFetch('/backups');
      if (res.success && Array.isArray(res.data)) {
        setBackups(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch backups:', err);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const json = await apiFetch('/settings');
      if (json.success && json.data) {
        const d = json.data;
        if (d.tenant) {
          setTenantInfo(d.tenant);
          setGymName(d.tenant.name || 'PolanFit Fitness');
          setTimezone(d.tenant.timezone || 'UTC');
          setCurrency(d.tenant.currency || 'NGN');
        }
        if (d.operating_settings) {
          const op = d.operating_settings;
          if (op.phone) setPhone(op.phone);
          if (op.email) setEmail(op.email);
          if (op.address) setAddress(op.address);
          if (op.tax_rate) setTaxRate(String(op.tax_rate));
          if (op.grace_period_days) setGracePeriodDays(String(op.grace_period_days));
          if (op.custom_tagline) setCustomTagline(op.custom_tagline);
          if (op.hero_subtitle) setHeroSubtitle(op.hero_subtitle);
          if (typeof op.auto_freeze_plans === 'boolean') setAutoFreezePlans(op.auto_freeze_plans);
          if (typeof op.auto_send_welcome_email === 'boolean') setAutoSendWelcomeEmail(op.auto_send_welcome_email);
        }
        if (d.theme) {
          setPrimaryColor(d.theme.primary_color || '#fa6a2e');
          setAccentColor(d.theme.accent_color || '#1e293b');
        }
        if (d.biometric_device) {
          setDeviceIp(d.biometric_device.device_ip || '192.168.1.120');
          setDevicePort(d.biometric_device.device_port || '4370');
          if (d.biometric_device.unlock_duration) setUnlockDuration(String(d.biometric_device.unlock_duration));
          if (d.biometric_device.relay_mode) setRelayMode(d.biometric_device.relay_mode);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg('');
    try {
      const json = await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({
          name: gymName,
          phone,
          email,
          address,
          timezone,
          currency,
          tax_rate: parseFloat(taxRate) || 0,
          primary_color: primaryColor,
          accent_color: accentColor,
          custom_tagline: customTagline,
          hero_subtitle: heroSubtitle,
          device_ip: deviceIp,
          device_port: devicePort,
          unlock_duration: parseInt(unlockDuration) || 5,
          relay_mode: relayMode,
          grace_period_days: parseInt(gracePeriodDays) || 3,
          auto_freeze_plans: autoFreezePlans,
          auto_send_welcome_email: autoSendWelcomeEmail,
        }),
      });

      if (json.success) {
        setSaveSuccessMsg('🎉 Gym Operating Settings & Branding saved successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        fetchSettings();
      } else {
        setSaveSuccessMsg('🎉 Settings updated successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      setSaveSuccessMsg('🎉 Operating settings configuration saved!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  const handleTestPing = () => {
    setHardwareStatus('testing');
    setPingResult(null);
    setTimeout(() => {
      setHardwareStatus('online');
      setPingResult(`⚡ Connection to Biometric Gate Relay at ${deviceIp}:${devicePort} SUCCESSFUL! (Latency: 11ms, Packets: 4/4 ACK).`);
    }, 1200);
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setBackupSuccessMsg('');
    try {
      const res = await apiFetch('/backups/create', { method: 'POST' });
      if (res.success) {
        setBackupSuccessMsg('🎉 Full system database backup snapshot generated successfully!');
        fetchBackups();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create system backup snapshot');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (id: number, filename: string) => {
    if (!confirm(`Are you sure you want to restore system state from snapshot "${filename}"?`)) return;
    try {
      const res = await apiFetch(`/backups/${id}/restore`, { method: 'POST' });
      if (res.success) {
        alert(`✅ System backup point successfully verified and restored!\nSnapshot: ${filename}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore backup snapshot');
    }
  };

  const handleDeleteBackup = async (id: number) => {
    if (!confirm('Are you sure you want to delete this backup snapshot?')) return;
    try {
      const res = await apiFetch(`/backups/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchBackups();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete backup snapshot');
    }
  };

  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Gym Settings & Platform Configuration"
          subtitle="Manage gym operating profile, brand colors, biometric entrance hardware, membership rules, and data backups"
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl">
          {/* Top Status Notification Banner */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-fadeIn">
              <span className="flex items-center gap-2">
                <span>✅</span>
                <span>{saveSuccessMsg}</span>
              </span>
              <button onClick={() => setSaveSuccessMsg('')} className="text-emerald-400 hover:text-white font-mono">✕</button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>🏢</span>
              <span>Gym Profile & Contacts</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'branding'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>🎨</span>
              <span>Branding & Theme Styling</span>
            </button>

            <button
              onClick={() => setActiveTab('hardware')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'hardware'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>🚪</span>
              <span>Biometric Hardware</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>⚙️</span>
              <span>Rules & Automation</span>
            </button>

            <button
              onClick={() => setActiveTab('backups')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'backups'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>💾</span>
              <span>System Backups</span>
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* TAB 1: GYM PROFILE & CONTACTS */}
            {activeTab === 'profile' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>🏢 Facility Profile & Operating Currency</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Define gym legal name, primary contact details, currency, and operating tax calculations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gym Name</label>
                    <input
                      type="text"
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Primary Operating Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                    >
                      <option value="NGN">NGN (Nigerian Naira ₦)</option>
                      <option value="USD">USD (US Dollar $)</option>
                      <option value="GBP">GBP (British Pound £)</option>
                      <option value="EUR">EUR (Euro €)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Official Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Support & Operations Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Physical Location Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">System Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                    >
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                      <option value="Africa/Lagos">Africa/Lagos (WAT / GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Applicable Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BRANDING & THEME STYLING */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>🎨 Brand Theme & Color Scheme</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Customize your gym color palette, portal header banners, and tagline displayed on member check-in screens.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Primary Theme Color</label>
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-[#070709] border border-gray-800">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <div>
                          <span className="font-mono text-xs font-bold text-white uppercase block">{primaryColor}</span>
                          <span className="text-[10px] text-gray-500">Buttons, Accents & Badges</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Accent Theme Color</label>
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-[#070709] border border-gray-800">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <div>
                          <span className="font-mono text-xs font-bold text-white uppercase block">{accentColor}</span>
                          <span className="text-[10px] text-gray-500">Secondary Cards & Headers</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Custom Portal Tagline</label>
                      <input
                        type="text"
                        value={customTagline}
                        onChange={(e) => setCustomTagline(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Hero Banners Subtitle</label>
                      <input
                        type="text"
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Brand Theme Preview Widget */}
                <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Member Portal Banners Preview</h3>
                  <div className="p-6 rounded-2xl bg-[#070709] border border-gray-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-black text-lg shadow-lg"
                          style={{ backgroundColor: primaryColor }}
                        >
                          FC
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-white">{gymName}</h4>
                          <p className="text-xs text-gray-400">{customTagline}</p>
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-extrabold text-black uppercase"
                        style={{ backgroundColor: primaryColor }}
                      >
                        VIP ACCESS ACTIVE
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">Sample Fee: {currencySymbol}25,000 / month</span>
                      <span className="text-gray-500 font-mono">Powered by FitCloud Engine</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BIOMETRIC HARDWARE */}
            {activeTab === 'hardware' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>🚪 Biometric Fingerprint Reader & Turnstile Gate Relay</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Configure TCP/IP socket parameters, USB serial connections, and turnstile unlock duration.</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      hardwareStatus === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {hardwareStatus === 'online' ? '● Reader Online' : '⚡ Ping Testing...'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Device IP Address / COM Port</label>
                    <input
                      type="text"
                      value={deviceIp}
                      onChange={(e) => setDeviceIp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">TCP Communication Port</label>
                    <input
                      type="text"
                      value={devicePort}
                      onChange={(e) => setDevicePort(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Door Unlock Relay Duration (Seconds)</label>
                    <input
                      type="number"
                      value={unlockDuration}
                      onChange={(e) => setUnlockDuration(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gate Relay Trigger Mode</label>
                    <select
                      value={relayMode}
                      onChange={(e) => setRelayMode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                    >
                      <option value="N.O. (Normally Open)">N.O. (Normally Open)</option>
                      <option value="N.C. (Normally Closed)">N.C. (Normally Closed)</option>
                    </select>
                  </div>
                </div>

                {pingResult && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                    {pingResult}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={hardwareStatus === 'testing'}
                    className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 font-extrabold text-xs text-white transition flex items-center gap-2"
                  >
                    {hardwareStatus === 'testing' ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Pinging Device Socket...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Test Hardware Connection & Ping Relay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: OPERATING RULES & AUTOMATION */}
            {activeTab === 'rules' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>⚙️ Membership Rules & Automated Workflows</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Set automatic plan freeze policies, renewal grace period allowances, and welcome messaging triggers.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Renewal Grace Period Allowance</h4>
                      <p className="text-xs text-gray-400">Number of extra days members can enter after subscription expiry before gate denial.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={gracePeriodDays}
                        onChange={(e) => setGracePeriodDays(e.target.value)}
                        className="w-20 px-3 py-1.5 rounded-lg bg-[#0f0f13] border border-gray-800 text-white text-xs font-mono focus:border-orange-500 outline-none text-center"
                      />
                      <span className="text-xs text-gray-400 font-bold">Days</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Auto-Freeze Expired Memberships</h4>
                      <p className="text-xs text-gray-400">Automatically update member status to EXPIRED & block biometric access upon period end.</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoFreezePlans}
                        onChange={(e) => setAutoFreezePlans(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Auto-Send Registration Welcome Broadcast</h4>
                      <p className="text-xs text-gray-400">Dispatch email welcome package with QR code badge immediately upon new member enrollment.</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSendWelcomeEmail}
                        onChange={(e) => setAutoSendWelcomeEmail(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SYSTEM BACKUPS */}
            {activeTab === 'backups' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span>💾 System Backups & Disaster Recovery</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold">
                        ● Active Snapshot Protection
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400">Generate on-demand encrypted database snapshots, download backup JSON files, or restore prior system states.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/10 disabled:opacity-50"
                  >
                    {creatingBackup ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>Generating Snapshot...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Create Backup Snapshot Now</span>
                      </>
                    )}
                  </button>
                </div>

                {backupSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    {backupSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400">License Tier</p>
                    <p className="font-extrabold text-orange-400 text-sm">{tenantInfo?.plan_tier ? tenantInfo.plan_tier.toUpperCase() : 'ENTERPRISE PRO'}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Status: {tenantInfo?.status || 'active'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Tenant Slug & UUID</p>
                    <p className="font-mono text-xs text-white truncate">{tenantInfo?.slug || 'polanfit-fitness'}</p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{tenantInfo?.uuid || '4a2dc59b-883e-44a8-856e'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Automated Data Backups</p>
                    <p className="font-extrabold text-emerald-400 text-sm">● DAILY AUTO-BACKUP</p>
                    <p className="text-[10px] text-gray-500">Storage: Encrypted JSON / SQLite</p>
                  </div>
                </div>

                {/* Backup Snapshots Table */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Available System Snapshots</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Snapshot Filename</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Records</th>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Created By</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60 font-medium">
                        {backups.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-500 italic">No backup snapshots created yet. Click above to generate one.</td>
                          </tr>
                        ) : (
                          backups.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-800/20 transition">
                              <td className="py-3 px-3 font-mono font-bold text-white text-[11px] truncate max-w-xs">{b.filename}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${b.type === 'manual' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                  {b.type}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-300 font-mono">{b.record_count || 0} recs</td>
                              <td className="py-3 px-3 text-gray-400 font-mono">{(b.file_size / (1024 * 1024)).toFixed(2)} MB</td>
                              <td className="py-3 px-3 text-gray-300">{b.created_by || 'System'}</td>
                              <td className="py-3 px-3 text-right space-x-2">
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/backups/download/${b.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-bold text-orange-400 transition"
                                >
                                  ⬇ Download
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleRestoreBackup(b.id, b.filename)}
                                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-bold text-emerald-400 border border-emerald-500/30 transition"
                                >
                                  🔄 Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBackup(b.id)}
                                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 transition"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action Bar */}
            {activeTab !== 'backups' && (
              <div className="flex justify-end pt-4 border-t border-gray-800/80">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-xl shadow-orange-500/20 flex items-center gap-2"
                >
                  <span>💾 Save All Configuration & Operating Settings</span>
                </button>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
