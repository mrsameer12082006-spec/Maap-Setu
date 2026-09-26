import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Search,
  CheckSquare,
  Square,
  Download,
  RotateCcw,
  Calendar,
  MapPin,
  Award,
  ChevronRight,
  FileSpreadsheet,
  X,
  FileCheck,
  Scale,
  SlidersHorizontal
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  STATUS_CATEGORIES,
  calculateLmdDashboardCounts
} from '../../utils/statusClassification';
import { Badge } from '../../components/common/Badge';
import { VernierRuler } from '../../components/common/VernierRuler';

// Helper to format GovTech ISO dates cleanly
const formatGovDate = (d) => {
  if (!d) return '—';
  if (typeof d === 'string' && d.includes('T')) {
    return d.split('T')[0];
  }
  return d;
};

// Helper to format Display Application ID
const formatDisplayAppId = (app) => {
  if (app.applicationNumber) return app.applicationNumber;
  if (!app.id) return 'APP-UNKNOWN';
  if (app.id.startsWith('APP-')) return app.id;
  return `APP-${app.id.slice(0, 8).toUpperCase()}`;
};

// Helper to format Display Certificate ID
const formatDisplayCertId = (certId) => {
  if (!certId) return null;
  if (certId.startsWith('CERT-')) return certId;
  return `CERT-${certId.slice(0, 8).toUpperCase()}`;
};

