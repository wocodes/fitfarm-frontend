'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiClient';
import {
  IconUser,
  IconPhone,
  IconInfoCircle,
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconCopy,
  IconCreditCard,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';

interface AddMemberModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  memberToEdit?: any;
  pricingPlans?: any[];
}

const WORDS = ["Swift", "Eagle", "Mountain", "River", "Golden", "Lion", "Azure", "Flame", "Silent", "Shadow", "Royal", "Noble", "Strong", "Fit", "Bold"];

export default function AddMemberModal({
  show,
  onHide,
  onSuccess,
  memberToEdit,
  pricingPlans = [],
}: AddMemberModalProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [memberUid, setMemberUid] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<number | string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Post-Registration Plan Assignment state
  const [showPlanOptions, setShowPlanOptions] = useState<boolean>(false);
  const [selectedRegistrationUid, setSelectedRegistrationUid] = useState<string>('');
  const [selectedSubscriptionUid, setSelectedSubscriptionUid] = useState<string>('');
  const [selectedPackageUid, setSelectedPackageUid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('POS');
  const [assignLoading, setAssignLoading] = useState<boolean>(false);
  const [assignSuccess, setAssignSuccess] = useState<boolean>(false);

  // Form fields state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    occupation: '',
    medicalConditions: '',
    bloodPressure: '',
    otherAilments: '',
    bloodGroup: '',
    genotype: '',
    nin: '',
    hmoProvider: '',
    hmoNumber: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    nextOfKinAddress: '',
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'polanfit-fitness';

  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('fitcloud_token') || localStorage.getItem('polanfit_token') || '';
  };

  useEffect(() => {
    if (show) {
      setErrorMsg(null);
      setFieldErrors({});
      setAssignSuccess(false);

      if (memberToEdit) {
        let formattedDob = '';
        if (memberToEdit.dob || memberToEdit.date_of_birth) {
          const rawDob = memberToEdit.dob || memberToEdit.date_of_birth;
          if (Array.isArray(rawDob) && rawDob.length >= 3) {
            formattedDob = `${rawDob[0]}-${String(rawDob[1]).padStart(2, '0')}-${String(rawDob[2]).padStart(2, '0')}`;
          } else if (typeof rawDob === 'string') {
            formattedDob = rawDob.split('T')[0];
          }
        }

        setFormData({
          firstName: memberToEdit.firstName || memberToEdit.first_name || '',
          lastName: memberToEdit.lastName || memberToEdit.last_name || '',
          email: memberToEdit.email || '',
          phone: memberToEdit.phone || '',
          dob: formattedDob,
          gender: (memberToEdit.gender || 'male').toLowerCase(),
          address: memberToEdit.address || '',
          emergencyContactName: memberToEdit.emergencyContactName || memberToEdit.emergency_contact_name || memberToEdit.emergencyContact?.contactName || '',
          emergencyContactPhone: memberToEdit.emergencyContactPhone || memberToEdit.emergency_contact_phone || memberToEdit.emergencyContact?.contactPhoneNumber || '',
          emergencyContactRelationship: memberToEdit.emergencyContactRelationship || memberToEdit.emergency_contact_relationship || memberToEdit.emergencyContact?.relationship || '',
          occupation: memberToEdit.occupation || '',
          medicalConditions: memberToEdit.medicalConditions || memberToEdit.medical_conditions || '',
          bloodPressure: memberToEdit.bloodPressure || memberToEdit.blood_pressure || '',
          otherAilments: memberToEdit.otherAilments || memberToEdit.other_ailments || '',
          bloodGroup: memberToEdit.bloodGroup || memberToEdit.blood_group || '',
          genotype: memberToEdit.genotype || '',
          nin: memberToEdit.nin || '',
          hmoProvider: memberToEdit.hmoProvider || memberToEdit.hmo_provider || '',
          hmoNumber: memberToEdit.hmoNumber || memberToEdit.hmo_number || '',
          nextOfKinName: memberToEdit.nextOfKinName || memberToEdit.next_of_kin_name || memberToEdit.nextOfKin?.nokName || '',
          nextOfKinPhone: memberToEdit.nextOfKinPhone || memberToEdit.next_of_kin_phone || memberToEdit.nextOfKin?.nokPhone || '',
          nextOfKinRelationship: memberToEdit.nextOfKinRelationship || memberToEdit.next_of_kin_relationship || memberToEdit.nextOfKin?.nokRelationship || '',
          nextOfKinAddress: memberToEdit.nextOfKinAddress || memberToEdit.next_of_kin_address || memberToEdit.nextOfKin?.nokAddress || '',
        });
        setMemberUid(memberToEdit.uuid || memberToEdit.uid || null);
        setMemberId(memberToEdit.id || null);
        setStep(1);
        setSuccess(false);
      } else {
        handleResetForm();
      }
    }
  }, [show, memberToEdit, pricingPlans]);

  const handleResetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'male',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      occupation: '',
      medicalConditions: '',
      bloodPressure: '',
      otherAilments: '',
      bloodGroup: '',
      genotype: '',
      nin: '',
      hmoProvider: '',
      hmoNumber: '',
      nextOfKinName: '',
      nextOfKinPhone: '',
      nextOfKinRelationship: '',
      nextOfKinAddress: '',
    });
    setStep(1);
    setSuccess(false);
    setGeneratedPassword('');
    setMemberUid(null);
    setMemberId(null);
    setFieldErrors({});
    setErrorMsg(null);

    // Auto-select default Registration plan if present
    const regPlan = pricingPlans.find(
      (p) => p.category === 'SYSTEM' || p.plan_name === 'SYSTEM-RG' || p.name?.toUpperCase().includes('REGISTRATION')
    );
    setSelectedRegistrationUid(regPlan ? (regPlan.id || regPlan.uuid || '') : '');
    setSelectedSubscriptionUid('');
    setSelectedPackageUid('');
    setShowPlanOptions(false);
  };

  const generateTempPassword = () => {
    const w1 = WORDS[Math.floor(Math.random() * WORDS.length)];
    const w2 = WORDS[Math.floor(Math.random() * WORDS.length)];
    const n = Math.floor(Math.random() * 90) + 10;
    return `${w1}${w2}${n}`;
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAssignPlan = async () => {
    if (!selectedRegistrationUid && !selectedSubscriptionUid && !selectedPackageUid) {
      setErrorMsg('Please select at least a Registration Fee or a Subscription plan');
      return;
    }

    setAssignLoading(true);
    setErrorMsg(null);
    try {
      const token = getAuthToken();
      const targetMemberId = memberId || memberUid;

      // 1. Process Registration Fee first if selected
      if (selectedRegistrationUid) {
        const json = await apiFetch('/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            member_id: targetMemberId,
            pricing_plan_id: selectedRegistrationUid,
            payment_method: paymentMethod,
            starts_at: new Date().toISOString(),
          }),
        });
        if (!json.success && json.status !== 'success') {
          throw new Error(json.message || 'Failed to assign registration fee');
        }
      }

      // 2. Process Core Subscription if selected
      if (selectedSubscriptionUid) {
        const json = await apiFetch('/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            member_id: targetMemberId,
            pricing_plan_id: selectedSubscriptionUid,
            payment_method: paymentMethod,
            starts_at: new Date().toISOString(),
          }),
        });
        if (!json.success && json.status !== 'success') {
          throw new Error(json.message || 'Failed to assign core subscription plan');
        }
      }

      // 3. Process Package if selected
      if (selectedPackageUid) {
        const json = await apiFetch('/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            member_id: targetMemberId,
            pricing_plan_id: selectedPackageUid,
            payment_method: paymentMethod,
          }),
        });
        if (!json.success && json.status !== 'success') {
          throw new Error(json.message || 'Failed to assign package plan');
        }
      }

      setAssignSuccess(true);
      onSuccess();
    } catch (err: any) {
      console.error('Assign plan error:', err);
      setErrorMsg(err.message || 'Network error while assigning plan');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const token = getAuthToken();

    // Step 1: Bio-Data Validation & Account Creation
    if (step === 1) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        setFieldErrors({ email: 'Please provide a valid email address' });
        return;
      }

      if (!formData.firstName.trim()) {
        setFieldErrors({ firstName: 'First name is required' });
        return;
      }
      if (!formData.lastName.trim()) {
        setFieldErrors({ lastName: 'Last name is required' });
        return;
      }

      if (formData.dob && calculateAge(formData.dob) < 18) {
        setFieldErrors({ dob: 'Member must be at least 18 years old.' });
        setErrorMsg('Member must be at least 18 years old to register.');
        return;
      }

      if (memberUid && !memberToEdit) {
        nextStep();
        return;
      }

      setLoading(true);
      try {
        if (memberToEdit) {
          // UPDATE MODE
          const json = await apiFetch(`/admin/members/${memberUid || memberId}`, {
            method: 'PUT',
            body: JSON.stringify(formData),
          });
          if (json.success || json.status === 'success') {
            nextStep();
          } else {
            setErrorMsg(json.message || 'Failed to update member bio-data');
          }
        } else {
          // NEW REGISTRATION MODE
          const tempPass = generateTempPassword();
          const signupPayload = {
            ...formData,
            password: tempPass,
          };

          const json = await apiFetch('/admin/members', {
            method: 'POST',
            body: JSON.stringify(signupPayload),
          });

          if (json.success || json.status === 'success') {
            const createdData = json.data || {};
            setMemberUid(createdData.uuid || createdData.memberUid || createdData.id);
            setMemberId(createdData.id || createdData.uuid);
            setGeneratedPassword(createdData.tempPassword || tempPass);
            nextStep();
          } else {
            if (json.errors) {
              const mapped: Record<string, string> = {};
              Object.keys(json.errors).forEach((key) => {
                mapped[key] = Array.isArray(json.errors[key]) ? json.errors[key][0] : json.errors[key];
              });
              setFieldErrors(mapped);
            }
            setErrorMsg(json.message || 'Registration failed. Please check inputs.');
          }
        }
      } catch (err: any) {
        console.error('Step 1 Error:', err);
        setErrorMsg(err.message || 'Failed to connect to server');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 2: Emergency Contact Update
    if (step === 2) {
      if (!formData.emergencyContactName.trim()) {
        setFieldErrors({ emergencyContactName: 'Emergency contact name is required' });
        return;
      }
      if (!formData.emergencyContactPhone.trim()) {
        setFieldErrors({ emergencyContactPhone: 'Emergency contact phone is required' });
        return;
      }

      setLoading(true);
      try {
        const targetId = memberUid || memberId;
        const json = await apiFetch(`/admin/members/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify({
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone,
            emergency_contact_relationship: formData.emergencyContactRelationship,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            emergencyContactRelationship: formData.emergencyContactRelationship,
          }),
        });
        if (json.success || json.status === 'success') {
          nextStep();
        } else {
          setErrorMsg(json.message || 'Failed to update emergency contact');
        }
      } catch (err: any) {
        console.error('Step 2 Error:', err);
        setErrorMsg(err.message || 'Failed to connect to server');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 3: Other Details & Completion
    if (step === 3) {
      setLoading(true);
      try {
        const targetId = memberUid || memberId;
        const json = await apiFetch(`/admin/members/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (json.success || json.status === 'success') {
          if (memberToEdit) {
            onSuccess();
            onHide();
          } else {
            setSuccess(true);
            onSuccess();
          }
        } else {
          setErrorMsg(json.message || 'Failed to save complete member profile');
        }
      } catch (err: any) {
        console.error('Step 3 Error:', err);
        setErrorMsg(err.message || 'Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!show) return null;

  const progressPercent = (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate__animated animate__fadeIn">
      <div className="relative w-full max-w-2xl bg-[#18181b] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
            {success ? 'Registration Complete' : memberToEdit ? `Edit Member: ${memberToEdit.name}` : 'New Member Registration'}
          </h3>
          <button
            onClick={() => {
              handleResetForm();
              onHide();
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <IconAlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          /* SUCCESS SCREEN */
          <div className="py-4 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2">
              <IconCheck size={44} />
            </div>

            <div>
              <h4 className="text-2xl font-black text-white">Registration Successful!</h4>
              <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
                Member account and full profile have been created and saved in FitCloud SaaS.
              </p>
            </div>

            {/* Temporary Password Box */}
            <div className="p-5 bg-[#0f0f11] border border-gray-800 rounded-2xl max-w-md mx-auto shadow-inner text-left space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Temporary Login Password
              </span>
              <div className="flex items-center justify-between gap-3 bg-[#18181b] p-3 rounded-xl border border-gray-700">
                <span className="font-mono text-lg font-extrabold text-orange-400 tracking-wider">
                  {generatedPassword}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                An email notice has been dispatched to <strong className="text-gray-300">{formData.email || 'the member email'}</strong> with login instructions.
              </p>
            </div>

            {/* Optional Plan Assignment Accordion */}
            <div className="max-w-md mx-auto text-left border-t border-gray-800 pt-5">
              {assignSuccess ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <IconCheck size={18} />
                  <span>Subscription plan successfully assigned and activated!</span>
                </div>
              ) : showPlanOptions ? (
                <div className="bg-[#0f0f11] border border-gray-800 rounded-2xl p-4 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                    <IconCreditCard size={16} />
                    Assign Membership Plan
                  </h5>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                      1. Registration Fee <span className="text-orange-400 font-normal">(Initial Fee)</span>
                    </label>
                    <select
                      value={selectedRegistrationUid}
                      onChange={(e) => setSelectedRegistrationUid(e.target.value)}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">No Registration Fee / Waived</option>
                      {pricingPlans
                        .filter((p) => p.category === 'SYSTEM' || p.plan_name === 'SYSTEM-RG' || p.name?.toUpperCase().includes('REGISTRATION'))
                        .map((p) => (
                          <option key={p.id || p.uuid} value={p.id || p.uuid}>
                            {p.name} - NGN {(p.price || p.fee || 0).toLocaleString()}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                      2. Core Subscription Plan <span className="text-gray-400 font-normal">(Workout Plan)</span>
                    </label>
                    <select
                      value={selectedSubscriptionUid}
                      onChange={(e) => setSelectedSubscriptionUid(e.target.value)}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Choose a subscription plan...</option>
                      {pricingPlans
                        .filter((p) => (p.category === 'SUBSCRIPTION' || !p.category) && p.category !== 'SYSTEM' && !p.name?.toUpperCase().includes('REGISTRATION'))
                        .map((p) => (
                          <option key={p.id || p.uuid} value={p.id || p.uuid}>
                            {p.name} - NGN {(p.price || p.fee || 0).toLocaleString()}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                      3. Additional Package (Optional)
                    </label>
                    <select
                      value={selectedPackageUid}
                      onChange={(e) => setSelectedPackageUid(e.target.value)}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Choose a package...</option>
                      {pricingPlans
                        .filter((p) => p.category === 'EXCLUSIVE' || p.category === 'GENERIC')
                        .map((p) => (
                          <option key={p.id || p.uuid} value={p.id || p.uuid}>
                            {p.name} - NGN {(p.price || p.fee || 0).toLocaleString()}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="POS">POS Terminal</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="PAYSTACK">Paystack (Online)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAssignPlan}
                      disabled={assignLoading || !selectedSubscriptionUid}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black text-xs font-black transition flex items-center justify-center gap-2"
                    >
                      {assignLoading ? 'Assigning Plan...' : 'Activate Subscription Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPlanOptions(false)}
                      className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPlanOptions(true)}
                  className="w-full py-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-extrabold flex items-center justify-center gap-2 transition"
                >
                  <IconCreditCard size={18} />
                  Assign Membership Plan & Activate Now
                </button>
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  onHide();
                }}
                className="px-8 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-black shadow-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM WIZARD STAGE */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step Navigation & Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition ${
                    step >= 1 ? 'text-orange-400 bg-orange-500/10' : 'text-gray-500'
                  }`}
                >
                  <IconUser size={16} /> 1. Bio-Data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (step >= 2 || memberToEdit || memberUid) setStep(2);
                  }}
                  disabled={!memberToEdit && !memberUid && step < 2}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition ${
                    step >= 2 ? 'text-orange-400 bg-orange-500/10' : 'text-gray-500 opacity-60'
                  }`}
                >
                  <IconPhone size={16} /> 2. Emergency
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (step >= 3 || memberToEdit || memberUid) setStep(3);
                  }}
                  disabled={!memberToEdit && !memberUid && step < 3}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition ${
                    step >= 3 ? 'text-orange-400 bg-orange-500/10' : 'text-gray-500 opacity-60'
                  }`}
                >
                  <IconInfoCircle size={16} /> 3. Other Details
                </button>
              </div>

              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* STEP 1: BIO-DATA */}
            {step === 1 && (
              <div className="space-y-4 animate__animated animate__fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(memberUid && !memberToEdit)}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. John"
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.firstName ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                    {fieldErrors.firstName && (
                      <span className="text-[10px] text-red-400 mt-1 block">{fieldErrors.firstName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(memberUid && !memberToEdit)}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Doe"
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.lastName ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                    {fieldErrors.lastName && (
                      <span className="text-[10px] text-red-400 mt-1 block">{fieldErrors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@example.com"
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                    {fieldErrors.email && (
                      <span className="text-[10px] text-red-400 mt-1 block">{fieldErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08012345678"
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.phone ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <span className="text-[10px] text-red-400 mt-1 block">{fieldErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Date of Birth <span className="text-red-400">*</span> (Minimum 18 yrs)
                    </label>
                    <input
                      type="date"
                      required
                      disabled={Boolean(memberUid && !memberToEdit)}
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.dob ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                    {fieldErrors.dob && (
                      <span className="text-[10px] text-red-400 mt-1 block">{fieldErrors.dob}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      disabled={Boolean(memberUid && !memberToEdit)}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Residential Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full physical residential address"
                    className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                {memberUid && !memberToEdit && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <IconCheck size={16} />
                    <span>Member account created. Bio-data is locked for this session.</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: EMERGENCY CONTACT */}
            {step === 2 && (
              <div className="space-y-4 animate__animated animate__fadeIn">
                <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
                  Provide primary emergency contact details for gym safety compliance.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Contact Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="Full name of emergency contact"
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.emergencyContactName ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Contact Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="Emergency phone number"
                      className={`w-full px-3.5 py-2.5 bg-[#0f0f11] border rounded-xl text-white text-xs focus:outline-none transition ${
                        fieldErrors.emergencyContactPhone ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Relationship <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: OTHER DETAILS & MEDICAL */}
            {step === 3 && (
              <div className="space-y-4 animate__animated animate__fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Occupation</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">NIN (National ID)</label>
                    <input
                      type="text"
                      value={formData.nin}
                      onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Genotype</label>
                    <select
                      value={formData.genotype}
                      onChange={(e) => setFormData({ ...formData, genotype: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select</option>
                      <option value="AA">AA</option>
                      <option value="AS">AS</option>
                      <option value="SS">SS</option>
                      <option value="AC">AC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                      placeholder="e.g. 120/80"
                      className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Medical Conditions</label>
                    <textarea
                      rows={2}
                      value={formData.medicalConditions}
                      onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                      placeholder="Allergies, injuries, etc. (Optional)"
                      className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Other Ailments</label>
                    <textarea
                      rows={2}
                      value={formData.otherAilments}
                      onChange={(e) => setFormData({ ...formData, otherAilments: e.target.value })}
                      placeholder="Other health issues (Optional)"
                      className="w-full px-3.5 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">HMO Provider</label>
                    <input
                      type="text"
                      value={formData.hmoProvider}
                      onChange={(e) => setFormData({ ...formData, hmoProvider: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">HMO Policy No.</label>
                    <input
                      type="text"
                      value={formData.hmoNumber}
                      onChange={(e) => setFormData({ ...formData, hmoNumber: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Next of Kin Sub-Section */}
                <div className="border-t border-gray-800 pt-3 space-y-3">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next of Kin (Optional)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={formData.nextOfKinName}
                        onChange={(e) => setFormData({ ...formData, nextOfKinName: e.target.value })}
                        placeholder="Next of Kin Full Name"
                        className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.nextOfKinPhone}
                        onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })}
                        placeholder="Next of Kin Phone Number"
                        className="w-full px-3 py-2 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Summary Box */}
                <div className="p-4 bg-[#0f0f11] border border-gray-800 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
                    Registration Summary Preview
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div>
                      <span className="text-gray-500">Name:</span> {formData.firstName} {formData.lastName}
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span> {formData.email || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span> {formData.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-500">Gender:</span> {formData.gender}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Navigation Footer */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <IconChevronLeft size={16} /> Back
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    onHide();
                  }}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-extrabold shadow-lg flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      {step === 3 ? (memberToEdit ? 'Update Member' : 'Complete Registration') : 'Continue'}
                      {step < 3 && <IconChevronRight size={16} />}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
