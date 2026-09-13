import { describe, it, expect } from 'vitest';
import { URGENCY_RANK, isMoreUrgent, UrgencyLevel } from '../../src/utils/triageUtils';

describe('frontend triageUtils', () => {
  it('defines correct urgency rankings strictly increasing in danger', () => {
    expect(URGENCY_RANK.routine).toBeLessThan(URGENCY_RANK.consult_48h);
    expect(URGENCY_RANK.consult_48h).toBeLessThan(URGENCY_RANK.consult_24h);
    expect(URGENCY_RANK.consult_24h).toBeLessThan(URGENCY_RANK.emergency_immediate);
  });

  it('correctly compares higher vs lower urgency levels', () => {
    expect(isMoreUrgent('emergency_immediate', 'consult_24h')).toBe(true);
    expect(isMoreUrgent('emergency_immediate', 'routine')).toBe(true);
    expect(isMoreUrgent('consult_24h', 'consult_48h')).toBe(true);
    expect(isMoreUrgent('consult_48h', 'routine')).toBe(true);

    expect(isMoreUrgent('routine', 'emergency_immediate')).toBe(false);
    expect(isMoreUrgent('consult_24h', 'emergency_immediate')).toBe(false);
    expect(isMoreUrgent('routine', 'routine')).toBe(false);
  });

  it('handles undefined or unknown urgency levels gracefully', () => {
    expect(isMoreUrgent('emergency_immediate', undefined)).toBe(true);
    expect(isMoreUrgent(undefined, 'emergency_immediate')).toBe(false);
    expect(isMoreUrgent(undefined, undefined)).toBe(false);
    expect(isMoreUrgent('invalid' as any, 'routine')).toBe(false);
  });
});
