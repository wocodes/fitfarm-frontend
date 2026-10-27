'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { apiFetch } from '../../lib/apiClient';

const autoSyncedUids = new Set<string>();

const CountdownStatus = ({ row, onAutoSync }: { row: any; onAutoSync: (uid: string) => void }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (row.status === 'DELIVERED') return '✓ DELIVERED';
      const createdAtTime = new Date(row.createdAt || row.created_at).getTime();
      const difference = createdAtTime + 122000 - Date.now();
      if (difference > 0) {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `DELIVERING (${minutes}m ${seconds}s left)`;
      } else {
        if (!autoSyncedUids.has(row.uid) && difference > -15000) {
          autoSyncedUids.add(row.uid);
          onAutoSync(row.uid);
        }
        return difference > -15000 ? 'SYNCING NOW...' : 'PENDING (Click Sync)';
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [row.createdAt, row.created_at, row.status, row.uid, onAutoSync]);

  return <span className="font-mono text-xs">{timeLeft}</span>;
};

export default function EmailBlastCampaignPage() {
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [recipientMode, setRecipientMode] = useState<string>('ALL'); // ALL, SELECTED, CUSTOM
  
  const [members, setMembers] = useState<any[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [customEmailsText, setCustomEmailsText] = useState<string>('');

  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');

  const [sending, setSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [campaignLogs, setCampaignLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL query parameters for pre-filled recipient and subject
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to');
      const subjectParam = params.get('subject');

      if (toParam) {
        setCustomEmailsText(toParam);
        setRecipientMode('CUSTOM');
      }
      if (subjectParam) {
        setSubject(subjectParam);
      }
    }
  }, []);

  // Fetch Member List for Selected Mode
  const loadMembers = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/members?per_page=500');
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : res.data.content || [];
        setMembers(list);
      }
    } catch (err) {
      console.error('Failed to load members for email selection:', err);
    }
  }, []);

  // Fetch Past Email Campaign Broadcast Logs
  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await apiFetch('/admin/campaigns/logs');
      if (res.success && res.data) {
        const logs = Array.isArray(res.data.content)
          ? res.data.content
          : Array.isArray(res.data)
          ? res.data
          : [];
        setCampaignLogs(logs);
      }
    } catch (err) {
      console.error('Failed to load campaign logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    loadLogs();
  }, [loadMembers, loadLogs]);

  // Image Upload Handler to convert file to Base64 preview
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImageMimeType(file.type);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageBase64('');
    setImageMimeType('');
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick Template Presets
  const applyPresetTemplate = (type: 'PROMO' | 'RENEWAL' | 'WELCOME') => {
    if (type === 'PROMO') {
      setSubject('🔥 Exclusive 25% Off Annual Membership Renewal - PolanFit Arena');
      setBody(
        `<p>Dear Valued Gym Member,</p>\n<p>We are thrilled to announce our special promotional offer! Renew your annual membership this week and enjoy <strong>25% OFF</strong> standard rates plus 5 complimentary personal training sessions.</p>\n<p>Visit the front reception desk or reply to this email to claim your voucher!</p>\n<p>Best regards,<br/><strong>PolanFit Arena Management</strong></p>`
      );
    } else if (type === 'RENEWAL') {
      setSubject('⚠️ Membership Expiry Notice - Keep Your Access Active');
      setBody(
        `<p>Hi Member,</p>\n<p>Your subscription plan is approaching its expiration date. To maintain uninterrupted access to our gym floor and biometric access gates, please extend your plan.</p>\n<p>Click below or drop by reception to renew today!</p>`
      );
    } else if (type === 'WELCOME') {
      setSubject('🎉 Welcome to FitFarmHQ Arena - Your Fitness Journey Begins!');
      setBody(
        `<p>Welcome to our fitness community!</p>\n<p>Your biometric fingerprint profile is registered and ready for access gate access. Feel free to reach out to our trainers if you need a customized workout schedule.</p>`
      );
    }
  };

  // Send Email Blast Form Submission
  const handleSendEmailBlast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setStatusMessage({ type: 'error', msg: 'Please enter an email subject line.' });
      return;
    }
    if (!body.trim() && !imageBase64) {
      setStatusMessage({ type: 'error', msg: 'Please enter message content or attach an image.' });
      return;
    }

    if (recipientMode === 'SELECTED' && selectedEmails.length === 0) {
      setStatusMessage({ type: 'error', msg: 'Please select at least one member recipient.' });
      return;
    }
    if (recipientMode === 'CUSTOM' && !customEmailsText.trim()) {
      setStatusMessage({ type: 'error', msg: 'Please enter custom recipient email addresses.' });
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      const res = await apiFetch('/admin/campaigns/email-blast', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          body,
          recipientMode,
          selectedEmails,
          customEmailsText,
          imageBase64,
          imageMimeType,
        }),
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          msg: res.message || 'Email blast campaign successfully queued and dispatched!',
        });
        setSubject('');
        setBody('');
        setSelectedEmails([]);
        setCustomEmailsText('');
        handleRemoveImage();
        loadLogs();
      } else {
        setStatusMessage({ type: 'error', msg: res.message || 'Failed to dispatch email campaign.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'An error occurred sending campaign.' });
    } finally {
      setSending(false);
    }
  };

  // Auto/Manual Sync Log Status
  const handleSyncLog = async (logUid: string) => {
    try {
      const res = await apiFetch(`/admin/campaigns/logs/${logUid}/sync`, { method: 'POST' });
      if (res.success) {
        loadLogs();
      }
    } catch (err) {
      console.error('Failed to sync log status:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060608] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Promotional Email Blast Broadcast"
          subtitle="Compose HTML marketing campaigns, target member lists, and monitor live delivery dispatch"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 lg:pb-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/campaigns"
              className="text-xs text-orange-400 font-bold hover:underline flex items-center gap-1"
            >
              ← Back to Campaign & Leaderboard Settings
            </Link>

            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase">
              Broadcast System Active
            </span>
          </div>

          {/* Email Composer & Target Config Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2-Cols: Composer */}
            <div className="lg:col-span-2 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 rounded-3xl bg-[#0d0d12] border border-gray-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Compose Broadcast Message</h2>
                  <p className="text-xs text-gray-400">Design email content with templates and optional banner graphics</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('PROMO')}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold"
                  >
                    🔥 Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('RENEWAL')}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold"
                  >
                    ⚠️ Renewal
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('WELCOME')}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold"
                  >
                    🎉 Welcome
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold border ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {statusMessage.msg}
                </div>
              )}

              <form onSubmit={handleSendEmailBlast} className="space-y-5 text-xs">
                {/* Subject Line */}
                <div>
                  <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Email Subject Line <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., 🔥 Exclusive 25% Off Annual Gym Membership Renewal!"
                    className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-gray-800 text-white font-medium outline-none focus:border-orange-500 transition text-sm"
                    required
                  />
                </div>

                {/* Email Body Content */}
                <div>
                  <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Message Body (Supports HTML formatting)
                  </label>
                  <textarea
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your email body content or paste HTML template..."
                    className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-gray-800 text-white font-mono outline-none focus:border-orange-500 transition text-xs leading-relaxed"
                  />
                </div>

                {/* Image Banner Attachment */}
                <div>
                  <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Attach Promo Image Graphic (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition"
                    >
                      🖼️ Upload Image File
                    </button>
                    {imageFileName && (
                      <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-1.5 rounded-xl text-xs">
                        <span className="text-emerald-400 font-bold truncate max-w-xs">{imageFileName}</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-red-400 font-bold hover:text-red-300 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Preview Box */}
                {imageBase64 && (
                  <div className="p-3 rounded-2xl bg-[#060608] border border-gray-800 max-w-xs">
                    <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Image Preview:</p>
                    <img src={imageBase64} alt="Campaign Promo" className="w-full rounded-xl object-cover max-h-40" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-orange-500/20"
                >
                  {sending ? 'Dispatching Email Blast...' : '🚀 Dispatch Broadcast Email Now'}
                </button>
              </form>
            </div>

            {/* Right 1-Col: Target Recipients Config */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-[#0d0d12] border border-gray-800 space-y-6 shadow-xl h-fit">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-lg font-bold text-white">Target Recipients</h3>
                <p className="text-xs text-gray-400">Choose member distribution list</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-2 uppercase tracking-wider text-[10px]">
                    Recipient Selection Mode
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#060608] border border-gray-800 cursor-pointer hover:border-orange-500/50 transition">
                      <input
                        type="radio"
                        name="recipientMode"
                        value="ALL"
                        checked={recipientMode === 'ALL'}
                        onChange={(e) => setRecipientMode(e.target.value)}
                        className="accent-orange-500"
                      />
                      <div>
                        <div className="font-bold text-white">All Active Members</div>
                        <div className="text-[10px] text-gray-400">Broadcast to all registered emails</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#060608] border border-gray-800 cursor-pointer hover:border-orange-500/50 transition">
                      <input
                        type="radio"
                        name="recipientMode"
                        value="SELECTED"
                        checked={recipientMode === 'SELECTED'}
                        onChange={(e) => setRecipientMode(e.target.value)}
                        className="accent-orange-500"
                      />
                      <div>
                        <div className="font-bold text-white">Specific Selected Members</div>
                        <div className="text-[10px] text-gray-400">Pick specific individuals from list</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#060608] border border-gray-800 cursor-pointer hover:border-orange-500/50 transition">
                      <input
                        type="radio"
                        name="recipientMode"
                        value="CUSTOM"
                        checked={recipientMode === 'CUSTOM'}
                        onChange={(e) => setRecipientMode(e.target.value)}
                        className="accent-orange-500"
                      />
                      <div>
                        <div className="font-bold text-white">Custom Email List</div>
                        <div className="text-[10px] text-gray-400">Paste raw email addresses</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Mode: Selected Members List */}
                {recipientMode === 'SELECTED' && (
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                      Select Members ({selectedEmails.length} selected)
                    </label>
                    <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#060608] border border-gray-800">
                      {members.length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-[11px]">No members loaded</div>
                      ) : (
                        members.map((m) => {
                          const email = m.email || '';
                          if (!email) return null;
                          const name =
                            m.first_name && m.last_name
                              ? `${m.first_name} ${m.last_name}`
                              : m.name || email;
                          const isChecked = selectedEmails.includes(email);

                          return (
                            <label
                              key={m.id || email}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-bold text-white truncate">{name}</div>
                                <div className="text-[10px] text-gray-400 truncate">{email}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEmails([...selectedEmails, email]);
                                  } else {
                                    setSelectedEmails(selectedEmails.filter((em) => em !== email));
                                  }
                                }}
                                className="accent-orange-500 rounded"
                              />
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Mode: Custom Email Textarea */}
                {recipientMode === 'CUSTOM' && (
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                      Paste Custom Emails (Comma/Newline separated)
                    </label>
                    <textarea
                      rows={5}
                      value={customEmailsText}
                      onChange={(e) => setCustomEmailsText(e.target.value)}
                      placeholder="john@example.com, sarah@example.com&#10;victor@polanfit.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#060608] border border-gray-800 text-white font-mono outline-none focus:border-orange-500 transition text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Table: Past Email Campaign Broadcast Logs */}
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 rounded-3xl bg-[#0d0d12] border border-gray-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">📜 Email Campaign Broadcast History</h3>
                <p className="text-xs text-gray-400">Track delivery status, recipient counts, and dispatch logs</p>
              </div>

              <button
                onClick={loadLogs}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-semibold"
              >
                🔄 Refresh Logs
              </button>
            </div>

            {logsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading campaign logs...</div>
            ) : campaignLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No past email campaign broadcasts recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Subject Line</th>
                      <th className="py-3 px-4 font-bold">Target Recipients</th>
                      <th className="py-3 px-4 font-bold">Sent Count</th>
                      <th className="py-3 px-4 font-bold">Status / Countdown</th>
                      <th className="py-3 px-4 font-bold">Dispatch Date</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {campaignLogs.map((log) => (
                      <tr key={log.uid || log.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                          {log.subject}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 max-w-xs truncate">
                          {log.targetEmails || log.target_emails || 'All Members'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                          {log.sentToCount ?? log.sent_to_count ?? 1} sent
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              log.status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            <CountdownStatus row={log} onAutoSync={handleSyncLog} />
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                          {log.createdAt || log.created_at
                            ? new Date(log.createdAt || log.created_at).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSyncLog(log.uid || log.id)}
                            className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold transition"
                          >
                            🔄 Sync Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
