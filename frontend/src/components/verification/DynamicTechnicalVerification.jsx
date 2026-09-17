import React, { useState, useEffect } from 'react';
import { FileText, Fuel, Droplets, Scale, Gauge, Sparkles, AlertTriangle } from 'lucide-react';
import { calculateOimlMpe } from '../../utils/oimlMpeCalculator';

export const DynamicTechnicalVerification = ({
  instrumentName = '',
  applicationType = '',
  accuracyClass = '',
  scaleInterval = '',
  maxCapacity = '',
  onDataChange
}) => {
  const nameLower = instrumentName.toLowerCase();

  // Scale Interval (e) confirmed/entered by Officer
  const [confirmedScaleInterval, setConfirmedScaleInterval] = useState(scaleInterval || '');

  useEffect(() => {
    if (scaleInterval) {
      setConfirmedScaleInterval(scaleInterval);
    }
  }, [scaleInterval]);

  const getCounterClassLabel = (cls) => {
    const c = (cls || '').toUpperCase();
    if (c.includes('II') && !c.includes('III')) return 'Class II - High Accuracy';
    if (c.includes('I') && !c.includes('II') && !c.includes('III')) return 'Class I - Special Accuracy';
    if (c.includes('IV')) return 'Class IV - Ordinary Accuracy';
    return 'Class III - Medium Accuracy';
  };

  // Detect Instrument Category
  const isFuelDispenser = nameLower.includes('fuel') || nameLower.includes('dispens');
  const isFlowmeter = nameLower.includes('flowmeter') || nameLower.includes('liquid flow');
  const isCounterScale = nameLower.includes('counter scale') || nameLower.includes('retail');
  const isPrePackaged = nameLower.includes('pre-packaged') || nameLower.includes('package');
  const isLabBalance = nameLower.includes('balance') || nameLower.includes('laboratory') || nameLower.includes('analytical');
  // Default: Weighbridge

  // State for Fuel Dispenser
  const [fuelProduct, setFuelProduct] = useState('Petrol');
  const [nozzleId, setNozzleId] = useState('NZ-01-PETROL');
  const [fuelZeroReset, setFuelZeroReset] = useState('0.000 L');
  const [dispensedVolume, setDispensedVolume] = useState('19.995 L');
  const [fuelMpeResult, setFuelMpeResult] = useState('PASS - Calculated Error -0.025% (MPE Limit: ±0.20%)');

  // State for Flowmeter
  const [flowRate, setFlowRate] = useState('498.5 L/min');
  const [referenceVolume, setReferenceVolume] = useState('1000.0 L');
  const [measuredVolume, setMeasuredVolume] = useState('999.2 L');
  const [flowmeterMpe, setFlowmeterMpe] = useState('PASS - Measurement Error -0.08% (Limit: ±0.15%)');

  // State for Counter Scale
  const [counterZero, setCounterZero] = useState('0.000 kg');
  const [counterHalf, setCounterHalf] = useState('15.000 kg');
  const [counterMax, setCounterMax] = useState('29.999 kg');

  // State for Pre-packaged Scale
  const [sample1, setSample1] = useState('1.002');
  const [sample2, setSample2] = useState('0.998');
  const [sample3, setSample3] = useState('1.001');

  // State for Lab Balance
  const [obsMass, setObsMass] = useState('100.0002 g');

  // State for Weighbridge (Default)
  const [wbZero, setWbZero] = useState('0.0 kg');
  const [wbHalf, setWbHalf] = useState('29,998.5 kg');
  const [wbMax, setWbMax] = useState('59,994.0 kg');

  // Dynamic OIML R76 / Legal Metrology MPE Calculations
  const counterMpeCalculation = calculateOimlMpe({
    accuracyClass: accuracyClass || 'Class II',
    scaleIntervalStr: confirmedScaleInterval,
    testLoadStr: '30 kg',
    observedReadingStr: counterMax,
    applicationType
  });

  const wbMpeCalculation = calculateOimlMpe({
    accuracyClass: accuracyClass || 'Class III',
    scaleIntervalStr: confirmedScaleInterval,
    testLoadStr: '60000 kg',
    observedReadingStr: wbMax,
    applicationType
  });

  const labMpeCalculation = calculateOimlMpe({
    accuracyClass: accuracyClass || 'Class I',
    scaleIntervalStr: confirmedScaleInterval || '0.001 g',
    testLoadStr: '100 g',
    observedReadingStr: obsMass,
    applicationType
  });

  // Expose state up to parent via onDataChange
  useEffect(() => {
    if (!onDataChange) return;

    if (isFuelDispenser) {
      onDataChange({
        category: 'fuel_dispenser',
        fuelProduct,
        nozzleId,
        fuelZeroReset,
        dispensedVolume,
        fuelMpeResult
      });
    } else if (isFlowmeter) {
      onDataChange({
        category: 'flowmeter',
        flowRate,
        referenceVolume,
        measuredVolume,
        flowmeterMpe
      });
    } else if (isCounterScale) {
      const isCalculated = counterMpeCalculation.valid;
      const counterMpeStr = isCalculated
        ? `${counterMpeCalculation.result} - Error ${counterMpeCalculation.observedErrorFormatted} within ${counterMpeCalculation.mpeLimitFormatted} (${counterMpeCalculation.accuracyClass})`
        : 'PENDING - Verification Scale Interval (e) required for regulatory MPE derivation';

      onDataChange({
        category: 'retail_scale',
        counterZero,
        counterHalf,
        counterMax,
        counterMpe: counterMpeStr,
        // Explainable structured regulatory audit data
        accuracyClass: counterMpeCalculation.accuracyClass || accuracyClass || 'Class II',
        verificationStage: counterMpeCalculation.verificationStage || 'INITIAL_VERIFICATION',
        verificationStageLabel: counterMpeCalculation.verificationStageLabel || 'Initial Verification',
        verificationScaleInterval: counterMpeCalculation.verificationScaleInterval || confirmedScaleInterval || 'Missing (e)',
        testedLoad: counterMpeCalculation.testLoad || '30 kg',
        testedLoadInE: counterMpeCalculation.loadInE || null,
        bracket: counterMpeCalculation.bracket || null,
        baseMpeMultiplier: counterMpeCalculation.baseMpeMultiplier || null,
        stageMultiplier: counterMpeCalculation.stageMultiplier || 1,
        effectiveMpeMultiplier: counterMpeCalculation.effectiveMpeMultiplier || null,
        mpeMultiplier: counterMpeCalculation.effectiveMpeMultiplier || null,
        mpeLimit: counterMpeCalculation.mpeLimit || 'Required (e)',
        observedError: counterMpeCalculation.observedError || null,
        mpeCompliance: isCalculated ? counterMpeCalculation.mpeCompliance : 'PENDING',
        mpeExplanation: counterMpeCalculation.explanation || counterMpeCalculation.error,
        mpeRuleReference: counterMpeCalculation.mpeRuleReference || 'OIML R76-1 / LM Rules 2011'
      });
    } else if (isPrePackaged) {
      const s1 = parseFloat(sample1) || 0;
      const s2 = parseFloat(sample2) || 0;
      const s3 = parseFloat(sample3) || 0;
      const avg = ((s1 + s2 + s3) / 3).toFixed(4);
      onDataChange({
        category: 'package_scale',
        sample1,
        sample2,
        sample3,
        calculatedAverage: `${avg} kg`
      });
    } else if (isLabBalance) {
      const isCalculated = labMpeCalculation.valid;
      const labMpeStr = isCalculated
        ? `${labMpeCalculation.result} - Error ${labMpeCalculation.observedErrorFormatted} within ${labMpeCalculation.mpeLimitFormatted} (${labMpeCalculation.accuracyClass})`
        : 'PENDING - Verification Scale Interval (e) required';

      onDataChange({
        category: 'lab_balance',
        obsMass,
        labMpe: labMpeStr,
        accuracyClass: labMpeCalculation.accuracyClass || accuracyClass || 'Class I',
        verificationScaleInterval: labMpeCalculation.verificationScaleInterval || confirmedScaleInterval || '0.001 g',
        testedLoad: labMpeCalculation.testLoad || '100 g',
        testedLoadInE: labMpeCalculation.loadInE || null,
        mpeBracket: labMpeCalculation.bracket || null,
        mpeMultiplier: labMpeCalculation.mpeMultiplier || null,
        mpeLimit: labMpeCalculation.mpeLimitFormatted || null,
        observedError: labMpeCalculation.observedErrorFormatted || null,
        mpeCompliance: isCalculated ? labMpeCalculation.result : 'PENDING',
        mpeExplanation: labMpeCalculation.explanation || labMpeCalculation.error,
        mpeRuleReference: 'OIML R76-1 Table 6 / LM Rules 2011 Table 20'
      });
    } else {
      // Default: Weighbridge
      const isCalculated = wbMpeCalculation.valid;
      const wbMpeStr = isCalculated
        ? `${wbMpeCalculation.result} - Error ${wbMpeCalculation.observedErrorFormatted} within ${wbMpeCalculation.mpeLimitFormatted} (${wbMpeCalculation.accuracyClass})`
        : 'PENDING - Verification Scale Interval (e) required for regulatory MPE derivation';

      onDataChange({
        category: 'weighbridge',
        wbZero,
        wbHalf,
        wbMax,
        wbMpe: wbMpeStr,
        accuracyClass: wbMpeCalculation.accuracyClass || accuracyClass || 'Class III',
        verificationStage: wbMpeCalculation.verificationStage || 'INITIAL_VERIFICATION',
        verificationStageLabel: wbMpeCalculation.verificationStageLabel || 'Initial Verification',
        verificationScaleInterval: wbMpeCalculation.verificationScaleInterval || confirmedScaleInterval || 'Missing (e)',
        testedLoad: wbMpeCalculation.testLoad || '60,000 kg',
        testedLoadInE: wbMpeCalculation.loadInE || null,
        bracket: wbMpeCalculation.bracket || null,
        baseMpeMultiplier: wbMpeCalculation.baseMpeMultiplier || null,
        stageMultiplier: wbMpeCalculation.stageMultiplier || 1,
        effectiveMpeMultiplier: wbMpeCalculation.effectiveMpeMultiplier || null,
        mpeMultiplier: wbMpeCalculation.effectiveMpeMultiplier || null,
        mpeLimit: wbMpeCalculation.mpeLimit || 'Required (e)',
        observedError: wbMpeCalculation.observedError || null,
        mpeCompliance: isCalculated ? wbMpeCalculation.mpeCompliance : 'PENDING',
        mpeExplanation: wbMpeCalculation.explanation || wbMpeCalculation.error,
        mpeRuleReference: wbMpeCalculation.mpeRuleReference || 'OIML R76-1 / LM Rules 2011'
      });
    }
  }, [
    isFuelDispenser, isFlowmeter, isCounterScale, isPrePackaged, isLabBalance,
    fuelProduct, nozzleId, fuelZeroReset, dispensedVolume, fuelMpeResult,
    flowRate, referenceVolume, measuredVolume, flowmeterMpe,
    counterZero, counterHalf, counterMax, confirmedScaleInterval,
    counterMpeCalculation.valid, counterMpeCalculation.result, counterMpeCalculation.explanation,
    sample1, sample2, sample3,
    obsMass, labMpeCalculation.valid, labMpeCalculation.result,
    wbZero, wbHalf, wbMax, wbMpeCalculation.valid, wbMpeCalculation.result,
    accuracyClass, onDataChange
  ]);

  // Calculated average helper
  const calculateAverage = () => {
    const s1 = parseFloat(sample1) || 0;
    const s2 = parseFloat(sample2) || 0;
    const s3 = parseFloat(sample3) || 0;
    return ((s1 + s2 + s3) / 3).toFixed(4);
  };

  // 🔴 1. FUEL DISPENSING METER
  if (isFuelDispenser) {
    return (
      <div className="space-y-4 bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-700" />
            <span>2. Fuel Dispenser Volumetric Tests (Liquid Measuring System)</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase">
            Multi-Product Meter
          </span>
        </div>

        {/* Product & Nozzle Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-amber-200 text-xs">
          <div>
            <label className="block font-bold text-[#003943] mb-1">Product / Nozzle Selected</label>
            <select
              value={fuelProduct}
              onChange={(e) => {
                setFuelProduct(e.target.value);
                setNozzleId(e.target.value === 'Petrol' ? 'NZ-01-PETROL' : e.target.value === 'Diesel' ? 'NZ-02-DIESEL' : 'NZ-03-SPEED');
              }}
              className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-lg px-3 py-2 font-bold text-[#003943]"
            >
              <option value="Petrol">Petrol (MS - Motor Spirit)</option>
              <option value="Diesel">Diesel (HSD - High Speed Diesel)</option>
              <option value="Speed Petrol">Speed / Premium Petrol</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#003943] mb-1">Nozzle Identification ID</label>
            <input
              type="text"
              value={nozzleId}
              onChange={(e) => setNozzleId(e.target.value)}
              className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-lg px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>
        </div>

        {/* Volumetric Test Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Zero Reset Verification <span className="text-gray-500 font-normal">(Expected: 0.000 L)</span>
            </label>
            <input
              type="text"
              value={fuelZeroReset}
              onChange={(e) => setFuelZeroReset(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Standard Measure (20 L Prover Test)
            </label>
            <input
              type="text"
              value={dispensedVolume}
              onChange={(e) => setDispensedVolume(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
            />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-amber-300 text-xs font-bold text-amber-900 flex justify-between items-center">
          <span>Volumetric Permissible Limit: ±0.20% (±40 mL on 20 L)</span>
          <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
            {fuelMpeResult}
          </span>
        </div>
      </div>
    );
  }

  // 💧 2. INDUSTRIAL FLOWMETER
  if (isFlowmeter) {
    return (
      <div className="space-y-4 bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between border-b border-blue-200 pb-2">
          <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-700" />
            <span>2. Bulk Flowmeter Metering Accuracy Tests (Class 0.3)</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[10px] font-bold uppercase">
            Liquid Measurement
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">Operating Flow Rate</label>
            <input
              type="text"
              value={flowRate}
              onChange={(e) => setFlowRate(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">Reference Master Volume</label>
            <input
              type="text"
              value={referenceVolume}
              onChange={(e) => setReferenceVolume(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">Meter Indicated Volume</label>
            <input
              type="text"
              value={measuredVolume}
              onChange={(e) => setMeasuredVolume(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs font-bold text-[#003943] flex justify-between items-center">
          <span>Class 0.3 Accuracy Limit: ±0.15%</span>
          <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
            {flowmeterMpe}
          </span>
        </div>
      </div>
    );
  }

  // 🟡 3. PRE-PACKAGED QUANTITY CHECK SCALE
  if (isPrePackaged) {
    return (
      <div className="space-y-4 bg-yellow-50/60 p-4 sm:p-5 rounded-2xl border border-yellow-200">
        <div className="flex items-center justify-between border-b border-yellow-200 pb-2">
          <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
            <Scale className="w-5 h-5 text-yellow-800" />
            <span>2. Pre-packaged Quantity & Net Contents Check Tests</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-200 text-yellow-900 text-[10px] font-bold uppercase">
            Net Weight Check
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">Sample 1 Weight (kg)</label>
            <input
              type="text"
              value={sample1}
              onChange={(e) => setSample1(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">Sample 2 Weight (kg)</label>
            <input
              type="text"
              value={sample2}
              onChange={(e) => setSample2(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">Sample 3 Weight (kg)</label>
            <input
              type="text"
              value={sample3}
              onChange={(e) => setSample3(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2 font-mono font-bold text-[#003943]"
            />
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-yellow-200 text-xs font-bold text-[#003943] flex justify-between items-center">
          <span>Calculated Average Net Weight: {calculateAverage()} kg</span>
          <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
            PASS - Within ±1.5g Permissible Error
          </span>
        </div>
      </div>
    );
  }

  // 🟢 4. PRECISION LABORATORY ANALYTICAL BALANCE
  if (isLabBalance) {
    return (
      <div className="space-y-4 bg-teal-50/60 p-4 sm:p-5 rounded-2xl border border-teal-200">
        <div className="flex items-center justify-between border-b border-teal-200 pb-2">
          <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <span>2. Precision Laboratory Balance Calibration Tests (Class I)</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900 text-[10px] font-bold uppercase">
            Class I Analytical
          </span>
        </div>

        {/* Verification Scale Interval input */}
        <div className="bg-white p-3 rounded-xl border border-teal-200 text-xs">
          <label className="block font-bold text-[#003943] mb-1">
            Verification Scale Interval (e)
          </label>
          <input
            type="text"
            value={confirmedScaleInterval || '0.001 g'}
            onChange={(e) => setConfirmedScaleInterval(e.target.value)}
            placeholder="e.g. 0.001 g (1 mg)"
            className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-lg px-3 py-2 font-mono font-bold text-[#003943]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Standard Mass Check <span className="text-gray-500 font-normal">(Target: 100.0000 g)</span>
            </label>
            <input
              type="text"
              value={obsMass}
              onChange={(e) => setObsMass(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Linearity & Sensitivity Result
            </label>
            <input
              type="text"
              value={labMpeCalculation.valid ? `${labMpeCalculation.result} - Error ${labMpeCalculation.observedErrorFormatted} within ${labMpeCalculation.mpeLimitFormatted}` : 'PENDING'}
              readOnly
              className="w-full bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl px-3 py-2.5 font-mono font-bold"
            />
          </div>
        </div>

        {labMpeCalculation.valid && (
          <p className="text-[11px] text-[#003943]/70 italic bg-white p-2.5 rounded-lg border border-teal-200">
            {labMpeCalculation.explanation}
          </p>
        )}
      </div>
    );
  }

  // 🟢 5. RETAIL DIGITAL COUNTER SCALE
  if (isCounterScale) {
    return (
      <div className="space-y-4 bg-cyan-50/60 p-4 sm:p-5 rounded-2xl border border-cyan-200">
        <div className="flex items-center justify-between border-b border-cyan-200 pb-2">
          <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-700" />
            <span>2. Retail Counter Scale Technical Tests ({getCounterClassLabel(accuracyClass)})</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-200 text-cyan-900 text-[10px] font-bold uppercase">
            Commercial Counter Scale
          </span>
        </div>

        {/* 1. Scale Interval (e) Input */}
        <div className="bg-white p-3.5 rounded-xl border border-cyan-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#003943] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-700" />
              Verification Scale Interval (e)
              <span className="text-red-500 font-bold">*</span>
            </label>
            <span className="text-[10px] font-mono text-[#003943]/60">OIML R76 Parameter</span>
          </div>
          <input
            type="text"
            value={confirmedScaleInterval}
            onChange={(e) => setConfirmedScaleInterval(e.target.value)}
            placeholder="e.g. 1 g, 2 g, 0.5 g, 10 g"
            className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-lg px-3 py-2 font-mono font-bold text-[#003943] focus:border-[#00959C]"
          />
          {!confirmedScaleInterval ? (
            <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Scale Interval (e) not stored in instrument profile. Confirm from physical nameplate to calculate statutory MPE.
            </p>
          ) : (
            <p className="text-[10px] text-emerald-700 font-medium mt-1">
              ✓ Verification Scale Interval e = {confirmedScaleInterval} loaded for OIML R76 Table 6 derivation.
            </p>
          )}
        </div>

        {/* 2. Load Tests */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Zero Error Test <span className="text-gray-500 font-normal">(Expected: 0.000 kg)</span>
            </label>
            <input
              type="text"
              value={counterZero}
              onChange={(e) => setCounterZero(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Half Capacity Test <span className="text-gray-500 font-normal">(Std Wt: 15.000 kg)</span>
            </label>
            <input
              type="text"
              value={counterHalf}
              onChange={(e) => setCounterHalf(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#003943]">
              Max Capacity Eccentricity <span className="text-gray-500 font-normal">(Target: 30.000 kg)</span>
            </label>
            <input
              type="text"
              value={counterMax}
              onChange={(e) => setCounterMax(e.target.value)}
              className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
            />
          </div>
        </div>

        {/* 3. Explainable Regulatory MPE Audit Breakdown Card */}
        {counterMpeCalculation.valid ? (
          <div className="p-3.5 bg-white rounded-xl border border-cyan-300 shadow-2xs space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-cyan-100 pb-1.5">
              <span className="font-bold text-[#003943] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-cyan-700" />
                OIML R76-1 / LM Rules 2011 MPE Audit Breakdown
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-cyan-100 text-cyan-900">
                {counterMpeCalculation.verificationStageLabel || counterMpeCalculation.verificationStage}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${counterMpeCalculation.result === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {counterMpeCalculation.result}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">Tested Load (m)</span>
                <span className="font-mono font-bold text-[#003943]">
                  {counterMpeCalculation.testLoad} ({counterMpeCalculation.loadInE.toLocaleString()} e)
                </span>
              </div>
              <div>
                <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">OIML Bracket</span>
                <span className="font-mono font-bold text-[#003943]">{counterMpeCalculation.bracket}</span>
              </div>
              <div>
                <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">Statutory Limit</span>
                <span className="font-mono font-bold text-[#00959C]">{counterMpeCalculation.mpeLimitFormatted}</span>
              </div>
              <div>
                <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">Observed Error</span>
                <span className={`font-mono font-bold ${counterMpeCalculation.isCompliant ? 'text-emerald-700' : 'text-red-700'}`}>
                  {counterMpeCalculation.observedErrorFormatted}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#003943]/70 italic border-t border-cyan-100 pt-1">
              {counterMpeCalculation.explanation}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{counterMpeCalculation.error}</span>
          </div>
        )}
      </div>
    );
  }

  // 🔵 6. HEAVY ELECTRONIC WEIGHBRIDGE (DEFAULT)
  return (
    <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="font-serif font-bold text-base text-[#003943] flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-600" />
          <span>2. Weighbridge Load & Eccentricity Tests ({getCounterClassLabel(accuracyClass)})</span>
        </h4>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
          Heavy Industrial
        </span>
      </div>

      {/* Verification Scale Interval (e) Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#003943] flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-slate-700" />
            Verification Scale Interval (e)
            <span className="text-red-500 font-bold">*</span>
          </label>
          <span className="text-[10px] font-mono text-[#003943]/60">OIML R76 Parameter</span>
        </div>
        <input
          type="text"
          value={confirmedScaleInterval}
          onChange={(e) => setConfirmedScaleInterval(e.target.value)}
          placeholder="e.g. 10 kg, 20 kg, 5 kg"
          className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-lg px-3 py-2 font-mono font-bold text-[#003943] focus:border-[#00959C]"
        />
        {!confirmedScaleInterval && (
          <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Scale Interval (e) not stored in instrument profile. Enter e from nameplate (e.g., 10 kg) to calculate MPE.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="space-y-1">
          <label className="block font-bold text-[#003943]">
            Zero Tracking Test <span className="text-gray-500 font-normal">(Expected: 0.0 kg)</span>
          </label>
          <input
            type="text"
            value={wbZero}
            onChange={(e) => setWbZero(e.target.value)}
            className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-bold text-[#003943]">
            Eccentricity Test (Corner Load) <span className="text-gray-500 font-normal">(Target: 30,000.0 kg)</span>
          </label>
          <input
            type="text"
            value={wbHalf}
            onChange={(e) => setWbHalf(e.target.value)}
            className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-bold text-[#003943]">
            Maximum Load MPE Check <span className="text-gray-500 font-normal">(Target: 60,000.0 kg)</span>
          </label>
          <input
            type="text"
            value={wbMax}
            onChange={(e) => setWbMax(e.target.value)}
            className="w-full bg-white border border-[#003943]/20 rounded-xl px-3 py-2.5 font-mono font-bold text-[#003943]"
          />
        </div>
      </div>

      {wbMpeCalculation.valid ? (
        <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-[#003943] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-slate-600" />
              OIML R76-1 / LM Rules 2011 Weighbridge MPE Audit
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-slate-200 text-slate-800">
              {wbMpeCalculation.verificationStageLabel || wbMpeCalculation.verificationStage}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${wbMpeCalculation.result === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {wbMpeCalculation.result}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">Tested Load (m)</span>
              <span className="font-mono font-bold text-[#003943]">
                {wbMpeCalculation.testLoad} ({wbMpeCalculation.loadInE.toLocaleString()} e)
              </span>
            </div>
            <div>
              <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">OIML Bracket</span>
              <span className="font-mono font-bold text-[#003943]">{wbMpeCalculation.bracket}</span>
            </div>
            <div>
              <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">Statutory Limit</span>
              <span className="font-mono font-bold text-[#00959C]">{wbMpeCalculation.mpeLimitFormatted}</span>
            </div>
            <div>
              <span className="text-[#003943]/50 block text-[9px] uppercase font-bold">Observed Error</span>
              <span className={`font-mono font-bold ${wbMpeCalculation.isCompliant ? 'text-emerald-700' : 'text-red-700'}`}>
                {wbMpeCalculation.observedErrorFormatted}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-[#003943]/70 italic border-t border-slate-100 pt-1">
            {wbMpeCalculation.explanation}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{wbMpeCalculation.error}</span>
        </div>
      )}
    </div>
  );
};
