import React, { useState } from 'react';
import { useNavigate, Link, } from 'react-router-dom';
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
    <div className="w-full max-w-4xl mx-auto space-y-7 pb-20 text-[#102A43]">
      <div className="space-y-6 text-left">
        <div className="space-y-1 text-left border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B315B] tracking-tight">
            Register Instrument
          </h1>
          <p className="text-sm text-slate-500">
            Enter mandatory Legal Metrology specifications and verification schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: INSTRUMENT & TECHNICAL SPECIFICATIONS */}
            <div className="bg-white rounded-md p-6 border border-slate-200 shadow-none space-y-6 text-left">
              <div className="pb-3 border-b border-slate-200 flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#C87541]" />
                <h2 className="font-medium text-base sm:text-lg text-[#0B315B]">
                  1. Instrument & Technical Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Row 1: Category & Quantity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Category / Instrument Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  >
                    <option value="Heavy Electronic Weighbridge">Heavy Electronic Weighbridge</option>
                    <option value="Retail Digital Counter Scale">Retail Digital Counter Scale</option>
                    <option value="Fuel Dispensing Meter (Multi-Product)">Fuel Dispensing Meter (Multi-Product)</option>
                    <option value="Industrial Automatic Liquid Flowmeter">Industrial Automatic Liquid Flowmeter</option>
                    <option value="Pre-packaged Quantity Check Scale">Pre-packaged Quantity Check Scale</option>
                    <option value="Precision Laboratory Analytical Balance">Precision Laboratory Analytical Balance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                {/* Row 2: Manufacturer & Model */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Manufacturer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g. Avery India Ltd / Essae-Teraoka"
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Model Name / Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. WB-60T-PRO"
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                {/* Row 3: Serial Number & Model Approval No */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. AV-984210-IN"
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Model Approval No.
                  </label>
                  <input
                    type="text"
                    name="modelApprovalNo"
                    value={formData.modelApprovalNo}
                    onChange={handleChange}
                    placeholder="e.g. IND/09/2021/442"
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                {/* Row 4: Max Capacity & Min Capacity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Max Capacity / Range <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    placeholder="e.g. 60,000"
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Min Capacity / Range
                  </label>
                  <input
                    type="text"
                    name="minCapacity"
                    value={formData.minCapacity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                {/* Row 5: Unit of Measurement & Scale Interval */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Unit of Measurement <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unitOfMeasurement"
                    value={formData.unitOfMeasurement}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="t (tonnes)">Tonnes (t)</option>
                    <option value="L (litres)">Litres (L)</option>
                    <option value="L/min">Litres per minute (L/min)</option>
                    <option value="m³">Cubic Meters (m³)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Verification Scale Interval (e) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="scaleInterval"
                    value={formData.scaleInterval}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 1 g, 10 g, 0.5 g, 10 kg"
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                  <p className="text-[11px] text-[#102A43]/60">
                    Required under OIML R76 & Legal Metrology Rules, 2011 to calculate Maximum Permissible Error (MPE).
                  </p>
                </div>

                {/* Row 6: Accuracy Class */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Accuracy Class (Rules 2011)
                  </label>
                  <select
                    name="accuracyClass"
                    value={formData.accuracyClass}
                    onChange={handleChange}
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
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

            {/* SECTION 2: PREMISES & INSTALLATION LOCATION DETAILS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#102A43]/15 shadow-md space-y-6">
              <div className="pb-3 border-b border-[#102A43]/10 flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#B85D19]" />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#102A43]">
                  2. Premises & Installation Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Premises / Installation Name
                  </label>
                  <input
                    type="text"
                    name="premisesName"
                    value={formData.premisesName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Logistics Warehouse Depot 4"
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Installation Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="installationAddress"
                    value={formData.installationAddress}
                    onChange={handleChange}
                    placeholder="e.g. Plot 45, MIDC Industrial Area, Chakan"
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Pune / Thane / Nagpur"
                    required
                    className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: VERIFICATION TYPE & LEGAL APPROVAL DETAILS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#102A43]/15 shadow-md space-y-6">
              <div className="pb-3 border-b border-[#102A43]/10 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#B85D19]" />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#102A43]">
                  3. Verification & Legal Approval Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                    Verification Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        formData.verificationType === 'Initial Verification'
                          ? 'border-[#B85D19] bg-[#102A43] text-white shadow-xs'
                          : 'border-[#102A43]/20 bg-[#FBF9F5] text-[#102A43]'
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
                      className={`p-3 rounded-xl border cursor-pointer text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        formData.verificationType === 'Re-verification'
                          ? 'border-[#B85D19] bg-[#102A43] text-white shadow-xs'
                          : 'border-[#102A43]/20 bg-[#FBF9F5] text-[#102A43]'
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
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                      Previous Certificate No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="previousCertificateNo"
                      value={formData.previousCertificateNo}
                      onChange={handleChange}
                      placeholder="e.g. CERT-2025-8891"
                      required
                      className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 opacity-50 select-none">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/60">
                      Previous Certificate No.
                    </label>
                    <div className="w-full bg-[#FBF9F5] border border-[#102A43]/10 rounded-xl px-4 py-3 text-xs font-medium text-[#102A43]/60 italic flex items-center justify-between">
                      <span>Not required for Initial Verification</span>
                      <span className="text-[10px] font-bold uppercase bg-[#102A43]/10 px-2 py-0.5 rounded">Initial</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Verification Application Details */}
              <div className="pt-2">
                <div className="flex items-center gap-3 border-b border-[#102A43]/10 pb-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#FDF3EC] flex items-center justify-center text-[#B85D19]">
                    <span className="font-extrabold text-sm">4</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#102A43]">Verification Application Details</h2>
                    <p className="text-xs text-[#102A43]/70 font-medium">Schedule the verification for this instrument</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                      Application Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appType}
                      onChange={(e) => setAppType(e.target.value)}
                      required
                      className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                    >
                      <option value="Initial Verification (New Instrument)">Initial Verification (New Instrument)</option>
                      <option value="Periodic Re-verification (Annual)">Periodic Re-verification (Annual)</option>
                      <option value="Re-verification After Stamping/Repair">Re-verification After Stamping/Repair</option>
                      <option value="Emergency Field Calibration">Emergency Field Calibration</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                      Preferred Inspection Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      required
                      className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43]/80">
                      Inspection Notes / Special Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Provide site access instructions, contact person phone number, or required test weight equipment details..."
                      className="w-full bg-[#FBF9F5] border border-[#102A43]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#102A43] focus:outline-none focus:border-[#B85D19]"
                    />
                  </div>
                </div>

                {/* Supporting Documents section */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#B85D19]" />
                    <h3 className="text-sm font-bold text-[#102A43]">Supporting Documents</h3>
                  </div>
                  
                  <div className="border-2 border-dashed border-[#102A43]/20 hover:border-[#B85D19] rounded-2xl p-6 bg-[#FBF9F5]/50 text-center relative transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-[#B85D19] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#102A43]">Drag & Drop files or click to upload</p>
                    <p className="text-xs text-[#102A43]/70 mt-1">Accepted: PDF, JPG, PNG (Max 10MB per file)</p>
                    <input
                      type="file"
                      onChange={handleAddFile}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#102A43]/70">Attached Documents ({files.length})</p>
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#102A43]/15 shadow-sm text-xs group">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-[#FDF3EC] rounded-lg">
                              <FileText className="w-4 h-4 text-[#B85D19]" />
                            </div>
                            <div>
                              <p className="font-bold text-[#102A43]">{file.name}</p>
                              <p className="text-[10px] text-[#102A43]/60">{file.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-[#102A43]/40 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-md border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
                <Info className="w-5 h-5 text-[#0B315B] shrink-0" />
                <span>
                  Submitting this form registers your instrument and files the verification application with the Legal Metrology department.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Link
                  to="/business"
                  className="px-4 py-2.5 min-h-[44px] rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors inline-flex items-center justify-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 min-h-[44px] rounded-md bg-[#0B315B] hover:bg-blue-900 text-white font-medium text-sm transition-colors shadow-none inline-flex items-center gap-2 group"
                >
                  <span>{submitLoading ? 'Submitting Application...' : 'Submit Application'}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
};


