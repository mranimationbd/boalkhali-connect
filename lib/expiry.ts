// Listing expiry (Wave 1, 2026-10-09): computed ONLY from stored dates — records are
// never mutated, re-stated or deleted because a date passed. Public lists/search hide
// expired items; detail pages stay reachable by direct link with a clear মেয়াদোত্তীর্ণ
// notice. Accepts ISO datetimes, plain YYYY-MM-DD, and Bengali-digit dates
// (seed jobs store '২০২৬-09-25'). "Today" is the Asia/Dhaka calendar day.
const BN = '০১২৩৪৫৬৭৮৯';
export function dateOnly(s: any): string {
  if (!s) return '';
  const t = String(s).replace(/[০-৯]/g, (d) => String(BN.indexOf(d))).trim();
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  const dt = new Date(t);
  return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
}
export function todayStr(): string {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }); }
  catch { return new Date().toISOString().slice(0, 10); }
}
// Posts carry expiresAt (new, optional, set at create/edit); job posts and the legacy
// jobs collection carry deadline. Either one, when present and past, expires the item.
export function expiryOf(r: any): string {
  if (!r) return '';
  return dateOnly(r.expiresAt) || dateOnly(r.deadline);
}
export function isExpired(r: any): boolean {
  const e = expiryOf(r);
  return !!e && e < todayStr();
}
