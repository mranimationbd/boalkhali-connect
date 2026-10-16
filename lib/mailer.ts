// Email sending for Boalkhali Connect — password reset codes (and future transactional
// mail). Transport is nodemailer over admin-configured SMTP (db.settings: smtpHost,
// smtpPort, smtpUser, smtpPass, smtpFrom, smtpSecure). No credentials are ever logged.
// If SMTP is not configured, sendMail returns {error:'SMTP_NOT_CONFIGURED'} so callers
// can show an honest message instead of pretending a mail was sent.
import crypto from 'crypto';

export function smtpSettings(db: any) {
  const s = (db && db.settings) || {};
  return {
    host: String(s.smtpHost || '').trim(),
    port: Number(s.smtpPort) || 587,
    user: String(s.smtpUser || '').trim(),
    pass: String(s.smtpPass || ''),
    from: String(s.smtpFrom || '').trim() || String(s.smtpUser || '').trim(),
    secure: !!s.smtpSecure,
  };
}

export function mailerConfigured(db: any) {
  const c = smtpSettings(db);
  return !!(c.host && c.user && c.pass);
}

export async function sendMail(db: any, to: string, subject: string, text: string, html?: string): Promise<{ ok?: true; error?: string }> {
  const c = smtpSettings(db);
  if (!c.host || !c.user || !c.pass) return { error: 'SMTP_NOT_CONFIGURED' };
  if (!to || !to.includes('@')) return { error: 'INVALID_RECIPIENT' };
  try {
    const nodemailer: any = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: c.host,
      port: c.port,
      secure: c.secure || c.port === 465,
      auth: { user: c.user, pass: c.pass },
      tls: { minVersion: 'TLSv1.2' },
    });
    await transporter.sendMail({ from: c.from || c.user, to, subject, text, html: html || undefined });
    return { ok: true };
  } catch (e: any) {
    return { error: 'SEND_FAILED: ' + String(e && e.message ? e.message : e).slice(0, 120) };
  }
}

export function sha256(s: string) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

export function resetCodeEmail(siteName: string, code: string) {
  const subject = `${siteName} — পাসওয়ার্ড রিসেট কোড`;
  const text =
    `আসসালামু আলাইকুম,\n\nআপনার ${siteName} অ্যাকাউন্টের পাসওয়ার্ড রিসেটের জন্য ভেরিফিকেশন কোড:\n\n    ${code}\n\nএই কোড ১৫ মিনিটের জন্য কার্যকর। কোডটি কাউকে দেবেন না।\n\nআপনি এই অনুরোধ না করে থাকলে এই ইমেইল উপেক্ষা করুন।\n\n— ${siteName} টিম`;
  const html =
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px">` +
    `<h2 style="color:#065f46">🔐 পাসওয়ার্ড রিসেট কোড</h2>` +
    `<p>আপনার <b>${siteName}</b> অ্যাকাউন্টের পাসওয়ার্ড রিসেটের জন্য ভেরিফিকেশন কোড:</p>` +
    `<p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#065f46;text-align:center;background:#ecfdf5;padding:16px;border-radius:12px">${code}</p>` +
    `<p style="color:#6b7280;font-size:14px">এই কোড <b>১৫ মিনিটের</b> জন্য কার্যকর। কোডটি কাউকে দেবেন না। আপনি এই অনুরোধ না করে থাকলে এই ইমেইল উপেক্ষা করুন।</p>` +
    `<p style="color:#9ca3af;font-size:12px">— ${siteName} টিম</p></div>`;
  return { subject, text, html };
}
