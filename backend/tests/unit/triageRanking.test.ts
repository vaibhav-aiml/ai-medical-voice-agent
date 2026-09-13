import { describe, it, expect } from 'vitest';
import { URGENCY_RANK, isMoreUrgent, UrgencyLevel } from '../../src/services/triageService';

describe('URGENCY_RANK and isMoreUrgent', () => {
  it('should rank urgency levels in strict ascending order of severity', () => {
    expect(URGENCY_RANK['routine']).toBeLessThan(URGENCY_RANK['consult_48h']);
    expect(URGENCY_RANK['consult_48h']).toBeLessThan(URGENCY_RANK['consult_24h']);
    expect(URGENCY_RANK['consult_24h']).toBeLessThan(URGENCY_RANK['emergency_immediate']);
  });

  it('isMoreUrgent returns true when first argument has strictly higher rank', () => {
    expect(isMoreUrgent('emergency_immediate', 'consult_24h')).toBe(true);
    expect(isMoreUrgent('emergency_immediate', 'consult_48h')).toBe(true);
    expect(isMoreUrgent('emergency_immediate', 'routine')).toBe(true);

    expect(isMoreUrgent('consult_24h', 'consult_48h')).toBe(true);
    expect(isMoreUrgent('consult_24h', 'routine')).toBe(true);

    expect(isMoreUrgent('consult_48h', 'routine')).toBe(true);
  });

  it('isMoreUrgent returns false when first argument has lower rank', () => {
    expect(isMoreUrgent('routine', 'consult_48h')).toBe(false);
    expect(isMoreUrgent('routine', 'consult_24h')).toBe(false);
    expect(isMoreUrgent('routine', 'emergency_immediate')).toBe(false);

    expect(isMoreUrgent('consult_48h', 'consult_24h')).toBe(false);
    expect(isMoreUrgent('consult_48h', 'emergency_immediate')).toBe(false);

    expect(isMoreUrgent('consult_24h', 'emergency_immediate')).toBe(false);
  });

  it('isMoreUrgent returns false when both arguments are equal', () => {
    const levels: UrgencyLevel[] = ['routine', 'consult_48h', 'consult_24h', 'emergency_immediate'];
    for (const level of levels) {
      expect(isMoreUrgent(level, level)).toBe(false);
    }
  });

  it('handles unknown levels gracefully without throwing', () => {
    expect(isMoreUrgent('emergency_immediate', 'unknown_level' as any)).toBe(true);
    expect(isMoreUrgent('unknown_level' as any, 'routine')).toBe(false);
    expect(isMoreUrgent('unknown_level' as any, 'unknown_level' as any)).toBe(false);
  });
});
