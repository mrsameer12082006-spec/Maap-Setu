import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, Calendar, MapPin, FileText, CheckCircle2, Clock, Award, ExternalLink, Download, QrCode, ShieldCheck, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { CertificateView } from '../../components/common/CertificateView';
import { VernierRuler } from '../../components/common/VernierRuler';

export const MyApplicationsPage = () => {
  const { applications, certificates } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  const myApplications = applications.filter(app => !user || app.applicantId === user.id);
  const sortedApps = [...myApplications].sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate) || a.id.localeCompare(b.id));
  const searchedApps = sortedApps.filter((app) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      app.id?.toLowerCase().includes(search) ||
      app.applicationNumber?.toLowerCase().includes(search) ||
      app.instrumentName?.toLowerCase().includes(search) ||
      app.applicationType?.toLowerCase().includes(search) ||
      app.assignedOfficerName?.toLowerCase().includes(search)
    );
  });

  const filteredApps = searchedApps.filter(app => statusFilter === 'all' || app.status === statusFilter);

  const getStatusCount = (status) => searchedApps.filter(app => status === 'all' ? true : app.status === status).length;

  const columns = [
    {
      header: 'App ID',
      key: 'id',
      render: (row) => <span className="font-mono font-semibold text-[#0B315B] text-xs tabular-nums">{row.id}</span>
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
      header: 'Submitted Date',
      key: 'submissionDate',
      render: (row) => <span className="text-xs font-mono text-slate-500 tabular-nums">{row.submissionDate}</span>
    },
    {
      header: 'Assigned Verifier',
      key: 'assignedOfficerName',
      render: (row) => (
        <span className="text-xs font-medium text-slate-800">
          {row.assignedOfficerName || <span className="text-slate-400 italic font-mono">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-mono text-slate-800 tabular-nums">
          {row.scheduledInspectionDate || <span className="text-slate-400 italic font-sans">—</span>}
        </span>
      )
    },
    {
      header: 'Legal Status',
      key: 'status',
      render: (row) => {
        const cert = certificates?.find(c => c.applicationId === row.id || c.instrumentId === row.instrumentId) || row.certificate;
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge status={row.status} variant="stamp" />
            {cert && (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded-xs">
                <Award className="w-3 h-3 text-emerald-600" /> CERT ISSUED
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Statutory Actions',
      key: 'action',
      render: (row) => {
        const cert = certificates?.find(c => c.applicationId === row.id || c.instrumentId === row.instrumentId) || row.certificate;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={() => setSelectedApp(row)}
            >
              Details
            </Button>
            {cert && (
              <Button
                variant="outline"
                size="sm"
                icon={Award}
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
                onClick={() => setSelectedCert(cert)}
              >
                Certificate
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Tactile Instrument Aesthetic */}
      <div className="relative bg-white border border-slate-200 rounded-sm p-6 shadow-none overflow-hidden text-left">
        <div className="h-1 bg-[#C87541] w-full absolute top-0 left-0" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#C87541] block">
              ENTERPRISE TRACKING CONSOLE • SECTION 24(1)
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0B315B] tracking-tight">
              My Verification Applications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track and monitor all verification and re-verification requests submitted to Legal Metrology.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge status="in_progress" variant="stamp" subtext={`${filteredApps.length} ACTIVE APPLICATIONS`}>
              PORTAL INTAKE
            </Badge>
            <Link to="/business">
              <Button variant="secondary" size="sm" icon={ArrowLeft} className="font-mono text-xs">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <VernierRuler className="mt-4" />
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Application ID or Instrument..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-sm border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-mono text-slate-600 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-sm border border-slate-300 text-xs py-1.5 px-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] font-mono"
            >
              <option value="all">ALL ({getStatusCount('all')})</option>
              <option value="submitted">SUBMITTED ({getStatusCount('submitted')})</option>
              <option value="assigned">ASSIGNED ({getStatusCount('assigned')})</option>
              <option value="in_progress">IN PROGRESS ({getStatusCount('in_progress')})</option>
              <option value="passed">PASSED ({getStatusCount('passed')})</option>
              <option value="failed">FAILED ({getStatusCount('failed')})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <Table columns={columns} data={filteredApps} emptyMessage="No applications found matching criteria." />

      {/* Application Detail Modal */}
      {selectedApp && (
        <Modal maxWidth="max-w-4xl" isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Details: ${selectedApp.id}`}
          footer={
            <Button variant="secondary" onClick={() => setSelectedApp(null)}>
              Close View
            </Button>
          }
        >
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 bg-neutral-100 rounded-lg border border-neutral-300">
              <div>
                <p className="text-xs text-neutral-600 font-medium">Status</p>
                <Badge status={selectedApp.status}>{selectedApp.status}</Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-600">Submitted On</p>
                <p className="font-semibold text-neutral-900">{selectedApp.submissionDate}</p>
              </div>
            </div>

            {/* Instrument Info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-2">
                Instrument & Verification Scope
              </h4>
              <p className="font-bold text-neutral-900 text-base">{selectedApp.instrumentName}</p>
              <p className="text-xs text-neutral-600 mt-0.5">Type: {selectedApp.applicationType}</p>
              <p className="text-xs text-neutral-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{selectedApp.inspectionLocation}</span>
              </p>
            </div>

            {/* Assigned Officer */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-2">
                Assigned Legal Metrology Verifier
              </h4>
              {selectedApp.assignedOfficerName ? (
                <div className="p-3 bg-primary-light/40 border border-primary/20 rounded-md text-xs">
                  <p className="font-bold text-neutral-900">{selectedApp.assignedOfficerName}</p>
                  <p className="text-neutral-600 mt-0.5">
                    Scheduled Inspection Date:{' '}
                    <span className="font-semibold text-neutral-900">{selectedApp.scheduledInspectionDate || 'TBD'}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-600 italic">
                  Currently under LMD administrative queue. Officer will be assigned shortly.
                </p>
              )}
            </div>

            {/* Verification Result Section */}
            {selectedApp.verification && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                selectedApp.verification.outcome === 'PASS' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`font-bold uppercase tracking-wider ${
                  selectedApp.verification.outcome === 'PASS' ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {selectedApp.verification.outcome === 'PASS' ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
                </p>

                {selectedApp.verification.outcome === 'FAIL' && (
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase">Reason for Failure</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedApp.verification.rejectionReason || 'Not specified'}
                    </span>
                  </div>
                )}

                <div>
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase">Officer Remarks</span>
                  <span className="font-semibold text-neutral-900">
                    {selectedApp.verification.officerRemarks || 'No remarks provided.'}
                  </span>
                </div>

                {selectedApp.verificationHistory?.length > 1 && (
                  <div className="pt-2 border-t border-black/10 mt-2 space-y-1">
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase">Prior Verification Attempts</span>
                    {selectedApp.verificationHistory.slice(1).map((hist, hIdx) => (
                      <div key={hIdx} className="p-2 bg-white/70 rounded text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-bold">Attempt #{selectedApp.verificationHistory.length - 1 - hIdx}: </span>
                          <span className={`font-bold ${hist.outcome === 'PASS' ? 'text-emerald-700' : 'text-red-700'}`}>{hist.outcome}</span>
                          {hist.rejectionReason && <span className="text-neutral-600"> — {hist.rejectionReason}</span>}
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

            {/* Official Digital Certificate Card */}
            {(() => {
              const selectedCertForApp = certificates?.find(c => c.applicationId === selectedApp.id) || selectedApp.certificate;
              if (selectedCertForApp) {
                return (
                  <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-700" />
                        <div>
                          <p className="font-bold text-emerald-950 text-sm">Official Legal Metrology Certificate Issued</p>
                          <p className="text-[11px] text-emerald-800">Generated automatically upon physical verification pass.</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-emerald-900 bg-white border border-emerald-300 px-3 py-1 rounded-md shadow-2xs self-start sm:self-auto">
                        {selectedCertForApp.certificateNumber || selectedCertForApp.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/80 p-3 rounded-lg border border-emerald-200">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Issued On</span>
                        <span className="font-semibold text-neutral-900">{selectedCertForApp.verificationDate || selectedCertForApp.issuedAt?.split('T')[0] || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Valid Until</span>
                        <span className="font-bold text-emerald-700">{selectedCertForApp.expiryDate || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Seal Number</span>
                        <span className="font-mono font-semibold text-neutral-900">{selectedCertForApp.sealNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-neutral-500">Authorized Officer</span>
                        <span className="font-medium text-neutral-900 truncate block">{selectedCertForApp.verificationOfficer || 'Assigned Officer'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedCert(selectedCertForApp)}
                        >
                          View / Print Certificate
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Download}
                          onClick={() => alert(`Downloading official digital certificate PDF: ${selectedCertForApp.certificateNumber || selectedCertForApp.id}`)}
                        >
                          Download PDF
                        </Button>
                      </div>
                      <Link to={`/verify/${selectedCertForApp.id}`} target="_blank">
                        <Button variant="ghost" size="sm" icon={ExternalLink} className="text-emerald-800 hover:text-emerald-950">
                          Public QR Verification
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              }

              if (selectedApp.status === 'passed') {
                const isInspection =
                  selectedApp.applicationType?.toLowerCase().includes('in-service') ||
                  selectedApp.applicationType?.toLowerCase().includes('in_service') ||
                  selectedApp.applicationType?.toLowerCase().includes('surveillance') ||
                  selectedApp.verification?.technicalTestResults?.verificationStage === 'IN_SERVICE_INSPECTION';

                if (isInspection) {
                  return (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-950">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">In-Service Inspection Passed</p>
                        <p className="text-emerald-800 text-[11px]">
                          Official in-service surveillance inspection completed and verified compliant under Legal Metrology Act, 2009. (Verification certificates are not issued for surveillance inspections).
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold">Verification Passed</p>
                      <p className="text-blue-700 text-[11px]">Official digital certificate is currently being finalized by the system.</p>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-3">
                Workflow Progress History
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-primary/30 ml-2">
                {selectedApp.timeline.map((step, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[19px] top-1 border-2 border-white" />
                    <p className="text-xs font-semibold text-neutral-900">{step.step}</p>
                    <p className="text-[10px] text-neutral-600">
                      {step.date} • by {step.actor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-2">
                Attached Documents ({selectedApp.documents.length})
              </h4>
              <div className="space-y-2">
                {selectedApp.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-neutral-100 rounded border border-neutral-300 text-xs">
                    <span className="font-medium text-neutral-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> {doc.name}
                    </span>
                    <span className="text-[10px] text-neutral-600">{doc.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Standalone Certificate Viewer Modal */}
      {selectedCert && (
        <Modal
          maxWidth="max-w-4xl"
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title={`Legal Metrology Verification Certificate: ${selectedCert.certificateNumber || selectedCert.id}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Link to={`/verify/${selectedCert.id}`} target="_blank">
                <Button variant="ghost" size="sm" icon={ExternalLink}>
                  Public QR Verification
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setSelectedCert(null)}>
                Close Viewer
              </Button>
            </div>
          }
        >
          <CertificateView certificate={selectedCert} />
        </Modal>
      )}
    </div>
  );
};






