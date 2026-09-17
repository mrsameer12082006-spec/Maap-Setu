import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Building2,
  Users,
  Search,
  CheckSquare,
  FileText,
  Sparkles,
  Calendar,
  MapPin,
  Eye,
  Check,
  X,
  Award
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  STATUS_CATEGORIES,
  calculateLmdDashboardCounts,
  getActionableLmdApplications
} from '../../utils/statusClassification';

export const LmdDashboard = () => {
  const { user } = useAuth();
  const { applications, loading: dataLoading, officers, certificates, assignOfficer, submitVerificationResult } = useData();

  // State for Review & Assignment Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [verifierType, setVerifierType] = useState('LMO'); // 'LMO' or 'GATC'
  const [selectedOfficerId, setSelectedOfficerId] = useState(officers[0]?.id || 'OFF-101');
  const [scheduledDate, setScheduledDate] = useState('2026-08-30');
  const [assignmentNotes, setAssignmentNotes] = useState('Inspect heavy standard test weights on site.');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    if (officers?.length > 0 && selectedOfficerId === 'OFF-101') {
      setSelectedOfficerId(officers[0].id);
    }
  }, [officers, selectedOfficerId]);

  // State for Final Approval Modal
  const [reviewRecordApp, setReviewRecordApp] = useState(null);

  // Dynamic Status Counts and Actionable Applications derived from canonical Supabase applications
  const statusCounts = useMemo(() => calculateLmdDashboardCounts(applications), [applications]);
  const actionableList = useMemo(() => getActionableLmdApplications(applications), [applications]);
  const actionableApps = useMemo(() => actionableList.slice(0, 5), [actionableList]);

  // Automated Eligibility Route Rule Helper
  const getEligibleRoute = (instrumentName = '') => {
    const lower = instrumentName.toLowerCase();
    if (lower.includes('water') || lower.includes('flowmeter') || lower.includes('packaged')) {
      return { route: 'GATC', label: 'GATC Authorized Test Centre', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
    return { route: 'LMO', label: 'State LMO Inspectorate', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  // Handle Assigning Verifier
  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setAssignLoading(true);

    await assignOfficer(
      selectedApp.id,
      selectedOfficerId,
      scheduledDate,
      `[${verifierType} Route] ${assignmentNotes}`
    );

    setAssignLoading(false);
    setSelectedApp(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-7 pb-20 text-[#003943]">
      {/* 1. HEADER BANNER */}
      <div className="space-y-1.5 pt-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00959C]">
          LMD ADMINISTRATOR PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#003943] tracking-tight">
          Statewide Control & Verification Roster
        </h1>
        <p className="text-xs sm:text-sm text-[#003943]/70 font-medium max-w-3xl">
          Supervise incoming business applications, review eligibility routes, assign LMO/GATC verifiers, and approve inspection records.
        </p>
      </div>

      {/* 2. MAIN METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* NEW */}
        <Link
          to="/lmd/review?status=new"
          className="bg-white rounded-2xl p-4 border border-[#003943]/15 shadow-xs text-center space-y-1 hover:border-[#00959C] hover:shadow-md transition-all cursor-pointer group block"
          title="View New Applications"
        >
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#003943] group-hover:text-[#00959C] transition-colors">
            {dataLoading ? <span className="text-gray-300 animate-pulse">—</span> : statusCounts[STATUS_CATEGORIES.NEW]}
          </p>
          <p className="text-[11px] font-bold text-[#003943]/70 uppercase tracking-wider group-hover:text-[#003943]">
            New
          </p>
        </Link>

        {/* IN PROGRESS */}
        <Link
          to="/lmd/review?status=in_progress"
          className="bg-white rounded-2xl p-4 border border-[#003943]/15 shadow-xs text-center space-y-1 hover:border-[#00959C] hover:shadow-md transition-all cursor-pointer group block"
          title="View Applications In Progress"
        >
          <p className="text-2xl sm:text-3xl font-serif font-bold text-cyan-700 group-hover:text-cyan-800 transition-colors">
            {dataLoading ? <span className="text-gray-300 animate-pulse">—</span> : statusCounts[STATUS_CATEGORIES.IN_PROGRESS]}
          </p>
          <p className="text-[11px] font-bold text-[#003943]/70 uppercase tracking-wider group-hover:text-[#003943]">
            In Progress
          </p>
        </Link>

        {/* AWAITING ASSIGN */}
        <Link
          to="/lmd/review?status=awaiting_assignment"
          className="bg-white rounded-2xl p-4 border border-[#003943]/15 shadow-xs text-center space-y-1 hover:border-[#00959C] hover:shadow-md transition-all cursor-pointer group block"
          title="View Applications Awaiting Verifier Assignment"
        >
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#00959C] group-hover:text-[#007b80] transition-colors">
            {dataLoading ? <span className="text-gray-300 animate-pulse">—</span> : statusCounts[STATUS_CATEGORIES.AWAITING_ASSIGN]}
          </p>
          <p className="text-[11px] font-bold text-[#003943]/70 uppercase tracking-wider group-hover:text-[#003943]">
            Awaiting Assign
          </p>
        </Link>

        {/* VERIFICATION */}
        <Link
          to="/lmd/review?status=verification"
          className="bg-white rounded-2xl p-4 border border-[#003943]/15 shadow-xs text-center space-y-1 hover:border-[#00959C] hover:shadow-md transition-all cursor-pointer group block"
          title="View Applications Under Verification"
        >
          <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
            {dataLoading ? <span className="text-gray-300 animate-pulse">—</span> : statusCounts[STATUS_CATEGORIES.VERIFICATION]}
          </p>
          <p className="text-[11px] font-bold text-[#003943]/70 uppercase tracking-wider group-hover:text-[#003943]">
            Verification
          </p>
        </Link>

        {/* COMPLETED */}
        <Link
          to="/lmd/review?status=completed"
          className="bg-white rounded-2xl p-4 border border-[#003943]/15 shadow-xs text-center space-y-1 hover:border-[#00959C] hover:shadow-md transition-all cursor-pointer group block"
          title="View Completed Applications"
        >
          <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
            {dataLoading ? <span className="text-gray-300 animate-pulse">—</span> : statusCounts[STATUS_CATEGORIES.COMPLETED]}
          </p>
          <p className="text-[11px] font-bold text-[#003943]/70 uppercase tracking-wider group-hover:text-[#003943]">
            Completed
          </p>
        </Link>
      </div>

      {/* 3. CASE WORKFLOW PIPELINE: INCOMING APPLICATIONS QUEUE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#003943]/10">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#003943]">
              Actionable Cases Preview
            </h2>
            <p className="text-xs text-[#003943]/70">
              Review application completeness, check eligibility rules, and assign authorized verifier (LMO / GATC).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#E0F5F6] text-[#00959C] text-xs font-bold shrink-0">
              {dataLoading ? '...' : `${actionableList.length} Actionable`}
            </span>
            <Link to="/lmd/review" className="text-xs font-bold text-[#00959C] hover:underline">
              Review all &rarr;
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {dataLoading ? (
            <div className="p-8 text-center text-[#003943]/60 text-sm font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-[#00959C]" /> Loading applications...
            </div>
          ) : actionableApps.length === 0 ? (
            <div className="p-8 text-center text-[#003943]/60 text-sm font-semibold">No actionable cases pending.</div>
          ) : actionableApps.map((app) => {
            const eligibility = getEligibleRoute(app.instrumentName);
            const isAssigned = app.status === 'assigned' || app.status === 'in_progress';
            const isCompleted = app.status === 'passed' || app.status === 'failed';

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[#FDF9F6] border border-[#003943]/15 hover:border-[#00959C] transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[#00959C]">{app.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${eligibility.color}`}>
                        Route Rule: {eligibility.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#003943]/10 text-[#003943] text-[10px] font-bold uppercase">
                        {app.applicationType}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#003943]">
                      {app.instrumentName}
                    </h3>

                    <p className="text-xs text-[#003943]/80">
                      Applicant: <span className="font-semibold text-[#003943]">{app.applicantName}</span> • Submitted: {app.submissionDate}
                    </p>

                    <p className="text-xs text-[#003943]/70 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00959C]" /> Location: {app.inspectionLocation}
                    </p>

                    {app.preferredDate && !isAssigned && !isCompleted && (
                      <p className="text-xs text-[#00959C] font-semibold flex items-center gap-1 mt-1">
                        Preferred Date: {app.preferredDate}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                    {isAssigned ? (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold">
                          Assigned to {app.assignedOfficerName || 'Officer'}
                        </span>
                        <p className="text-[11px] text-[#003943]/60 mt-0.5">Date: {app.scheduledInspectionDate || 'Scheduled'}</p>
                      </div>
                    ) : isCompleted ? (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                          {app.status === 'passed' ? 'Passed' : 'Completed'} - {app.assignedOfficerName || 'Officer'}
                        </span>
                        <p className="text-[11px] text-[#003943]/60 mt-0.5">Date: {app.scheduledInspectionDate || 'Completed'}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          if (app.assignedOfficerId) setSelectedOfficerId(app.assignedOfficerId);
                          const initDate = app.scheduledInspectionDate || app.preferredDate || '';
                          setScheduledDate(initDate);
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-[#02B7BF]" />
                        <span>Review & Assign Verifier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. VERIFIER ROSTER & AUTHORIZED CENTRES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-6">
        <div className="pb-3 border-b border-[#003943]/10">
          <h3 className="font-serif font-bold text-xl text-[#003943]">
            Authorized Verifiers Roster (LMO Inspectors & GATCs)
          </h3>
          <p className="text-xs text-[#003943]/70">
            State Government Inspectors & Approved Testing Centres available for field verification.
          </p>
        </div>

        {officers && officers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {officers.map(officer => (
              <div key={officer.id} className="p-4 bg-[#FDF9F6] rounded-2xl border border-[#003943]/10 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00959C] text-white flex items-center justify-center font-bold">
                    {officer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#003943] text-sm">{officer.name}</p>
                    <p className="text-xs text-[#00959C] font-semibold uppercase">{officer.role}</p>
                  </div>
                </div>
                <div className="text-xs text-[#003943]/70 pt-2 border-t border-[#003943]/5">
                  <p>Zone: <span className="font-semibold">{officer.zone || 'Unassigned'}</span></p>
                  <p>Rating: <span className="font-semibold">{officer.rating || 'N/A'}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#FDF9F6] rounded-2xl p-8 border border-[#003943]/15 text-center space-y-2">
            <Users className="w-8 h-8 text-[#00959C] mx-auto" />
            <p className="font-serif font-bold text-[#003943] text-base">No authorized verifiers added yet</p>
            <p className="text-xs text-[#003943]/60 max-w-md mx-auto">
              State Legal Metrology Officers (LMO) and Government Approved Test Centres (GATC) will appear here once onboarded into the registry.
            </p>
          </div>
        )}
      </div>

      {/* 5. REVIEW & ASSIGN VERIFIER MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-transparent flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#003943]/20 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-[#003943]/10 flex items-center justify-between bg-white shrink-0">
              <div>
                <span className="text-[10px] font-extrabold text-[#00959C] uppercase tracking-wider">
                  CASE ASSIGNMENT WORKFLOW
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#003943]">
                  Review & Assign Verifier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#003943] flex items-center justify-center font-bold text-lg transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">

            {/* Full Machine Specifications & Legal Application Record */}
            <div className="p-4 sm:p-5 bg-[#FDF9F6] rounded-2xl border border-[#003943]/15 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#003943]/10 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-[#00959C]">{selectedApp.id}</span>
                  <h4 className="font-serif font-bold text-[#003943] text-sm mt-0.5">{selectedApp.instrumentName}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E0F5F6] text-[#003943] font-bold text-[10px] uppercase">
                  {selectedApp.applicationType}
                </span>
              </div>

              {/* 1. Technical Specifications */}
              <div className="space-y-1.5">
                <p className="font-bold uppercase text-[10px] tracking-wider text-[#00959C]">
                  1. Technical Specifications
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-[#003943]/10">
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Manufacturer</span>
                    <span className="font-semibold text-[#003943]">Avery India Ltd</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Model Designation</span>
                    <span className="font-semibold text-[#003943]">WB-60T-PRO</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Serial Number</span>
                    <span className="font-mono font-bold text-[#00959C]">AV-984210-IN</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Max Capacity</span>
                    <span className="font-semibold text-[#003943]">60,000 kg (60T)</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Min Capacity</span>
                    <span className="font-semibold text-[#003943]">200 kg</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Accuracy Class</span>
                    <span className="font-semibold text-[#003943]">Class III (Medium)</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Scale Interval (e)</span>
                    <span className="font-semibold text-[#003943]">10 kg</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Unit of Measure</span>
                    <span className="font-semibold text-[#003943]">Kilogram (kg)</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Quantity</span>
                    <span className="font-semibold text-[#003943]">1 Unit</span>
                  </div>
                </div>
              </div>

              {/* 2. Premises & Installation Location */}
              <div className="space-y-1.5">
                <p className="font-bold uppercase text-[10px] tracking-wider text-[#00959C]">
                  2. Premises & Installation Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-[#003943]/10">
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Business / Premises</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Installation Address</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.inspectionLocation}</span>
                  </div>
                </div>
              </div>

              {/* 3. Legal Approval & Verification Details */}
              <div className="space-y-1.5">
                <p className="font-bold uppercase text-[10px] tracking-wider text-[#00959C]">
                  3. Legal Approval & Certificate Details
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-[#003943]/10">
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Verification Type</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.applicationType}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Model Approval No</span>
                    <span className="font-mono font-bold text-[#003943]">IND/09/2021/442</span>
                  </div>
                  {selectedApp.applicationType?.toLowerCase().includes('re-verification') && (
                    <div>
                      <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Previous Cert No</span>
                      <span className="font-mono font-bold text-[#003943]">CERT-2025-8891</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verifier Route Eligibility Selection */}
            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Select Verifier Entity Route <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifierType('LMO')}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      verifierType === 'LMO'
                        ? 'border-[#00959C] bg-[#003943] text-white shadow-xs'
                        : 'border-[#003943]/20 bg-[#FDF9F6] text-[#003943]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>LMO Govt Officer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifierType('GATC')}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      verifierType === 'GATC'
                        ? 'border-[#00959C] bg-[#003943] text-white shadow-xs'
                        : 'border-[#003943]/20 bg-[#FDF9F6] text-[#003943]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>GATC Approved Centre</span>
                    <span>GATC Approved Centre ({officers.filter(o => o.officerType === 'GATC').length})</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Select Authorized Inspector / Centre ({verifierType}) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  required
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943]"
                >
                  {officers
                    .filter((off) => (off.officerType || 'LMO') === verifierType)
                    .map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.role} — {off.zone})
                      </option>
                    ))}
                </select>
              </div>

              {selectedApp.preferredDate && (
                <div className="space-y-1.5 mb-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#003943]/70">
                    BUSINESS REQUEST: Preferred Inspection Date
                  </label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 cursor-not-allowed">
                    {selectedApp.preferredDate}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  LMD DECISION: Scheduled Inspection Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943]"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Requested by business. You may adjust the final inspection date.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Inspection Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl p-3 text-xs font-semibold text-[#003943]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-[#003943] font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-6 py-3 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-extrabold text-xs transition-all shadow-md"
                >
                  {assignLoading ? 'Assigning...' : 'Assign Verifier & Schedule'}
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




