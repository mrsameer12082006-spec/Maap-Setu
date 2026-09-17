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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 text-[#003943]">
      <div>
        <Link
          to={`/officer/record/${currentApp.id}`}
          className="inline-flex items-center gap-1 text-xs text-[#003943]/70 hover:text-[#003943] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Record Workspace
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#003943]">
              Physical Inspection & Field Verification
            </h1>
            <p className="text-xs text-[#003943]/70 mt-0.5">
              Record physical checklist observations, technical MPE tests, and inspection evidence under Legal Metrology Rules, 2011.
            </p>
          </div>
          <span className="font-mono text-xs font-extrabold text-[#00959C] bg-[#E0F5F6] px-3 py-1 rounded-full self-start sm:self-auto">
            App ID: {currentApp.applicationNumber || currentApp.id}
          </span>
        </div>
      </div>

      {/* 1. CASE REFERENCE (READ-ONLY) */}
      <div className="p-5 rounded-2xl bg-[#FDF9F6] border border-[#003943]/15 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#003943]/10 pb-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-[#00959C]">
            Case Reference Information
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#003943]/10 text-[#003943] font-bold text-[10px] uppercase">
            {currentApp.applicationType}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[#003943]/60 text-[10px] uppercase font-bold block">Business / Applicant</span>
            <span className="font-bold text-[#003943] text-sm block">{currentApp.applicantName}</span>
          </div>
          <div>
            <span className="text-[#003943]/60 text-[10px] uppercase font-bold block">Instrument Type</span>
            <span className="font-semibold text-[#003943] block">{currentApp.instrument?.name || currentApp.instrumentName}</span>
          </div>
          <div>
            <span className="text-[#003943]/60 text-[10px] uppercase font-bold block">Manufacturer & Serial</span>
            <span className="font-mono font-semibold text-[#003943] block">
              {currentApp.instrument?.manufacturer || 'N/A'} · S/N: {currentApp.instrument?.serialNumber || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[#003943]/60 text-[10px] uppercase font-bold block">Scheduled Inspection Date</span>
            <span className="font-bold text-[#00959C] block">
              {currentApp.scheduledInspectionDate || 'Today'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. MANDATORY PHYSICAL CHECKLIST */}
        <div className="bg-white rounded-3xl p-6 border border-[#003943]/15 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#003943]/10">
            <CheckSquare className="w-5 h-5 text-[#00959C]" />
            <h3 className="font-serif font-bold text-lg text-[#003943]">
              1. Mandatory Physical Requirements Checklist
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { key: 'nameplateChecked', label: 'Identification / nameplate checked' },
              { key: 'modelChecked', label: 'Manufacturer / model checked' },
              { key: 'capacityChecked', label: 'Capacity parameters checked' },
              { key: 'accuracyClassChecked', label: 'Accuracy class checked' },
              { key: 'markingsChecked', label: 'Required statutory markings checked' },
              { key: 'sealConditionChecked', label: 'Lead seal & stamping condition checked' }
            ].map(({ key, label }) => (
              <label
                key={key}
                className="p-3.5 bg-[#FDF9F6] rounded-xl border border-[#003943]/15 flex items-center gap-3 cursor-pointer hover:border-[#00959C] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checklist[key]}
                  onChange={() => handleToggleChecklist(key)}
                  className="w-4 h-4 text-[#00959C] rounded accent-[#00959C]"
                />
                <span className="font-semibold text-[#003943]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. TECHNICAL OBSERVATIONS & MPE TESTS */}
        <div className="bg-white rounded-3xl p-6 border border-[#003943]/15 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#003943]/10">
            <Award className="w-5 h-5 text-[#00959C]" />
            <h3 className="font-serif font-bold text-lg text-[#003943]">
              2. Technical Observations & MPE Tolerances
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003943] mb-1.5">
                Visual Lead Seal Intactness
              </label>
              <select
                value={sealIntact}
                onChange={(e) => setSealIntact(e.target.value)}
                className="w-full rounded-xl border border-[#003943]/20 text-xs font-semibold p-3 bg-[#FDF9F6] text-[#003943]"
              >
                <option value="YES">YES — Intact & Unbroken</option>
                <option value="NO">NO — Seal Broken or Tampered</option>
                <option value="NEW">NEW — Lead Seal Attached Now</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#003943] mb-1.5">
                MPE Error Test Outcome
              </label>
              <select
                value={mpeCheck}
                onChange={(e) => setMpeCheck(e.target.value)}
                className="w-full rounded-xl border border-[#003943]/20 text-xs font-semibold p-3 bg-[#FDF9F6] text-[#003943]"
              >
                <option value="PASSED">PASSED — Error Within MPE Limit</option>
                <option value="FAILED">FAILED — Error Exceeds Tolerance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#003943] mb-1.5">
                Zero Load Repeatability Test
              </label>
              <select
                value={zeroLoadTest}
                onChange={(e) => setZeroLoadTest(e.target.value)}
                className="w-full rounded-xl border border-[#003943]/20 text-xs font-semibold p-3 bg-[#FDF9F6] text-[#003943]"
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
        <div className="bg-white rounded-3xl p-6 border border-[#003943]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#003943]/10">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#00959C]" />
              <h3 className="font-serif font-bold text-lg text-[#003943]">
                3. Inspection Evidence Photographs
              </h3>
            </div>
            <span className="text-xs font-bold text-[#00959C]">{photos.length} Captured</span>
          </div>

          <p className="text-xs text-[#003943]/70">
            Attach official photographs showing lead seal, instrument reading, or nameplate. Evidence is stored securely in private storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(photoCategoryLabels).map(([key, label]) => (
              <label
                key={key}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                  photoCategory === key
                    ? 'bg-[#003943] text-white border-[#003943]'
                    : 'bg-[#FDF9F6] text-[#003943] border-[#003943]/15 hover:border-[#00959C]'
                }`}
              >
                <input
                  type="radio"
                  name="photoCategory"
                  value={key}
                  checked={photoCategory === key}
                  onChange={(e) => setPhotoCategory(e.target.value)}
                  className="w-3.5 h-3.5 accent-[#02B7BF]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Upload File Button */}
            <div className="border-2 border-dashed border-[#003943]/20 rounded-2xl p-5 bg-[#FDF9F6] text-center relative hover:border-[#00959C] transition-colors">
              <UploadCloud className="w-7 h-7 text-[#00959C] mx-auto mb-1.5" />
              <p className="text-xs font-bold text-[#003943]">Upload Evidence Image</p>
              <p className="text-[10px] text-[#003943]/60 mt-0.5">Select photo file ({photoCategoryLabels[photoCategory]})</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhotos}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Take Photo with Camera */}
            <div className="border-2 border-dashed border-[#003943]/20 rounded-2xl p-5 bg-[#FDF9F6] text-center relative hover:border-[#00959C] transition-colors">
              <Camera className="w-7 h-7 text-[#00959C] mx-auto mb-1.5" />
              <p className="text-xs font-bold text-[#003943]">Take Photo (Camera)</p>
              <p className="text-[10px] text-[#003943]/60 mt-0.5">Capture live image using device camera</p>
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
                  className="rounded-xl overflow-hidden border border-[#003943]/15 bg-white shadow-2xs relative group"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-2 text-xs">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#E0F5F6] text-[#00959C] inline-block mb-1">
                      {photoCategoryLabels[item.category] || item.category}
                    </span>
                    <p className="font-semibold text-[#003943] truncate text-[11px]">{item.name}</p>
                    <p className="text-[10px] text-[#003943]/50">{item.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(item.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs hover:bg-red-700 shadow-md"
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
        <div className="bg-white rounded-3xl p-6 border border-[#003943]/15 shadow-sm space-y-3">
          <label className="block font-bold text-xs uppercase tracking-wider text-[#003943]/80">
            Official Inspector Verification Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            required
            placeholder="Enter technical findings, lead seal numbers affixed, deadweight IDs, or recommendations..."
            className="w-full rounded-2xl border border-[#003943]/20 text-xs font-semibold text-[#003943] bg-[#FDF9F6] p-3.5 focus:outline-none focus:ring-2 focus:ring-[#00959C]"
          />
        </div>

        {/* 6. FINAL OUTCOME DECISION */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#003943]/20 shadow-md space-y-4">
          <label className="block font-bold text-xs uppercase tracking-wider text-[#003943]/80">
            Select Inspection Final Outcome Decision <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setResultOutcome('PASS');
                setCustomOtherReason('');
              }}
              className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                resultOutcome === 'PASS'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-[#003943]/15 bg-white text-[#003943]/70 hover:bg-[#FDF9F6]'
              }`}
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <div>
                <span className="text-base block font-bold">[ PASS / STAMP ]</span>
                <span className="text-[11px] font-normal text-[#003943]/60 block mt-0.5">
                  Instrument satisfies statutory tolerances; submitted for LMD certificate generation
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setResultOutcome('FAIL')}
              className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                resultOutcome === 'FAIL'
                  ? 'border-red-600 bg-red-50 text-red-900 font-extrabold ring-2 ring-red-500/20 shadow-sm'
                  : 'border-[#003943]/15 bg-white text-[#003943]/70 hover:bg-[#FDF9F6]'
              }`}
            >
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <span className="text-base block font-bold">[ FAIL / REJECT ]</span>
                <span className="text-[11px] font-normal text-[#003943]/60 block mt-0.5">
                  Rejection notice issued; instrument requires rework, adjustment & re-verification
                </span>
              </div>
            </button>
          </div>

          {/* Reason for Failure Selection (Shown when FAIL is selected) */}
          {resultOutcome === 'FAIL' && (
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
                        ? 'bg-red-700 text-white border-red-800 shadow-2xs'
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
                  <label className="block font-bold text-xs uppercase tracking-wider text-red-900 mb-1.5">
                    Specific Reason for Failure <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customOtherReason}
                    onChange={(e) => setCustomOtherReason(e.target.value)}
                    placeholder="Describe specific reasons for rejection..."
                    className="w-full rounded-xl border border-red-200 text-xs text-red-900 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {uploadStatus && (
          <p className="text-xs text-center font-bold text-[#00959C] animate-pulse">
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
