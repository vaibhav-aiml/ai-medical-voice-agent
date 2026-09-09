import { db } from '../config/database';
import { hipaaLogs } from '../db/schema/index';
import logger from '../utils/logger';

export interface PHIPattern {
  id: string;
  label: string;
  regex: RegExp;
}

/**
 * IMPORTANT: Regex-based PHI detection is best-effort, not a compliance guarantee.
 * These patterns use deterministic string matching and do NOT employ statistical NLP
 * or clinical Named Entity Recognition (NER). Unstructured identifiers, non-standard
 * formats, or identifiers embedded within longer strings may not be detected.
 * See README-HIPAA.md and README-DPDP.md for compliance context.
 */
export const PHI_PATTERNS: PHIPattern[] = [
  {
    id: 'email',
    label: '[EMAIL REDACTED]',
    regex: /\b[\w\.-]+@[\w\.-]+\.\w{2,}\b/gi
  },
  {
    // Aadhaar (ungrouped): 12 consecutive digits preceded by a contextual keyword.
    // MUST appear before the phone pattern to prevent the phone regex from consuming
    // the first 10 digits of a 12-digit Aadhaar number.
    // NOTE: We intentionally do NOT match bare 12-digit numbers without a keyword
    // anchor, because that would false-positive against UPI transaction IDs,
    // timestamps, and other long numeric sequences. Ungrouped Aadhaar numbers
    // without a preceding keyword will NOT be caught — this is an intentional
    // trade-off to avoid false positives. This is a known limitation of
    // regex-based PHI detection.
    id: 'aadhaar_ungrouped',
    label: '[AADHAAR REDACTED]',
    regex: /(?:aadhaa?r|uid|uidai)\s*(?:no\.?|number|num|#|:)?\s*\d{12}\b/gi
  },
  {
    id: 'phone',
    label: '[PHONE REDACTED]',
    regex: /\b(?:\+?\d{1,3}[ -.]?)?\(?\d{3}\)?[ -.]?\d{3}[ -.]?\d{4}\b/g
  },
  {
    id: 'ssn',
    label: '[SSN REDACTED]',
    regex: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g
  },
  {
    id: 'mrn',
    label: '[MRN REDACTED]',
    regex: /\b(?:MRN|Medical Record Number|Medical Record)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi
  },
  {
    id: 'insurance',
    label: '[INSURANCE REDACTED]',
    regex: /\b(?:Insurance|Policy|Beneficiary|Health Plan)\s*[:#]?\s*[A-Z0-9-]{6,20}\b/gi
  },
  {
    id: 'account',
    label: '[ACCOUNT REDACTED]',
    regex: /\b(?:Account|Acc)\s*[:#]?\s*[A-Z0-9-]{8,18}\b/gi
  },
  {
    id: 'license',
    label: '[LICENSE REDACTED]',
    regex: /\b(?:Driver\'s License|DL|License|Certificate)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi
  },
  {
    id: 'dob',
    label: '[DATE REDACTED]',
    regex: /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?,? \d{2,4}\b/gi
  },
  {
    id: 'zip',
    label: '[ZIP REDACTED]',
    regex: /\b\d{5}(?:-\d{4})?\b/g
  },
  {
    id: 'address',
    label: '[ADDRESS REDACTED]',
    regex: /\b\d+\s+[A-Za-z0-9\s.,#-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct|Circle|Cir)\b/gi
  },
  {
    id: 'ip',
    label: '[IP REDACTED]',
    regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g
  },
  {
    id: 'url',
    label: '[URL REDACTED]',
    regex: /\bhttps?:\/\/[^\s$.?#].[^\s]*\b/gi
  },
  {
    id: 'prescription',
    label: '[PRESCRIPTION REDACTED]',
    regex: /\b(?:Prescription|Rx|RxID)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi
  },
  {
    id: 'appointment',
    label: '[APPOINTMENT REDACTED]',
    regex: /\b(?:Appointment|Appt|ApptID)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi
  },
  {
    id: 'name',
    label: '[NAME REDACTED]',
    regex: /\b(?:Dr\.|Mr\.|Mrs\.|Ms\.)\s+[A-Z][a-z]+\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g
  },
  // --- Indian PII Patterns ---
  {
    // Aadhaar: 12-digit UID, commonly formatted as 4-4-4 with spaces or hyphens
    id: 'aadhaar_grouped',
    label: '[AADHAAR REDACTED]',
    regex: /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g
  },
  {
    // PAN: Permanent Account Number — format: 5 uppercase letters, 4 digits, 1 uppercase letter
    // Example: ABCDE1234F
    id: 'pan',
    label: '[PAN REDACTED]',
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g
  },
  {
    // Indian PIN code: 6-digit postal code. First digit is 1-9 (never 0).
    // NOTE: This may match other 6-digit numbers in non-address contexts.
    // Consider combining with address-context keywords for higher precision.
    id: 'indian_pincode',
    label: '[PINCODE REDACTED]',
    regex: /\b[1-9]\d{5}\b/g
  }
];

export function containsPHI(text: string): boolean {
  if (!text) return false;
  return PHI_PATTERNS.some(p => {
    const rx = new RegExp(p.regex);
    return rx.test(text);
  });
}

export function anonymizeForAI(text: string): string {
  if (!text) return text;
  let redacted = text;
  for (const p of PHI_PATTERNS) {
    const rx = new RegExp(p.regex);
    redacted = redacted.replace(rx, p.label);
  }
  return redacted;
}

export async function prepareTextForAI(
  text: string,
  userId: string,
  sessionId: string
): Promise<string> {
  if (!text) return text;
  
  const hasPHI = containsPHI(text);
  if (!hasPHI) {
    return text;
  }
  
  const redacted = anonymizeForAI(text);
  
  // Validation check: Re-verify that all PHI has been successfully redacted
  if (containsPHI(redacted)) {
    logger.error('PHI Redaction validation failed: text still contains identifiers after redaction', { userId, sessionId });
    throw new Error('PHI Redaction validation failed: sensitive information could not be fully anonymized.');
  }
  
  // Logs generated: Insert a record into hipaa_logs
  try {
    await db.insert(hipaaLogs).values({
      type: 'redaction',
      value: 'AI Provider request processed',
      accessReason: 'Automatic PHI redaction prior to external AI invocation',
      accessedBy: userId || 'system',
      timestamp: new Date(),
      extraData: { sessionId, originalLength: text.length, redactedLength: redacted.length }
    });
  } catch (err: any) {
    logger.error('Failed to write HIPAA redaction log to database', { error: err.message });
  }
  
  return redacted;
}

export const phiService = {
  containsPHI,
  anonymizeForAI,
  prepareTextForAI
};
