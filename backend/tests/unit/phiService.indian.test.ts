import { describe, it, expect, vi } from 'vitest';
import { containsPHI, anonymizeForAI } from '../../src/services/phiService';

// Mock DB interactions (not needed for pure redaction tests, but the module imports db)
vi.mock('../../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => Promise.resolve({ success: true })
    })
  }
}));

describe('PHI Service — Indian PII Patterns', () => {
  describe('Aadhaar Number Detection', () => {
    it('should detect Aadhaar formatted with spaces (4-4-4)', () => {
      expect(containsPHI('My Aadhaar is 1234 5678 9012')).toBe(true);
    });

    it('should detect Aadhaar formatted with hyphens (4-4-4)', () => {
      expect(containsPHI('Aadhaar: 1234-5678-9012')).toBe(true);
    });

    it('should redact space-grouped Aadhaar', () => {
      const result = anonymizeForAI('My Aadhaar is 1234 5678 9012, please update records.');
      expect(result).toContain('[AADHAAR REDACTED]');
      expect(result).not.toContain('1234 5678 9012');
    });

    it('should redact hyphen-grouped Aadhaar', () => {
      const result = anonymizeForAI('Card number 1234-5678-9012 on file.');
      expect(result).toContain('[AADHAAR REDACTED]');
      expect(result).not.toContain('1234-5678-9012');
    });

    it('should detect ungrouped Aadhaar with keyword "aadhaar"', () => {
      expect(containsPHI('My aadhaar number 123456789012')).toBe(true);
    });

    it('should detect ungrouped Aadhaar with keyword "uid"', () => {
      expect(containsPHI('UID: 123456789012')).toBe(true);
    });

    it('should detect ungrouped Aadhaar with keyword "aadhar" (common misspelling)', () => {
      expect(containsPHI('aadhar no. 123456789012')).toBe(true);
    });

    it('should redact ungrouped Aadhaar with keyword anchor', () => {
      const result = anonymizeForAI('Aadhaar number 123456789012 registered.');
      expect(result).toContain('[AADHAAR REDACTED]');
    });

    it('should NOT flag bare 12-digit number without keyword (intentional trade-off)', () => {
      // A bare 12-digit number could be a UPI transaction ID, timestamp, etc.
      // This is a known limitation documented in the code.
      const result = anonymizeForAI('Transaction ref 123456789012 completed.');
      // The ungrouped pattern should NOT match without a keyword
      // (but the grouped pattern also won't match since there are no separators)
      // Note: the 12-digit number may still be partially matched by other patterns
      // like the SSN pattern (first 9 digits). This test verifies the Aadhaar-specific
      // ungrouped pattern does not fire without a keyword.
      expect(result).not.toContain('[AADHAAR REDACTED]');
    });
  });

  describe('PAN Number Detection', () => {
    it('should detect PAN in standard format (ABCDE1234F)', () => {
      expect(containsPHI('PAN card ABCDE1234F for income tax.')).toBe(true);
    });

    it('should redact PAN number', () => {
      const result = anonymizeForAI('My PAN is BFGHI5678J please verify.');
      expect(result).toContain('[PAN REDACTED]');
      expect(result).not.toContain('BFGHI5678J');
    });

    it('should detect various valid PAN formats', () => {
      expect(containsPHI('AAAPA1234A')).toBe(true); // Company PAN
      expect(containsPHI('ZZZZZ9999Z')).toBe(true); // Edge case
    });

    it('should NOT match invalid PAN formats', () => {
      // Wrong pattern: 4 letters instead of 5
      const result = anonymizeForAI('Code ABCD1234F is not a PAN.');
      expect(result).not.toContain('[PAN REDACTED]');
    });
  });

  describe('Indian PIN Code Detection', () => {
    it('should detect major city PIN codes', () => {
      expect(containsPHI('Address PIN 110001 New Delhi.')).toBe(true); // New Delhi
      expect(containsPHI('Mumbai 400001 area.')).toBe(true);           // Mumbai
      expect(containsPHI('Bangalore 560001.')).toBe(true);             // Bangalore
    });

    it('should redact PIN code', () => {
      const result = anonymizeForAI('Deliver to PIN 110001 area.');
      expect(result).toContain('[PINCODE REDACTED]');
      expect(result).not.toContain('110001');
    });

    it('should NOT match PIN starting with 0', () => {
      // Indian PIN codes never start with 0
      const result = anonymizeForAI('Code 012345 is not a PIN.');
      expect(result).not.toContain('[PINCODE REDACTED]');
    });
  });

  describe('Combined Indian PII Strings', () => {
    it('should redact multiple Indian PII types in one string', () => {
      const input = 'Patient Aadhaar 1234 5678 9012, PAN ABCDE1234F, residing at PIN 400001.';
      const result = anonymizeForAI(input);
      expect(result).toContain('[AADHAAR REDACTED]');
      expect(result).toContain('[PAN REDACTED]');
      expect(result).toContain('[PINCODE REDACTED]');
      expect(result).not.toContain('1234 5678 9012');
      expect(result).not.toContain('ABCDE1234F');
      expect(result).not.toContain('400001');
    });

    it('should redact Indian PII alongside US PII', () => {
      const input = 'Patient email: test@hospital.in, Aadhaar 1234-5678-9012, SSN 123-45-6789.';
      const result = anonymizeForAI(input);
      expect(result).toContain('[EMAIL REDACTED]');
      expect(result).toContain('[AADHAAR REDACTED]');
      expect(result).toContain('[SSN REDACTED]');
    });

    it('should handle Indian phone number with +91', () => {
      // The existing phone pattern should catch this
      expect(containsPHI('Contact at +91 9876543210.')).toBe(true);
    });
  });
});
