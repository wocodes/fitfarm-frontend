'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { apiFetch } from '../../lib/apiClient';

interface GymLocation {
  id: number;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  active?: boolean;
}

interface QRLinkData {
  qrLink: string;
  locationName: string;
  timestamp?: number;
}

export default function QRGeneratorPage() {
  const [locations, setLocations] = useState<GymLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isPermanent, setIsPermanent] = useState(true);
  const [qrData, setQrData] = useState<QRLinkData | null>(null);
  const [customText, setCustomText] = useState('SCAN TO CHECK-IN');

  // Location Modal State
  const [showLocModal, setShowLocModal] = useState(false);
  const [locModalLoading, setLocModalLoading] = useState(false);
  const [editingLoc, setEditingLoc] = useState<GymLocation | null>(null);
  const [locForm, setLocForm] = useState({
    name: '',
    address: '',
    latitude: 6.4281,
    longitude: 3.4219,
    radius: 50,
    active: true,
  });

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/admin/checkin/locations');
      if (res.success && res.data) {
        const locs = Array.isArray(res.data) ? res.data : res.data.content || [];
        setLocations(locs);
        if (locs.length > 0 && !selectedLocation) {
          setSelectedLocation(locs[0].uuid || String(locs[0].id));
        }
      } else {
        setError(res.message || 'Failed to fetch gym locations');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading locations.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedLocation) return;

    setGenerating(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/admin/checkin/generate-link?locationId=${selectedLocation}&permanent=${isPermanent}`
      );

      if (res.success && res.data) {
        setQrData(res.data);
      } else {
        setError(res.message || 'Failed to generate QR link.');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating QR code link.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocModalLoading(true);
    try {
      const endpoint = editingLoc ? `/admin/locations/${editingLoc.uuid || editingLoc.id}` : '/admin/locations';
      const method = editingLoc ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(locForm),
      });

      if (res.success) {
        setShowLocModal(false);
        fetchLocations();
      } else {
        alert(res.message || 'Failed to save location.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving location.');
    } finally {
      setLocModalLoading(false);
    }
  };

  const handleDeleteLocation = async (loc: GymLocation) => {
    const isConfirmed = window.confirm(`Delete gym location "${loc.name}"?`);
    if (!isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/locations/${loc.uuid || loc.id}`, { method: 'DELETE' });
      if (res.success) {
        fetchLocations();
      } else {
        alert(res.message || 'Failed to delete location.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting location.');
    }
  };

  const openLocModal = (loc: GymLocation | null = null) => {
    if (loc) {
      setEditingLoc(loc);
      setLocForm({
        name: loc.name,
        address: loc.address || '',
        latitude: loc.latitude || 6.4281,
        longitude: loc.longitude || 3.4219,
        radius: loc.radius || 50,
        active: loc.active ?? true,
      });
    } else {
      setEditingLoc(null);
      setLocForm({
        name: '',
        address: '',
        latitude: 6.4281,
        longitude: 3.4219,
        radius: 50,
        active: true,
      });
    }
    setShowLocModal(true);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      handleGenerate();
    } else {
      setQrData(null);
    }
  }, [selectedLocation, isPermanent]);

  const handlePrint = () => {
    window.print();
  };

  const qrImageUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrData.qrLink)}`
    : '';

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      {/* Sidebar hidden when printing */}
      <div className="no-print">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print">
          <Header
            title="QR Code Poster Generator"
            subtitle="Generate printable, high-resolution QR posters for self-service member kiosk check-ins and attendance points"
          />
        </div>

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Configuration Column */}
            <div className="lg:col-span-4 space-y-6 no-print">
              {/* Configuration Card */}
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>⚙️ Configuration</span>
                  </h3>
                  <button
                    onClick={() => openLocModal(null)}
                    className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>+ New Location</span>
                  </button>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Location Select */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Gym Location</label>
                    {selectedLocation && (
                      <button
                        onClick={() => {
                          const found = locations.find((l) => l.uuid === selectedLocation || String(l.id) === selectedLocation);
                          openLocModal(found || null);
                        }}
                        className="text-[11px] text-orange-400 hover:underline font-semibold"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium text-xs outline-none focus:border-orange-500/50"
                  >
                    <option value="">-- Choose Gym Location --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.uuid || String(loc.id)}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* QR Code Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    QR Code Access Type
                  </label>
                  <div className="space-y-2 text-xs">
                    <label
                      onClick={() => setIsPermanent(true)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        isPermanent
                          ? 'bg-orange-500/10 border-orange-500/40 text-white'
                          : 'bg-[#070709] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qrType"
                        checked={isPermanent}
                        onChange={() => setIsPermanent(true)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-white">Permanent (Printed Gym Poster)</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Fixed QR code for framed wall posters and access gate kiosk stands.
                        </div>
                      </div>
                    </label>

                    <label
                      onClick={() => setIsPermanent(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        !isPermanent
                          ? 'bg-orange-500/10 border-orange-500/40 text-white'
                          : 'bg-[#070709] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qrType"
                        checked={!isPermanent}
                        onChange={() => setIsPermanent(false)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-white">Dynamic (Short-Lived Access)</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Time-stamped QR code link generated dynamically for temporary access.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Print Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Custom Poster Banner Heading
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. SCAN TO CHECK-IN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold text-xs outline-none focus:border-orange-500/50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Appears as the prominent top banner on the printable poster.</p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!selectedLocation || generating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <span>Generating QR Link...</span>
                  ) : (
                    <>
                      <span>🔄 Refresh / Re-Generate QR</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gym Locations List Card */}
              <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Gym Locations</h4>
                <div className="divide-y divide-gray-800/80">
                  {locations.map((loc) => (
                    <div key={loc.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>📍</span>
                          <span>{loc.name}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{loc.address || 'No address set'}</div>
                        <div className="text-[10px] text-orange-400 font-mono mt-0.5">Radius: {loc.radius}m</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openLocModal(loc)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                          title="Edit Location"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          title="Delete Location"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {locations.length === 0 && !loading && (
                    <div className="py-6 text-center text-xs text-gray-500">No locations added yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Poster Preview Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-8 rounded-3xl bg-[#0f0f13] border border-gray-800 min-h-[720px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                {!qrData ? (
                  <div className="py-20 text-gray-500 space-y-3 no-print">
                    <div className="text-6xl opacity-30">📱</div>
                    <p className="text-sm font-medium">Select a location on the left to preview its printable QR poster.</p>
                  </div>
                ) : (
                  <>
                    {/* Printable Poster Area */}
                    <div id="printable-area" className="w-full max-w-xl p-10 rounded-3xl bg-white text-black text-center shadow-2xl space-y-6 border border-gray-200 my-4">
                      {/* Top Header */}
                      <div className="border-b border-gray-200 pb-4">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">{customText}</h1>
                        <p className="text-sm font-semibold text-gray-600 mt-1">
                          FitFarmHQ Gym Management — {qrData.locationName}
                        </p>
                      </div>

                      {/* High-Res QR Code Image Container */}
                      <div className="inline-block p-6 bg-white rounded-3xl border-2 border-gray-900 shadow-md">
                        <img
                          src={qrImageUrl}
                          alt="FitFarmHQ Check-In QR Code"
                          className="w-[320px] h-[320px] mx-auto object-contain"
                        />
                      </div>

                      {/* Location Name & Type */}
                      <div className="space-y-1">
                        <h2 className="text-2xl font-extrabold text-gray-900">{qrData.locationName}</h2>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                          {isPermanent ? 'Permanent Access Point' : 'Temporary Access Link'}
                        </p>
                      </div>

                      {/* Footer Instructions */}
                      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 font-medium space-y-1">
                        <p>Open your Smartphone Camera or FitFarmHQ Member App to scan.</p>
                        <p className="text-gray-900 font-bold text-sm">Powered by FitFarmHQ.io</p>
                      </div>
                    </div>

                    {/* Action Bar (Hidden during print) */}
                    <div className="no-print pt-6 flex items-center gap-4">
                      <button
                        onClick={handlePrint}
                        className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/20 transition flex items-center gap-2"
                      >
                        <span>🖨️ Print QR Poster</span>
                      </button>

                      <button
                        onClick={() => setQrData(null)}
                        className="px-5 py-3.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm transition"
                      >
                        Clear Preview
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Location Modal (New / Edit Location) */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">{editingLoc ? 'Edit Location' : 'New Gym Location'}</h3>
              <button
                onClick={() => setShowLocModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lekki Phase 1 Branch"
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Physical Address</label>
                <textarea
                  rows={2}
                  placeholder="123 Admiralty Way, Lekki Phase 1..."
                  value={locForm.address}
                  onChange={(e) => setLocForm({ ...locForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium outline-none focus:border-orange-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={locForm.latitude}
                    onChange={(e) => setLocForm({ ...locForm, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={locForm.longitude}
                    onChange={(e) => setLocForm({ ...locForm, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Geofencing Radius (Meters)</label>
                <input
                  type="number"
                  required
                  value={locForm.radius}
                  onChange={(e) => setLocForm({ ...locForm, radius: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-mono outline-none focus:border-orange-500/50"
                />
                <p className="text-[10px] text-gray-500 mt-1">Maximum allowed distance for mobile check-in verification.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                  disabled={locModalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={locModalLoading}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  {locModalLoading ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Query for Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          #printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 50px !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
