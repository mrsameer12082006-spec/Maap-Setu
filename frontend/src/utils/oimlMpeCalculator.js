/**
 * OIML R76-1 & Legal Metrology (General) Rules, 2011
 * Maximum Permissible Errors (MPE) Calculation Engine for Non-Automatic Weighing Instruments
 *
 * Official Legal Metrology Stage Standards:
 * 1. INITIAL VERIFICATION (OIML R76-1 Clause 3.5.1 / Table 6 & LM Rules 2011 Table 20):
 *    - Applies to new or imported instruments prior to initial commercial entry.
 *    - stageMultiplier = 1.0 (base MPE: ±0.5e, ±1.0e, ±1.5e).
 *
 * 2. SUBSEQUENT VERIFICATION / PERIODIC RE-VERIFICATION (OIML R76-1 Clause 8.4.1 / LM Rules 2011):
 *    - Applies to routine periodic re-stamping / re-verification or re-verification after repair/alteration.
 *    - Under Clause 8.4.1, tests and error limits are IDENTICAL to initial verification.
 *    - stageMultiplier = 1.0 (base MPE: ±0.5e, ±1.0e, ±1.5e).
 *
 * 3. IN-SERVICE INSPECTION / SURVEILLANCE (OIML R76-1 Clause 3.5.2 & Clause 8.4.2):
 *    - Applies to spot checks, enforcement inspections, and market surveillance of instruments in active trade use.
 *    - Under Clause 3.5.2 and 8.4.2, maximum permissible errors are TWICE the initial verification values.
 *    - stageMultiplier = 2.0 (in-service MPE: ±1.0e, ±2.0e, ±3.0e).
 */

export function parseUnitAndValue(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/[eE]\s*[:=]\s*/, '').trim();
  const match = cleaned.match(/^([\d.,]+)\s*([a-zA-Z]+)?$/);
  if (!match) return null;
  const val = parseFloat(match[1].replace(/,/g, ''));
  const unit = (match[2] || 'g').toLowerCase();
  return { value: val, unit };
}

export function toGrams(value, unit) {
  const u = (unit || 'g').toLowerCase();
  switch (u) {
    case 't':
    case 'tonne':
    case 'tonnes':
      return value * 1000000;
    case 'kg':
      return value * 1000;
    case 'g':
      return value;
    case 'mg':
      return value * 0.001;
    default:
      return value;
  }
}

export function formatMassFromGrams(grams) {
  if (Math.abs(grams) >= 1000000) return `${(grams / 1000000).toFixed(3)} t`;
  if (Math.abs(grams) >= 1000) return `${(grams / 1000).toFixed(3)} kg`;
  if (Math.abs(grams) >= 1) return `${grams.toFixed(grams % 1 === 0 ? 0 : 3)} g`;
  return `${(grams * 1000).toFixed(2)} mg`;
}

/**
 * Normalizes input stage or application_type string to explicit OIML R76 stage enum.
 */
export function normalizeVerificationStage(stageOrType) {
  const raw = String(stageOrType || '').trim().toLowerCase();

  // Explicit in-service surveillance / market inspection
  if (
    raw === 'in_service_inspection' ||
    raw === 'in-service inspection' ||
    raw === 'in service inspection' ||
    raw === 'inspection' ||
    raw === 'surveillance' ||
    raw.includes('in-service') ||
    raw.includes('in_service')
  ) {
    return 'IN_SERVICE_INSPECTION';
  }

  // Periodic re-verification or post-repair verification
  if (
    raw === 'subsequent_verification' ||
    raw === 'subsequent verification' ||
    raw === 'reverification' ||
    raw === 're-verification' ||
    raw.includes('periodic') ||
    raw.includes('re-verification') ||
    raw.includes('reverification') ||
    raw.includes('repair')
  ) {
    return 'SUBSEQUENT_VERIFICATION';
  }

  // Default: Initial Verification
  return 'INITIAL_VERIFICATION';
}

/**
 * Calculates statutory MPE and evaluates compliance against an observed reading.
 *
 * @param {Object} params
 * @param {string} params.accuracyClass - e.g. 'Class I', 'Class II', 'Class III', 'Class IV'
 * @param {string} params.scaleIntervalStr - e.g. '1 g', '10 kg', '0.5 g'
 * @param {string} params.testLoadStr - e.g. '30 kg', '15 kg', '60000 kg'
 * @param {string} params.observedReadingStr - e.g. '29.999 kg'
 * @param {string} params.applicationType - e.g. 'Initial Verification', 'Periodic Re-verification'
 * @param {string} [params.verificationStage] - Optional explicit override enum ('INITIAL_VERIFICATION', 'SUBSEQUENT_VERIFICATION', 'IN_SERVICE_INSPECTION')
 */
