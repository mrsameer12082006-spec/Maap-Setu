// shared/certificateSigning.ts

export const CERTIFICATE_VERSION = 'v2'; // Bumped for new canonicalization format

export interface CertificatePayload {
  id: string;
  application_id: string;
  instrument_id: string;
  certificate_number: string;
  instrument_type: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  capacity: string;
  accuracy_class: string;
  owner_name: string;
  owner_address: string;
  verification_authority: string;
  verification_officer: string;
  verification_date: string; // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
  seal_number: string;
  qr_code_token: string;
  issued_at: string; // ISO 8601 with ms (YYYY-MM-DDTHH:mm:ss.SSSZ)
}

/**
 * Generates the deterministic canonical string for signing using a strict 
 * length-prefixed format.
 * 
 * Format:
 * VERSION
 * NUM_FIELDS
 * name_len:name|type:val_len:value
 * 
 * type is 'S' for string, 'N' for null/undefined
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let maxDay = daysInMonth[month - 1];
  
  if (month === 2 && isLeapYear(year)) {
    maxDay = 29;
  }
  
  return day <= maxDay;
}

function normalizeDate(val: any): string {
  if (typeof val !== 'string') throw new Error(`Invalid date representation: not a string`);
  if (val === '') return ''; // Empty strings are explicitly distinct from NULL in payload
  
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error(`Invalid date format, expected YYYY-MM-DD: ${val}`);
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  
  if (!isValidCalendarDate(year, month, day)) {
    throw new Error(`Invalid calendar date: ${val}`);
  }
  
  return val; // Already strictly YYYY-MM-DD
}

function normalizeTimestamp(val: any): string {
  if (typeof val !== 'string') throw new Error(`Invalid timestamp representation: not a string`);
  if (val === '') return '';
  
  // Requires YYYY-MM-DDTHH:mm:ss.SSSZ or with timezone offset
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})(Z|[+-]\d{2}:?\d{2})$/);
  if (!match) throw new Error(`Invalid timestamp format: ${val}`);
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = parseInt(match[6], 10);
  
  if (!isValidCalendarDate(year, month, day)) {
    throw new Error(`Invalid calendar date in timestamp: ${val}`);
  }
  
  if (hour > 23 || minute > 59 || second > 59) {
    throw new Error(`Invalid time components in timestamp: ${val}`);
  }
  
  // Safe to parse natively now that shape and calendar limits are mathematically proven
  return new Date(val).toISOString(); // Output guarantees YYYY-MM-DDTHH:mm:ss.SSSZ
}

export function buildCertificatePayload(payload: CertificatePayload): string {
  // Use a fixed array of keys to guarantee order regardless of JS engine iteration
  const FIXED_KEYS: (keyof CertificatePayload)[] = [
    'accuracy_class',
    'application_id',
    'capacity',
    'certificate_number',
    'expiry_date',
    'id',
    'instrument_id',
    'instrument_type',
    'issued_at',
    'manufacturer',
    'model',
    'owner_address',
    'owner_name',
    'qr_code_token',
    'seal_number',
    'serial_number',
    'verification_authority',
    'verification_date',
    'verification_officer'
  ];
  
  let canonicalString = `${CERTIFICATE_VERSION}\n${FIXED_KEYS.length}\n`;
  
  for (const key of FIXED_KEYS) {
    let val = payload[key];
    
    // UUID normalization for consistency
    if (key.endsWith('_id') || key === 'id' || key === 'qr_code_token') {
      if (typeof val === 'string') val = val.toLowerCase();
    }
    
    // Date and Timestamp normalization
    if (val !== null && val !== undefined) {
      if (key === 'verification_date' || key === 'expiry_date') {
        val = normalizeDate(val);
      } else if (key === 'issued_at') {
        val = normalizeTimestamp(val);
      }
    }
    
    const keyStr = String(key);
    
    if (val === null || val === undefined) {
      canonicalString += `${keyStr.length}:${keyStr}|N:0:\n`;
    } else {
      const valStr = String(val);
      // We calculate byte length for safety against unicode multi-byte characters
      const byteLen = new TextEncoder().encode(valStr).length;
      canonicalString += `${keyStr.length}:${keyStr}|S:${byteLen}:${valStr}\n`;
    }
  }
  
  return canonicalString;
}

const encoder = new TextEncoder();

/**
 * Returns a CryptoKey from the raw HMAC hex or string secret
 */
async function getSigningKey(secret: string): Promise<CryptoKey> {
  const secretBytes = encoder.encode(secret);
  return await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
}

/**
 * Signs the canonical payload using HMAC-SHA256
 */
export async function signPayload(payloadString: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret);
  const data = encoder.encode(payloadString);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return buf2hex(signature);
}

/**
 * Generates the SHA-256 content hash of the canonical payload
 */
export async function hashPayload(payloadString: string): Promise<string> {
  const data = encoder.encode(payloadString);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(hash);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Supported in all edge runtimes without relying on experimental built-ins.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  
  if (aBuf.byteLength !== bBuf.byteLength) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < aBuf.byteLength; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  
  return result === 0;
}
