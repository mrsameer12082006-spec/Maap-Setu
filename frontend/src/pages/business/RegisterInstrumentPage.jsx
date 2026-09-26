import React, { useState, useEffect } from 'react';
import { mockApiService as api } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Info,
  Building2,
  ShieldCheck,
  Scale,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RegisterInstrumentPage = () => {
  const navigate = useNavigate();
  const { registerInstrument, submitApplication } = useData();
  const [submitLoading, setSubmitLoading] = useState(false);

  const [premises, setPremises] = useState([]);
  const [loadingPremises, setLoadingPremises] = useState(true);
  const [selectedPremiseId, setSelectedPremiseId] = useState(() => sessionStorage.getItem('reg_selectedPremiseId') || '');

  useEffect(() => {
    async function fetchPremises() {
      try {
        const data = await api.getMyActivePremisesWithGeo();
        setPremises(data || []);
      } catch (error) {
        console.error("Failed to fetch premises", error);
      } finally {
        setLoadingPremises(false);
      }
    }
    fetchPremises();
  }, []);




  
  // Verification Application State
  const [appType, setAppType] = useState(() => sessionStorage.getItem('reg_appType') || 'Initial Verification (New Instrument)');
  const [preferredDate, setPreferredDate] = useState(() => sessionStorage.getItem('reg_preferredDate') || '');
  const [notes, setNotes] = useState(() => sessionStorage.getItem('reg_notes') || '');

  // 17 Complete Form Fields as requested
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('reg_formData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error('Failed to parse reg_formData:', e);
      }
    }
    return {
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

      // 3. Verification & Approval Details
      verificationType: 'Initial Verification',
      previousCertificateNo: '',
      modelApprovalNo: 'IND/09/2021/442'
    };
  });

  useEffect(() => {
    sessionStorage.setItem('reg_selectedPremiseId', selectedPremiseId);
    sessionStorage.setItem('reg_appType', appType);
    sessionStorage.setItem('reg_preferredDate', preferredDate);
    sessionStorage.setItem('reg_notes', notes);
    sessionStorage.setItem('reg_formData', JSON.stringify(formData));
  }, [selectedPremiseId, appType, preferredDate, notes, formData]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    // We only uppercase these three fields. We DO NOT strip any characters here.
    if (name === 'serialNumber' || name === 'modelApprovalNo' || name === 'previousCertificateNo') {
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };


  const validateForm = () => {
    const newErrors = {};

    // Quantity: must be a positive integer >= 1. No decimals, no negative, no letters.
    const qtyStr = String(formData.quantity).trim();
    if (!/^\d+$/.test(qtyStr) || parseInt(qtyStr, 10) < 1) {
      newErrors.quantity = 'Quantity must be a positive integer.';
    }

    // Max Capacity: positive decimal/integer
    const maxStr = String(formData.maxCapacity).trim();
    if (!/^\d+(\.\d+)?$/.test(maxStr) || parseFloat(maxStr) <= 0) {
      newErrors.maxCapacity = 'Max capacity must be a positive number.';
    }

    // Min Capacity: positive decimal/integer, min <= max
    const minStr = String(formData.minCapacity || '').trim();
    if (minStr) {
      if (!/^\d+(\.\d+)?$/.test(minStr) || parseFloat(minStr) <= 0) {
        newErrors.minCapacity = 'Min capacity must be a positive number.';
      } else if (!newErrors.maxCapacity && parseFloat(minStr) > parseFloat(maxStr)) {
        newErrors.minCapacity = 'Min capacity cannot exceed Max capacity.';
      }
    }

    // Serial Number: ^[A-Z0-9-]+$
    const serialStr = String(formData.serialNumber).trim();
    if (!serialStr) {
      newErrors.serialNumber = 'Serial Number is required.';
    } else if (!/^[A-Z0-9-]+$/.test(serialStr)) {
      newErrors.serialNumber = 'Invalid Serial Number. Only letters, numbers, and hyphens are allowed.';
    }

    // Model Approval No: ^[A-Z0-9/-]+$
    const modelApprStr = String(formData.modelApprovalNo || '').trim();
    if (modelApprStr && !/^[A-Z0-9/-]+$/.test(modelApprStr)) {
      newErrors.modelApprovalNo = 'Invalid Model Approval No. Only letters, numbers, hyphens, and slashes are allowed.';
    }

    if (!selectedPremiseId) newErrors.premise = 'Please select a registered premise.';

    if (!preferredDate) {
      newErrors.preferredDate = 'Preferred Inspection Date is required.';
    } else {
      const today = new Date();
      // local time YYYY-MM-DD
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - (offset*60*1000));
      const todayStr = localDate.toISOString().split('T')[0];
      if (preferredDate < todayStr) {
        newErrors.preferredDate = 'Inspection date cannot be in the past.';
      }
    }

    if (formData.verificationType === 'Re-verification') {
      const certStr = String(formData.previousCertificateNo || '').trim();
      if (!certStr) {
        newErrors.previousCertificateNo = 'Previous Certificate Number is required.';
      } else if (!/^CERT-\d{4}-\d{4}$/.test(certStr)) {
        newErrors.previousCertificateNo = 'Must match format CERT-YYYY-XXXX.';
      }
    }

    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required.';
    if (!formData.model.trim()) newErrors.model = 'Model is required.';
    if (!formData.scaleInterval.trim()) newErrors.scaleInterval = 'Scale interval is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }
    setSubmitLoading(true);
    try {
      // 1. Create the instrument
      
        if (!selectedPremiseId) {
            alert("Please select a registered premise.");
            setSubmitLoading(false);
            return;
        }
        
        
            const latestPremises = await api.getMyActivePremisesWithGeo();
            const latestPremise = latestPremises.find(p => p.id === selectedPremiseId);
            
            if (!latestPremise) {
                alert("The selected premise is no longer active or available. Please select another premise.");
                setSubmitLoading(false);
                return;
            }

            // Preserve backward compatibility for instrument record
            const legacyLocationString = `${latestPremise.premises_name}, ${latestPremise.address_line_1}, ${latestPremise.subdistrict?.name ? latestPremise.subdistrict.name + ', ' : ''}${latestPremise.district?.name || ''}, ${latestPremise.state?.name || ''} - ${latestPremise.pincode || ''}`;

            const newInst = await registerInstrument({
              ...formData,
              premisesName: latestPremise.premises_name,
              installationAddress: latestPremise.address_line_1,
              state: latestPremise.state?.name || '',
              district: latestPremise.district?.name || '',
              capacity: `${formData.maxCapacity} ${formData.unitOfMeasurement}`,
              location: legacyLocationString
            });
  
        // 2. Create the application automatically mapped to the new instrument
        await submitApplication({
          instrumentId: newInst.id,
          applicationType: appType,
          preferredDate,
          inspectionLocation: legacyLocationString,
          businessPremiseId: selectedPremiseId,
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


  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 pb-20 text-[#003943]">
      <div className="space-y-8 animate-in fade-in duration-150">
        <div className="space-y-1">
          <Link to="/business" className="inline-flex items-center gap-1 text-xs text-[#003943]/60 hover:text-[#003943] transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="block pt-1"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00959C]">
            INSTRUMENT REGISTRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#003943]">
            Manual Instrument Registration
          </h1>
          <p className="text-xs sm:text-sm text-[#003943]/70 font-medium">
            Fill out the mandatory Legal Metrology specifications in the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
            {/* SECTION 1: INSTRUMENT & TECHNICAL SPECIFICATIONS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-6">
              <div className="pb-3 border-b border-[#003943]/10 flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#00959C]" />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#003943]">
                  1. Instrument & Technical Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Row 1: Category & Quantity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Category / Instrument Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.quantity && <p className="text-red-500 text-[10px] mt-1">{errors.quantity}</p>}
                </div>

                {/* Row 2: Manufacturer & Model */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Manufacturer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g. Avery India Ltd / Essae-Teraoka"
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.manufacturer && <p className="text-red-500 text-[10px] mt-1">{errors.manufacturer}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Model Name / Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. WB-60T-PRO"
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.model && <p className="text-red-500 text-[10px] mt-1">{errors.model}</p>}
                </div>

                {/* Row 3: Serial Number & Model Approval No */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. AV-984210-IN"
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.serialNumber && <p className="text-red-500 text-[10px] mt-1">{errors.serialNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Model Approval No.
                  </label>
                  <input
                    type="text"
                    name="modelApprovalNo"
                    value={formData.modelApprovalNo}
                    onChange={handleChange}
                    placeholder="e.g. IND/09/2021/442"
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.modelApprovalNo && <p className="text-red-500 text-[10px] mt-1">{errors.modelApprovalNo}</p>}
                </div>

                {/* Row 4: Max Capacity & Min Capacity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Max Capacity / Range <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    placeholder="e.g. 60,000"
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.maxCapacity && <p className="text-red-500 text-[10px] mt-1">{errors.maxCapacity}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Min Capacity / Range
                  </label>
                  <input
                    type="text"
                    name="minCapacity"
                    value={formData.minCapacity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.minCapacity && <p className="text-red-500 text-[10px] mt-1">{errors.minCapacity}</p>}
                </div>

                {/* Row 5: Unit of Measurement & Scale Interval */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Unit of Measurement <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unitOfMeasurement"
                    value={formData.unitOfMeasurement}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Verification Scale Interval (e) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="scaleInterval"
                    value={formData.scaleInterval}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 1 g, 10 g, 0.5 g, 10 kg"
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                  />
                  {errors.scaleInterval && <p className="text-red-500 text-[10px] mt-1">{errors.scaleInterval}</p>}
                  <p className="text-[11px] text-[#003943]/60">
                    Required under OIML R76 & Legal Metrology Rules, 2011 to calculate Maximum Permissible Error (MPE).
                  </p>
                </div>

                {/* Row 6: Accuracy Class */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Accuracy Class (Rules 2011)
                  </label>
                  <select
                    name="accuracyClass"
                    value={formData.accuracyClass}
                    onChange={handleChange}
                    className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-6">
              <div className="pb-3 border-b border-[#003943]/10 flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#00959C]" />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#003943]">
                  2. Premises & Installation Details
                </h3>
              </div>
              
              {loadingPremises ? (
                <div className="text-sm text-[#003943]/70">Loading your premises...</div>
              ) : premises.length === 0 ? (
                <div className="bg-orange-50 text-orange-800 p-5 rounded-xl text-sm font-semibold border border-orange-200">
                  <p className="mb-3">You have no active premises registered.</p>
                  <Link to="/business/premises" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-block">
                    Register a Premise
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5 md:col-span-2">
                    
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                          Select Installation Premise <span className="text-red-500">*</span>
                        </label>
                        <Link 
                          to="/business/premises"
                          state={{ returnTo: '/business/register' }}
                          className="text-xs text-[#00959C] font-semibold hover:underline bg-[#00959C]/10 px-2 py-1 rounded"
                        >
                          + Create a Premise
                        </Link>
                      </div>

                    <select
                      value={selectedPremiseId}
                      onChange={(e) => { setSelectedPremiseId(e.target.value); if (errors.premise) setErrors({...errors, premise: ''}); }}
                      required
                      className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
                    >
                      <option value="">-- Choose an active premise --</option>
                      {premises.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.premises_name} - {p.address_line_1}, {p.district?.name}, {p.state?.name}
                        </option>
                      ))}
                    </select>
                    {errors.premise && <p className="text-red-500 text-[10px] mt-1">{errors.premise}</p>}
                  </div>
                  
                  {selectedPremiseId && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-[#003943] mb-1">
                        {premises.find(p => p.id === selectedPremiseId)?.premises_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {premises.find(p => p.id === selectedPremiseId)?.address_line_1}<br/>
                        {premises.find(p => p.id === selectedPremiseId)?.district?.name}, {premises.find(p => p.id === selectedPremiseId)?.state?.name} {premises.find(p => p.id === selectedPremiseId)?.pincode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

              {/* SECTION 3: VERIFICATION TYPE & LEGAL APPROVAL DETAILS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#003943]/15 shadow-md space-y-6">
              <div className="pb-3 border-b border-[#003943]/10 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00959C]" />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#003943]">
                  3. Verification & Legal Approval Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                    Verification Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        formData.verificationType === 'Initial Verification'
                          ? 'border-[#00959C] bg-[#003943] text-white shadow-xs'
                          : 'border-[#003943]/20 bg-[#FDF9F6] text-[#003943]'
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
                          ? 'border-[#00959C] bg-[#003943] text-white shadow-xs'
                          : 'border-[#003943]/20 bg-[#FDF9F6] text-[#003943]'
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                      Previous Certificate No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="previousCertificateNo"
                      value={formData.previousCertificateNo}
                      onChange={handleChange}
                      placeholder="e.g. CERT-2025-8891"
                      required
                      className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#003943] focus:outline-none focus:border-[#00959C]"
                    />
                  {errors.previousCertificateNo && <p className="text-red-500 text-[10px] mt-1">{errors.previousCertificateNo}</p>}
                  </div>
                ) : (
                  <div className="space-y-1.5 opacity-50 select-none">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/60">
                      Previous Certificate No.
                    </label>
                    <div className="w-full bg-[#FDF9F6] border border-[#003943]/10 rounded-xl px-4 py-3 text-xs font-medium text-[#003943]/60 italic flex items-center justify-between">
                      <span>Not required for Initial Verification</span>
                      <span className="text-[10px] font-bold uppercase bg-[#003943]/10 px-2 py-0.5 rounded">Initial</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Verification Application Details */}
              <div className="pt-2">
                <div className="flex items-center gap-3 border-b border-[#003943]/10 pb-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#E0F5F6] flex items-center justify-center text-[#00959C]">
                    <span className="font-extrabold text-sm">4</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#003943]">Verification Application Details</h2>
                    <p className="text-xs text-[#003943]/70 font-medium">Schedule the verification for this instrument</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                      Application Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appType}
                      onChange={(e) => setAppType(e.target.value)}
                      required
                      className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#003943] focus:outline-none focus:border-[#00959C]"
                    >
                      <option value="Initial Verification (New Instrument)">Initial Verification (New Instrument)</option>
                      <option value="Periodic Re-verification (Annual)">Periodic Re-verification (Annual)</option>
                      <option value="Re-verification After Stamping/Repair">Re-verification After Stamping/Repair</option>
                      <option value="Emergency Field Calibration">Emergency Field Calibration</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                      Preferred Inspection Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => { setPreferredDate(e.target.value); if (errors.preferredDate) setErrors({...errors, preferredDate: ''}); }}
                      required
                      className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#003943] focus:outline-none focus:border-[#00959C]"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                      Inspection Notes / Special Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Provide site access instructions, contact person phone number, or required test weight equipment details..."
                      className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#003943] focus:outline-none focus:border-[#00959C]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#E0F5F6] rounded-2xl border border-[#00959C]/30 text-xs text-[#003943] flex items-center gap-3">
                <Info className="w-5 h-5 text-[#00959C] shrink-0" />
                <span className="font-bold text-[#003943]">
                  Submitting this form will register your instrument and officially file the verification application with the Legal Metrology department.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#003943]/10">
                <Link
                  to="/business"
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#003943] font-bold text-xs sm:text-sm transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-7 py-3.5 rounded-full bg-[#003943] hover:bg-[#002B33] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 group"
                >
                  <span>{submitLoading ? 'Submitting Application...' : 'Submit Complete Registration'}</span>
                  <CheckCircle className="w-4 h-4 text-[#02B7BF] group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
};




