'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

export default function LegalDocsPage() {
  const [activeDoc, setActiveDoc] = useState<'terms' | 'privacy' | 'waiver' | 'refund'>('terms');

  // Document Contents
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [waiver, setWaiver] = useState('');
  const [refund, setRefund] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [previewMode, setPreviewMode] = useState(false);

  const fetchLegalDocs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/settings');
      if (res.success && res.data) {
        const d = res.data;
        if (d.legal_docs) {
          const ld = d.legal_docs;
          if (ld.terms_conditions) setTerms(ld.terms_conditions);
          if (ld.privacy_policy) setPrivacy(ld.privacy_policy);
          if (ld.liability_waiver) setWaiver(ld.liability_waiver);
          if (ld.refund_policy) setRefund(ld.refund_policy);
        } else {
          if (d.terms_conditions) setTerms(d.terms_conditions);
          if (d.privacy_policy) setPrivacy(d.privacy_policy);
        }
      }
    } catch (err) {
      console.error('Failed to fetch legal documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalDocs();
  }, []);

  const handleSaveLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMsg('');
    try {
      const res = await apiFetch('/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          terms_conditions: terms,
          privacy_policy: privacy,
          liability_waiver: waiver,
          refund_policy: refund,
        }),
      });

      if (res.success) {
        setToastType('success');
        setToastMsg('Facility legal agreements and privacy documents updated successfully.');
        setTimeout(() => setToastMsg(''), 4000);
        fetchLegalDocs();
      } else {
        setToastType('error');
        setToastMsg(res.message || 'Could not save legal documents.');
        setTimeout(() => setToastMsg(''), 5000);
      }
    } catch (err: any) {
      setToastType('error');
      setToastMsg(err.message || 'Could not save legal documents. Please try again.');
      setTimeout(() => setToastMsg(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = (docType: 'terms' | 'privacy' | 'waiver' | 'refund') => {
    if (docType === 'terms') {
      setTerms(
        '<h2>1. Facility Membership & Code of Conduct</h2><p>By entering our gym facilities, members agree to adhere to all facility rules, hygiene protocols, and proper equipment operation guidelines.</p><h2>2. Access Controls & Biometric Verification</h2><p>Access is restricted strictly to active subscription holders. Access Gates require valid biometric fingerprint scan or dynamic encrypted QR badge verification at entrance.</p><h2>3. Fees & Membership Renewals</h2><p>Subscription fees are billed according to chosen plan cycles (Monthly, Quarterly, Annual). Expired memberships incur access freeze following a 3-day grace period.</p>'
      );
    } else if (docType === 'privacy') {
      setPrivacy(
        '<h2>1. Biometric Data Protection Notice</h2><p>Biometric fingerprint templates are stored using encrypted 256-bit hashing algorithms strictly for gate access authentication. Raw fingerprint imagery is never stored or transmitted.</p><h2>2. Member Information Security</h2><p>Personal profile data, email addresses, and transaction receipts are stored in compliance with NDPR and international data privacy benchmarks.</p>'
      );
    } else if (docType === 'waiver') {
      setWaiver(
        '<h2>1. Physical Fitness & Medical Clearance</h2><p>Members confirm they are in sound physical health to engage in cardiovascular and resistance weight training activities.</p><h2>2. Assumption of Risk</h2><p>Members participate at their own risk and release the gym from liability regarding accidental personal injury occurring during unsupervised workout routines.</p>'
      );
    } else if (docType === 'refund') {
      setRefund(
        '<h2>1. Subscription Cancellations</h2><p>Memberships may be cancelled at any time prior to automatic renewal billing date.</p><h2>2. Refund Policy</h2><p>Subscription payments are non-refundable once activated, except in cases of double payment processing errors verified by administrative audit.</p>'
      );
    }
    setToastMsg(`✨ Loaded standard fitness template for ${docType.toUpperCase()}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const getCurrentContent = () => {
    if (activeDoc === 'terms') return terms;
    if (activeDoc === 'privacy') return privacy;
    if (activeDoc === 'waiver') return waiver;
    return refund;
  };

  const setCurrentContent = (val: string) => {
    if (activeDoc === 'terms') setTerms(val);
    else if (activeDoc === 'privacy') setPrivacy(val);
    else if (activeDoc === 'waiver') setWaiver(val);
    else setRefund(val);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Legal & Compliance Documents Hub"
          subtitle="Manage facility Terms & Conditions, Biometric Data Privacy Policy, Health Liability Waivers, and Refund Agreements"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-5xl">
          {/* Notification Toast */}
          {toastMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between shadow-lg animate-fadeIn ${
              toastType === 'success'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400 shadow-red-500/10'
            }`}>
              <span className="flex items-center gap-2">
                <span>{toastType === 'success' ? '⚖️' : '⚠️'}</span>
                <span>{toastMsg}</span>
              </span>
              <button onClick={() => setToastMsg('')} className="hover:text-white font-mono">✕</button>
            </div>
          )}

          {/* Compliance Status Header Widget */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Facility Compliance Status</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold">
                  ● Fully Compliant (NDPR / GDPR Ready)
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Legal agreements automatically display during member onboarding and kiosk check-ins.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${
                  previewMode
                    ? 'bg-orange-500 text-black border-orange-500'
                    : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                }`}
              >
                {previewMode ? '✏️ Back to Editor' : '👁️ Live Rendered Reader'}
              </button>
            </div>
          </div>

          {/* Document Selection Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveDoc('terms')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeDoc === 'terms'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>📜</span>
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => setActiveDoc('privacy')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeDoc === 'privacy'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>🔒</span>
              <span>Privacy & Biometric Policy</span>
            </button>

            <button
              onClick={() => setActiveDoc('waiver')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeDoc === 'waiver'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>⚠️</span>
              <span>Health & Liability Waiver</span>
            </button>

            <button
              onClick={() => setActiveDoc('refund')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeDoc === 'refund'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'bg-[#0f0f13] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>💳</span>
              <span>Subscription Refund Terms</span>
            </button>
          </div>

          <form onSubmit={handleSaveLegal} className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {activeDoc === 'terms' && '📜 Facility Terms & Conditions of Membership'}
                    {activeDoc === 'privacy' && '🔒 Privacy & Biometric Data Handling Notice'}
                    {activeDoc === 'waiver' && '⚠️ Member Medical Clearance & Liability Release Waiver'}
                    {activeDoc === 'refund' && '💳 Subscription Billing, Cancellations & Refund Rules'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Supports HTML formatting (&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;).</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLoadTemplate(activeDoc)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 font-extrabold text-xs text-orange-400 border border-orange-500/20 transition flex items-center gap-1.5"
                >
                  <span>✨ Load Standard Template</span>
                </button>
              </div>

              {!previewMode ? (
                <div>
                  <textarea
                    rows={12}
                    value={getCurrentContent()}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono text-xs focus:border-orange-500 outline-none leading-relaxed"
                    placeholder="Enter document HTML or plain text agreement..."
                  />
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#070709] border border-gray-800 min-h-[300px]">
                  <div
                    className="prose prose-invert max-w-none text-sm text-gray-300 space-y-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: getCurrentContent() || '<p className="italic text-gray-500">No content provided for this document yet.</p>' }}
                  />
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-800/80">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-xl shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Updating Documents...</span>
                  </>
                ) : (
                  <>
                    <span>⚖️ Save Legal & Compliance Documents</span>
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
