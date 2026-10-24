'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

type CmsTab = 'visibility' | 'hero' | 'classes' | 'trainers' | 'testimonials' | 'amenities' | 'faqs';

export default function WebsiteCmsPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>('visibility');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Section Visibility State
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({
    hero: true,
    pulse: true,
    how_it_works: true,
    amenities: true,
    classes: true,
    bmi: true,
    trainers: true,
    plans: true,
    testimonials: true,
    faqs: true,
  });

  // CMS Content States
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<Record<string, any[]>>({});
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [trainersList, setTrainersList] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<any[]>([]);
  const [faqsList, setFaqsList] = useState<any[]>([]);

  // Fetch all CMS sections on mount
  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/cms');
      if (res.success && res.data && res.data.sections) {
        const s = res.data.sections;
        if (s.section_visibility) {
          setSectionVisibility((prev) => ({ ...prev, ...s.section_visibility }));
        }
        if (s.hero?.slides) setHeroSlides(s.hero.slides);
        if (s.classes) setClassesData(s.classes);
        if (s.trainers?.items) setTrainersList(s.trainers.items);
        if (s.testimonials?.items) setTestimonialsList(s.testimonials.items);
        if (s.amenities?.items) setAmenitiesList(s.amenities.items);
        if (s.faqs?.items) setFaqsList(s.faqs.items);
      }
    } catch (err) {
      console.error('Failed to load CMS data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Toggle individual section visibility
  const toggleSectionVisibility = async (key: string) => {
    const updated = {
      ...sectionVisibility,
      [key]: !sectionVisibility[key],
    };
    setSectionVisibility(updated);
    try {
      const res = await apiFetch('/admin/cms/section_visibility', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res.success) {
        showToast(`${updated[key] ? '🟢 Activated' : '⚪ Deactivated'} ${key.replace(/_/g, ' ').toUpperCase()} section on homepage.`);
      }
    } catch (err: any) {
      showToast(`❌ Failed to update visibility: ${err.message}`);
    }
  };

  // Save current active tab section
  const handleSaveSection = async (sectionKey: string, payload: any) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/admin/cms/${sectionKey}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success) {
        showToast(`✅ ${sectionKey.toUpperCase()} section saved successfully! Changes are live on the member portal.`);
      } else {
        showToast(`❌ Error saving: ${res.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      showToast(`❌ Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onUrlUploaded: (url: string) => void) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast('Uploading image asset...');
      const token = localStorage.getItem('fitcloud_token') || '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/admin/cms/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.data?.url) {
        onUrlUploaded(data.data.url);
        showToast('✅ Image uploaded successfully!');
      } else {
        showToast(`❌ Upload failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      showToast(`❌ Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070709] text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Website Content & Portal CMS"
          subtitle="Control landing page copy, photos, schedules, and reviews"
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                  Website Content Management System
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Member Portal & Website Manager
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Control the member landing page: hero slider, class schedule, coach profiles, member reviews, and amenities.
              </p>
            </div>

            {/* Quick Visit Member Portal Button */}
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black font-extrabold text-xs transition border border-orange-500/30 flex items-center gap-2 shadow-lg shadow-orange-500/5 w-fit"
            >
              <span>Preview Live Member Portal</span>
              <span>↗</span>
            </a>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center justify-between shadow-xl animate-fadeIn">
              <span>{toastMsg}</span>
              <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-white font-mono">✕</button>
            </div>
          )}

          {/* CMS Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800">
            {[
              { id: 'visibility', label: 'Section Toggles & Layout', icon: '🎛️' },
              { id: 'hero', label: 'Hero Slides', icon: '🖼️' },
              { id: 'classes', label: 'Class Timetable', icon: '📅' },
              { id: 'trainers', label: 'Master Coaches', icon: '🏋️' },
              { id: 'testimonials', label: 'Member Reviews', icon: '⭐' },
              { id: 'amenities', label: 'Facilities & Amenities', icon: '✨' },
              { id: 'faqs', label: 'FAQs', icon: '❓' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CmsTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                    : 'bg-[#0e0e12] text-gray-400 hover:text-white border border-gray-800/80 hover:bg-[#121217]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 font-mono">Loading website CMS content...</p>
            </div>
          ) : (
            <div>
              {/* TAB 0: MASTER SECTION VISIBILITY & LAYOUT TOGGLES */}
              {activeTab === 'visibility' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-white">Homepage Section Activation & Controls</h2>
                      <p className="text-xs text-gray-400">
                        Instantly toggle any homepage section on or off. Deactivated sections are completely hidden on the member portal.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const allOn: Record<string, boolean> = {};
                          Object.keys(sectionVisibility).forEach((k) => (allOn[k] = true));
                          setSectionVisibility(allOn);
                          await apiFetch('/admin/cms/section_visibility', { method: 'POST', body: JSON.stringify(allOn) });
                          showToast('🟢 All homepage sections activated!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 hover:text-white transition"
                      >
                        Activate All
                      </button>
                    </div>
                  </div>

                  {/* Section Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'hero',
                        name: 'Hero Slider & Top CTA',
                        icon: '🖼️',
                        desc: 'Top headline, rotating imagery, tag badges, digital pass CTA, and online renewal button.',
                        editTab: 'hero',
                      },
                      {
                        key: 'pulse',
                        name: 'Live Gym Pulse & Operating Hours',
                        icon: '🟢',
                        desc: 'Real-time open/closed status badge, operating hours ticker, and occupancy capacity indicator.',
                        editTab: null,
                      },
                      {
                        key: 'how_it_works',
                        name: 'How Gate Entry Works',
                        icon: '🚀',
                        desc: 'Step-by-step visual onboarding showing QR turnstile scanning, biometric gates, and instant check-in.',
                        editTab: null,
                      },
                      {
                        key: 'amenities',
                        name: 'Facilities & Equipment Grid',
                        icon: '✨',
                        desc: 'Olympic free weights, cardio suites, recovery zones, sauna, and premium gym infrastructure.',
                        editTab: 'amenities',
                      },
                      {
                        key: 'classes',
                        name: 'Weekly Class Timetable',
                        icon: '📅',
                        desc: 'Interactive day-by-day group session schedule with booked slots, instructors, and intensity badges.',
                        editTab: 'classes',
                      },
                      {
                        key: 'bmi',
                        name: 'Interactive BMI Telemetry Calculator',
                        icon: '⚖️',
                        desc: 'Member body mass index calculator with customized calorie, workout, and plan recommendations.',
                        editTab: null,
                      },
                      {
                        key: 'trainers',
                        name: 'Master Coaches & Trainers Roster',
                        icon: '🏋️',
                        desc: 'Coaches showcase with certifications, bios, specialties, and 1-on-1 consultation booking buttons.',
                        editTab: 'trainers',
                      },
                      {
                        key: 'plans',
                        name: 'Membership Pricing Plans',
                        icon: '💳',
                        desc: 'Active tiered membership plans, feature checklists, and instant Paystack online checkout.',
                        editTab: null,
                      },
                      {
                        key: 'testimonials',
                        name: 'Member Reviews & Transformation Stories',
                        icon: '⭐',
                        desc: 'Authentic social proof, member ratings, transformation PR badges, and workout streaks.',
                        editTab: 'testimonials',
                      },
                      {
                        key: 'faqs',
                        name: 'Frequently Asked Questions (FAQs)',
                        icon: '❓',
                        desc: 'Accordion FAQ answering gate access, billing renewals, pass pausing, and front desk questions.',
                        editTab: 'faqs',
                      },
                    ].map((sec) => {
                      const isVisible = sectionVisibility[sec.key] !== false;
                      return (
                        <div
                          key={sec.key}
                          className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                            isVisible
                              ? 'bg-[#0e0e12] border-gray-800/80 hover:border-orange-500/30 shadow-lg'
                              : 'bg-[#0a0a0c]/60 border-gray-900 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl p-2.5 rounded-2xl bg-[#14141a] border border-gray-800 flex-shrink-0">
                                {sec.icon}
                              </span>
                              <div>
                                <h3 className="text-sm font-black text-white flex items-center gap-2">
                                  <span>{sec.name}</span>
                                  {isVisible ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 text-[9px] font-mono font-bold uppercase">
                                      Hidden
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{sec.desc}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-gray-800/60 pt-3">
                            {sec.editTab ? (
                              <button
                                onClick={() => setActiveTab(sec.editTab as CmsTab)}
                                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
                              >
                                <span>Edit Content</span>
                                <span>→</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-500 italic">Managed via System Settings</span>
                            )}

                            {/* Interactive Toggle Switch */}
                            <button
                              onClick={() => toggleSectionVisibility(sec.key)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isVisible ? 'bg-orange-500' : 'bg-gray-800'
                              }`}
                              role="switch"
                              aria-checked={isVisible}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isVisible ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 1: HERO SLIDES */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">Homepage Hero Slider</h2>
                        <button
                          onClick={() => toggleSectionVisibility('hero')}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 ${
                            sectionVisibility.hero !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sectionVisibility.hero !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{sectionVisibility.hero !== false ? 'Visible on Homepage' : 'Hidden on Homepage'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Manage headline text, tags, and background imagery.</p>
                    </div>
                    <button
                      onClick={() => {
                        setHeroSlides([
                          ...heroSlides,
                          {
                            id: `h_${Date.now()}`,
                            title: 'New Headline Goes Here',
                            subtitle: 'Punchy secondary subtext outlining your fitness experience.',
                            tag: 'Special Feature',
                            image: '/images/hero/hero-1.webp',
                            cta_text: 'Get Started',
                            cta_action: 'plans',
                            secondary_cta: 'Sign In',
                            secondary_action: 'login',
                          },
                        ]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
                    >
                      + Add Slide
                    </button>
                  </div>

                  <div className="space-y-6">
                    {heroSlides.map((slide, idx) => (
                      <div
                        key={slide.id || idx}
                        className="rounded-3xl bg-[#0e0e12] border border-gray-800/80 p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                          <span className="text-xs font-mono font-bold text-orange-400">
                            Slide #{idx + 1}
                          </span>
                          {heroSlides.length > 1 && (
                            <button
                              onClick={() => {
                                setHeroSlides(heroSlides.filter((_, i) => i !== idx));
                              }}
                              className="text-xs text-red-400 hover:text-red-300 font-bold"
                            >
                              Delete Slide
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-400">Tagline Badge</label>
                            <input
                              type="text"
                              value={slide.tag || ''}
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].tag = e.target.value;
                                setHeroSlides(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-400">Background Image URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={slide.image || ''}
                                onChange={(e) => {
                                  const copy = [...heroSlides];
                                  copy[idx].image = e.target.value;
                                  setHeroSlides(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                              <label className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold cursor-pointer whitespace-nowrap">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleImageUpload(e, (url) => {
                                      const copy = [...heroSlides];
                                      copy[idx].image = url;
                                      setHeroSlides(copy);
                                    })
                                  }
                                />
                              </label>
                            </div>
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-gray-400">Main Headline</label>
                            <input
                              type="text"
                              value={slide.title || ''}
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].title = e.target.value;
                                setHeroSlides(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-gray-400">Subtitle / Highlights</label>
                            <textarea
                              rows={2}
                              value={slide.subtitle || ''}
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].subtitle = e.target.value;
                                setHeroSlides(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-400">Primary CTA Text</label>
                            <input
                              type="text"
                              value={slide.cta_text || ''}
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].cta_text = e.target.value;
                                setHeroSlides(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-400">Secondary CTA Text</label>
                            <input
                              type="text"
                              value={slide.secondary_cta || ''}
                              onChange={(e) => {
                                const copy = [...heroSlides];
                                copy[idx].secondary_cta = e.target.value;
                                setHeroSlides(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSection('hero', { slides: heroSlides })}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? 'Saving...' : 'Save Hero Slides'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CLASSES & TIMETABLE */}
              {activeTab === 'classes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">Weekly Class Schedule</h2>
                        <button
                          onClick={() => toggleSectionVisibility('classes')}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 ${
                            sectionVisibility.classes !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sectionVisibility.classes !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{sectionVisibility.classes !== false ? 'Visible on Homepage' : 'Hidden on Homepage'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Select a day to view or edit scheduled group fitness classes.</p>
                    </div>
                    <button
                      onClick={() => {
                        const currentDayClasses = classesData[selectedDay] || [];
                        setClassesData({
                          ...classesData,
                          [selectedDay]: [
                            ...currentDayClasses,
                            {
                              id: `cls_${Date.now()}`,
                              name: 'New Class Session',
                              category: 'Strength',
                              time: '08:00 AM - 09:00 AM',
                              duration: '60 min',
                              trainer: 'Marcus Vance',
                              intensity: 'High',
                              capacity: '10 / 15 Booked',
                              room: 'Main Studio',
                              image: '/images/classes/l1.webp',
                            },
                          ],
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition w-fit"
                    >
                      + Add Class to {selectedDay}
                    </button>
                  </div>

                  {/* Day Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          selectedDay === day
                            ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                            : 'bg-[#0e0e12] border border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {day} ({(classesData[day] || []).length})
                      </button>
                    ))}
                  </div>

                  {/* Day's Classes */}
                  <div className="space-y-4">
                    {(classesData[selectedDay] || []).length === 0 ? (
                      <div className="p-12 text-center rounded-3xl bg-[#0e0e12] border border-gray-800 text-xs text-gray-400">
                        No classes scheduled for {selectedDay}. Click "+ Add Class" to create one.
                      </div>
                    ) : (
                      (classesData[selectedDay] || []).map((cls, idx) => (
                        <div
                          key={cls.id || idx}
                          className="p-5 rounded-3xl bg-[#0e0e12] border border-gray-800/80 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                            <span className="text-xs font-mono font-bold text-orange-400">
                              Class #{idx + 1} ({cls.time})
                            </span>
                            <button
                              onClick={() => {
                                const filtered = (classesData[selectedDay] || []).filter((_, i) => i !== idx);
                                setClassesData({ ...classesData, [selectedDay]: filtered });
                              }}
                              className="text-xs text-red-400 hover:text-red-300 font-bold"
                            >
                              Remove Class
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Class Name</label>
                              <input
                                type="text"
                                value={cls.name || ''}
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].name = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                              <select
                                value={cls.category || 'Strength'}
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].category = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              >
                                <option value="Strength">Strength</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Combat">Combat</option>
                                <option value="Yoga">Yoga</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Time Slot</label>
                              <input
                                type="text"
                                value={cls.time || ''}
                                placeholder="07:00 AM - 08:00 AM"
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].time = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Coach / Trainer</label>
                              <input
                                type="text"
                                value={cls.trainer || ''}
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].trainer = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Intensity</label>
                              <select
                                value={cls.intensity || 'High'}
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].intensity = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              >
                                <option value="High">🔥 High</option>
                                <option value="Moderate">⚡ Moderate</option>
                                <option value="Low">🧘 Low</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Room / Studio</label>
                              <input
                                type="text"
                                value={cls.room || ''}
                                placeholder="Main Rig & Racks"
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].room = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Capacity / Slots</label>
                              <input
                                type="text"
                                value={cls.capacity || ''}
                                placeholder="14 / 16 Booked"
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].capacity = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Duration</label>
                              <input
                                type="text"
                                value={cls.duration || ''}
                                placeholder="60 min"
                                onChange={(e) => {
                                  const copy = { ...classesData };
                                  copy[selectedDay][idx].duration = e.target.value;
                                  setClassesData(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSection('classes', classesData)}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? 'Saving...' : 'Save Weekly Schedule'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: COACHES & TRAINERS */}
              {activeTab === 'trainers' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">Master Coaches Roster</h2>
                        <button
                          onClick={() => toggleSectionVisibility('trainers')}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 ${
                            sectionVisibility.trainers !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sectionVisibility.trainers !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{sectionVisibility.trainers !== false ? 'Visible on Homepage' : 'Hidden on Homepage'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Manage coach biographies, specialties, certifications, and portrait photography.</p>
                    </div>
                    <button
                      onClick={() => {
                        setTrainersList([
                          ...trainersList,
                          {
                            id: `tr_${Date.now()}`,
                            name: 'New Coach Name',
                            title: 'Strength Specialist',
                            image: '/images/team/1.webp',
                            certifications: ['CSCS', 'NASM-CPT'],
                            experience: '5+ Years Experience',
                            transformations: '150+ Member Transformations',
                            specialties: ['Hypertrophy', 'Conditioning'],
                            quote: 'Consistency always beats motivation.',
                          },
                        ]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
                    >
                      + Add Trainer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trainersList.map((trainer, idx) => (
                      <div
                        key={trainer.id || idx}
                        className="rounded-3xl bg-[#0e0e12] border border-gray-800/80 p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                          <span className="text-xs font-mono font-bold text-orange-400">
                            Coach #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              setTrainersList(trainersList.filter((_, i) => i !== idx));
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Delete Coach
                          </button>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0 relative group">
                            <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Coach Name</label>
                              <input
                                type="text"
                                value={trainer.name || ''}
                                onChange={(e) => {
                                  const copy = [...trainersList];
                                  copy[idx].name = e.target.value;
                                  setTrainersList(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-orange-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Title / Role</label>
                              <input
                                type="text"
                                value={trainer.title || ''}
                                onChange={(e) => {
                                  const copy = [...trainersList];
                                  copy[idx].title = e.target.value;
                                  setTrainersList(copy);
                                }}
                                className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Photo URL / File</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={trainer.image || ''}
                              onChange={(e) => {
                                const copy = [...trainersList];
                                copy[idx].image = e.target.value;
                                setTrainersList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                            <label className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold cursor-pointer whitespace-nowrap">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(e, (url) => {
                                    const copy = [...trainersList];
                                    copy[idx].image = url;
                                    setTrainersList(copy);
                                  })
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Experience Tag</label>
                            <input
                              type="text"
                              value={trainer.experience || ''}
                              placeholder="11+ Years Experience"
                              onChange={(e) => {
                                const copy = [...trainersList];
                                copy[idx].experience = e.target.value;
                                setTrainersList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Certifications (comma separated)</label>
                            <input
                              type="text"
                              value={Array.isArray(trainer.certifications) ? trainer.certifications.join(', ') : trainer.certifications || ''}
                              placeholder="CSCS, USAW, NASM"
                              onChange={(e) => {
                                const copy = [...trainersList];
                                copy[idx].certifications = e.target.value.split(',').map((s) => s.trim());
                                setTrainersList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Specialties (comma separated)</label>
                          <input
                            type="text"
                            value={Array.isArray(trainer.specialties) ? trainer.specialties.join(', ') : trainer.specialties || ''}
                            placeholder="Hypertrophy, Olympic Barbell, Powerlifting"
                            onChange={(e) => {
                              const copy = [...trainersList];
                              copy[idx].specialties = e.target.value.split(',').map((s) => s.trim());
                              setTrainersList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Coach Quote / Motto</label>
                          <textarea
                            rows={2}
                            value={trainer.quote || ''}
                            onChange={(e) => {
                              const copy = [...trainersList];
                              copy[idx].quote = e.target.value;
                              setTrainersList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSection('trainers', { items: trainersList })}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? 'Saving...' : 'Save Coaches Roster'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TESTIMONIALS & REVIEWS */}
              {activeTab === 'testimonials' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">Member Reviews & Transformation Stories</h2>
                        <button
                          onClick={() => toggleSectionVisibility('testimonials')}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 ${
                            sectionVisibility.testimonials !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sectionVisibility.testimonials !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{sectionVisibility.testimonials !== false ? 'Visible on Homepage' : 'Hidden on Homepage'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Display verified member feedback, milestone PRs, and quotes.</p>
                    </div>
                    <button
                      onClick={() => {
                        setTestimonialsList([
                          ...testimonialsList,
                          {
                            id: `rev_${Date.now()}`,
                            name: 'Member Name',
                            role: 'Active Gym Member',
                            avatar: '/images/testimonial/1.webp',
                            rating: 5,
                            achievement: '🔥 Lost 10kg in 90 Days',
                            comment: 'Fantastic facilities and seamless turnstile access every single morning.',
                            duration: 'Member for 6 Months',
                          },
                        ]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
                    >
                      + Add Review
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonialsList.map((rev, idx) => (
                      <div
                        key={rev.id || idx}
                        className="rounded-3xl bg-[#0e0e12] border border-gray-800/80 p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                          <span className="text-xs font-mono font-bold text-orange-400">
                            Review #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              setTestimonialsList(testimonialsList.filter((_, i) => i !== idx));
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Delete Review
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Member Name</label>
                            <input
                              type="text"
                              value={rev.name || ''}
                              onChange={(e) => {
                                const copy = [...testimonialsList];
                                copy[idx].name = e.target.value;
                                setTestimonialsList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Member Role / Tier</label>
                            <input
                              type="text"
                              value={rev.role || ''}
                              onChange={(e) => {
                                const copy = [...testimonialsList];
                                copy[idx].role = e.target.value;
                                setTestimonialsList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Achievement Badge</label>
                            <input
                              type="text"
                              value={rev.achievement || ''}
                              placeholder="🔥 Lost 14kg & Built Muscle"
                              onChange={(e) => {
                                const copy = [...testimonialsList];
                                copy[idx].achievement = e.target.value;
                                setTestimonialsList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Duration</label>
                            <input
                              type="text"
                              value={rev.duration || ''}
                              placeholder="Member for 1 Year"
                              onChange={(e) => {
                                const copy = [...testimonialsList];
                                copy[idx].duration = e.target.value;
                                setTestimonialsList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Avatar Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={rev.avatar || ''}
                              onChange={(e) => {
                                const copy = [...testimonialsList];
                                copy[idx].avatar = e.target.value;
                                setTestimonialsList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                            <label className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold cursor-pointer whitespace-nowrap">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(e, (url) => {
                                    const copy = [...testimonialsList];
                                    copy[idx].avatar = url;
                                    setTestimonialsList(copy);
                                  })
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Review Quote</label>
                          <textarea
                            rows={3}
                            value={rev.comment || ''}
                            onChange={(e) => {
                              const copy = [...testimonialsList];
                              copy[idx].comment = e.target.value;
                              setTestimonialsList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSection('testimonials', { items: testimonialsList })}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? 'Saving...' : 'Save Member Reviews'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: AMENITIES & FACILITIES */}
              {activeTab === 'amenities' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">Facilities & Equipment Highlights</h2>
                        <button
                          onClick={() => toggleSectionVisibility('amenities')}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 ${
                            sectionVisibility.amenities !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sectionVisibility.amenities !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{sectionVisibility.amenities !== false ? 'Visible on Homepage' : 'Hidden on Homepage'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Showcase your gym floor, strength zones, and recovery suites.</p>
                    </div>
                    <button
                      onClick={() => {
                        setAmenitiesList([
                          ...amenitiesList,
                          {
                            id: `am_${Date.now()}`,
                            title: 'New Facility Name',
                            category: 'Strength',
                            description: 'High-end training gear and amenities.',
                            image: '/images/amenities/strength.webp',
                            features: ['State of the Art', 'Air Conditioned'],
                          },
                        ]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
                    >
                      + Add Amenity
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {amenitiesList.map((am, idx) => (
                      <div
                        key={am.id || idx}
                        className="rounded-3xl bg-[#0e0e12] border border-gray-800/80 p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                          <span className="text-xs font-mono font-bold text-orange-400">
                            Facility #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              setAmenitiesList(amenitiesList.filter((_, i) => i !== idx));
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                            <input
                              type="text"
                              value={am.title || ''}
                              onChange={(e) => {
                                const copy = [...amenitiesList];
                                copy[idx].title = e.target.value;
                                setAmenitiesList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                            <input
                              type="text"
                              value={am.category || ''}
                              placeholder="Strength, Cardio, Recovery"
                              onChange={(e) => {
                                const copy = [...amenitiesList];
                                copy[idx].category = e.target.value;
                                setAmenitiesList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={am.image || ''}
                              onChange={(e) => {
                                const copy = [...amenitiesList];
                                copy[idx].image = e.target.value;
                                setAmenitiesList(copy);
                              }}
                              className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                            />
                            <label className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold cursor-pointer whitespace-nowrap">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(e, (url) => {
                                    const copy = [...amenitiesList];
                                    copy[idx].image = url;
                                    setAmenitiesList(copy);
                                  })
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Key Features (comma separated)</label>
                          <input
                            type="text"
                            value={Array.isArray(am.features) ? am.features.join(', ') : am.features || ''}
                            placeholder="6 Racks, Towel Service, Sauna"
                            onChange={(e) => {
                              const copy = [...amenitiesList];
                              copy[idx].features = e.target.value.split(',').map((s) => s.trim());
                              setAmenitiesList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                          <textarea
                            rows={2}
                            value={am.description || ''}
                            onChange={(e) => {
                              const copy = [...amenitiesList];
                              copy[idx].description = e.target.value;
                              setAmenitiesList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSection('amenities', { items: amenitiesList })}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? 'Saving...' : 'Save Amenities'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: FAQS */}
              {activeTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">Frequently Asked Questions</h2>
                        <button
                          onClick={() => toggleSectionVisibility('faqs')}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 ${
                            sectionVisibility.faqs !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sectionVisibility.faqs !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{sectionVisibility.faqs !== false ? 'Visible on Homepage' : 'Hidden on Homepage'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Help prospective and current members understand gate passes, rules, and billing.</p>
                    </div>
                    <button
                      onClick={() => {
                        setFaqsList([
                          ...faqsList,
                          {
                            q: 'New Question Title?',
                            a: 'Clear, concise explanation for your members.',
                          },
                        ]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  <div className="space-y-4">
                    {faqsList.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-3xl bg-[#0e0e12] border border-gray-800/80 p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                          <span className="text-xs font-mono font-bold text-orange-400">
                            FAQ #{idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              setFaqsList(faqsList.filter((_, i) => i !== idx));
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Delete FAQ
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Question</label>
                          <input
                            type="text"
                            value={faq.q || ''}
                            onChange={(e) => {
                              const copy = [...faqsList];
                              copy[idx].q = e.target.value;
                              setFaqsList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Answer</label>
                          <textarea
                            rows={3}
                            value={faq.a || ''}
                            onChange={(e) => {
                              const copy = [...faqsList];
                              copy[idx].a = e.target.value;
                              setFaqsList(copy);
                            }}
                            className="w-full bg-[#14141a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSection('faqs', { items: faqsList })}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
                    >
                      {saving ? 'Saving...' : 'Save FAQs'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
