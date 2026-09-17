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
    <div className="w-full max-w-5xl mx-auto space-y-7 pb-20 text-[#003943]">
      {/* 1. OFFICER HEADER BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#003943] text-[#02B7BF] flex items-center justify-center shadow-md font-bold text-lg border-2 border-[#00959C]">
            <span>RS</span>
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00959C]">
              AUTHORIZED VERIFICATION OFFICER
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#003943]">
              {user?.name || 'Inspector Rajesh V. Sharma'}
            </h1>
            <p className="text-xs text-[#003943]/70 font-medium">
              Badge #LMO-NGP-442 • Zone: Nagpur Industrial Division & GATC Liaison
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E0F5F6] text-[#003943] text-xs font-bold">
            {assignedQueue.length} Field Inspections Pending
          </span>
        </div>
      </div>

      {/* 2. TODAY'S FIELD VERIFICATION SCHEDULE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#003943]/10">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#003943]">
              Today's Field Verification Schedule
            </h2>
            <p className="text-xs text-[#003943]/70">
              Assigned physical verification appointments needing on-site testing.
            </p>
          </div>
          <Clock className="w-5 h-5 text-[#00959C]" />
        </div>

        {assignedQueue.length === 0 ? (
          <div className="bg-[#FDF9F6] rounded-2xl p-8 text-center space-y-2 border border-[#003943]/10">
            <CheckCircle2 className="w-8 h-8 text-[#00959C] mx-auto" />
            <p className="font-serif font-bold text-[#003943]">All field verifications completed!</p>
            <p className="text-xs text-[#003943]/60">There are no pending inspections scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPreview.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[#FDF9F6] border border-[#003943]/15 hover:border-[#00959C] transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#00959C]">{app.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-[10px] font-bold uppercase">
                        Scheduled: {app.scheduledInspectionDate || 'Today'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                        {String(app.applicationType || '').toLowerCase().includes('re') ? 'Re-verification' : 'Initial Verification'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#003943]">
                      {app.instrumentName}
                    </h3>

                    <p className="text-xs text-[#003943]/80">
                      Owner: <span className="font-semibold text-[#003943]">{app.applicantName}</span>
                    </p>

                    <p className="text-xs text-[#003943]/70 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00959C]" /> Location: {app.inspectionLocation}
                    </p>
                  </div>

                  <Link
                    to={`/officer/record/${app.id}`}
                    className="px-5 py-2.5 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 shrink-0"
                  >
                    <FileText className="w-4 h-4 text-[#02B7BF]" />
                    <span>View Record</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. COMPLETED FIELD VERIFICATION LOG */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-5">
        <div className="pb-3 border-b border-[#003943]/10 flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl text-[#003943]">
            Recent Completed Inspections
          </h3>
          <span className="text-xs font-bold text-emerald-700">{completedQueue.length} Verified</span>
        </div>

        <div className="space-y-3">
          {completedPreview.map((app) => (
            <div key={app.id} className="p-4 rounded-2xl bg-[#FDF9F6] border border-[#003943]/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-mono font-bold text-[#00959C]">{app.id}</p>
                <p className="font-serif font-bold text-[#003943] text-sm">{app.instrumentName}</p>
                <p className="text-[#003943]/70">Owner: {app.applicantName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3.5 py-1 rounded-full font-bold text-xs ${app.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {app.status === 'failed' ? 'FAIL' : 'PASS'}
                </span>
                <Link
                  to={`/officer/record/${app.id}`}
                  className="px-3 py-1 rounded-full border border-[#003943]/20 font-bold text-xs text-[#003943] hover:bg-white hover:border-[#00959C] transition-all"
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
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-transparent flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#003943]/20 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-[#003943]/10 flex items-center justify-between bg-white shrink-0">
              <div>
                <span className="text-[10px] font-extrabold text-[#00959C] uppercase tracking-wider">
                  INSTRUMENT VERIFICATION WORKSPACE
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#003943]">
                  Physical Inspection & Test Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#003943] flex items-center justify-center font-bold text-lg transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">

            {submitSuccess && (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Verification Result Submitted to LMD Admin for Final Approval!</span>
              </div>
            )}

            {/* Instrument Info Header Box */}
            <div className="p-4 bg-[#FDF9F6] rounded-2xl border border-[#003943]/15 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#00959C]">{activeApp.id}</span>
                <span className="px-2.5 py-0.5 rounded bg-[#003943] text-white font-mono font-bold text-[10px]">
                  AV-984210-IN
                </span>
              </div>
              <p className="font-serif font-bold text-[#003943] text-base">{activeApp.instrumentName}</p>
              <p className="text-[#003943]/80">Owner: <span className="font-semibold">{activeApp.applicantName}</span></p>
              <p className="text-[#003943]/70">Location: {activeApp.inspectionLocation}</p>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* A. MANDATORY REQUIREMENTS CHECKLIST */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#00959C]" />
                  <span>1. Mandatory Physical Requirements Checklist</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="p-3 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.nameplateChecked}
                      onChange={() => handleToggleChecklist('nameplateChecked')}
                      className="w-4 h-4 text-[#00959C] rounded"
                    />
                    <span className="font-semibold text-[#003943]">Identification / nameplate checked</span>
                  </label>

                  <label className="p-3 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.modelChecked}
                      onChange={() => handleToggleChecklist('modelChecked')}
                      className="w-4 h-4 text-[#00959C] rounded"
                    />
                    <span className="font-semibold text-[#003943]">Manufacturer / model checked</span>
                  </label>

                  <label className="p-3 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.capacityChecked}
                      onChange={() => handleToggleChecklist('capacityChecked')}
                      className="w-4 h-4 text-[#00959C] rounded"
                    />
                    <span className="font-semibold text-[#003943]">Capacity checked</span>
                  </label>

                  <label className="p-3 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.accuracyClassChecked}
                      onChange={() => handleToggleChecklist('accuracyClassChecked')}
                      className="w-4 h-4 text-[#00959C] rounded"
                    />
                    <span className="font-semibold text-[#003943]">Accuracy class checked</span>
                  </label>

                  <label className="p-3 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.markingsChecked}
                      onChange={() => handleToggleChecklist('markingsChecked')}
                      className="w-4 h-4 text-[#00959C] rounded"
                    />
                    <span className="font-semibold text-[#003943]">Required markings checked</span>
                  </label>

                  <label className="p-3 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.sealConditionChecked}
                      onChange={() => handleToggleChecklist('sealConditionChecked')}
                      className="w-4 h-4 text-[#00959C] rounded"
                    />
                    <span className="font-semibold text-[#003943]">Seal condition checked</span>
                  </label>
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
                <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#00959C]" />
                  <span>3. Photo Evidence & Inspection Remarks</span>
                </h4>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>📷 Instrument / Inspection Photo</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>📷 Nameplate Scan Attached</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>📷 Lead Seal & QR Stamp Photo Attached</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-xs uppercase tracking-wider text-[#003943]/80">
                    Officer Remarks & Observations <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl p-3 text-xs font-semibold text-[#003943]"
                  />
                </div>
              </div>

              {/* D. FINAL OUTCOME ACTION */}
              <div className="space-y-3 pt-2 border-t border-[#003943]/10">
                <label className="block font-bold text-xs uppercase tracking-wider text-[#003943]/80">
                  Select Inspection Final Outcome <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOutcome('PASS');
                      setCustomOtherReason('');
                    }}
                    className={`py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                      outcome === 'PASS'
                        ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>[ PASS / STAMP ]</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutcome('FAIL')}
                    className={`py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                      outcome === 'FAIL'
                        ? 'bg-red-700 text-white shadow-md ring-2 ring-red-500'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>[ FAIL / REJECT ]</span>
                  </button>
                </div>

                {/* Reason for Failure Selection (Shown when FAIL is selected) */}
                {outcome === 'FAIL' && (
                  <div className="p-4 bg-red-50/90 rounded-2xl border border-red-200 space-y-3 animate-in fade-in duration-200 mt-3">
                    <label className="block font-extrabold text-xs uppercase tracking-wider text-red-900">
                      Reason for Failure <span className="text-red-600">*</span>
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
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer font-bold transition-all ${
                            failReason === reason
                              ? 'bg-red-700 text-white border-red-800 shadow-xs'
                              : 'bg-white text-red-900 border-red-200 hover:bg-red-100/60'
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
                            className="w-4 h-4 accent-red-700"
                          />
                          <span>{reason}</span>
                        </label>
                      ))}
                    </div>

                    {failReason === 'Other' && (
                      <div className="pt-2">
                        <label className="block font-bold text-xs uppercase tracking-wider text-red-900 mb-1.5">
                          OTHER REASON FOR FAILURE <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={customOtherReason}
                          onChange={(e) => setCustomOtherReason(e.target.value)}
                          placeholder="Describe the reason for rejection..."
                          className="w-full rounded-xl border border-red-200 text-xs text-red-900 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#003943]/10">
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-[#003943] font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3.5 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>{submitting ? 'Submitting to LMD...' : 'Submit Verification Result to LMD'}</span>
                  <ArrowRight className="w-4 h-4 text-[#02B7BF]" />
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
