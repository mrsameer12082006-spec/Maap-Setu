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
      render: (row) => <span className="font-mono font-bold text-primary text-xs">{row.id}</span>
    },
    {
      header: 'Applicant & Business',
      key: 'applicantName',
      render: (row) => (
        <div>
          <p className="font-semibold text-neutral-900">{row.applicantName}</p>
          <p className="text-[11px] text-neutral-600">Location: {row.inspectionLocation.split(',')[0]}</p>
        </div>
      )
    },
    {
      header: 'Instrument Specs',
      key: 'instrumentName',
      render: (row) => (
        <div>
          <p className="font-semibold text-neutral-900">{row.instrumentName}</p>
          <p className="text-[11px] text-neutral-600">{row.applicationType}</p>
        </div>
      )
    },
    {
      header: 'Submitted',
      key: 'submissionDate',
      render: (row) => <span className="text-xs text-neutral-600">{row.submissionDate}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>
    },
    {
      header: 'Assigned Verifier',
      key: 'assignedOfficerName',
      render: (row) => (
        <span className="text-xs font-medium text-neutral-900">
          {row.assignedOfficerName || <span className="text-neutral-600 italic">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-medium text-neutral-900">
          {row.scheduledInspectionDate || <span className="text-neutral-600 italic">-</span>}
        </span>
      )
    },
    {
      header: 'Actions',
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
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Review Incoming Verification Applications</h1>
        <p className="text-xs text-neutral-600">
          Inspect submitted calibration certificates, model approvals, and owner credentials prior to assigning an inspector.
        </p>
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#003943] text-white shadow-sm'
                  : 'bg-white border border-[#003943]/15 text-[#003943]/80 hover:bg-[#003943]/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by App ID, Instrument, or Applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-input border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="text-xs text-neutral-600 font-medium">
            Showing <span className="font-bold text-neutral-900">{filteredApps.length}</span> of <span className="font-bold text-neutral-900">{applications.length}</span> applications
          </div>
        </div>
      </Card>

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
            <div className="flex justify-between items-center p-4 bg-neutral-100 rounded border border-neutral-300">
              <div>
                <p className="text-xs text-neutral-600">Applicant</p>
                <p className="font-bold text-neutral-900">{selectedApp.applicantName}</p>
              </div>
              <Badge status={selectedApp.status}>{selectedApp.status}</Badge>
            </div>

            {/* Full Machine Specifications & Legal Application Record */}
            <div className="p-4 bg-[#FDF9F6] rounded-2xl border border-[#003943]/15 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#003943]/10 pb-2">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#003943]/10">
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Manufacturer</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.manufacturer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Model Designation</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.model || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Serial Number</span>
                    <span className="font-mono font-bold text-[#00959C]">{selectedApp.instrument?.serialNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Max Capacity</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.maxCapacity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Min Capacity</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.minCapacity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Accuracy Class</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.accuracyClass || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Scale Interval (e)</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.scaleInterval || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Unit of Measure</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.unitOfMeasurement || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Quantity</span>
                    <span className="font-semibold text-[#003943]">{selectedApp.instrument?.quantity || '1 Unit'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Premises & Installation Location */}
              <div className="space-y-1.5">
                <p className="font-bold uppercase text-[10px] tracking-wider text-[#00959C]">
                  2. Premises & Installation Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-[#003943]/10">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#003943]/10">
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

              {/* 4. LMO Field Inspection Result & Technical Report */}
              <div className="space-y-2 pt-2 border-t border-[#003943]/15">
                <div className="flex items-center justify-between">
                  <p className="font-bold uppercase text-[11px] tracking-wider text-[#00959C]">
                    4. LMO Field Inspection Result & Technical Report
                  </p>
                  {selectedApp.status === 'passed' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                      ✓ PASS / STAMPED
                    </span>
                  )}
                  {selectedApp.status === 'failed' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px] uppercase">
                      ✕ FAIL / REJECTED
                    </span>
                  )}
                  {selectedApp.status !== 'passed' && selectedApp.status !== 'failed' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase">
                      ⏳ INSPECTION IN PROGRESS
                    </span>
                  )}
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#003943]/15 space-y-3 text-xs">
                  <div className="flex justify-between items-center bg-[#FDF9F6] p-3 rounded-xl border border-[#003943]/10">
                    <div>
                      <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Assigned Inspection Officer</span>
                      <span className="font-bold text-[#003943] text-sm">
                        {selectedApp.assignedOfficerName || 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Scheduled / Inspection Date</span>
                      <span className="font-mono font-bold text-[#003943]">
                        {selectedApp.scheduledInspectionDate || '28 Aug 2026'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase mb-1">
                      Physical Inspection Checklist (Verified on Site)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Nameplate Checked</div>
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Model Approved</div>
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Capacity Checked</div>
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">✓ Lead Seal Affixed</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase mb-1">
                      Technical Verification & Rule MPE Test Results
                    </span>
                    <DynamicTechnicalVerification
                      instrumentName={selectedApp.instrumentName}
                      applicationType={selectedApp.applicationType}
                      accuracyClass={selectedApp.instrument?.accuracyClass || selectedApp.instrument?.accuracy_class || selectedApp.accuracyClass}
                      scaleInterval={selectedApp.instrument?.scaleInterval || selectedApp.instrument?.scale_interval}
                      maxCapacity={selectedApp.instrument?.maxCapacity}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Officer Remarks & Observations</span>
                    <p className="font-semibold text-[#003943] text-xs mt-1">
                      "{selectedApp.observations || 'All physical inspection criteria passed. Lead seal affixed & QR code digital stamp generated.'}"
                    </p>
                  </div>

                  {selectedApp.status === 'failed' && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 font-bold">
                      ⚠️ Rejection Reason Recorded: {selectedApp.rejectionReason || 'MPE Error Exceeded Rule Limits'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedApp.applicationType?.toLowerCase().includes('re-verification') && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003943]/80 border-b pb-1 mb-2">
                  Attached Document (1)
                </h4>
                <div className="p-3 bg-white rounded-xl border border-[#003943]/15 flex items-center justify-between text-xs shadow-xs">
                  <span className="font-bold text-[#003943] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00959C]" /> Previous_Verification_Certificate_2025.pdf
                  </span>
                  <button
                    type="button"
                    onClick={() => alert('Previewing Previous_Verification_Certificate_2025.pdf')}
                    className="text-xs text-[#00959C] font-bold hover:underline"
                  >
                    Preview File
                  </button>
                </div>
              </div>
            )}

            {/* Officer Verification Result Section */}
            {selectedApp.verification && (
              <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
                selectedApp.verification.outcome === 'PASS' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`font-bold uppercase tracking-wider ${
                  selectedApp.verification.outcome === 'PASS' ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  OFFICER VERIFICATION RESULT
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase">Outcome</span>
                    <span className={`font-extrabold ${
                      selectedApp.verification.outcome === 'PASS' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {selectedApp.verification.outcome}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase">Reason for Failure</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedApp.verification.outcome === 'FAIL' 
                        ? (selectedApp.verification.rejectionReason || 'Not specified')
                        : 'Not applicable'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase">Officer Remarks</span>
                  <span className="font-semibold text-neutral-900">
                    {selectedApp.verification.officerRemarks || 'No remarks provided.'}
                  </span>
                </div>

                {selectedApp.verification.technicalTestResults && Object.keys(selectedApp.verification.technicalTestResults).length > 0 && (
                  <div className="pt-2 border-t border-black/10 mt-2">
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Technical Summary</span>
                    <ul className="space-y-1">
                      {Object.entries(selectedApp.verification.technicalTestResults).map(([key, val]) => (
                        <li key={key} className="flex justify-between font-medium text-neutral-800">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span>{val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedApp.verificationHistory?.length > 1 && (
                  <div className="pt-2 border-t border-black/10 mt-2 space-y-1.5">
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase">Prior Verification Attempts</span>
                    {selectedApp.verificationHistory.slice(1).map((hist, hIdx) => (
                      <div key={hIdx} className="p-2 bg-neutral-50 rounded text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-neutral-700">Attempt #{selectedApp.verificationHistory.length - 1 - hIdx}: </span>
                          <span className={`font-bold ${hist.outcome === 'PASS' ? 'text-emerald-700' : 'text-red-700'}`}>{hist.outcome}</span>
                          {hist.rejectionReason && <span className="text-neutral-500"> — {hist.rejectionReason}</span>}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {hist.createdAt ? new Date(hist.createdAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedApp.notes && (
              <div className="p-3 bg-neutral-100 rounded border border-neutral-300 text-xs">
                <p className="font-semibold text-neutral-900">Applicant Notes:</p>
                <p className="text-neutral-600 mt-0.5">{selectedApp.notes}</p>
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
          <div className="space-y-5 text-[#003943]">
            {/* Header info */}
            <div className="p-3.5 bg-[#FDF9F6] rounded-2xl border border-[#003943]/15 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#00959C]">{assignModalApp.id}</span>
                <Badge status={assignModalApp.status}>{assignModalApp.status}</Badge>
              </div>
              <p className="font-serif font-bold text-[#003943] text-sm">{assignModalApp.instrumentName}</p>
              <p className="text-[#003943]/70 font-medium">Applicant Vendor: {assignModalApp.applicantName}</p>
            </div>

            {/* Currently Assigned Officer Details (Name, Date, Rating) */}
            {assignModalApp.assignedOfficerName ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  ASSIGNED VERIFIER DETAILS
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-[#003943] text-base">{assignModalApp.assignedOfficerName}</h4>
                    <p className="text-xs text-[#00959C] font-semibold">State LMO Officer</p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                    ★ 4.9 Rating
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                  <span className="text-[#003943]/70 font-medium">Scheduled Inspection Date:</span>
                  <span className="font-mono font-bold text-[#003943]">{assignModalApp.scheduledInspectionDate || '28 Aug 2026'}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold">
                ⚠️ No Verifier Assigned Yet — Ready to allocate LMO Inspector below.
              </div>
            )}

            {/* Assign / Change Officer Controls */}
            <div className="space-y-3 pt-2 border-t border-[#003943]/10">
              <p className="text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                {assignModalApp.assignedOfficerName ? 'Reassign / Change Officer' : 'Assign Authorized Officer'}
              </p>

              {/* Route Selector: LMO vs GATC */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#003943]">Verification Authority Route</label>
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
                        ? 'border-[#00959C] bg-[#003943] text-white shadow-xs'
                        : 'border-[#003943]/20 bg-[#FDF9F6] text-[#003943]'
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
                        ? 'border-[#00959C] bg-[#003943] text-white shadow-xs'
                        : 'border-[#003943]/20 bg-[#FDF9F6] text-[#003943]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>GATC Centre ({officers.filter(o => o.officerType === 'GATC').length})</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#003943]">
                  Select Authorized Inspector / Centre ({verifierType})
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003943]"
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#003943]/70">
                    BUSINESS REQUEST: Preferred Inspection Date
                  </label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed">
                    {assignModalApp.preferredDate}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#003943]">
                  LMD DECISION: Scheduled Inspection Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#003943]"
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
          <div className="space-y-5 text-[#003943]">
            <div className="p-3.5 bg-[#FDF9F6] rounded-2xl border border-[#003943]/15 text-xs space-y-1">
              <span className="font-mono font-bold text-[#00959C]">{inspectModalApp.id}</span>
              <p className="font-serif font-bold text-[#003943] text-sm">{inspectModalApp.instrumentName}</p>
              <p className="text-[#003943]/70 font-medium">
                Assigned Inspector: <span className="font-bold text-[#003943]">{inspectModalApp.assignedOfficerName || 'Inspector Rajesh V. Sharma'}</span>
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#003943]/10 space-y-3 text-xs">
              <span className="font-bold text-xs uppercase tracking-wider text-[#00959C] block">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                Officer Remarks & Observations
              </label>
              <textarea
                rows={2}
                value={inspectionRemarks}
                onChange={(e) => setInspectionRemarks(e.target.value)}
                className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl p-3 text-xs font-bold text-[#003943]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#003943]/10">
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






