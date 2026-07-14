import { describe, it, expect, vi } from 'vitest';
import { containsPHI, anonymizeForAI, prepareTextForAI } from '../../src/services/phiService';

// Mock DB interactions for prepareTextForAI
vi.mock('../../src/config/database', () => ({
  db: {
    insert: () => ({
      values: () => Promise.resolve({ success: true })
    })
  }
}));

describe('PHI Service Tests', () => {
  describe('containsPHI', () => {
    it('should detect email addresses', () => {
      expect(containsPHI('My email is test@example.com.')).toBe(true);
    });

    it('should detect phone numbers', () => {
      expect(containsPHI('Call me at (555) 123-4567.')).toBe(true);
      expect(containsPHI('Reach me at 555-123-4567.')).toBe(true);
    });

    it('should detect SSN', () => {
      expect(containsPHI('My SSN is 123-45-6789.')).toBe(true);
    });

    it('should detect dates of birth', () => {
      expect(containsPHI('Born on 10/12/1990.')).toBe(true);
      expect(containsPHI('Born on Dec 12, 1990.')).toBe(true);
    });

    it('should detect MRN', () => {
      expect(containsPHI('Patient MRN: A1234567.')).toBe(true);
    });

    it('should detect names', () => {
      expect(containsPHI('Hello Dr. House.')).toBe(true);
      expect(containsPHI('Patient John Doe is here.')).toBe(true);
    });

    it('should not flag non-PHI text', () => {
      expect(containsPHI('The patient took the medicine once a day.')).toBe(false);
    });
  });

  describe('anonymizeForAI', () => {
    it('should replace sensitive identifiers with redacted tokens', () => {
      const text = 'Patient John Doe (born 10/12/1990) can be reached at test@example.com.';
      const anonymized = anonymizeForAI(text);
      expect(anonymized).toContain('[NAME REDACTED]');
      expect(anonymized).toContain('[DATE REDACTED]');
      expect(anonymized).toContain('[EMAIL REDACTED]');
      expect(containsPHI(anonymized)).toBe(false);
    });
  });

  describe('prepareTextForAI', () => {
    it('should return unmodified clean text', async () => {
      const clean = 'No sensitive data here.';
      const processed = await prepareTextForAI(clean, 'user-123', 'session-123');
      expect(processed).toBe(clean);
    });

    it('should return anonymized text if PHI exists and write logs', async () => {
      const sensitive = 'Email me at support@example.com.';
      const processed = await prepareTextForAI(sensitive, 'user-123', 'session-123');
      expect(processed).toBe('Email me at [EMAIL REDACTED].');
    });
  });
});
