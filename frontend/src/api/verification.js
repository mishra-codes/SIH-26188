// ── Verification API Service ────────────────────────────────────
// Toggle mock mode here. When backend is ready, set USE_MOCK = false.
const USE_MOCK = true;
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// ── Mock responses ───────────────────────────────────────────────
const MOCK_CASES = [
  {
    status: 'CLEAR',
    risk_score: 11,
    document: {
      document_type: 'passport',
      passport_number: 'P8821034',
      name: 'SARAH ELENA WRIGHT',
      nationality: 'GBR',
      date_of_birth: '1988-07-22',
      date_of_expiry: '2031-07-21',
      issuing_country: 'United Kingdom',
      issuing_authority: 'HM Passport Office',
    },
    checks: {
      ocr: 'PASS',
      mrz: 'PASS',
      expiry: 'PASS',
      tampering: 'PASS',
      face: 'PASS',
      consistency: 'PASS',
    },
    reasons: ['All checks passed. Document appears authentic.'],
  },
  {
    status: 'REVIEW',
    risk_score: 72,
    document: {
      document_type: 'passport',
      passport_number: 'X1234567',
      name: 'JOHN ALEXANDER SMITH',
      nationality: 'USA',
      date_of_birth: '1999-04-12',
      date_of_expiry: '2030-06-14',
      issuing_country: 'United States',
      issuing_authority: 'U.S. Department of State',
    },
    checks: {
      ocr: 'PASS',
      mrz: 'PASS',
      expiry: 'PASS',
      tampering: 'SUSPICIOUS',
      face: 'PASS',
      consistency: 'PASS',
    },
    reasons: [
      'Localized image manipulation detected in photo region.',
      'Pixel-level inconsistency near MRZ border.',
    ],
  },
  {
    status: 'HIGH-RISK',
    risk_score: 91,
    document: {
      document_type: 'passport',
      passport_number: 'Z9988776',
      name: 'MARK JAMES LEE',
      nationality: 'KOR',
      date_of_birth: '1975-11-03',
      date_of_expiry: '2025-03-20',
      issuing_country: 'Republic of Korea',
      issuing_authority: 'Korea Immigration Service',
    },
    checks: {
      ocr: 'FAIL',
      mrz: 'FAIL',
      expiry: 'FAIL',
      tampering: 'SUSPICIOUS',
      face: 'FAIL',
      consistency: 'FAIL',
    },
    reasons: [
      'Document has expired (2025-03-20).',
      'MRZ check digit validation failed.',
      'Face verification: no match found.',
      'Extensive tampering indicators across multiple regions.',
      'Data field inconsistency: DOB does not match MRZ.',
    ],
  },
];

let mockIndex = 0;

// ── Helpers ──────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function normalizeMockDate(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function normalizeResponse(raw) {
  return {
    ...raw,
    document: {
      ...raw.document,
      date_of_birth_fmt: normalizeMockDate(raw.document?.date_of_birth),
      date_of_expiry_fmt: normalizeMockDate(raw.document?.date_of_expiry),
    },
  };
}

// ── API ──────────────────────────────────────────────────────────
/**
 * Submit a passport image for verification.
 * @param {File} file
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>} normalized verification result
 */
export async function verifyPassport(file, signal) {
  if (USE_MOCK) {
    await delay(2800);
    const result = MOCK_CASES[mockIndex % MOCK_CASES.length];
    mockIndex += 1;
    return normalizeResponse(result);
  }

  const body = new FormData();
  body.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      body,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('NETWORK_ERROR');
  }

  if (!response.ok) {
    if (response.status === 422) throw new Error('INVALID_FILE');
    if (response.status >= 500) throw new Error('SERVER_ERROR');
    throw new Error('API_ERROR');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('MALFORMED_RESPONSE');
  }

  if (!data.status || !data.document || !data.checks) {
    throw new Error('MISSING_FIELDS');
  }

  return normalizeResponse(data);
}

export { MOCK_CASES, USE_MOCK };
