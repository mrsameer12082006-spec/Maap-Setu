import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckSquare,
  ArrowLeft,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  UploadCloud,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DynamicTechnicalVerification } from '../../components/verification/DynamicTechnicalVerification';

export const VerificationFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appIdParam = searchParams.get('appId') || '';

  const { applications, submitVerificationResult, uploadEvidencePhoto } = useData();

  const currentApp = applications.find((a) => a.id === appIdParam) || applications[0];

  // Outcome & Remarks State
  const [resultOutcome, setResultOutcome] = useState('PASS'); // PASS | FAIL
  const [failReason, setFailReason] = useState('MPE exceeded');
  const [customOtherReason, setCustomOtherReason] = useState('');
  const [inspectorNotes, setInspectorNotes] = useState(
    'Visual seal check completed. Maximum Permissible Error (MPE) verified against standard deadweights. All physical checklist criteria inspected on site.'
  );

  // Mandatory Physical Requirements Checklist
  const [checklist, setChecklist] = useState({
    nameplateChecked: true,
    modelChecked: true,
    capacityChecked: true,
    accuracyClassChecked: true,
    markingsChecked: true,
    sealConditionChecked: true
  });

  const handleToggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Technical Test Observation State
  const [sealIntact, setSealIntact] = useState('YES');
  const [mpeCheck, setMpeCheck] = useState('PASSED');
  const [zeroLoadTest, setZeroLoadTest] = useState('PASSED');
  const [observedErrorMargin, setObservedErrorMargin] = useState('+0.02% (Within MPE tolerance)');
  const [dynamicTechData, setDynamicTechData] = useState({});

  // Inspection Evidence Photos State (real files with collision-resistant metadata)
  const [photos, setPhotos] = useState([]);
  const [photoCategory, setPhotoCategory] = useState('instrument');
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const photoCategoryLabels = {
    instrument: 'Instrument / Inspection Photo',
    nameplate: 'Nameplate Scan',
    seal: 'Lead Seal & QR Stamp Photo'
  };

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      category: photoCategory,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      previewUrl: URL.createObjectURL(file)
    }));

    setPhotos((prev) => [...prev, ...newEntries]);
    e.target.value = '';
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentApp) return;

    if (resultOutcome === 'FAIL') {
      const reasonToSubmit = failReason === 'Other' ? customOtherReason.trim() : failReason;
      if (!reasonToSubmit || reasonToSubmit === 'Other') {
        alert('Please provide the specific explanation for verification failure when "Other" is selected.');
        return;
      }
    }

    setSubmitting(true);
    setUploadStatus('Uploading evidence photographs to secure storage...');

    try {
      // 1. Upload evidence photos to Supabase Storage
      const uploadedStoragePaths = [];
      for (const item of photos) {
        if (item.file) {
          try {
            const ext = item.file.name.split('.').pop() || 'jpg';
            const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const customFile = new File([item.file], `${Date.now()}-${item.category}-${safeName}`, {
              type: item.file.type
            });
            const storagePath = await uploadEvidencePhoto(currentApp.id, customFile);
            uploadedStoragePaths.push(storagePath);
          } catch (uploadErr) {
            console.warn('Storage upload error (fallback path used):', uploadErr);
            uploadedStoragePaths.push(`${currentApp.id}/${Date.now()}-${item.category}-${item.name}`);
          }
        }
      }

      setUploadStatus('Submitting verification record to Legal Metrology Department...');

      // 2. Format payload adhering strictly to database schema & check constraints
      const rejectionReasonVal =
        resultOutcome === 'FAIL'
          ? failReason === 'Other'
            ? customOtherReason.trim()
            : failReason
          : null;

      if (dynamicTechData?.mpeCompliance === 'PENDING') {
        alert('Verification Scale Interval (e) must be confirmed from the nameplate to calculate regulatory MPE under OIML R76 / Legal Metrology Rules, 2011 before submitting verification.');
        setSubmitting(false);
        setUploadStatus('');
        return;
      }

      const checklistPayload = {
        ...checklist
      };

      const technicalPayload = {
        ...dynamicTechData,
        observedErrorMargin,
        sealIntact,
        mpeCheck,
        zeroLoadTest
      };

      await submitVerificationResult({
        applicationId: currentApp.id,
        outcome: resultOutcome,
        checklist_results: checklistPayload,
        technical_test_results: technicalPayload,
        officer_remarks: inspectorNotes,
        rejection_reason: rejectionReasonVal,
        photo_evidence_urls: uploadedStoragePaths
      });

      setSubmitting(false);
      navigate(`/officer/record/${currentApp.id}`);
    } catch (err) {
      setSubmitting(false);
      setUploadStatus('');
      alert(`Failed to submit verification result: ${err.message}`);
      console.error(err);
    }
  };

  if (!currentApp) {
    return (
      <Card className="text-center py-12">
        <p className="text-sm font-semibold text-neutral-900">No application selected for verification.</p>
        <Link to="/officer/queue" className="text-xs text-primary underline mt-2 inline-block">
          Return to Queue
        </Link>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 text-slate-800">
      <div>
        <Link
          to={`/officer/record/${currentApp.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B315B] hover:text-[#C87541] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Record Workspace
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
              Official Metrology Field Protocol • Form VIII
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B315B] tracking-tight">
              Physical Inspection & Field Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Record physical checklist observations, technical MPE tests, and inspection evidence under Legal Metrology Rules, 2011.
            </p>
          </div>
          <div className="border border-slate-300 bg-white px-3 py-1.5 rounded-sm self-start sm:self-auto text-left shadow-2xs">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CASE REGISTRY ID</span>
            <span className="font-mono text-xs font-bold text-[#0B315B] tabular-nums">
              {currentApp.applicationNumber || currentApp.id}
            </span>
          </div>
        </div>
      </div>

      {/* 1. CASE REFERENCE SPEC SHEET (READ-ONLY) */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden text-xs">
        <div className="h-1 bg-[#C87541] w-full"></div>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="font-mono font-semibold uppercase tracking-wider text-[10px] text-slate-500 block mb-0.5">
              Statutory Docket File
            </span>
            <h2 className="text-sm font-semibold text-[#0B315B]">
              Calibration Dossier • Section 24(1) Compliance
            </h2>
          </div>
          <div className="border border-[#0B315B]/30 bg-slate-100 px-2.5 py-0.5 rounded-xs">
            <span className="font-mono text-[9px] font-semibold uppercase text-[#0B315B] tracking-wider">
              {currentApp.applicationType}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-200">
          <div className="p-3.5">
            <dt className="text-slate-400 font-mono text-[10px] uppercase font-semibold">Business / Applicant</dt>
            <dd className="font-semibold text-slate-900 text-sm mt-0.5">{currentApp.applicantName}</dd>
          </div>
          <div className="p-3.5">
            <dt className="text-slate-400 font-mono text-[10px] uppercase font-semibold">Instrument Type</dt>
            <dd className="font-medium text-slate-900 mt-0.5">{currentApp.instrument?.name || currentApp.instrumentName}</dd>
          </div>
          <div className="p-3.5">
            <dt className="text-slate-400 font-mono text-[10px] uppercase font-semibold">Manufacturer & Serial</dt>
            <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">
              {currentApp.instrument?.manufacturer || 'N/A'} · S/N: {currentApp.instrument?.serialNumber || 'N/A'}
            </dd>
          </div>
          <div className="p-3.5">
            <dt className="text-slate-400 font-mono text-[10px] uppercase font-semibold">Scheduled Date</dt>
            <dd className="font-mono font-semibold text-[#C87541] mt-0.5 tabular-nums">
              {currentApp.scheduledInspectionDate || 'Today'}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. MANDATORY PHYSICAL CHECKLIST */}
        <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
            <CheckSquare className="w-4 h-4 text-[#C87541]" />
            <h3 className="font-semibold text-base text-[#0B315B] tracking-tight">
              1. Mandatory Physical Requirements Checklist
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { key: 'nameplateChecked', label: 'Identification / nameplate verified' },
              { key: 'modelChecked', label: 'Manufacturer & model approval check' },
              { key: 'capacityChecked', label: 'Capacity parameters verified' },
              { key: 'accuracyClassChecked', label: 'Accuracy class identification check' },
              { key: 'markingsChecked', label: 'Required statutory markings intact' },
              { key: 'sealConditionChecked', label: 'Lead seal & stamping condition intact' }
            ].map(({ key, label }) => (
              <label
                key={key}
                className="p-3 bg-slate-50/70 rounded-sm border border-slate-200 flex items-center gap-3 cursor-pointer hover:border-[#0B315B] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checklist[key]}
                  onChange={() => handleToggleChecklist(key)}
                  className="w-4 h-4 text-[#0B315B] rounded-xs accent-[#0B315B]"
                />
                <span className="font-medium text-slate-800">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. TECHNICAL OBSERVATIONS & MPE TESTS */}
        <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
            <Award className="w-4 h-4 text-[#C87541]" />
            <h3 className="font-semibold text-base text-[#0B315B] tracking-tight">
              2. Technical Observations & MPE Tolerances
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1.5">
                Visual Lead Seal Intactness
              </label>
              <select
                value={sealIntact}
                onChange={(e) => setSealIntact(e.target.value)}
                className="w-full rounded-sm border border-slate-300 text-xs font-medium p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#0B315B]"
              >
                <option value="YES">YES — Intact & Unbroken</option>
                <option value="NO">NO — Seal Broken or Tampered</option>
                <option value="NEW">NEW — Lead Seal Attached Now</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1.5">
                MPE Error Test Outcome
              </label>
              <select
                value={mpeCheck}
                onChange={(e) => setMpeCheck(e.target.value)}
                className="w-full rounded-sm border border-slate-300 text-xs font-medium p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#0B315B]"
              >
                <option value="PASSED">PASSED — Error Within MPE Limit</option>
                <option value="FAILED">FAILED — Error Exceeds Tolerance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1.5">
                Zero Load Repeatability Test
              </label>
              <select
                value={zeroLoadTest}
                onChange={(e) => setZeroLoadTest(e.target.value)}
                className="w-full rounded-sm border border-slate-300 text-xs font-medium p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#0B315B]"
              >
                <option value="PASSED">PASSED — Returns to Zero</option>
                <option value="FAILED">FAILED — Hysteresis Error</option>
              </select>
            </div>
          </div>

          <Input
            label="Observed Percentage Error & Test Weights Used"
            value={observedErrorMargin}
            onChange={(e) => setObservedErrorMargin(e.target.value)}
            required
          />

          {/* Instrument-Specific Dynamic Technical Verification */}
          <div className="pt-2">
            <DynamicTechnicalVerification
              instrumentName={currentApp.instrument?.name || currentApp.instrumentName}
              applicationType={currentApp.applicationType}
              accuracyClass={currentApp.instrument?.accuracyClass || currentApp.instrument?.accuracy_class || currentApp.accuracyClass}
              scaleInterval={currentApp.instrument?.scaleInterval || currentApp.instrument?.scale_interval}
              maxCapacity={currentApp.instrument?.maxCapacity}
              onDataChange={setDynamicTechData}
            />
          </div>
        </div>

        {/* 4. INSPECTION EVIDENCE (PHOTO UPLOAD / CAMERA) */}
        <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#C87541]" />
              <h3 className="font-semibold text-base text-[#0B315B] tracking-tight">
                3. Physical Inspection Evidence Photographs
              </h3>
            </div>
            <div className="border border-slate-300 bg-slate-50 px-2 py-0.5 rounded-xs">
              <span className="font-mono text-[9px] uppercase font-semibold text-slate-700 tracking-wider">
                {photos.length} Captured
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Attach official photographs showing lead seal, instrument reading, or nameplate. Evidence is stored securely in private storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.entries(photoCategoryLabels).map(([key, label]) => (
              <label
                key={key}
                className={`p-3 rounded-sm border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2.5 ${
                  photoCategory === key
                    ? 'bg-[#0B315B] text-white border-[#0B315B] shadow-2xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:border-[#0B315B]'
                }`}
              >
                <input
                  type="radio"
                  name="photoCategory"
                  value={key}
                  checked={photoCategory === key}
                  onChange={(e) => setPhotoCategory(e.target.value)}
                  className="w-3.5 h-3.5 accent-[#C87541]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upload File Button */}
            <div className="border-2 border-dashed border-slate-300 rounded-sm p-5 bg-slate-50/50 text-center relative hover:border-[#0B315B] transition-colors">
              <UploadCloud className="w-6 h-6 text-[#C87541] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-900">Upload Evidence Image</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Target: {photoCategoryLabels[photoCategory]}</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhotos}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Take Photo with Camera */}
            <div className="border-2 border-dashed border-slate-300 rounded-sm p-5 bg-slate-50/50 text-center relative hover:border-[#0B315B] transition-colors">
              <Camera className="w-6 h-6 text-[#C87541] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-900">Take Photo (Camera)</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Capture live image via optical sensor</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleAddPhotos}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="rounded-sm overflow-hidden border border-slate-200 bg-white shadow-2xs relative group"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-2 text-xs">
                    <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200 inline-block mb-1">
                      {photoCategoryLabels[item.category] || item.category}
                    </span>
                    <p className="font-semibold text-slate-900 truncate text-[11px]">{item.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{item.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(item.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-sm bg-red-600 text-white flex items-center justify-center text-xs hover:bg-red-700 shadow-md"
                    title="Remove photograph"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. OFFICER REMARKS */}
        <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm space-y-3">
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600">
            Official Inspector Verification Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            required
            placeholder="Enter technical findings, lead seal numbers affixed, deadweight IDs, or statutory recommendations..."
            className="w-full rounded-sm border border-slate-300 text-xs text-slate-800 bg-white p-3 font-mono focus:outline-none focus:border-[#0B315B]"
          />
        </div>

        {/* 6. FINAL OUTCOME DECISION */}
        <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm space-y-4">
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600">
            Select Inspection Statutory Outcome Decision <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setResultOutcome('PASS');
                setCustomOtherReason('');
              }}
              className={`p-5 rounded-sm border-2 text-center transition-all flex flex-col items-center gap-2 ${
                resultOutcome === 'PASS'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <div>
                <span className="text-sm block font-mono font-bold uppercase tracking-wider">[ PASS / STAMP VERIFIED ]</span>
                <span className="text-[11px] font-normal text-slate-500 block mt-1">
                  Instrument satisfies statutory tolerances; submitted for LMD certificate generation
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setResultOutcome('FAIL')}
              className={`p-5 rounded-sm border-2 text-center transition-all flex flex-col items-center gap-2 ${
                resultOutcome === 'FAIL'
                  ? 'border-red-600 bg-red-50/70 text-red-900 font-bold ring-2 ring-red-500/20 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-7 h-7 text-red-600" />
              <div>
                <span className="text-sm block font-mono font-bold uppercase tracking-wider">[ FAIL / REJECT NOTICE ]</span>
                <span className="text-[11px] font-normal text-slate-500 block mt-1">
                  Rejection notice issued; instrument requires rework, adjustment & re-verification
                </span>
              </div>
            </button>
          </div>

          {/* Reason for Failure Selection (Shown when FAIL is selected) */}
          {resultOutcome === 'FAIL' && (
            <div className="p-4 bg-red-50/90 rounded-sm border border-red-200 space-y-3 animate-in fade-in duration-200 mt-3">
              <label className="block font-mono font-semibold text-[11px] uppercase tracking-wider text-red-900">
                Statutory Reason for Rejection <span className="text-red-600">*</span>
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
                    className={`p-2.5 rounded-sm border flex items-center gap-2.5 cursor-pointer font-medium transition-all ${
                      failReason === reason
                        ? 'bg-red-700 text-white border-red-800 shadow-2xs font-semibold'
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
                        if (e.target.value !== 'Other') setCustomOtherReason('');
                      }}
                      className="w-4 h-4 accent-red-700"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {failReason === 'Other' && (
                <div className="pt-2">
                  <label className="block font-mono font-semibold text-[10px] uppercase tracking-wider text-red-900 mb-1.5">
                    Specific Reason for Failure <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customOtherReason}
                    onChange={(e) => setCustomOtherReason(e.target.value)}
                    placeholder="Describe specific reasons for rejection..."
                    className="w-full rounded-sm border border-red-200 text-xs text-red-900 bg-white p-3 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {uploadStatus && (
          <p className="text-xs text-center font-mono font-semibold text-[#C87541] animate-pulse">
            {uploadStatus}
          </p>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link to={`/officer/record/${currentApp.id}`}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            type="submit"
            variant={resultOutcome === 'PASS' ? 'accent' : 'danger'}
            size="lg"
            loading={submitting}
            icon={resultOutcome === 'PASS' ? Award : XCircle}
          >
            Submit Official Verification Result ({resultOutcome})
          </Button>
        </div>
      </form>
    </div>
  );
};
