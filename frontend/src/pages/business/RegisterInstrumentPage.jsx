import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Upload,
  Trash2,
  Info,
  Building2,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VernierRuler } from '../../components/common/VernierRuler';

export const RegisterInstrumentPage = () => {
  const navigate = useNavigate();
  const { registerInstrument, submitApplication } = useData();
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Verification Application State
  const [appType, setAppType] = useState('Initial Verification (New Instrument)');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);

  // 17 Complete Form Fields as requested
  const [formData, setFormData] = useState({
    // 1. Technical Specifications
    type: 'Heavy Electronic Weighbridge',
    manufacturer: '',
    model: '',
    serialNumber: '',
    maxCapacity: '',
    minCapacity: '',
    unitOfMeasurement: 'kg',
    accuracyClass: 'Class III (Medium Commercial)',
    scaleInterval: '10 g',
    quantity: '1',

    // 2. Premises & Location Details
    premisesName: 'Apex Logistics Warehouse Hub #4',
    installationAddress: 'Plot 45, MIDC Industrial Area, Chakan',
    state: 'Maharashtra',
    district: 'Pune',

    // 3. Verification & Approval Details
    verificationType: 'Initial Verification',
    previousCertificateNo: '',
    modelApprovalNo: 'IND/09/2021/442'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAddFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles([...files, { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      // 1. Create the instrument
      const newInst = await registerInstrument({
        ...formData,
        capacity: `${formData.maxCapacity} ${formData.unitOfMeasurement}`,
        location: `${formData.premisesName}, ${formData.installationAddress}, ${formData.district}, ${formData.state}`
      });

      // 2. Create the application automatically mapped to the new instrument
      await submitApplication({
        instrumentId: newInst.id,
        applicationType: appType,
        preferredDate,
        inspectionLocation: `${formData.premisesName}, ${formData.installationAddress}, ${formData.district}, ${formData.state}`,
        documents: files.map((f) => ({ name: f.name, size: f.size, url: '#' })),
        notes
      });

      // Workflow successfully completed, return to applications
      navigate('/business/applications');
    } catch (error) {
      console.error("Combined workflow failed:", error);
      alert("Failed to create application. Instrument may have been created successfully. " + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const indianStates = [
    'Maharashtra',
    'Gujarat',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
    'West Bengal',
    'Uttar Pradesh',
    'Telangana',
    'Rajasthan',
    'Madhya Pradesh',
    'Haryana',
    'Punjab',
    'Kerala',
    'Andhra Pradesh',
    'Odisha',
    'Bihar'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 font-sans">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
              Statutory Form LM-1 • Registration & Stamping Mandate
            </span>
            <h1 className="text-xl font-semibold text-[#0B315B] tracking-tight">
              Register Measuring Instrument
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-slate-300 bg-white px-3 py-1 rounded-sm">
            <span className="text-[10px] font-mono uppercase text-slate-500">Legal Act:</span>
            <span className="text-xs font-mono font-semibold text-[#0B315B]">Act 2009 / Sec 24</span>
          </div>
        </div>
        <VernierRuler className="my-3 opacity-75" />
        <p className="text-xs text-slate-600">
          Enter verified manufacturer specifications, pattern approval numbers, and field location details to file an initial verification or periodic re-verification application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: INSTRUMENT & TECHNICAL SPECIFICATIONS */}
        <div className="relative bg-white border border-slate-300 rounded-sm shadow-none overflow-hidden">
          <div className="h-1 bg-[#C87541] w-full" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#C87541]" />
                <h2 className="font-mono text-xs uppercase font-bold tracking-wider text-[#0B315B]">
                  1. Instrument Technical Specifications
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">OIML R76 / IS 14331</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1: Category & Quantity */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Category / Instrument Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                >
                  <option value="Heavy Electronic Weighbridge">Heavy Electronic Weighbridge</option>
                  <option value="Retail Digital Counter Scale">Retail Digital Counter Scale</option>
                  <option value="Fuel Dispensing Meter (Multi-Product)">Fuel Dispensing Meter (Multi-Product)</option>
                  <option value="Industrial Automatic Liquid Flowmeter">Industrial Automatic Liquid Flowmeter</option>
                  <option value="Pre-packaged Quantity Check Scale">Pre-packaged Quantity Check Scale</option>
                  <option value="Precision Laboratory Analytical Balance">Precision Laboratory Analytical Balance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Quantity (Units) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              {/* Row 2: Manufacturer & Model */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Manufacturer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g. Avery India Ltd / Essae-Teraoka"
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Model Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. WB-60T-PRO"
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              {/* Row 3: Serial Number & Model Approval No */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Instrument Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="e.g. AV-984210-IN"
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Pattern / Model Approval Certificate No.
                </label>
                <input
                  type="text"
                  name="modelApprovalNo"
                  value={formData.modelApprovalNo}
                  onChange={handleChange}
                  placeholder="e.g. IND/09/2021/442"
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              {/* Row 4: Max Capacity & Min Capacity */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Max Capacity / Range <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  placeholder="e.g. 60,000"
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Min Capacity / Range
                </label>
                <input
                  type="text"
                  name="minCapacity"
                  value={formData.minCapacity}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              {/* Row 5: Unit of Measurement & Scale Interval */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Unit of Measurement <span className="text-red-500">*</span>
                </label>
                <select
                  name="unitOfMeasurement"
                  value={formData.unitOfMeasurement}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="t (tonnes)">Tonnes (t)</option>
                  <option value="L (litres)">Litres (L)</option>
                  <option value="L/min">Litres per minute (L/min)</option>
                  <option value="m³">Cubic Meters (m³)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Verification Scale Interval (e) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="scaleInterval"
                  value={formData.scaleInterval}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 1 g, 10 g, 0.5 g, 10 kg"
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
                <p className="text-[10px] font-mono text-slate-400">
                  Used to compute Maximum Permissible Error (MPE) thresholds under OIML R76.
                </p>
              </div>

              {/* Row 6: Accuracy Class */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Accuracy Class (Rules 2011)
                </label>
                <select
                  name="accuracyClass"
                  value={formData.accuracyClass}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                >
                  <option value="Class I (Special Precision)">Class I (Special Precision)</option>
                  <option value="Class II (High Accuracy)">Class II (High Accuracy)</option>
                  <option value="Class III (Medium Commercial)">Class III (Medium Commercial)</option>
                  <option value="Class IV (Ordinary Heavy)">Class IV (Ordinary Heavy)</option>
                  <option value="Class 0.5 (Fuel/Liquids)">Class 0.5 (Fuel/Liquids)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PREMISES & INSTALLATION LOCATION DETAILS */}
        <div className="relative bg-white border border-slate-300 rounded-sm shadow-none overflow-hidden">
          <div className="h-1 bg-[#0B315B] w-full" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B315B]" />
                <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-[#0B315B]">
                  2. Premises & Installation Site Details
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Jurisdiction Mapping</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Premises / Installation Name
                </label>
                <input
                  type="text"
                  name="premisesName"
                  value={formData.premisesName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Logistics Warehouse Depot 4"
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Installation Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="installationAddress"
                  value={formData.installationAddress}
                  onChange={handleChange}
                  placeholder="e.g. Plot 45, MIDC Industrial Area, Chakan"
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  State Jurisdiction <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  District Inspection Circle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Pune / Thane / Nagpur"
                  required
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: VERIFICATION TYPE & LEGAL APPROVAL DETAILS */}
        <div className="relative bg-white border border-slate-300 rounded-sm shadow-none overflow-hidden">
          <div className="h-1 bg-[#C87541] w-full" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C87541]" />
                <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-[#0B315B]">
                  3. Verification Type & Stamping Protocol
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Rule 14 Stamping</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                  Verification Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <label
                    className={`p-2.5 rounded-sm border cursor-pointer text-center font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      formData.verificationType === 'Initial Verification'
                        ? 'border-[#0B315B] bg-[#0B315B] text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="verificationType"
                      value="Initial Verification"
                      checked={formData.verificationType === 'Initial Verification'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>Initial</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-sm border cursor-pointer text-center font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      formData.verificationType === 'Re-verification'
                        ? 'border-[#0B315B] bg-[#0B315B] text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="verificationType"
                      value="Re-verification"
                      checked={formData.verificationType === 'Re-verification'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>Re-verification</span>
                  </label>
                </div>
              </div>

              {formData.verificationType === 'Re-verification' ? (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                    Previous Certificate No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="previousCertificateNo"
                    value={formData.previousCertificateNo}
                    onChange={handleChange}
                    placeholder="e.g. CERT-2025-8891"
                    required
                    className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                  />
                </div>
              ) : (
                <div className="space-y-1 opacity-50 select-none">
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-500">
                    Previous Certificate No.
                  </label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-500 italic flex items-center justify-between">
                    <span>Not required for initial verification</span>
                    <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-xs font-semibold">Exempt</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Verification Application Details */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C87541]" />
                  <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-[#0B315B]">
                    4. Application Schedule & Field Logistics
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Field Scheduling</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                    Application Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                  >
                    <option value="Initial Verification (New Instrument)">Initial Verification (New Instrument)</option>
                    <option value="Periodic Re-verification (Annual)">Periodic Re-verification (Annual)</option>
                    <option value="Re-verification After Stamping/Repair">Re-verification After Stamping/Repair</option>
                    <option value="Emergency Field Calibration">Emergency Field Calibration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                    Preferred Inspection Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                    Inspection Notes / Site Access Directives
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide site access instructions, site officer contact details, or test weight crane availability..."
                    className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
                  />
                </div>
              </div>

              {/* Supporting Documents section */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600">
                    Technical Schematics & Calibration Records
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">PDF, JPG, PNG (Max 10MB)</span>
                </div>
                
                <div className="border border-dashed border-slate-300 hover:border-[#C87541] rounded-sm p-5 bg-slate-50/50 text-center relative transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#C87541] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-800">Drag & Drop files or click to upload</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">Attach model approval certificate, manufacturer invoice, or test reports</p>
                  <input
                    type="file"
                    onChange={handleAddFile}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Attached Documents ({files.length})
                    </p>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-sm border border-slate-300 text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0B315B]" />
                          <div>
                            <p className="font-mono text-xs font-medium text-slate-900">{file.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 tabular-nums">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-sm border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5 font-sans">
              <Info className="w-4 h-4 text-[#0B315B] shrink-0 mt-0.5" />
              <span>
                Submitting this form registers the instrument in the state registry and automatically files the verification docket with the Legal Metrology Department.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Link
                to="/business"
                className="px-4 py-2 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors inline-flex items-center justify-center font-mono"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitLoading}
                className="px-5 py-2 rounded-sm bg-[#0B315B] hover:bg-[#082240] text-white font-semibold text-xs transition-colors border border-[#0B315B] shadow-xs inline-flex items-center gap-2 group tracking-wide font-mono uppercase"
              >
                <span>{submitLoading ? 'Registering Docket...' : 'Submit Application'}</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};


