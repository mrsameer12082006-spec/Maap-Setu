import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MapPin,
  FileText,
  ShieldCheck,
  Award,
  ArrowRight,
  UploadCloud,
  Sparkles,
  Info,
  Building2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DynamicTechnicalVerification } from '../../components/verification/DynamicTechnicalVerification';
import { VernierRuler } from '../../components/common/VernierRuler';
import { Badge } from '../../components/common/Badge';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const { applications, submitVerificationResult } = useData();

  // Selected App for active field inspection
  const [activeApp, setActiveApp] = useState(null);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState({
    nameplateChecked: true,
    modelChecked: true,
    capacityChecked: true,
    accuracyClassChecked: true,
    markingsChecked: true,
    sealConditionChecked: true
  });

  // Rule-Based Test Results State
  const [testResults, setTestResults] = useState({
    test1ZeroLoad: '0.0 kg',
    test2HalfLoad: '29,998.5 kg',
    test3MaxLoad: '59,994.0 kg',
    mpeCheck: 'PASS - Within Rule 11 MPE Limits'
  });

  // Photos & Remarks State
  const [photosUploaded, setPhotosUploaded] = useState(true);
  const [remarks, setRemarks] = useState('All 6 physical inspection criteria passed. Lead seal affixed & QR code digital stamp generated.');
  const [outcome, setOutcome] = useState('PASS'); // 'PASS' or 'FAIL'
  const [failReason, setFailReason] = useState('MPE exceeded');
  const [customOtherReason, setCustomOtherReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter assigned inspection appointments
  const assignedQueue = applications.filter((a) => a.status === 'assigned' || a.status === 'in_progress');
  const completedQueue = applications.filter((a) => a.status === 'passed' || a.status === 'failed');

  const pendingPreview = [...assignedQueue]
    .sort((a, b) => new Date(a.scheduledInspectionDate || a.created_at) - new Date(b.scheduledInspectionDate || b.created_at))
    .slice(0, 3);
  const completedPreview = [...completedQueue]
    .sort((a, b) => new Date(b.created_at || b.submissionDate) - new Date(a.created_at || a.submissionDate))
    .slice(0, 3);

  const [technicalResults, setTechnicalResults] = useState({});

  const handleToggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestChange = (e) => {
    setTestResults({ ...testResults, [e.target.name]: e.target.value });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;

    if (outcome === 'FAIL') {
      const reasonToSubmit = failReason === 'Other' ? customOtherReason.trim() : failReason;
      if (!reasonToSubmit || reasonToSubmit === 'Other') {
        alert("Please provide the specific reason for failure when 'Other' is selected.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const rejectionReasonVal = outcome === 'FAIL'
        ? (failReason === 'Other' ? customOtherReason.trim() : failReason)
        : null;

      await submitVerificationResult({
        applicationId: activeApp.id,
        outcome: outcome,
        checklist_results: checklist,
        technical_test_results: technicalResults,
        officer_remarks: remarks,
        rejection_reason: rejectionReasonVal,
        photo_evidence_urls: []
      });

      setSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveApp(null);
      }, 1500);
    } catch (err) {
      setSubmitting(false);
      alert(`Failed to submit verification: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 text-slate-900 font-sans">
      {/* 1. OFFICER HEADER BANNER */}
      <div className="relative bg-white border border-slate-200 rounded-sm p-6 shadow-none overflow-hidden">
        <div className="h-1 bg-[#C87541] w-full absolute top-0 left-0" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-sm bg-[#0B315B] text-[#C87541] flex items-center justify-center font-mono font-bold text-base border border-[#C87541]/40 shrink-0">
              <span>RS</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87541] block">
                AUTHORIZED VERIFICATION OFFICER • LMO SEC. 24(1)
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0B315B] tracking-tight">
                {user?.name || 'Inspector Rajesh V. Sharma'}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Badge #LMO-NGP-442 • Zone: Nagpur Industrial Division & GATC Liaison
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={assignedQueue.length > 0 ? 'in_progress' : 'passed'} variant="stamp" subtext={`${assignedQueue.length} INSPECTIONS DUE`}>
              FIELD DISPATCH ACTIVE
            </Badge>
          </div>
        </div>

        <VernierRuler className="mt-4" />
      </div>

      {/* 2. TODAY'S FIELD VERIFICATION SCHEDULE */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              PHYSICAL ENFORCEMENT QUEUE • SCHEDULED INSPECTIONS
            </div>
            <h2 className="text-base font-semibold text-[#0B315B] tracking-tight mt-0.5">
              Today's Field Verification Schedule
            </h2>
          </div>
          <Clock className="w-4 h-4 text-[#C87541]" />
        </div>

        <div className="vernier-ruler-divider w-full" />

        <div className="p-6">
          {assignedQueue.length === 0 ? (
            <div className="bg-slate-50 rounded-sm p-8 text-center space-y-2 border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-semibold text-slate-900">All field verifications completed!</p>
              <p className="text-xs text-slate-500 font-mono">There are no pending inspections scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPreview.map((app) => (
                <div
                  key={app.id}
                  className="rounded-sm bg-white border border-slate-200 hover:border-slate-400 transition-colors overflow-hidden"
                >
                  <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[#0B315B] bg-slate-200/60 px-2 py-0.5 rounded-xs border border-slate-300">
                        {app.id}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        SCHEDULED: <span className="text-slate-900 font-medium">{app.scheduledInspectionDate || 'Today'}</span>
                      </span>
                    </div>

                    <Badge status="in_progress" variant="stamp" subtext={String(app.applicationType || '').toUpperCase()}>
                      PENDING FIELD CHECK
                    </Badge>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-200 text-xs">
                    <div className="p-3.5">
                      <dt className="text-slate-500 font-mono text-[10px] uppercase">INSTRUMENT DESIGNATION</dt>
                      <dd className="font-semibold text-slate-900 mt-0.5">{app.instrumentName}</dd>
                    </div>
                    <div className="p-3.5">
                      <dt className="text-slate-500 font-mono text-[10px] uppercase">APPLICANT / COMMERCIAL ENTITY</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">{app.applicantName}</dd>
                    </div>
                    <div className="p-3.5">
                      <dt className="text-slate-500 font-mono text-[10px] uppercase">INSPECTION PREMISES</dt>
                      <dd className="text-slate-700 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C87541] shrink-0" />
                        <span className="truncate">{app.inspectionLocation}</span>
                      </dd>
                    </div>
                  </dl>

                  <div className="p-3 bg-slate-50/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Standard Reference: Rule 11 Verification
                    </span>
                    <Link
                      to={`/officer/record/${app.id}`}
                      className="px-3.5 py-1.5 rounded-sm bg-[#0B315B] hover:bg-[#082342] text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C87541]" />
                      <span>Open Inspection Record</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. COMPLETED FIELD VERIFICATION LOG */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              AUDIT LOG • RECENT VERIFICATION OUTCOMES
            </div>
            <h3 className="text-base font-semibold text-[#0B315B] tracking-tight mt-0.5">
              Recent Completed Inspections
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xs border border-slate-200">
            {completedQueue.length} VERIFIED
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {completedPreview.map((app) => (
            <div key={app.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-[#0B315B]">{app.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-900">{app.instrumentName}</span>
                </div>
                <p className="text-slate-500 text-[11px]">Owner: {app.applicantName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={app.status} variant="stamp" />
                <Link
                  to={`/officer/record/${app.id}`}
                  className="px-3 py-1 rounded-sm border border-slate-300 font-medium text-xs text-[#0B315B] hover:bg-slate-100 transition-colors"
                >
                  View Record
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. INTERACTIVE FIELD VERIFICATION WORKSPACE MODAL */}
      {activeApp && (
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 shadow-xl animate-in zoom-in-95 duration-150 text-left">
            {/* Top Mechanical Accent */}
            <div className="h-1 bg-[#C87541] w-full shrink-0" />

            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
                  LEGAL METROLOGY ACT, 2009 • SECTION 24(1)
                </span>
                <h3 className="font-semibold text-lg text-[#0B315B] tracking-tight">
                  Physical Inspection & Test Report Workspace
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="w-8 h-8 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-sm transition-colors shrink-0 border border-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="vernier-ruler-divider w-full shrink-0" />

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {submitSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-500/40 rounded-sm text-emerald-800 text-xs font-mono flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>VERIFICATION RECORD STORED • SUBMITTED FOR LMD SUPERINTENDENT SEAL</span>
                </div>
              )}

              {/* Instrument Spec Sheet Container */}
              <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
                <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#0B315B] bg-slate-200/70 px-2 py-0.5 rounded-xs border border-slate-300">
                      {activeApp.id}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-slate-500 uppercase">
                      STATUTORY CASE FILE
                    </span>
                  </div>
                  <Badge status="in_progress" variant="stamp" subtext="UNDER INSPECTION">
                    CALIBRATION DISPATCH
                  </Badge>
                </div>

                <dl className="grid grid-cols-2 text-xs divide-x divide-y divide-slate-100">
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">INSTRUMENT</dt>
                    <dd className="font-semibold text-slate-900 mt-0.5">{activeApp.instrumentName}</dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">APPLICANT ENTITY</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">{activeApp.applicantName}</dd>
                  </div>
                  <div className="p-3 col-span-2">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">LOCATION</dt>
                    <dd className="text-slate-700 mt-0.5 font-mono text-[11px]">{activeApp.inspectionLocation}</dd>
                  </div>
                </dl>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-6">
                {/* A. MANDATORY REQUIREMENTS CHECKLIST */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#0B315B] flex items-center gap-1.5 font-mono">
                    <CheckSquare className="w-4 h-4 text-[#C87541]" />
                    <span>1. Statutory Physical Checklist (Rule 11)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'nameplateChecked', label: 'Identification / nameplate checked' },
                      { key: 'modelChecked', label: 'Manufacturer / model verified' },
                      { key: 'capacityChecked', label: 'Capacity & division confirmed' },
                      { key: 'accuracyClassChecked', label: 'Accuracy class verified' },
                      { key: 'markingsChecked', label: 'Required statutory markings intact' },
                      { key: 'sealConditionChecked', label: 'Physical lead seal intact' }
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`p-3 rounded-sm border flex items-center gap-3 cursor-pointer transition-colors ${
                          checklist[item.key]
                            ? 'bg-slate-50/80 border-slate-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checklist[item.key]}
                          onChange={() => handleToggleChecklist(item.key)}
                          className="w-4 h-4 accent-[#0B315B] rounded-xs"
                        />
                        <span className="font-medium text-xs">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* B. INSTRUMENT-SPECIFIC DYNAMIC TECHNICAL VERIFICATION */}
                <DynamicTechnicalVerification
                  instrumentName={activeApp.instrumentName}
                  applicationType={activeApp.applicationType}
                  onDataChange={setTechnicalResults}
                />

                {/* C. PHOTO EVIDENCE & OFFICER REMARKS */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#0B315B] flex items-center gap-1.5 font-mono">
                    <Camera className="w-4 h-4 text-[#C87541]" />
                    <span>3. Photo Evidence & Technical Remarks</span>
                  </h4>

                  <div className="flex items-center gap-2 text-xs flex-wrap font-mono">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xs border border-emerald-300 text-emerald-800 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>INSTRUMENT PHOTO STORED</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xs border border-emerald-300 text-emerald-800 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>NAMEPLATE SCAN ATTACHED</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xs border border-emerald-300 text-emerald-800 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>LEAD SEAL & QR STAMP PHOTO</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-600">
                      OFFICER OBSERVATIONS & STATUTORY REMARKS <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-sm p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B]"
                    />
                  </div>
                </div>

                {/* D. FINAL OUTCOME ACTION */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    STATUTORY VERIFICATION DETERMINATION <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOutcome('PASS');
                        setCustomOtherReason('');
                      }}
                      className={`py-3 rounded-sm font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 border ${
                        outcome === 'PASS'
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                          : 'bg-emerald-50/50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>[ PASS / ISSUE STAMP ]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOutcome('FAIL')}
                      className={`py-3 rounded-sm font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 border ${
                        outcome === 'FAIL'
                          ? 'bg-red-700 text-white border-red-800 shadow-xs'
                          : 'bg-red-50/50 text-red-900 border-red-300 hover:bg-red-100/50'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>[ FAIL / NON-COMPLIANT ]</span>
                    </button>
                  </div>

                  {outcome === 'FAIL' && (
                    <div className="p-4 bg-red-50/70 rounded-sm border border-red-300 space-y-3 animate-in fade-in duration-200 mt-2">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-red-900">
                        PRIMARY REJECTION GROUND <span className="text-red-600">*</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          'MPE exceeded',
                          'Nameplate mismatch',
                          'Seal damaged',
                          'Required marking missing',
                          'Instrument not functioning',
                          'Other'
                        ].map((reason) => (
                          <label
                            key={reason}
                            className={`p-2.5 rounded-sm border flex items-center gap-2 cursor-pointer font-medium transition-colors text-xs ${
                              failReason === reason
                                ? 'bg-red-700 text-white border-red-800'
                                : 'bg-white text-red-900 border-red-200 hover:bg-red-100/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="failReason"
                              value={reason}
                              checked={failReason === reason}
                              onChange={(e) => {
                                setFailReason(e.target.value);
                                if (e.target.value !== 'Other') {
                                  setCustomOtherReason('');
                                }
                              }}
                              className="w-3.5 h-3.5 accent-red-700"
                            />
                            <span>{reason}</span>
                          </label>
                        ))}
                      </div>

                      {failReason === 'Other' && (
                        <div className="pt-2">
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-red-900 mb-1">
                            DETAILED REJECTION SPECIFICATION <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={customOtherReason}
                            onChange={(e) => setCustomOtherReason(e.target.value)}
                            placeholder="Detail non-compliance with Legal Metrology (General) Rules..."
                            className="w-full rounded-sm border border-red-300 text-xs text-red-900 bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveApp(null)}
                    className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-300 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-sm bg-[#0B315B] hover:bg-[#082342] text-white font-medium text-xs transition-colors flex items-center gap-2 border border-[#0B315B]"
                  >
                    <span>{submitting ? 'Transmitting Record...' : 'Submit Verification Record'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C87541]" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
