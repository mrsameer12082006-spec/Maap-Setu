import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, FileCheck, UserCheck, Eye, Check, X, MapPin, FileText, AlertCircle, Award, CheckSquare, ShieldCheck, Building2, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { DynamicTechnicalVerification } from '../../components/verification/DynamicTechnicalVerification';
import { VernierRuler } from '../../components/common/VernierRuler';
import {
  STATUS_CATEGORIES,
  getApplicationStatusCategory,
  calculateLmdDashboardCounts
} from '../../utils/statusClassification';

const STATUS_TABS = [
  { key: 'all', label: 'All Applications' },
  { key: 'new', label: 'New', category: STATUS_CATEGORIES.NEW },
  { key: 'in_progress', label: 'In Progress', category: STATUS_CATEGORIES.IN_PROGRESS },
  { key: 'awaiting_assignment', label: 'Awaiting Assign', category: STATUS_CATEGORIES.AWAITING_ASSIGN },
  { key: 'verification', label: 'Verification', category: STATUS_CATEGORIES.VERIFICATION },
  { key: 'completed', label: 'Completed', category: STATUS_CATEGORIES.COMPLETED }
];

export const ReviewApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { applications, certificates, officers, assignOfficer, submitVerificationResult, generateCertificate } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [assignModalApp, setAssignModalApp] = useState(null);
  const [inspectModalApp, setInspectModalApp] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState(officers[0]?.id || 'OFF-101');
  const [verifierType, setVerifierType] = useState('LMO');
  const [scheduledDate, setScheduledDate] = useState('2026-08-30');
  const [assignLoading, setAssignLoading] = useState(false);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectionOutcome, setInspectionOutcome] = useState('PASS');
  const [failReason, setFailReason] = useState('MPE exceeded');
  const [customOtherReason, setCustomOtherReason] = useState('');
  const [inspectionRemarks, setInspectionRemarks] = useState('Physical field verification completed. All MPE tolerance checks within Rule 11 bounds.');

  // Guarantee the selectedOfficerId snaps to a real UUID when data loads
  useEffect(() => {
    if (officers?.length > 0 && selectedOfficerId === 'OFF-101') {
      setSelectedOfficerId(officers[0].id);
    }
  }, [officers, selectedOfficerId]);

  const activeStatusFilter = (searchParams.get('status') || 'all').toLowerCase();

  const tabCounts = useMemo(() => {
    const counts = calculateLmdDashboardCounts(applications);
    return {
      all: applications.length,
      new: counts[STATUS_CATEGORIES.NEW],
      in_progress: counts[STATUS_CATEGORIES.IN_PROGRESS],
      awaiting_assignment: counts[STATUS_CATEGORIES.AWAITING_ASSIGN],
      verification: counts[STATUS_CATEGORIES.VERIFICATION],
      completed: counts[STATUS_CATEGORIES.COMPLETED]
    };
  }, [applications]);

  const sortedApps = useMemo(() => {
    return [...applications].sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate) || a.id.localeCompare(b.id));
  }, [applications]);

  const filteredApps = useMemo(() => {
    return sortedApps.filter((app) => {
      // 1. Tab / Status filter
      if (activeStatusFilter !== 'all') {
        const appCategory = getApplicationStatusCategory(app);
        const matchingTab = STATUS_TABS.find(t => t.key === activeStatusFilter);
        if (matchingTab && matchingTab.category) {
          if (appCategory !== matchingTab.category) return false;
        } else if (String(app.status).toLowerCase() !== activeStatusFilter) {
          return false;
        }
      }

      // 2. Search query filter
      const search = searchTerm.trim().toLowerCase();
      if (!search) return true;
      return (
        app.id?.toLowerCase().includes(search) ||
        app.applicationNumber?.toLowerCase().includes(search) ||
        app.applicantName?.toLowerCase().includes(search) ||
        app.instrumentName?.toLowerCase().includes(search) ||
        app.applicationType?.toLowerCase().includes(search) ||
        app.assignedOfficerName?.toLowerCase().includes(search)
      );
    });
  }, [sortedApps, activeStatusFilter, searchTerm]);

  const handleGenerateCert = async (appId) => {
    try {
      const cert = await generateCertificate(appId);
      if (cert) {
        alert(`Legal Metrology Certificate ${cert.id} successfully generated & issued!`);
      }
    } catch (err) {
      alert(`Failed to generate certificate: ${err.message}`);
      console.error(err);
    }
  };

  const columns = [
    {
      header: 'App ID',
      key: 'id',
      render: (row) => <span className="font-mono font-semibold text-[#0B315B] text-xs tabular-nums">{row.id}</span>
    },
    {
      header: 'Applicant & Premises',
      key: 'applicantName',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.applicantName}</p>
          <p className="text-[11px] text-slate-500 font-mono">Location: {row.inspectionLocation?.split(',')[0]}</p>
        </div>
      )
    },
    {
      header: 'Instrument Specification',
      key: 'instrumentName',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.instrumentName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.applicationType}</p>
        </div>
      )
    },
    {
      header: 'Submitted',
      key: 'submissionDate',
      render: (row) => <span className="text-xs font-mono text-slate-500 tabular-nums">{row.submissionDate}</span>
    },
    {
      header: 'Legal Status',
      key: 'status',
      render: (row) => <Badge status={row.status} variant="stamp" />
    },
    {
      header: 'Assigned Verifier',
      key: 'assignedOfficerName',
      render: (row) => (
        <span className="text-xs font-medium text-slate-900">
          {row.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          {row.scheduledInspectionDate || <span className="text-slate-400 italic font-sans">—</span>}
        </span>
      )
    },
    {
      header: 'Statutory Actions',
      key: 'action',
      render: (row) => {
        const isPassed = row.status === 'passed' || row.status === 'inspection_passed';

        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Eye} onClick={() => setSelectedApp(row)}>
              Review Docs
            </Button>

            {isPassed ? (
              row.certificateId || row.certificate || certificates?.some(c => c.applicationId === row.id) ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Award}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
                  onClick={() => setSelectedApp(row)}
                >
                  Certificate Issued
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  icon={Award}
                  onClick={() => handleGenerateCert(row.id)}
                >
                  Generate Certificate
                </Button>
              )
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={UserCheck}
                onClick={() => {
                  setAssignModalApp(row);
                  if (row.assignedOfficerId) setSelectedOfficerId(row.assignedOfficerId);
                  
                  // Priority: 1. Scheduled Date 2. Preferred Date 3. Empty
                  const initDate = row.scheduledInspectionDate || row.preferredDate || '';
                  setScheduledDate(initDate);
                }}
              >
                Assigned Officer
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Tactile Instrument Aesthetic */}
      <div className="relative bg-white border border-slate-200 rounded-sm p-6 shadow-none overflow-hidden text-left">
        <div className="h-1 bg-[#C87541] w-full absolute top-0 left-0" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#C87541] block">
              STATUTORY INTAKE QUEUE • SECTION 24(1)
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0B315B] tracking-tight">
              Review Verification Applications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect submitted calibration certificates, model approvals, and owner credentials prior to assigning an inspector.
            </p>
          </div>
          <Badge status="in_progress" variant="stamp" subtext={`${applications.length} TOTAL INTAKE`}>
            LMD AUDIT DESK
          </Badge>
        </div>
        <VernierRuler className="mt-4" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatusFilter === tab.key;
          const count = tabCounts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                if (tab.key === 'all') {
                  searchParams.delete('status');
                  setSearchParams(searchParams);
                } else {
                  setSearchParams({ status: tab.key });
                }
              }}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#0B315B] text-white border-[#0B315B] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label.toUpperCase()}</span>
              <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-mono tabular-nums ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by App ID, Instrument, or Applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-sm border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B]"
            />
          </div>
          <div className="text-xs font-mono text-slate-500">
            SHOWING <span className="font-semibold text-slate-900 tabular-nums">{filteredApps.length}</span> OF <span className="font-semibold text-slate-900 tabular-nums">{applications.length}</span> RECORDS
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredApps}
        emptyMessage={`No ${activeStatusFilter === 'all' ? '' : activeStatusFilter.replace('_', ' ')} applications found.`}
      />

      {/* Review Modal */}
      {selectedApp && (
        <Modal isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Administrative Document Review: ${selectedApp.id}`}
          maxWidth="max-w-5xl"
          footer={
            <div className="flex items-center gap-3">
              {selectedApp.status === 'passed' || selectedApp.status === 'inspection_passed' ? (
                (() => {
                  const cert = certificates?.find(c => c.applicationId === selectedApp.id) || selectedApp.certificate;
                  if (cert) {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          Certificate {cert.certificateNumber || cert.id} Issued
                        </span>
                        <Link to={`/verify/${cert.id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            Public Verify
                          </Button>
                        </Link>
                        <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                          Close
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <Button
                      variant="accent"
                      icon={Award}
                      onClick={() => {
                        handleGenerateCert(selectedApp.id);
                        setSelectedApp(null);
                      }}
                    >
                      Generate Certificate (Retry)
                    </Button>
                  );
                })()
              ) : selectedApp.status === 'failed' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                    ❌ Inspection Failed — Certificate Generation Locked
                  </span>
                  <Button variant="ghost" onClick={() => setSelectedApp(null)}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    onClick={() => {
                      alert(`Application ${selectedApp.id} marked for document clarification.`);
                      setSelectedApp(null);
                    }}
                  >
                    Request Clarification
                  </Button>
                  <Button
                    variant="primary"
                    icon={UserCheck}
                    onClick={() => {
                      const targetApp = selectedApp;
                      setSelectedApp(null);
                      setAssignModalApp(targetApp);
                      if (targetApp.assignedOfficerId) setSelectedOfficerId(targetApp.assignedOfficerId);
                      
                      // Priority: 1. Scheduled Date 2. Preferred Date 3. Empty
                      const initDate = targetApp.scheduledInspectionDate || targetApp.preferredDate || '';
                      setScheduledDate(initDate);
                    }}
                  >
                    Assigned Officer
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-6 text-sm">
            {/* Top Stat Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-sm border border-slate-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">APPLICANT ENTITY</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedApp.applicantName}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedApp.inspectionLocation}</p>
              </div>
              <Badge status={selectedApp.status} variant="stamp" />
            </div>

            {/* Full Machine Specifications & Legal Application Record - Technical Spec Sheet */}
            <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
              <div className="h-1 bg-[#C87541] w-full" />
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#0B315B] bg-slate-200/70 px-2 py-0.5 rounded-xs border border-slate-300">
                    {selectedApp.id}
                  </span>
                  <span className="ml-2 font-semibold text-slate-900 text-xs">
                    {selectedApp.instrumentName}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-xs bg-slate-200/60 text-slate-700 font-mono text-[10px] uppercase border border-slate-300">
                  {selectedApp.applicationType}
                </span>
              </div>

              {/* 1. Technical Specifications Grid */}
              <div className="p-3 bg-slate-50/50 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                1. TECHNICAL SPECIFICATIONS & CALIBRATION METRICS
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-100 border-b border-slate-200 text-xs">
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">MANUFACTURER</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">{selectedApp.instrument?.manufacturer || 'N/A'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">MODEL DESIGNATION</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">{selectedApp.instrument?.model || 'N/A'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">SERIAL NUMBER</dt>
                  <dd className="font-mono font-medium text-[#0B315B] mt-0.5 tabular-nums">{selectedApp.instrument?.serialNumber || 'N/A'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">MAX CAPACITY</dt>
                  <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedApp.instrument?.maxCapacity || 'N/A'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">MIN CAPACITY</dt>
                  <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedApp.instrument?.minCapacity || 'N/A'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">ACCURACY CLASS</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{selectedApp.instrument?.accuracyClass || 'Class III'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">SCALE INTERVAL (e)</dt>
                  <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedApp.instrument?.scaleInterval || 'e = 5 g'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">MEASURE UNIT</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{selectedApp.instrument?.unitOfMeasurement || 'Kilogram (kg)'}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">EQUIPMENT COUNT</dt>
                  <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedApp.instrument?.quantity || '1 Unit'}</dd>
                </div>
              </dl>

              {/* 2. Legal Approval & Verification Details */}
              <div className="p-3 bg-slate-50/50 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                2. STATUTORY APPROVALS & REGULATORY TRACEABILITY
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-100 border-b border-slate-200 text-xs">
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">VERIFICATION TYPE</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{selectedApp.applicationType}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">MODEL APPROVAL NO</dt>
                  <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">IND/09/2021/442</dd>
                </div>
                <div className="p-3">
                  <dt className="text-slate-500 font-mono text-[10px] uppercase">STANDARDS BASIS</dt>
                  <dd className="font-mono text-slate-700 mt-0.5">OIML R76 / LM ACT</dd>
                </div>
              </dl>

              {/* 3. LMO Field Inspection Result & Technical Report */}
              <div className="p-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  3. FIELD INSPECTION AUDIT & TECHNICAL TEST REPORT
                </span>
                <Badge status={selectedApp.status} variant="stamp" />
              </div>

              <div className="p-4 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-sm border border-slate-200 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">ASSIGNED INSPECTION OFFICER</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {selectedApp.assignedOfficerName || 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)'}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase text-slate-500 block">SCHEDULED / INSPECTION DATE</span>
                    <span className="font-medium text-slate-900 mt-0.5 block tabular-nums">
                      {selectedApp.scheduledInspectionDate || '28 Aug 2026'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                    PHYSICAL INSPECTION CHECKLIST (FIELD VERIFIED)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-emerald-50/80 rounded-sm border border-emerald-300 text-emerald-900 text-[11px]">✓ NAMEPLATE CHECKED</div>
                    <div className="p-2.5 bg-emerald-50/80 rounded-sm border border-emerald-300 text-emerald-900 text-[11px]">✓ MODEL APPROVED</div>
                    <div className="p-2.5 bg-emerald-50/80 rounded-sm border border-emerald-300 text-emerald-900 text-[11px]">✓ CAPACITY CONFIRMED</div>
                    <div className="p-2.5 bg-emerald-50/80 rounded-sm border border-emerald-300 text-emerald-900 text-[11px]">✓ LEAD SEAL AFFIXED</div>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                    DYNAMIC TECHNICAL VERIFICATION & MPE TOLERANCE ANALYSIS
                  </span>
                  <DynamicTechnicalVerification
                    instrumentName={selectedApp.instrumentName}
                    applicationType={selectedApp.applicationType}
                    accuracyClass={selectedApp.instrument?.accuracyClass || selectedApp.instrument?.accuracy_class || selectedApp.accuracyClass}
                    scaleInterval={selectedApp.instrument?.scaleInterval || selectedApp.instrument?.scale_interval}
                    maxCapacity={selectedApp.instrument?.maxCapacity}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">OFFICER REMARKS & OBSERVATIONS</span>
                  <p className="text-slate-800 text-xs mt-1 font-mono">
                    "{selectedApp.observations || 'All physical inspection criteria passed. Lead seal affixed & QR code digital stamp generated.'}"
                  </p>
                </div>

                {selectedApp.status === 'failed' && (
                  <div className="p-3 bg-red-50 rounded-sm border border-red-300 text-red-900 font-mono text-xs">
                    ⚠️ STATUTORY REJECTION GROUND: {selectedApp.rejectionReason || 'MPE Error Exceeded Rule Limits'}
                  </div>
                )}
              </div>
            </div>

            {selectedApp.applicationType?.toLowerCase().includes('re-verification') && (
              <div className="border border-slate-200 rounded-sm p-4 bg-slate-50/50">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
                  ATTACHED PREVIOUS CERTIFICATE
                </span>
                <div className="p-3 bg-white rounded-sm border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C87541]" /> Previous_Verification_Certificate_2025.pdf
                  </span>
                  <button
                    type="button"
                    onClick={() => alert('Previewing Previous_Verification_Certificate_2025.pdf')}
                    className="text-xs text-[#0B315B] font-mono hover:underline"
                  >
                    View File
                  </button>
                </div>
              </div>
            )}

            {/* Officer Verification Result Section */}
            {selectedApp.verification && (
              <div className="border border-slate-200 rounded-sm p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    FIELD VERIFICATION AUDIT RECORD
                  </span>
                  <Badge status={selectedApp.verification.outcome} variant="stamp" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase">OFFICIAL DETERMINATION</span>
                    <span className={`font-mono font-bold ${
                      selectedApp.verification.outcome === 'PASS' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {selectedApp.verification.outcome}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500 uppercase">FAILURE REASON</span>
                    <span className="font-medium text-slate-900">
                      {selectedApp.verification.outcome === 'FAIL' 
                        ? (selectedApp.verification.rejectionReason || 'Not specified')
                        : 'None (Compliant)'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">OFFICER OBSERVATIONS</span>
                  <p className="font-mono text-slate-900 mt-0.5">
                    {selectedApp.verification.officerRemarks || 'No remarks recorded.'}
                  </p>
                </div>

                {selectedApp.verificationHistory?.length > 1 && (
                  <div className="pt-2 border-t border-slate-200 mt-2 space-y-1.5 font-mono text-xs">
                    <span className="block text-[10px] text-slate-500 uppercase">PRIOR VERIFICATION AUDIT TRAIL</span>
                    {selectedApp.verificationHistory.slice(1).map((hist, hIdx) => (
                      <div key={hIdx} className="p-2 bg-white border border-slate-200 rounded-xs flex justify-between items-center">
                        <div>
                          <span className="text-slate-600">Attempt #{selectedApp.verificationHistory.length - 1 - hIdx}: </span>
                          <span className={`font-semibold ${hist.outcome === 'PASS' ? 'text-emerald-700' : 'text-red-700'}`}>{hist.outcome}</span>
                          {hist.rejectionReason && <span className="text-slate-500"> — {hist.rejectionReason}</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {hist.createdAt ? new Date(hist.createdAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedApp.notes && (
              <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 text-xs font-mono">
                <span className="text-[10px] uppercase text-slate-500 block">APPLICANT NOTES</span>
                <p className="text-slate-800 mt-0.5">{selectedApp.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Assign Officer Details Modal (On Same Page - No Redirection) */}
      {assignModalApp && (
        <Modal isOpen={!!assignModalApp}
          onClose={() => setAssignModalApp(null)}
          title={`Verifier Assignment: ${assignModalApp.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-[#102A43]">
            {/* Header info */}
            <div className="p-3.5 bg-[#FBF9F5] rounded-2xl border border-[#102A43]/15 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#B85D19]">{assignModalApp.id}</span>
                <Badge status={assignModalApp.status}>{assignModalApp.status}</Badge>
              </div>
              <p className="font-serif font-bold text-[#102A43] text-sm">{assignModalApp.instrumentName}</p>
              <p className="text-[#102A43]/70 font-medium">Applicant Vendor: {assignModalApp.applicantName}</p>
            </div>

            {/* Currently Assigned Officer Details (Name, Date, Rating) */}
            {assignModalApp.assignedOfficerName ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  ASSIGNED VERIFIER DETAILS
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-[#102A43] text-base">{assignModalApp.assignedOfficerName}</h4>
                    <p className="text-xs text-[#B85D19] font-semibold">State LMO Officer</p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                    ★ 4.9 Rating
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                  <span className="text-[#102A43]/70 font-medium">Scheduled Inspection Date:</span>
                  <span className="font-mono font-bold text-[#102A43]">{assignModalApp.scheduledInspectionDate || '28 Aug 2026'}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold">
                ⚠️ No Verifier Assigned Yet — Ready to allocate LMO Inspector below.
              </div>
            )}

            {/* Assign / Change Officer Controls */}
            <div className="space-y-3 pt-2 border-t border-[#102A43]/10">
              <p className="text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                {assignModalApp.assignedOfficerName ? 'Reassign / Change Officer' : 'Assign Authorized Officer'}
              </p>

              {/* Route Selector: LMO vs GATC */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#102A43]">Verification Authority Route</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifierType('LMO');
                      const firstLmo = officers.find((o) => (o.officerType || 'LMO') === 'LMO');
                      if (firstLmo) setSelectedOfficerId(firstLmo.id);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      verifierType === 'LMO'
                        ? 'border-[#B85D19] bg-[#102A43] text-white shadow-xs'
                        : 'border-[#102A43]/20 bg-[#FBF9F5] text-[#102A43]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>LMO Officer ({officers.filter(o => (o.officerType || 'LMO') === 'LMO').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifierType('GATC');
                      const firstGatc = officers.find((o) => o.officerType === 'GATC');
                      if (firstGatc) setSelectedOfficerId(firstGatc.id);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      verifierType === 'GATC'
                        ? 'border-[#B85D19] bg-[#102A43] text-white shadow-xs'
                        : 'border-[#102A43]/20 bg-[#FBF9F5] text-[#102A43]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>GATC Centre ({officers.filter(o => o.officerType === 'GATC').length})</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#102A43]">
                  Select Authorized Inspector / Centre ({verifierType})
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#102A43]"
                >
                  {officers
                    .filter((off) => (off.officerType || 'LMO') === verifierType)
                    .map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.role} — ★ {off.rating})
                      </option>
                    ))}
                </select>
              </div>

              {assignModalApp.preferredDate && (
                <div className="space-y-1 mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#102A43]/70">
                    BUSINESS REQUEST: Preferred Inspection Date
                  </label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed">
                    {assignModalApp.preferredDate}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#102A43]">
                  LMD DECISION: Scheduled Inspection Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#102A43]"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Requested by business. You may adjust the final inspection date.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button variant="ghost" onClick={() => setAssignModalApp(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  loading={assignLoading}
                  onClick={async () => {
                    setAssignLoading(true);
                    await assignOfficer(assignModalApp.id, selectedOfficerId, scheduledDate, 'Assigned in Review Panel');
                    setAssignLoading(false);
                    setAssignModalApp(null);
                  }}
                >
                  Confirm & Save
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Offline Inspection Result Modal */}
      {inspectModalApp && (
        <Modal isOpen={!!inspectModalApp}
          onClose={() => setInspectModalApp(null)}
          title={`Record Offline Inspection Result: ${inspectModalApp.id}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-[#102A43]">
            <div className="p-3.5 bg-[#FBF9F5] rounded-2xl border border-[#102A43]/15 text-xs space-y-1">
              <span className="font-mono font-bold text-[#B85D19]">{inspectModalApp.id}</span>
              <p className="font-serif font-bold text-[#102A43] text-sm">{inspectModalApp.instrumentName}</p>
              <p className="text-[#102A43]/70 font-medium">
                Assigned Inspector: <span className="font-bold text-[#102A43]">{inspectModalApp.assignedOfficerName || 'Inspector Rajesh V. Sharma'}</span>
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#102A43]/10 space-y-3 text-xs">
              <span className="font-bold text-xs uppercase tracking-wider text-[#B85D19] block">
                Offline Physical Test Verification Checklist
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Nameplate Checked</div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Model Approved</div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Max Capacity Check</div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Lead Seal Affixed</div>
              </div>
            </div>

            {/* Dynamic Technical Verification Section */}
            <DynamicTechnicalVerification
              instrumentName={inspectModalApp.instrumentName}
              applicationType={inspectModalApp.applicationType}
              accuracyClass={inspectModalApp.instrument?.accuracyClass || inspectModalApp.instrument?.accuracy_class || inspectModalApp.accuracyClass}
              scaleInterval={inspectModalApp.instrument?.scaleInterval || inspectModalApp.instrument?.scale_interval}
              maxCapacity={inspectModalApp.instrument?.maxCapacity}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                Inspection Outcome <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInspectionOutcome('PASS')}
                  className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                    inspectionOutcome === 'PASS'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  [ PASS / STAMP ]
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionOutcome('FAIL')}
                  className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                    inspectionOutcome === 'FAIL'
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  [ FAIL / REJECT ]
                </button>
              </div>

              {/* Reason for Failure Options */}
              {inspectionOutcome === 'FAIL' && (
                <div className="p-3.5 bg-red-50/90 rounded-2xl border border-red-200 space-y-2.5 animate-in fade-in duration-200 mt-2">
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
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer font-bold transition-all ${
                          failReason === reason
                            ? 'bg-red-700 text-white border-red-800 shadow-xs'
                            : 'bg-white text-red-900 border-red-200 hover:bg-red-100/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reviewFailReason"
                          value={reason}
                          checked={failReason === reason}
                          onChange={(e) => setFailReason(e.target.value)}
                          className="w-3.5 h-3.5 accent-red-700"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {failReason === 'Other' && (
                    <div className="mt-2.5 space-y-1">
                      <label className="block text-[11px] font-bold text-red-900">
                        Specify Custom Reason for Failure <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={customOtherReason}
                        onChange={(e) => setCustomOtherReason(e.target.value)}
                        placeholder="Provide details on why the instrument failed inspection..."
                        className="w-full bg-white border border-red-300 rounded-xl p-2.5 text-xs text-red-900 font-medium placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                Officer Remarks & Observations
              </label>
              <textarea
                rows={2}
                value={inspectionRemarks}
                onChange={(e) => setInspectionRemarks(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl p-3 text-xs font-bold text-[#102A43]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#102A43]/10">
              <Button variant="ghost" onClick={() => setInspectModalApp(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                loading={inspectLoading}
                onClick={async () => {
                  if (inspectionOutcome === 'FAIL') {
                    const reasonToSubmit = failReason === 'Other' ? customOtherReason.trim() : failReason;
                    if (!reasonToSubmit || reasonToSubmit === 'Other') {
                      alert("Please provide the specific explanation for failure when 'Other' is selected.");
                      return;
                    }
                  }
                  setInspectLoading(true);
                  const finalReason = failReason === 'Other' ? customOtherReason.trim() : failReason;
                  const finalObs = inspectionOutcome === 'FAIL'
                    ? `[Rejection Reason: ${finalReason}] ${inspectionRemarks}`
                    : inspectionRemarks;

                  await submitVerificationResult({
                    applicationId: inspectModalApp.id,
                    result: inspectionOutcome,
                    observations: finalObs,
                    evidencePhotos: [],
                    officerName: inspectModalApp.assignedOfficerName || 'Inspector Rajesh V. Sharma'
                  });
                  setInspectLoading(false);
                  setInspectModalApp(null);
                }}
              >
                Submit Inspection Result
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};






