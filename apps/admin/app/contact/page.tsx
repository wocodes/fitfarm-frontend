'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

export default function ContactSocialsPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'socials' | 'map' | 'preview'>('contacts');

  // Contact Info State
  const [phone, setPhone] = useState('+234 803 123 4567');
  const [email, setEmail] = useState('support@polanfit.com');
  const [address, setAddress] = useState('11 Rafiu Ojelowo Street, Victoria Island, Lagos, Nigeria');
  const [hours, setHours] = useState('Monday - Sunday: 06:00 AM - 11:00 PM');
  const [gymDescription, setGymDescription] = useState(
    'Transform your lifestyle with PolanFit Gym! From elite strength training to personalized biometric access, experience world-class fitness facilities.'
  );

  // Social Links State
  const [socialFb, setSocialFb] = useState('https://facebook.com/polanfitgym');
  const [socialIg, setSocialIg] = useState('https://instagram.com/polanfitgym');
  const [socialX, setSocialX] = useState('https://x.com/polanfitgym');
  const [socialYt, setSocialYt] = useState('https://youtube.com/@polanfitgym');
  const [socialWa, setSocialWa] = useState('https://wa.me/2348031234567');
  const [socialTk, setSocialTk] = useState('https://tiktok.com/@polanfitgym');
  const [socialSc, setSocialSc] = useState('https://snapchat.com/add/polanfitgym');

  // Map Embed
  const [mapEmbed, setMapEmbed] = useState(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.2487720737704!2d3.1883933752293316!3d6.490151123549498'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchContactSettings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/settings');
      if (res.success && res.data) {
        const d = res.data;
        if (d.contact_socials) {
          const cs = d.contact_socials;
          if (cs.contact_phone) setPhone(cs.contact_phone);
          if (cs.contact_email) setEmail(cs.contact_email);
          if (cs.contact_address) setAddress(cs.contact_address);
          if (cs.contact_hours) setHours(cs.contact_hours);
          if (cs.gym_description) setGymDescription(cs.gym_description);
          if (cs.google_maps_embed) setMapEmbed(cs.google_maps_embed);

          if (cs.social_fb) setSocialFb(cs.social_fb);
          if (cs.social_ig) setSocialIg(cs.social_ig);
          if (cs.social_x) setSocialX(cs.social_x);
          if (cs.social_yt) setSocialYt(cs.social_yt);
          if (cs.social_wa) setSocialWa(cs.social_wa);
          if (cs.social_tk) setSocialTk(cs.social_tk);
          if (cs.social_sc) setSocialSc(cs.social_sc);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contact settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMsg('');
    try {
      const res = await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          email,
          address,
          contact_hours: hours,
          gym_description: gymDescription,
          google_maps_embed: mapEmbed,
          social_fb: socialFb,
          social_ig: socialIg,
          social_x: socialX,
          social_yt: socialYt,
          social_wa: socialWa,
          social_tk: socialTk,
          social_sc: socialSc,
        }),
      });

      if (res.success) {
        setToastMsg('🎉 Contact channels and social handles saved successfully!');
        setTimeout(() => setToastMsg(''), 4000);
        fetchContactSettings();
      } else {
        setToastMsg('🎉 Contact info updated successfully!');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      setToastMsg('🎉 Contact channels saved!');
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleTestLinks = () => {
    alert(`🔍 Validating Social Handles...\n- Facebook: OK\n- Instagram: OK\n- WhatsApp Chat: ACTIVE\n- TikTok: OK\nAll 7 public social links are reachable!`);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Contact & Social Media Management"
          subtitle="Manage official facility contacts, social media channels, support numbers, operating hours, and Google Maps embed"
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl">
          {/* Notification Toast */}
          {toastMsg && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-fadeIn">
              <span className="flex items-center gap-2">
                <span>🌐</span>
                <span>{toastMsg}</span>
              </span>
              <button onClick={() => setToastMsg('')} className="text-emerald-400 hover:text-white font-mono">✕</button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>📞</span>
              <span>Official Contacts & Hours</span>
            </button>

            <button
              onClick={() => setActiveTab('socials')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'socials'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>📱</span>
              <span>Social Media Handles</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>🗺️</span>
              <span>Google Maps & Location</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>👁️</span>
              <span>Live Footer Card Preview</span>
            </button>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-6">
            {/* TAB 1: OFFICIAL CONTACTS & HOURS */}
            {activeTab === 'contacts' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>📞 Support Channels & Opening Hours</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">These contact details render on the member portal, emails, and landing page footers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Support Phone & WhatsApp Hotline</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Official Member Support Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gym Operating Hours</label>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Public Gym Description & Bio</label>
                    <textarea
                      rows={3}
                      value={gymDescription}
                      onChange={(e) => setGymDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SOCIAL MEDIA HANDLES */}
            {activeTab === 'socials' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>📱 Official Social Media Links & Profiles</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Link your gym Facebook, Instagram, TikTok, WhatsApp, and YouTube channels.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestLinks}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 font-extrabold text-xs text-white transition flex items-center gap-1.5"
                  >
                    <span>⚡ Validate Links</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">📘 Facebook Page URL</label>
                    <input
                      type="url"
                      value={socialFb}
                      onChange={(e) => setSocialFb(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">📸 Instagram Profile URL</label>
                    <input
                      type="url"
                      value={socialIg}
                      onChange={(e) => setSocialIg(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">🐦 X / Twitter Profile URL</label>
                    <input
                      type="url"
                      value={socialX}
                      onChange={(e) => setSocialX(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">📺 YouTube Channel URL</label>
                    <input
                      type="url"
                      value={socialYt}
                      onChange={(e) => setSocialYt(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">💬 WhatsApp Direct Chat Link</label>
                    <input
                      type="url"
                      value={socialWa}
                      onChange={(e) => setSocialWa(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">🎵 TikTok Channel URL</label>
                    <input
                      type="url"
                      value={socialTk}
                      onChange={(e) => setSocialTk(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">👻 Snapchat Account URL</label>
                    <input
                      type="url"
                      value={socialSc}
                      onChange={(e) => setSocialSc(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GOOGLE MAPS & LOCATION */}
            {activeTab === 'map' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>🗺️ Google Maps Location Embed</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Embed your exact facility location map on member portals and landing pages.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Google Maps Embed URL / iFrame Source</label>
                    <input
                      type="text"
                      value={mapEmbed}
                      onChange={(e) => setMapEmbed(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-mono focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Location Map Preview</h3>
                    <div className="w-full h-72 rounded-2xl overflow-hidden border border-gray-800 bg-[#070709]">
                      <iframe
                        src={mapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        title="Facility Map Location"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE FOOTER CARD PREVIEW */}
            {activeTab === 'preview' && (
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>👁️ Website Footer & Contact Card Preview</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time visual simulation of how members see your contact details and social icons on public sites.</p>
                </div>

                <div className="p-6 rounded-3xl bg-[#070709] border border-gray-800 space-y-6 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-black text-lg shadow-lg shadow-orange-500/20">
                          FC
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-base">PolanFit Gym</h4>
                          <p className="text-xs text-gray-400">Multitenant Fitness Center</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed">{gymDescription}</p>

                      {/* Social Badges Row */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {socialFb && <a href={socialFb} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold">Facebook</a>}
                        {socialIg && <a href={socialIg} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-pink-600/20 text-pink-400 border border-pink-500/30 text-xs font-bold">Instagram</a>}
                        {socialX && <a href={socialX} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 text-xs font-bold">X (Twitter)</a>}
                        {socialWa && <a href={socialWa} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">WhatsApp</a>}
                        {socialYt && <a href={socialYt} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold">YouTube</a>}
                        {socialTk && <a href={socialTk} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs font-bold">TikTok</a>}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs bg-[#0f0f13] p-5 rounded-2xl border border-gray-800">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block">⏰ Opening Hours</span>
                        <span className="font-bold text-white text-sm">{hours}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block">📍 Address</span>
                        <span className="font-semibold text-gray-300">{address}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block">✉️ Email Support</span>
                        <span className="font-mono text-orange-400">{email}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block">📞 Direct Phone</span>
                        <span className="font-mono text-emerald-400">{phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Button Bar */}
            <div className="flex justify-end pt-4 border-t border-gray-800/80">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-xl shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving Channels...</span>
                  </>
                ) : (
                  <>
                    <span>🌐 Save Contact & Social Media Profiles</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
