// Ad truthfulness (Wave 1, 2026-10-09): counters are REAL — impressions increment via
// a client beacon, clicks via the /api/ads/<id>/click through-route — and both start at
// 0. An ad is served only inside its start/end window (missing date = unbounded) and
// only while not HIDDEN. Nothing here fabricates reach numbers.
import { dateOnly, todayStr } from './expiry';
export function adState(a: any): 'HIDDEN' | 'UPCOMING' | 'EXPIRED' | 'LIVE' {
  if (!a || a.status === 'HIDDEN') return 'HIDDEN';
  const t = todayStr();
  const s = dateOnly(a.startDate), e = dateOnly(a.endDate);
  if (s && t < s) return 'UPCOMING';
  if (e && t > e) return 'EXPIRED';
  return 'LIVE';
}
export function isAdLive(a: any): boolean { return adState(a) === 'LIVE'; }
// Only absolute http(s) URLs may ever be a click target (no javascript:, no relatives).
export function adUrl(a: any): string {
  const u = String((a && (a.url || a.link)) || '').trim();
  return /^https?:\/\/\S+$/i.test(u) ? u : '';
}
