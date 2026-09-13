export type UrgencyLevel = 'routine' | 'consult_48h' | 'consult_24h' | 'emergency_immediate';

export const URGENCY_RANK: Record<UrgencyLevel, number> = {
  routine: 0,
  consult_48h: 1,
  consult_24h: 2,
  emergency_immediate: 3,
};

/**
 * Compares two urgency levels and returns true if level `a` has strictly higher urgency than `b`.
 * Unknown or undefined levels are assigned a sentinel rank of -1.
 */
export function isMoreUrgent(a?: UrgencyLevel | string, b?: UrgencyLevel | string): boolean {
  const rankA = a ? (URGENCY_RANK[a as UrgencyLevel] ?? -1) : -1;
  const rankB = b ? (URGENCY_RANK[b as UrgencyLevel] ?? -1) : -1;
  return rankA > rankB;
}
