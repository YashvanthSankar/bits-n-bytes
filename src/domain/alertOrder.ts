import type { Severity } from '../contracts/domain';
const rank: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1, UNKNOWN: 0 };
/** Urgency first, then publication time; stable IDs break equal-time ties. */
export function compareAlerts(a: { severity: Severity; publishedAt: number; id: string }, b: { severity: Severity; publishedAt: number; id: string }) {
  return rank[b.severity] - rank[a.severity] || b.publishedAt - a.publishedAt || a.id.localeCompare(b.id);
}
