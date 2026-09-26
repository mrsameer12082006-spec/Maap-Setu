import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Wrench,
  MapPin,
  Calendar,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  Camera,
  ChevronRight,
  Award,
  AlertTriangle,
  Paperclip,
  ExternalLink,
  Copy,
  Check,
  X,
  Maximize2,
  Eye,
  Scale
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Badge } from '../../components/common/Badge';

// ─── Helper: Section wrapper ──────────────────────────────────────
const Section = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden relative ${className}`}>
    <div className="h-0.5 bg-[#C87541] w-full"></div>
    <div className="flex items-center gap-2.5 px-5 py-3 bg-slate-50/70 border-b border-slate-200">
      {Icon && <Icon className="w-4 h-4 text-[#C87541] shrink-0" />}
      <h3 className="font-semibold text-[#0B315B] text-xs uppercase tracking-wider font-mono">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Helper: Label-Value pair ─────────────────────────────────────
const Field = ({ label, value, mono = false, className = '' }) => (
  <div className={className}>
    <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold tracking-wider block mb-0.5">{label}</span>
    <span className={`text-sm font-medium text-slate-900 ${mono ? 'font-mono tabular-nums' : ''}`}>
      {value || <span className="text-slate-400 italic">—</span>}
    </span>
  </div>
);

// ─── Timeline event row ───────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
  const iconMap = {
    SUBMISSION: { icon: FileText, color: 'bg-blue-50 text-[#0B315B] border border-blue-200' },
    ASSIGNMENT: { icon: UserCheck, color: 'bg-amber-50 text-amber-800 border border-amber-200' },
    VERIFICATION: { icon: ClipboardList, color: 'bg-emerald-50 text-emerald-800 border border-emerald-200' },
    CERTIFICATE_GENERATE: { icon: Award, color: 'bg-purple-50 text-purple-800 border border-purple-200' },
  };
  const { icon: Ico, color } = iconMap[event.eventType] || { icon: Clock, color: 'bg-slate-100 text-slate-700 border border-slate-200' };
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${color}`}>
          <Ico className="w-4 h-4" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
      </div>
      <div className={`pb-5 ${isLast ? '' : ''}`}>
        <p className="font-semibold text-slate-900 text-xs sm:text-sm tracking-tight">{event.step}</p>
        <p className="text-xs text-slate-500 mt-0.5">{event.message}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
          {event.actorRole?.toUpperCase()} · {new Date(event.createdAt).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

// ─── Main CaseRecordPage ──────────────────────────────────────────
export const CaseRecordPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { applications, getApplicationTimeline, getEvidenceSignedUrl } = useData();

  const app = applications.find(a => a.id === appId);

  const [timeline, setTimeline] = useState([]);
  const [evidenceUrls, setEvidenceUrls] = useState({});
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [expandedHistoryPhotos, setExpandedHistoryPhotos] = useState({});

  useEffect(() => {
    if (!appId) return;
    setLoadingTimeline(true);
    getApplicationTimeline(appId).then(t => {
      setTimeline(t);
      setLoadingTimeline(false);
    }).catch(() => setLoadingTimeline(false));
  }, [appId]);

  // Helper: Resolve signed URLs for stored evidence paths (memoized/cached in evidenceUrls)
  const resolveEvidencePaths = async (paths) => {
    if (!paths || !paths.length) return;
    const missing = paths.filter(p => p && !p.startsWith('http') && !evidenceUrls[p]);
    if (!missing.length) return;
    const resolved = await Promise.all(
      missing.map(async p => ({ path: p, url: await getEvidenceSignedUrl(p) }))
    );
    setEvidenceUrls(prev => {
      const next = { ...prev };
      resolved.forEach(r => { if (r.url) next[r.path] = r.url; });
      return next;
    });
  };

  // Generate signed URLs for latest verification evidence on load
  useEffect(() => {
    const paths = app?.verification?.photoEvidenceUrls;
    if (paths && paths.length) {
      resolveEvidencePaths(paths);
    }
  }, [app?.verification?.photoEvidenceUrls]);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <FileText className="w-12 h-12 text-[#102A43]/20" />
        <p className="text-[#102A43]/60 font-semibold">Application not found.</p>
        <Link to="/officer/queue" className="text-xs text-[#B85D19] font-bold hover:underline">← Return to Queue</Link>
      </div>
    );
  }

  const isCompleted = app.status === 'passed' || app.status === 'failed';
  const isPassed = app.status === 'passed';
  const hasPendingVerification = ['assigned', 'in_progress'].includes(app.status);
  const vr = app.verification;
  const history = app.verificationHistory || [];

  return (
    <div className="w-full space-y-6 pb-16 text-slate-800">
      {/* ── Back nav ── */}
      <div>
        <Link to="/officer/queue" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B315B] hover:text-[#C87541] transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Queue
        </Link>

        {/* ── Case Header Card ── */}
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="h-1 bg-[#C87541] absolute top-0 left-0 right-0"></div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="border border-slate-300 bg-slate-50 px-2 py-0.5 rounded-xs">
                <span className="font-mono text-xs font-bold text-[#0B315B] tabular-nums">
                  {app.applicationNumber || app.id}
                </span>
              </div>
              <Badge status={app.status}>{app.status?.replace('_', ' ')}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B315B] tracking-tight">
              {app.instrument?.name || app.instrumentName}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {app.applicationType} · Submitted {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasPendingVerification && (
              <button
                onClick={() => navigate(`/officer/verify/new?appId=${app.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white text-xs font-semibold border border-[#0B315B] transition-colors shadow-2xs"
              >
                <ClipboardList className="w-4 h-4 text-[#C87541]" />
                Start Physical Verification
              </button>
            )}
            {app.status === 'failed' && (
              <button
                onClick={() => navigate(`/officer/verify/new?appId=${app.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white text-xs font-semibold border border-[#0B315B] transition-colors shadow-2xs"
              >
                <ClipboardList className="w-4 h-4 text-[#C87541]" />
                Start Re-Verification
              </button>
            )}
            {isCompleted && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider border ${isPassed ? 'border-emerald-600/40 bg-emerald-50 text-emerald-800' : 'border-red-600/40 bg-red-50 text-red-800'}`}>
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Verification {isPassed ? 'Passed' : 'Failed'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* APPLICATION DETAILS */}
        <Section icon={FileText} title="Application Details">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Application Number" value={app.applicationNumber} mono />
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold tracking-wider block mb-0.5">Application ID</span>
              <div className="flex items-center gap-1.5" title={app.id}>
                <span className="text-sm font-mono font-medium text-slate-900">
                  {app.id?.slice(0, 13)}…
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(app.id);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-sm text-[#C87541] transition-colors"
                  title="Copy full Application UUID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <Field label="Application Type" value={app.applicationType} />
            <Field label="Status" value={app.status?.replace('_', ' ')} />
            <Field label="Submission Date" value={app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('en-IN') : null} />
            <Field label="Preferred Inspection Date" value={app.preferredDate ? new Date(app.preferredDate).toLocaleDateString('en-IN') : null} />
          </div>
        </Section>

        {/* APPLICANT / BUSINESS */}
        <Section icon={User} title="Applicant / Business">
          <div className="grid grid-cols-1 gap-y-4">
            <Field label="Business / Applicant Name" value={app.applicantName} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" value={app.applicant?.email} />
              <Field label="Phone" value={app.applicant?.phone} />
            </div>
          </div>
        </Section>

        {/* INSTRUMENT SPECIFICATIONS */}
        <Section icon={Wrench} title="Instrument Specifications">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Instrument Type" value={app.instrument?.name || app.instrumentName} />
            <Field label="Manufacturer" value={app.instrument?.manufacturer} />
            <Field label="Model Number" value={app.instrument?.model} mono />
            <Field label="Serial Number" value={app.instrument?.serialNumber} mono />
            <Field label="Max Capacity" value={app.instrument?.maxCapacity ? `${app.instrument.maxCapacity} ${app.instrument.unitOfMeasurement || ''}` : null} />
            <Field label="Min Capacity" value={app.instrument?.minCapacity ? `${app.instrument.minCapacity} ${app.instrument.unitOfMeasurement || ''}` : '0'} />
            <Field label="Accuracy Class" value={app.instrument?.accuracyClass} />
            <Field label="Scale Interval (e)" value={app.instrument?.scaleInterval} />
            <Field label="Model Approval No." value={app.instrument?.modelApprovalNo} mono />
            <Field label="Quantity" value={app.instrument?.quantity?.toString()} />
          </div>
        </Section>

        {/* PREMISES & SITE */}
        <Section icon={MapPin} title="Premises & Site Information">
          <div className="grid grid-cols-1 gap-y-4">
            <Field label="Premises Name" value={app.instrument?.premisesName} />
            <Field label="Installation / Inspection Address" value={app.inspectionLocation} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="State" value={app.instrument?.state} />
              <Field label="District" value={app.instrument?.district} />
            </div>
          </div>
        </Section>

        {/* ASSIGNMENT & SCHEDULE */}
        <Section icon={Calendar} title="Assignment & Inspection Schedule">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Assigned Verifier" value={app.assignedOfficerName} />
            <Field
              label="Actual Verification Date"
              value={vr?.createdAt ? new Date(vr.createdAt).toLocaleDateString('en-IN') : 'Pending Inspection'}
            />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold tracking-wider block mb-0.5">
                Business Preferred Date
              </span>
              <span className="text-sm font-semibold text-slate-900 font-mono">
                {app.preferredDate ? new Date(app.preferredDate).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold tracking-wider block mb-0.5">
                LMD Scheduled Date
              </span>
              <span className="text-sm font-bold text-[#C87541] font-mono">
                {app.scheduledInspectionDate ? new Date(app.scheduledInspectionDate).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
          </div>
          {app.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-sm border border-slate-200 text-xs text-slate-600 italic">
              {app.notes}
            </div>
          )}
        </Section>

        {/* SUPPORTING DOCUMENTS */}
        <Section icon={Paperclip} title={`Supporting Documents (${app.documents?.length || 0})`}>
          {app.documents?.length > 0 ? (
            <div className="space-y-2">
              {app.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-sm border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C87541] shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{doc.name || doc.filename || `Document ${i + 1}`}</span>
                    {doc.category && <span className="text-slate-400 font-mono text-[10px]">({doc.category})</span>}
                  </div>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#C87541] font-semibold hover:underline shrink-0 ml-2">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No documents attached to this application.</p>
          )}
        </Section>
      </div>

      {/* ── INSPECTION REPORT (only if completed) ── */}
      {isCompleted && vr && (
        <div className="space-y-5">
          {/* Outcome banner */}
          <div className={`rounded-sm p-5 border flex items-center gap-4 relative overflow-hidden ${isPassed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-red-50/70 border-red-300'}`}>
            <div className={`h-1 absolute top-0 left-0 right-0 ${isPassed ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
            <div className={`w-11 h-11 rounded-sm border flex items-center justify-center shrink-0 ${isPassed ? 'bg-emerald-100/80 border-emerald-300' : 'bg-red-100/80 border-red-300'}`}>
              {isPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-700" /> : <XCircle className="w-6 h-6 text-red-700" />}
            </div>
            <div>
              <p className={`text-base font-mono font-bold uppercase tracking-wider ${isPassed ? 'text-emerald-900' : 'text-red-900'}`}>
                Statutory Verification {isPassed ? '[ PASSED / CERTIFIED ]' : '[ FAILED / REJECT NOTICE ]'}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Completed: {vr.createdAt ? new Date(vr.createdAt).toLocaleString('en-IN') : '—'}
                {app.assignedOfficerName && ` · Inspector: ${app.assignedOfficerName}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Physical Checklist (6 Canonical Criteria) */}
            {vr.checklistResults && Object.keys(vr.checklistResults).length > 0 && (
              <Section icon={ClipboardList} title="Physical Inspection Checklist">
                <div className="space-y-2">
                  {Object.entries(vr.checklistResults)
                    .filter(([key]) => [
                      'nameplateChecked',
                      'modelChecked',
                      'capacityChecked',
                      'accuracyClassChecked',
                      'markingsChecked',
                      'sealConditionChecked'
                    ].includes(key) || !['sealIntact', 'mpeCheck', 'zeroLoadTest'].includes(key))
                    .map(([key, val]) => {
                      const labels = {
                        nameplateChecked: 'Nameplate / Identification Verified',
                        modelChecked: 'Manufacturer & Model Verified',
                        capacityChecked: 'Capacity Parameters Verified',
                        accuracyClassChecked: 'Accuracy Class Verified',
                        markingsChecked: 'Required Statutory Markings Present',
                        sealConditionChecked: 'Seal Condition Acceptable',
                      };
                      const passed = val === true || val === 'YES' || val === 'PASSED' || val === 'NEW';
                      return (
                        <div key={key} className="flex items-center gap-3 p-2.5 rounded-sm bg-slate-50/70 border border-slate-200">
                          <div className={`w-5 h-5 rounded-xs flex items-center justify-center shrink-0 border ${passed ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                            {passed
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              : <XCircle className="w-3.5 h-3.5 text-red-700" />
                            }
                          </div>
                          <span className="text-xs font-medium text-slate-800">{labels[key] || key}</span>
                          <span className={`ml-auto text-[10px] font-mono font-bold uppercase ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
                            {typeof val === 'boolean' ? (val ? 'Pass' : 'Fail') : val}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </Section>
            )}

            {/* Technical Observations & MPE */}
            {vr.technicalTestResults && Object.keys(vr.technicalTestResults).length > 0 && (
              <Section icon={Wrench} title="Technical Observations & MPE">
                <div className="space-y-2.5">
                  {Object.entries(vr.technicalTestResults)
                    .filter(([key]) => ![
                      'accuracyClass',
                      'verificationStage',
                      'verificationStageLabel',
                      'verificationScaleInterval',
                      'testedLoad',
                      'testedLoadInE',
                      'bracket',
                      'mpeBracket',
                      'baseMpeMultiplier',
                      'stageMultiplier',
                      'effectiveMpeMultiplier',
                      'mpeMultiplier',
                      'mpeLimit',
                      'observedError',
                      'mpeCompliance',
                      'mpeExplanation',
                      'mpeRuleReference'
                    ].includes(key))
                    .map(([key, val]) => {
                      const labels = {
                        observedErrorMargin: 'Observed Error Margin / Test Weights',
                        sealIntact: 'Visual Lead Seal Intactness',
                        mpeCheck: 'MPE Error Test Outcome',
                        zeroLoadTest: 'Zero Load Repeatability Test',
                        counterMpe: 'Counter Scale MPE Compliance',
                        counterZero: 'Zero Error Test Reading',
                        counterHalf: 'Half Capacity Test Reading',
                        counterMax: 'Max Capacity Eccentricity Reading',
                        wbZero: 'Zero Tracking Test Reading',
                        wbHalf: 'Eccentricity (Half Load) Reading',
                        wbMax: 'Maximum Load MPE Reading',
                        wbMpe: 'Weighbridge MPE Compliance',
                        zeroLoadReading: 'Zero Load Reading',
                        halfLoadReading: 'Half Load Reading',
                        maxLoadReading: 'Max Load Reading',
                        mpeResult: 'MPE Result',
                        flowRate: 'Flow Rate Observed',
                        referenceVolume: 'Reference Standard Volume',
                        measuredVolume: 'Meter Measured Volume',
                        flowmeterMpe: 'Flowmeter MPE Compliance',
                        fuelProduct: 'Fuel Product Dispensed',
                        nozzleId: 'Nozzle Identification ID',
                        fuelZeroReset: 'Zero Reset Verification',
                        dispensedVolume: 'Dispensed Volume Measured',
                        fuelMpeResult: 'Fuel Dispenser MPE Compliance',
                        sample1: 'Package Sample 1 Net Mass',
                        sample2: 'Package Sample 2 Net Mass',
                        sample3: 'Package Sample 3 Net Mass',
                        calculatedAverage: 'Calculated Average Net Weight',
                        obsMass: 'Observed Standard Mass',
                        labMpe: 'Analytical Sensitivity & MPE'
                      };
                      return (
                        <div key={key} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-b-0">
                          <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold tracking-wider">
                            {labels[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-xs font-mono font-medium text-slate-900 text-right tabular-nums">
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}

                  {/* Explainable Regulatory MPE Derivation Audit Card */}
                  {vr.technicalTestResults.verificationScaleInterval && (
                    <div className="mt-3 p-3.5 bg-slate-50 rounded-sm border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#C87541]" />
                          <span className="text-[10px] uppercase font-mono font-bold text-[#0B315B] tracking-wider">
                            Regulatory MPE Calculation & Derivation Audit
                          </span>
                          {vr.technicalTestResults.verificationStage && (
                            <span className="border border-slate-300 bg-white px-2 py-0.5 rounded-xs text-slate-700 text-[9px] font-mono font-semibold uppercase">
                              {vr.technicalTestResults.verificationStageLabel || vr.technicalTestResults.verificationStage}
                              {vr.technicalTestResults.stageMultiplier ? ` (${vr.technicalTestResults.stageMultiplier}x MPE)` : ''}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">
                          {vr.technicalTestResults.mpeRuleReference || 'OIML R76-1 / LM Rules 2011'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Scale Interval (e)</span>
                          <span className="font-mono font-medium text-slate-900 tabular-nums">
                            {vr.technicalTestResults.verificationScaleInterval}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Tested Load (m)</span>
                          <span className="font-mono font-medium text-slate-900 tabular-nums">
                            {vr.technicalTestResults.testedLoad || '—'}
                            {vr.technicalTestResults.testedLoadInE && ` (${vr.technicalTestResults.testedLoadInE.toLocaleString()} e)`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Regulatory Limit</span>
                          <span className="font-mono font-semibold text-[#C87541] tabular-nums">
                            {vr.technicalTestResults.mpeLimit || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Observed Error</span>
                          <span className="font-mono font-medium text-slate-900 tabular-nums">
                            {vr.technicalTestResults.observedError || '—'}
                          </span>
                        </div>
                      </div>
                      {vr.technicalTestResults.mpeExplanation && (
                        <p className="text-[11px] font-mono text-slate-500 border-t border-slate-200 pt-1.5">
                          {vr.technicalTestResults.mpeExplanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>

          {/* DEDICATED PHOTO EVIDENCE SECTION */}
          <Section icon={Camera} title={`Photo Evidence (${(vr.photoEvidenceUrls || []).length} photo${(vr.photoEvidenceUrls || []).length === 1 ? '' : 's'})`}>
            {vr.photoEvidenceUrls && vr.photoEvidenceUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {vr.photoEvidenceUrls.map((p, i) => {
                  const displayUrl = evidenceUrls[p] || (p.startsWith('http') ? p : null);
                  const fileName = p.split('/').pop();
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => displayUrl && setLightboxPhoto({ url: displayUrl, name: fileName })}
                      className="group relative rounded-sm overflow-hidden border border-slate-300 bg-slate-50 aspect-square flex items-center justify-center hover:border-[#C87541] transition-all focus:outline-none focus:ring-1 focus:ring-[#C87541]"
                    >
                      {displayUrl ? (
                        <>
                          <img src={displayUrl} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-left">
                            <p className="text-[10px] text-white font-mono truncate">{fileName}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-3 text-center">
                          <Camera className="w-6 h-6 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-mono break-all">{fileName}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50/60 rounded-sm border border-slate-200 text-center text-xs text-slate-500 font-mono">
                No physical photo evidence attached to this verification docket.
              </div>
            )}
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Officer Remarks */}
            <Section icon={User} title="Officer Remarks">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {vr.officerRemarks || <span className="text-slate-400 italic">No remarks recorded.</span>}
              </p>
            </Section>

            {/* Failure Reason or Stamp Decision */}
            {!isPassed && vr.rejectionReason ? (
              <Section icon={AlertTriangle} title="Failure Reason">
                <div className="p-3 bg-red-50/80 rounded-sm border border-red-200">
                  <p className="text-xs text-red-900 font-medium leading-relaxed font-mono">
                    {vr.rejectionReason}
                  </p>
                </div>
              </Section>
            ) : (
              <Section icon={CheckCircle2} title="Stamping & Seal Decision">
                <div className="p-3 bg-emerald-50/80 rounded-sm border border-emerald-200 text-xs text-emerald-900 font-medium leading-relaxed">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-800 block mb-0.5 font-semibold">Statutory Compliant</span>
                  Instrument verified compliant under Legal Metrology Rules, 2011. Verification mark and security seal applied.
                </div>
              </Section>
            )}
          </div>
        </div>
      )}

      {/* ── VERIFICATION & INSPECTION HISTORY ── */}
      {history.length > 0 && (
        <Section icon={ClipboardList} title={`Verification & Inspection History (${history.length} Attempt${history.length > 1 ? 's' : ''})`}>
          <div className="space-y-3">
            {history.map((attempt, idx) => {
              const attemptNumber = history.length - idx;
              const isAttemptPassed = attempt.outcome === 'PASS';
              const isLatest = idx === 0;

              return (
                <div
                  key={attempt.id || idx}
                  className={`p-4 rounded-sm border transition-all ${
                    isLatest
                      ? 'bg-amber-50/30 border-[#C87541]/40'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0B315B] text-sm">
                        Attempt #{attemptNumber}
                      </span>
                      {isLatest && (
                        <span className="text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded-xs bg-[#C87541] text-white tracking-wider">
                          Latest Attempt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString('en-IN') : '—'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase font-semibold tracking-wider border ${
                        isAttemptPassed 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-600/40' 
                          : 'bg-red-50 text-red-800 border-red-600/40'
                      }`}>
                        {attempt.outcome}
                      </span>
                    </div>
                  </div>

                  {!isAttemptPassed && attempt.rejectionReason && (
                    <div className="mb-2 p-2.5 bg-red-50/80 rounded-sm border border-red-200">
                      <span className="text-[10px] uppercase font-mono font-semibold text-red-700 block">Failure Reason</span>
                      <p className="text-xs text-red-900 font-mono mt-0.5">{attempt.rejectionReason}</p>
                    </div>
                  )}

                  {attempt.officerRemarks && (
                    <div className="text-xs text-slate-700">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Officer Remarks</span>
                      <p className="mt-0.5 italic">{attempt.officerRemarks}</p>
                    </div>
                  )}

                  {attempt.photoEvidenceUrls && attempt.photoEvidenceUrls.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-[#C87541] font-mono font-medium flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{attempt.photoEvidenceUrls.length} evidence photo(s) recorded</span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const key = attempt.id || `idx-${idx}`;
                            const isExp = !!expandedHistoryPhotos[key];
                            if (!isExp) {
                              await resolveEvidencePaths(attempt.photoEvidenceUrls);
                            }
                            setExpandedHistoryPhotos(prev => ({ ...prev, [key]: !isExp }));
                          }}
                          className="text-[11px] text-[#0B315B] hover:text-[#C87541] font-mono font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          {expandedHistoryPhotos[attempt.id || `idx-${idx}`] ? 'Hide Photos' : 'View Photos'}
                        </button>
                      </div>

                      {expandedHistoryPhotos[attempt.id || `idx-${idx}`] && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
                          {attempt.photoEvidenceUrls.map((p, pIdx) => {
                            const displayUrl = evidenceUrls[p] || (p.startsWith('http') ? p : null);
                            const fName = p.split('/').pop();
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => displayUrl && setLightboxPhoto({ url: displayUrl, name: fName })}
                                className="group relative rounded-sm overflow-hidden border border-slate-300 bg-slate-50 aspect-square flex items-center justify-center hover:border-[#C87541] transition-all"
                              >
                                {displayUrl ? (
                                  <>
                                    <img src={displayUrl} alt={`Attempt ${attemptNumber} Evidence ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                      <Maximize2 className="w-4 h-4" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="p-2 text-center">
                                    <Camera className="w-4 h-4 mx-auto text-slate-300" />
                                    <span className="text-[9px] text-slate-400 font-mono block truncate mt-1">{fName}</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── WORKFLOW TIMELINE ── */}
      <Section icon={Clock} title="Workflow Timeline">
        {loadingTimeline ? (
          <p className="text-xs text-slate-400 font-mono italic">Loading audit trail timeline…</p>
        ) : timeline.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono italic">No timeline events recorded yet.</p>
        ) : (
          <div>
            {timeline.map((t, i) => (
              <TimelineEvent key={t.id} event={t} isLast={i === timeline.length - 1} />
            ))}
          </div>
        )}
      </Section>

      {/* Pending CTA */}
      {hasPendingVerification && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => navigate(`/officer/verify/new?appId=${app.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#0B315B] text-white font-semibold text-xs hover:bg-[#082240] transition-colors border border-[#0B315B] shadow-xs tracking-wide"
          >
            <ClipboardList className="w-4 h-4 text-[#C87541]" />
            Start Physical Verification
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Photo Lightbox Modal ── */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#0B315B] rounded-sm border border-slate-700 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#082240] text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#C87541]" />
                <span className="text-xs font-mono font-medium truncate max-w-md">{lightboxPhoto.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="p-1 hover:bg-white/10 rounded-sm transition-colors text-white/80 hover:text-white"
                title="Close Lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-black/90 flex items-center justify-center min-h-[250px] max-h-[75vh] overflow-auto">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.name}
                className="max-w-full max-h-[70vh] object-contain rounded-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