export const LmdDashboard = () => {
  const { user } = useAuth();
  const {
    applications = [],
    loading: dataLoading,
    officers = [],
    certificates = [],
    instruments = [],
    assignOfficer
  } = useData();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [modelClassFilter, setModelClassFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Batch Selection State
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [isBatchAssignOpen, setIsBatchAssignOpen] = useState(false);
  const [batchVerifierType, setBatchVerifierType] = useState('LMO');
  const [batchOfficerId, setBatchOfficerId] = useState('');
  const [batchScheduledDate, setBatchScheduledDate] = useState('2026-09-01');
  const [batchNotes, setBatchNotes] = useState('Mandatory physical calibration test under Legal Metrology Rules, 2011.');
  const [batchAssignLoading, setBatchAssignLoading] = useState(false);

  // Single Application Review & Assignment Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [verifierType, setVerifierType] = useState('LMO');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-01');
  const [assignmentNotes, setAssignmentNotes] = useState('Inspect standard test weights and calibrate to OIML R76 MPE limits.');
  const [assignLoading, setAssignLoading] = useState(false);

  // Initialize Default Officers for single and batch assignment
  useEffect(() => {
    if (officers && officers.length > 0) {
      const defaultLmo = officers.find(o => (o.officerType || 'LMO') === 'LMO') || officers[0];
      if (!selectedOfficerId) setSelectedOfficerId(defaultLmo.id);
      if (!batchOfficerId) setBatchOfficerId(defaultLmo.id);
    }
  }, [officers, selectedOfficerId, batchOfficerId]);

  // Dynamic Status Counts
  const statusCounts = useMemo(() => calculateLmdDashboardCounts(applications), [applications]);

  // Legal Metrology Data Enrichment Resolver
  const enrichedApplications = useMemo(() => {
    return applications.map((app) => {
      // Resolve matching instrument
      const inst = instruments.find((i) => i.id === app.instrumentId) || app.instrument || null;

      // Model Class / Accuracy Class
      const rawClass = inst?.accuracyClass || inst?.accuracy_class || app.accuracyClass || '';
      let modelClass = 'Class III (Medium)';
      if (rawClass.includes('Class I') && !rawClass.includes('Class II') && !rawClass.includes('Class III')) {
        modelClass = 'Class I (Special Accuracy)';
      } else if (rawClass.includes('Class II') && !rawClass.includes('Class III')) {
        modelClass = 'Class II (High Accuracy)';
      } else if (rawClass.includes('Class IV')) {
        modelClass = 'Class IV (Ordinary)';
      } else if (rawClass.includes('0.5') || app.instrumentName?.toLowerCase().includes('fuel') || app.instrumentName?.toLowerCase().includes('dispens')) {
        modelClass = 'Class 0.5 (Fuel Dispenser)';
      } else if (rawClass.includes('0.3') || app.instrumentName?.toLowerCase().includes('flowmeter')) {
        modelClass = 'Class 0.3 (Liquid Flowmeter)';
      } else if (rawClass) {
        modelClass = rawClass;
      }

      // Max Capacity
      const maxCapacity = inst?.maxCapacity || inst?.capacity || app.capacity || '60,000 kg';

      // Scale Interval (e)
      const scaleInterval = inst?.scaleInterval || inst?.scale_interval || app.scaleInterval || (
        maxCapacity.includes('60,000') ? '10 kg' :
        maxCapacity.includes('30 kg') ? '1 g' :
        maxCapacity.includes('80 L') ? '0.05 L' :
        maxCapacity.includes('500 L') ? '0.1 L' : '0.0001 g'
      );

      // Certificate ID (Check app directly, or joined certificates, or linked instrument)
      const matchingCert = certificates.find((c) => c.applicationId === app.id || (c.instrumentId && c.instrumentId === app.instrumentId));
      const rawCertId = matchingCert?.certificateNumber || app.certificateNumber || app.certificateId || app.certificate?.certificateNumber || app.certificate?.id || matchingCert?.id || inst?.certificateId || null;
      const certificateId = rawCertId;
      const displayCertId = formatDisplayCertId(rawCertId);
      const displayAppId = formatDisplayAppId(app);

      // Automated Eligibility Route Rule Helper
      const instNameLower = (app.instrumentName || '').toLowerCase();
      const isGatcRoute = (
        instNameLower.includes('water') ||
        instNameLower.includes('flowmeter') ||
        instNameLower.includes('dispens') ||
        instNameLower.includes('fuel') ||
        instNameLower.includes('analytical') ||
        instNameLower.includes('packaged')
      );
      const route = isGatcRoute ? 'GATC' : 'LMO';
      const routeLabel = isGatcRoute ? 'GATC Testing Lab' : 'State LMO Inspectorate';

      // Statutory Error Margin / MPE Formulation
      let errorMargin = '±0.5e to ±1.5e (±5 kg to ±15 kg)';
      if (modelClass.includes('Class II')) {
        errorMargin = '±0.5e to ±1.0e (±0.5 g to ±1.0 g)';
      } else if (modelClass.includes('Class I')) {
        errorMargin = '±0.5e to ±1.5e (±0.0005 g)';
      } else if (modelClass.includes('0.5')) {
        errorMargin = '±0.50% (±100 mL on 20 L check)';
      } else if (modelClass.includes('0.3')) {
        errorMargin = '±0.30% Max Permissible Error';
      }

      // If already inspected, show field observation snippet
      let observedError = null;
      if (app.status === 'passed') {
        observedError = app.observations?.includes('MPE')
          ? 'Compliant (Within MPE)'
          : 'Compliant (Standard Pass)';
      } else if (app.status === 'failed') {
        observedError = app.observations?.includes('exceeded')
          ? 'Exceeded MPE Limit'
          : 'Failed Test Criteria';
      }

      return {
        ...app,
        instrument: inst,
        modelClass,
        maxCapacity,
        scaleInterval,
        certificateId,
        displayCertId,
        displayAppId,
        formattedSubmissionDate: formatGovDate(app.submissionDate),
        route,
        routeLabel,
        errorMargin,
        observedError
      };
    });
  }, [applications, instruments, certificates]);

  // Filtered Applications according to Toolbar Inputs
  const filteredApplications = useMemo(() => {
    return enrichedApplications.filter((app) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = (app.id || '').toLowerCase().includes(query) || (app.displayAppId || '').toLowerCase().includes(query);
        const matchesCert = (app.certificateId || '').toLowerCase().includes(query) || (app.displayCertId || '').toLowerCase().includes(query);
        const matchesApplicant = (app.applicantName || '').toLowerCase().includes(query);
        const matchesInstrument = (app.instrumentName || '').toLowerCase().includes(query);
        const matchesLocation = (app.inspectionLocation || '').toLowerCase().includes(query);
        const matchesSerial = (app.instrument?.serialNumber || '').toLowerCase().includes(query);

        if (!matchesId && !matchesCert && !matchesApplicant && !matchesInstrument && !matchesLocation && !matchesSerial) {
          return false;
        }
      }

      // 2. Model Class Filter
      if (modelClassFilter !== 'ALL') {
        if (!app.modelClass.toLowerCase().includes(modelClassFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Route Filter
      if (routeFilter !== 'ALL') {
        if (app.route !== routeFilter) {
          return false;
        }
      }

      // 4. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'awaiting_assignment') {
          if (app.status !== 'submitted' && app.status !== 'under_review') return false;
        } else if (statusFilter === 'in_progress') {
          if (app.status !== 'assigned' && app.status !== 'in_progress') return false;
        } else if (statusFilter === 'passed') {
          if (app.status !== 'passed' && app.status !== 'verified') return false;
        } else if (statusFilter === 'failed') {
          if (app.status !== 'failed' && app.status !== 'rejected') return false;
        }
      }

      return true;
    });
  }, [enrichedApplications, searchQuery, modelClassFilter, routeFilter, statusFilter]);

  // Multi-Select Handlers
  const isAllFilteredSelected = filteredApplications.length > 0 && filteredApplications.every((app) => selectedAppIds.includes(app.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApplications.map((app) => app.id));
    }
  };

  const handleToggleRow = (appId) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setModelClassFilter('ALL');
    setRouteFilter('ALL');
    setStatusFilter('ALL');
  };

  // CSV Export Generation
  const handleExportCSV = () => {
    const recordsToExport = selectedAppIds.length > 0
      ? filteredApplications.filter((app) => selectedAppIds.includes(app.id))
      : filteredApplications;

    const headers = [
      'Application ID',
      'Certificate ID',
      'Applicant Business',
      'Instrument Name',
      'Serial Number',
      'Model Class',
      'Max Capacity',
      'Scale Interval (e)',
      'Statutory MPE Margin',
      'Verification Route',
      'Assigned Verifier',
      'Scheduled Date',
      'Status',
      'Submission Date',
      'Inspection Location'
    ];

    const rows = recordsToExport.map((app) => [
      `"${app.id || ''}"`,
      `"${app.certificateId || 'PENDING'}"`,
      `"${(app.applicantName || '').replace(/"/g, '""')}"`,
      `"${(app.instrumentName || '').replace(/"/g, '""')}"`,
      `"${app.instrument?.serialNumber || 'N/A'}"`,
      `"${app.modelClass || ''}"`,
      `"${app.maxCapacity || ''}"`,
      `"${app.scaleInterval || ''}"`,
      `"${app.errorMargin || ''}"`,
      `"${app.routeLabel || ''}"`,
      `"${(app.assignedOfficerName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${app.scheduledInspectionDate || app.preferredDate || 'Unscheduled'}"`,
      `"${app.status || ''}"`,
      `"${app.formattedSubmissionDate || ''}"`,
      `"${(app.inspectionLocation || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `MaapSetu_LMD_Verification_Roster_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Batch Assign Submission
  const handleConfirmBatchAssignment = async (e) => {
    e.preventDefault();
    if (selectedAppIds.length === 0 || !batchOfficerId) return;

    setBatchAssignLoading(true);
    try {
      for (const appId of selectedAppIds) {
        await assignOfficer(
          appId,
          batchOfficerId,
          batchScheduledDate,
          `[Batch Assignment: ${batchVerifierType} Route] ${batchNotes}`
        );
      }
      setSelectedAppIds([]);
      setIsBatchAssignOpen(false);
    } catch (err) {
      console.error('Batch assignment failed', err);
    } finally {
      setBatchAssignLoading(false);
    }
  };

  // Single Case Assign Submission
  const handleConfirmSingleAssignment = async (e) => {
    e.preventDefault();
    if (!selectedApp || !selectedOfficerId) return;

    setAssignLoading(true);
    try {
      await assignOfficer(
        selectedApp.id,
        selectedOfficerId,
        scheduledDate,
        `[${verifierType} Route] ${assignmentNotes}`
      );
      setSelectedApp(null);
    } catch (err) {
      console.error('Single assignment failed', err);
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 text-slate-800 font-sans">
      {/* 1. HIERARCHICAL SUB-HEADER & STATUTORY BREADCRUMB */}
      <div className="bg-white border border-slate-300 rounded-xs shadow-none overflow-hidden text-left">
        {/* Subtle top accent line in Warm Precision Copper */}
        <div className="h-1 bg-[#C87541] w-full" />

        <div className="p-6 space-y-4">
          {/* Hierarchical Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="text-slate-600">Department of Legal Metrology</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">State Verification & Licensing Directorate</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#0B315B] font-semibold">LMD Admin / GATC Testing Center</span>
            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-[11px] font-mono tabular-nums text-slate-700">
              OIML R76 / LM RULES 2011 · ACTIVE ROSTER
            </span>
          </div>

          {/* Title & Primary Batch Action Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0B315B] tracking-tight">
                LMD Administrative & GATC Testing Roster
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                Statutory verification oversight, automated technical route allocation (State LMO Inspectorate vs. Approved GATC Laboratories), batch officer scheduling, and legal certificate control.
              </p>
            </div>

            {/* Primary Batch Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Batch Assign Button */}
              <button
                type="button"
                onClick={() => setIsBatchAssignOpen(true)}
                disabled={selectedAppIds.length === 0}
                className={`min-h-[44px] px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 transition-colors border ${
                  selectedAppIds.length > 0
                    ? 'bg-[#0B315B] hover:bg-blue-900 text-white border-[#0B315B] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title={selectedAppIds.length === 0 ? 'Select rows in table to enable batch assignment' : 'Assign selected verification cases'}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>
                  Batch Assign Verifiers
                  {selectedAppIds.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-white text-[#0B315B] text-xs font-bold tabular-nums">
                      {selectedAppIds.length}
                    </span>
                  )}
                </span>
              </button>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="min-h-[44px] px-4 py-2.5 rounded-md font-medium text-sm border border-[#C87541] text-[#C87541] hover:bg-[#FDF3EC] transition-colors flex items-center gap-2 bg-white"
                title="Export complete metrological queue as standardized CSV"
              >
                <Download className="w-4 h-4 shrink-0 text-[#C87541]" />
                <span>Export Regulatory Roster (CSV)</span>
              </button>

              {/* Comprehensive Review Link */}
              <Link
                to="/lmd/review"
                className="min-h-[44px] px-4 py-2.5 rounded-md font-medium text-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-slate-500" />
                <span>Technical Review &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Vernier Metric Ruler Tick Divider */}
        <VernierRuler />
      </div>

      {/* 2. STATUTORY METRICS STRIP (HIGH DENSITY FLAT CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* NEW */}
        <div
          onClick={() => { setStatusFilter('awaiting_assignment'); }}
          className="bg-white rounded-md p-4 border border-slate-200 text-left space-y-1 hover:border-[#0B315B] transition-colors cursor-pointer"
        >
          <div className="text-xs uppercase font-medium tracking-wider text-slate-500">New Submissions</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {dataLoading ? '—' : statusCounts[STATUS_CATEGORIES.NEW]}
          </div>
          <div className="text-[11px] text-slate-500">Unprocessed trader cases</div>
        </div>

        {/* IN REVIEW */}
        <div
          onClick={() => { setStatusFilter('in_progress'); }}
          className="bg-white rounded-md p-4 border border-slate-200 text-left space-y-1 hover:border-[#0B315B] transition-colors cursor-pointer"
        >
          <div className="text-xs uppercase font-medium tracking-wider text-slate-500">In Verification</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0B315B] tabular-nums">
            {dataLoading ? '—' : statusCounts[STATUS_CATEGORIES.IN_PROGRESS]}
          </div>
          <div className="text-[11px] text-slate-500">Under physical testing</div>
        </div>

        {/* AWAITING ASSIGN */}
        <div
          onClick={() => { setStatusFilter('awaiting_assignment'); }}
          className="bg-white rounded-md p-4 border border-slate-200 text-left space-y-1 hover:border-[#0B315B] transition-colors cursor-pointer"
        >
          <div className="text-xs uppercase font-medium tracking-wider text-slate-500">Awaiting Assign</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#C87541] tabular-nums">
            {dataLoading ? '—' : statusCounts[STATUS_CATEGORIES.AWAITING_ASSIGN]}
          </div>
          <div className="text-[11px] text-slate-500">Pending LMO/GATC routing</div>
        </div>

        {/* UNDER VERIFICATION */}
        <div
          onClick={() => { setStatusFilter('in_progress'); }}
          className="bg-white rounded-md p-4 border border-slate-200 text-left space-y-1 hover:border-[#0B315B] transition-colors cursor-pointer"
        >
          <div className="text-xs uppercase font-medium tracking-wider text-slate-500">Field Inspections</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 tabular-nums">
            {dataLoading ? '—' : statusCounts[STATUS_CATEGORIES.VERIFICATION]}
          </div>
          <div className="text-[11px] text-slate-500">Active inspector roster</div>
        </div>

        {/* COMPLETED */}
        <div
          onClick={() => { setStatusFilter('passed'); }}
          className="bg-white rounded-md p-4 border border-slate-200 text-left space-y-1 hover:border-[#0B315B] transition-colors cursor-pointer"
        >
          <div className="text-xs uppercase font-medium tracking-wider text-slate-500">Certified & Compliant</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 tabular-nums">
            {dataLoading ? '—' : statusCounts[STATUS_CATEGORIES.COMPLETED]}
          </div>
          <div className="text-[11px] text-slate-500">Digital certificates sealed</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERING TOOLBAR (STANDARD BORDERED INPUTS - NO PILLS) */}
      <div className="bg-white rounded-md border border-slate-200 p-4 space-y-4 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0B315B]" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Verification Queue Filters & Search
            </h2>
          </div>
          {(searchQuery || modelClassFilter !== 'ALL' || routeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Search Records</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, Certificate, Serial, Applicant..."
                className="w-full rounded-md border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
              />
            </div>
          </div>

          {/* Model Class Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Model Accuracy Class</label>
            <select
              value={modelClassFilter}
              onChange={(e) => setModelClassFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
            >
              <option value="ALL">All Accuracy Classes</option>
              <option value="Class I">Class I (Special Accuracy - Analytical)</option>
              <option value="Class II">Class II (High Accuracy - Precision)</option>
              <option value="Class III">Class III (Medium - Commercial Weighbridges)</option>
              <option value="Class IV">Class IV (Ordinary)</option>
              <option value="0.5">Class 0.5 (Fuel Dispensers)</option>
              <option value="0.3">Class 0.3 (Liquid Mass Flowmeters)</option>
            </select>
          </div>

          {/* Route Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Regulatory Routing</label>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
            >
              <option value="ALL">All Routes (State LMO & GATC)</option>
              <option value="LMO">State LMO Inspectorate Only</option>
              <option value="GATC">GATC Testing Laboratories Only</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
            >
              <option value="ALL">All Statuses</option>
              <option value="awaiting_assignment">Awaiting Assignment / New</option>
              <option value="in_progress">In Verification / Scheduled</option>
              <option value="passed">Passed (Certified)</option>
              <option value="failed">Failed (MPE Exceeded / Defective)</option>
            </select>
          </div>
        </div>

        {/* Selection Status & Results Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 tabular-nums">
              Showing {filteredApplications.length} of {applications.length} cases
            </span>
            {selectedAppIds.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0B315B] font-semibold border border-blue-200 tabular-nums">
                {selectedAppIds.length} row(s) selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-[#0B315B] hover:underline font-medium"
            >
              {isAllFilteredSelected ? 'Deselect All Rows' : 'Select All Filtered Rows'}
            </button>
            {selectedAppIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAppIds([])}
                className="text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. HIGH-DENSITY LEGAL METROLOGY QUEUE TABLE */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden text-left">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                {/* Select Checkbox Column */}
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all cases"
                    className="w-4 h-4 rounded border-slate-300 text-[#0B315B] focus:ring-[#0B315B] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Application / Certificate ID</th>
                <th className="py-3.5 px-4">Instrument & Trader</th>
                <th className="py-3.5 px-4">Model Class</th>
                <th className="py-3.5 px-4">Max Capacity / e</th>
                <th className="py-3.5 px-4">Error Margin (MPE)</th>
                <th className="py-3.5 px-4">Route & Verifier</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {dataLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-[#0B315B]" />
                      <span>Loading legal metrology verification queue...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700">No applications match current criteria.</p>
                      <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const isSelected = selectedAppIds.includes(app.id);
                  const isPassed = app.status === 'passed' || app.status === 'verified';
                  const isFailed = app.status === 'failed' || app.status === 'rejected';
                  const isAssigned = app.status === 'assigned' || app.status === 'in_progress';

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3 px-4 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(app.id)}
                          aria-label={`Select application ${app.id}`}
                          className="w-4 h-4 rounded border-slate-300 text-[#0B315B] focus:ring-[#0B315B] cursor-pointer"
                        />
                      </td>

                      {/* Application ID & Certificate ID */}
                      <td className="py-3 px-4 align-top text-left space-y-1">
                        <div
                          className="font-mono text-xs font-bold text-[#0B315B] cursor-default"
                          title={app.id}
                        >
                          {app.displayAppId}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {app.certificateId ? (
                            <span
                              className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 cursor-default"
                              title={app.certificateId}
                            >
                              <Award className="w-3 h-3 text-emerald-700 shrink-0" />
                              {app.displayCertId}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Pending Certificate
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Sub: {app.formattedSubmissionDate}
                        </div>
                      </td>

                      {/* Instrument & Trader */}
                      <td className="py-3 px-4 align-top text-left space-y-0.5">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {app.instrumentName}
                        </div>
                        <div className="text-xs text-slate-600">
                          {app.applicantName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{app.inspectionLocation}</span>
                        </div>
                        {app.instrument?.serialNumber && (
                          <div className="font-mono text-[10px] text-slate-500">
                            SN: {app.instrument.serialNumber}
                          </div>
                        )}
                      </td>

                      {/* Model Class */}
                      <td className="py-3 px-4 align-top text-left">
                        <span className="inline-block px-2 py-0.5 rounded border text-[11px] font-medium bg-slate-50 border-slate-200 text-slate-800">
                          {app.modelClass}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Type: {app.applicationType}
                        </div>
                      </td>

                      {/* Max Capacity / Scale Interval e */}
                      <td className="py-3 px-4 align-top text-left space-y-0.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {app.maxCapacity}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Interval: <span className="font-medium text-slate-800">{app.scaleInterval}</span>
                        </div>
                      </td>

                      {/* Error Margin (MPE Limit) */}
                      <td className="py-3 px-4 align-top text-left space-y-1">
                        <div className="font-medium text-slate-800 text-[11px]">
                          {app.errorMargin}
                        </div>
                        {app.observedError && (
                          <div className={`text-[10px] font-semibold ${
                            isPassed ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                            {app.observedError}
                          </div>
                        )}
                      </td>

                      {/* Route & Verifier */}
                      <td className="py-3 px-4 align-top text-left space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                          app.route === 'GATC'
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-blue-50 text-[#0B315B] border-blue-200'
                        }`}>
                          {app.routeLabel}
                        </span>
                        <div className="text-xs text-slate-700">
                          {app.assignedOfficerName ? (
                            <span className="font-medium">{app.assignedOfficerName}</span>
                          ) : (
                            <span className="text-amber-800 font-medium">Unassigned (Pending)</span>
                          )}
                        </div>
                        {app.scheduledInspectionDate && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Date: {app.scheduledInspectionDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4 align-top text-left">
                        <Badge status={app.status} variant="stamp" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setVerifierType(app.route);
                              if (app.assignedOfficerId) {
                                setSelectedOfficerId(app.assignedOfficerId);
                              }
                              setScheduledDate(app.scheduledInspectionDate || app.preferredDate || '2026-09-01');
                            }}
                            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                              !isAssigned && !isPassed && !isFailed
                                ? 'bg-[#0B315B] hover:bg-blue-900 text-white border-[#0B315B]'
                                : isPassed
                                ? 'bg-white border-[#C87541] text-[#C87541] hover:bg-[#FDF3EC]'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {!isAssigned && !isPassed && !isFailed
                              ? 'Assign Verifier'
                              : isPassed
                              ? 'Audit Record'
                              : 'Reassign / Edit'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. AUTHORIZED VERIFIERS & GATC REGISTRY SECTION */}
      <div className="bg-white rounded-md border border-slate-200 p-6 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0B315B]">
              Authorized Verification Officers & GATC Laboratory Registry
            </h2>
            <p className="text-xs text-slate-500">
              State Legal Metrology Officers (LMO) and accredited Government Approved Test Centres (GATC).
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded tabular-nums">
            {officers.length} Registered Verifiers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officers.map((officer) => {
            const isGatc = (officer.role || '').toLowerCase().includes('gatc') || (officer.officerType === 'GATC');
            return (
              <div
                key={officer.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#0B315B] block">
                      {officer.id}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {officer.name}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                    isGatc
                      ? 'bg-purple-50 text-purple-900 border-purple-200'
                      : 'bg-blue-50 text-[#0B315B] border-blue-200'
                  }`}>
                    {isGatc ? 'GATC Lab' : 'LMO Officer'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/60">
                  <p><span className="text-slate-500">Role:</span> {officer.role || 'Inspector'}</p>
                  <p><span className="text-slate-500">Jurisdiction:</span> {officer.zone || 'Statewide'}</p>
                  <p><span className="text-slate-500">Active Queue:</span> <span className="font-semibold tabular-nums text-slate-800">{officer.activeCount || 0} cases</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. BATCH ASSIGN VERIFIERS MODAL */}
      {isBatchAssignOpen && (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-md shadow-lg border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0B315B]">
                  Batch Assign Verifiers
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocating {selectedAppIds.length} selected cases to an authorized statutory verifier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchAssignOpen(false)}
                className="w-8 h-8 rounded border border-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmBatchAssignment} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="font-medium text-slate-700">Selected Applications for Batch Dispatch:</p>
                <div className="font-mono text-xs text-[#0B315B] mt-1 flex flex-wrap gap-1.5">
                  {selectedAppIds.map(id => {
                    const matchedApp = applications.find(a => a.id === id);
                    const label = matchedApp ? formatDisplayAppId(matchedApp) : id;
                    return (
                      <span key={id} className="bg-white px-2 py-0.5 rounded border border-slate-300 tabular-nums">
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Route Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  1. Verifier Regulatory Route <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBatchVerifierType('LMO')}
                    className={`min-h-[44px] p-3 rounded-md border text-center font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
                      batchVerifierType === 'LMO'
                        ? 'border-[#0B315B] bg-[#0B315B] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>State LMO Inspectorate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchVerifierType('GATC')}
                    className={`min-h-[44px] p-3 rounded-md border text-center font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
                      batchVerifierType === 'GATC'
                        ? 'border-[#0B315B] bg-[#0B315B] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>GATC Testing Laboratory</span>
                  </button>
                </div>
              </div>

              {/* Officer Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  2. Select Authorized Officer or Center <span className="text-red-600">*</span>
                </label>
                <select
                  value={batchOfficerId}
                  onChange={(e) => setBatchOfficerId(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                >
                  {officers
                    .filter((off) => (off.officerType || 'LMO') === batchVerifierType)
                    .map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.role} — {off.zone})
                      </option>
                    ))}
                </select>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  3. Scheduled Verification Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={batchScheduledDate}
                  onChange={(e) => setBatchScheduledDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              {/* Batch Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  4. Regulatory Instructions & Calibration Directives
                </label>
                <textarea
                  rows={2}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBatchAssignOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchAssignLoading}
                  className="min-h-[44px] px-5 py-2.5 rounded-md bg-[#0B315B] hover:bg-blue-900 text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  {batchAssignLoading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Dispatching Batch Assignment...</span>
                    </>
                  ) : (
                    <span>Confirm Batch Assignment ({selectedAppIds.length})</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SINGLE APPLICATION REVIEW & ASSIGN MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-md shadow-lg border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-left">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <span className="font-mono text-xs font-semibold text-[#0B315B]">
                  APPLICATION: {selectedApp.displayAppId}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Technical Specifications & Verifier Assignment
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded border border-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
              {/* Technical Spec Container with Ruler Header & Monospace Precision */}
              <div className="relative bg-white border border-slate-300 rounded-xs shadow-none overflow-hidden text-left">
                {/* Subtle top accent line in Warm Copper */}
                <div className="h-1 bg-[#C87541] w-full" />

                {/* Header with Technical Stamp */}
                <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 gap-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
                      Calibration Record • {selectedApp.displayAppId}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0B315B] tracking-tight">
                      {selectedApp.instrumentName}
                    </h3>
                    <p className="text-xs text-slate-500">Applicant: {selectedApp.applicantName}</p>
                  </div>

                  {/* Tactile Stamp Badge */}
                  <Badge
                    status={selectedApp.status || 'verified'}
                    variant="stamp"
                    subtext="NPL Traceable"
                    className="shrink-0"
                  />
                </div>

                {/* Vernier scale divider line */}
                <div className="vernier-ticks-sm" />

                {/* High-Density Spec Grid */}
                <dl className="grid grid-cols-2 text-xs divide-x divide-y divide-slate-100 border-b border-slate-200">
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">SERIAL NO.</dt>
                    <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums text-xs">
                      {selectedApp.instrument?.serialNumber || 'AV-984210-IN'}
                    </dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">VERIFICATION UNIT / CLASS</dt>
                    <dd className="font-medium text-slate-900 mt-0.5 text-xs">
                      {selectedApp.modelClass} ({selectedApp.scaleInterval})
                    </dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">MAX CAPACITY</dt>
                    <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums text-xs">
                      {selectedApp.maxCapacity}
                    </dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">STATUTORY MPE / DEVIATION</dt>
                    <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums text-xs">
                      {selectedApp.errorMargin}
                    </dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">PREMISES LOCATION</dt>
                    <dd className="font-medium text-slate-800 mt-0.5 text-xs truncate">
                      {selectedApp.inspectionLocation}
                    </dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[10px] uppercase">APPLICATION STAGE</dt>
                    <dd className="font-mono font-medium text-[#0B315B] mt-0.5 text-xs">
                      {selectedApp.applicationType}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Assignment Form */}
              <form onSubmit={handleConfirmSingleAssignment} className="space-y-4">
                {/* Route Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Statutory Route Allocation <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVerifierType('LMO')}
                      className={`min-h-[44px] p-3 rounded-md border text-center font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
                        verifierType === 'LMO'
                          ? 'border-[#0B315B] bg-[#0B315B] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>State LMO Inspectorate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifierType('GATC')}
                      className={`min-h-[44px] p-3 rounded-md border text-center font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
                        verifierType === 'GATC'
                          ? 'border-[#0B315B] bg-[#0B315B] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>GATC Testing Laboratory</span>
                    </button>
                  </div>
                </div>

                {/* Authorized Officer */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Authorized Officer / Testing Centre <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
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

                {/* Preferred Date Info */}
                {selectedApp.preferredDate && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Applicant Preferred Date:</span>
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-200 text-xs font-semibold text-slate-700 tabular-nums">
                      {selectedApp.preferredDate}
                    </div>
                  </div>
                )}

                {/* Scheduled Inspection Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    LMD Scheduled Inspection Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 min-h-[44px] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                  />
                </div>

                {/* Inspection Instructions */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Inspection Directives & Field Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="min-h-[44px] px-4 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="min-h-[44px] px-5 py-2.5 rounded-md bg-[#0B315B] hover:bg-blue-900 text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
                  >
                    {assignLoading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Updating Schedule...</span>
                      </>
                    ) : (
                      <span>Assign Verifier & Schedule</span>
                    )}
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

export default LmdDashboard;