export function calculateOimlMpe({
  accuracyClass = 'Class III',
  scaleIntervalStr = '',
  testLoadStr = '',
  observedReadingStr = '',
  applicationType = 'initial',
  verificationStage: explicitStage = null
}) {
  const parsedE = parseUnitAndValue(scaleIntervalStr);
  if (!parsedE || isNaN(parsedE.value) || parsedE.value <= 0) {
    return {
      valid: false,
      error: 'Verification Scale Interval (e) is required under OIML R76 / Legal Metrology Rules, 2011 to determine regulatory MPE.'
    };
  }

  const parsedLoad = parseUnitAndValue(testLoadStr);
  if (!parsedLoad || isNaN(parsedLoad.value) || parsedLoad.value < 0) {
    return {
      valid: false,
      error: 'Test load is required to calculate regulatory MPE.'
    };
  }

  const eInGrams = toGrams(parsedE.value, parsedE.unit);
  const loadInGrams = toGrams(parsedLoad.value, parsedLoad.unit);
  const n = eInGrams > 0 ? loadInGrams / eInGrams : 0; // Load in multiples of e

  // Determine stage enum and corresponding regulatory multiplier
  const stageEnum = explicitStage || normalizeVerificationStage(applicationType);

  let stageMultiplier = 1;
  let stageLabel = 'Initial Verification';
  let ruleCitation = 'OIML R76-1 Table 6 / LM Rules 2011 Table 20 (Initial Verification)';

  if (stageEnum === 'IN_SERVICE_INSPECTION') {
    stageMultiplier = 2;
    stageLabel = 'In-Service Inspection';
    ruleCitation = 'OIML R76-1 Clause 3.5.2 & 8.4.2 (In-Service Inspection: 2x MPE)';
  } else if (stageEnum === 'SUBSEQUENT_VERIFICATION') {
    stageMultiplier = 1;
    stageLabel = 'Subsequent Verification (Periodic Re-verification)';
    ruleCitation = 'OIML R76-1 Clause 8.4.1 / LM Rules 2011 (Subsequent Verification: 1x MPE)';
  }

  const clsUpper = (accuracyClass || '').toUpperCase();
  let normalizedClass = 'Class III';
  let baseK = 1.0;
  let bracket = '';

  if (clsUpper.includes('II') && !clsUpper.includes('III')) {
    normalizedClass = 'Class II';
    if (n <= 5000) {
      baseK = 0.5;
      bracket = '0 ≤ m ≤ 5,000 e';
    } else if (n <= 20000) {
      baseK = 1.0;
      bracket = '5,000 e < m ≤ 20,000 e';
    } else {
      baseK = 1.5;
      bracket = 'm > 20,000 e';
    }
  } else if (clsUpper.includes('I') && !clsUpper.includes('II') && !clsUpper.includes('III')) {
    normalizedClass = 'Class I';
    if (n <= 50000) {
      baseK = 0.5;
      bracket = '0 ≤ m ≤ 50,000 e';
    } else if (n <= 200000) {
      baseK = 1.0;
      bracket = '50,000 e < m ≤ 200,000 e';
    } else {
      baseK = 1.5;
      bracket = 'm > 200,000 e';
    }
  } else if (clsUpper.includes('IV')) {
    normalizedClass = 'Class IV';
    if (n <= 50) {
      baseK = 0.5;
      bracket = '0 ≤ m ≤ 50 e';
    } else if (n <= 200) {
      baseK = 1.0;
      bracket = '50 e < m ≤ 200 e';
    } else {
      baseK = 1.5;
      bracket = 'm > 200 e';
    }
  } else {
    // Class III (Medium Commercial)
    normalizedClass = 'Class III';
    if (n <= 500) {
      baseK = 0.5;
      bracket = '0 ≤ m ≤ 500 e';
    } else if (n <= 2000) {
      baseK = 1.0;
      bracket = '500 e < m ≤ 2,000 e';
    } else {
      baseK = 1.5;
      bracket = 'm > 2,000 e';
    }
  }

  // Effective multiplier: base k * stage multiplier
  const effectiveK = baseK * stageMultiplier;
  const mpeGramLimit = effectiveK * eInGrams;
  const mpeFormatted = `±${formatMassFromGrams(mpeGramLimit)} (±${effectiveK} e)`;

  let errorGrams = null;
  let errorFormatted = '—';
  let isCompliant = null;
  let result = 'PASS';

  if (observedReadingStr) {
    const parsedObs = parseUnitAndValue(observedReadingStr);
    if (parsedObs) {
      const obsInGrams = toGrams(parsedObs.value, parsedObs.unit);
      errorGrams = obsInGrams - loadInGrams;
      errorFormatted = `${errorGrams >= 0 ? '+' : ''}${formatMassFromGrams(errorGrams)}`;
      isCompliant = Math.abs(errorGrams) <= (mpeGramLimit + 0.00001);
      result = isCompliant ? 'PASS' : 'FAIL';
    }
  }

  const explanation = `${ruleCitation} [${normalizedClass} · ${stageLabel}]: At load ${parsedLoad.value} ${parsedLoad.unit} (${Math.round(n).toLocaleString()} e, ${bracket}), statutory MPE is ±${effectiveK} e (${formatMassFromGrams(mpeGramLimit)}). Observed error is ${errorFormatted} → ${result}.`;

  return {
    valid: true,
    accuracyClass: normalizedClass,
    verificationStage: stageEnum,
    verificationStageLabel: stageLabel,
    verificationScaleInterval: `${parsedE.value} ${parsedE.unit}`,
    scaleIntervalGrams: eInGrams,
    testLoad: `${parsedLoad.value} ${parsedLoad.unit}`,
    loadInE: Math.round(n),
    bracket,
    baseMpeMultiplier: baseK,
    stageMultiplier,
    effectiveMpeMultiplier: effectiveK,
    mpeLimit: mpeFormatted,
    mpeLimitGrams: mpeGramLimit,
    observedReading: observedReadingStr,
    observedError: errorFormatted,
    observedErrorGrams: errorGrams,
    mpeCompliance: result,
    result,
    explanation,
    mpeRuleReference: ruleCitation
  };
}
