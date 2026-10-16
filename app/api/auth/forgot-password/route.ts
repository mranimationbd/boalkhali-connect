export const dynamic='force-dynamic';
// Step 1 — request a reset code. {email} → always {ok:true} (no account enumeration).
// For DB-password accounts with SMTP configured: creates a 6-digit code record
// (SHA-256 stored, 15-min expiry) and emails it. Firebase accounts are flagged so the
// client can use the Firebase reset flow; without SMTP the client falls back to the
// admin-request path. Heavily rate-limited.
import {NextResponse} from 'next/server'; import crypto from 'crypto'; import {readDBAsync,mutateDBAsync,id,now,sanitize,audit} from '@/lib/db'; import {rateLimit,clientIp} from '@/lib/auth'; import {sendMail,mailerConfigured,sha256,resetCodeEmail} from '@/lib/mailer';
const CODE_TTL=15*60*1000;
export async function POST(req:Request){
  if(!rateLimit('fpw:'+clientIp(req),5,60000)) return NextResponse.json({error:'RATE_LIMIT'},{status:429});
  const b=await req.json().catch(()=>null); if(!b) return NextResponse.json({error:'INVALID_JSON'},{status:400});
  const email=sanitize(b.email||'').toLowerCase().trim();
  if(!email||!email.includes('@')) return NextResponse.json({error:'INVALID_EMAIL'},{status:400});
  const db=await readDBAsync();
  const u=db.users.find((x:any)=>String(x.email||'').toLowerCase()===email);
  // Always respond ok to avoid leaking which emails exist.
  if(!u||!u.email) return NextResponse.json({ok:true});
  if(u.firebaseUid) return NextResponse.json({ok:true,mode:'firebase',email:u.email});
  if(!u.passwordHash) return NextResponse.json({ok:true});
  if(!mailerConfigured(db)) return NextResponse.json({ok:true,mode:'no-smtp'});
  const code=String(crypto.randomInt(100000,999999));
  const rec={id:id('pr'),userId:u.id,email:u.email,codeHash:sha256(code),expiresAt:new Date(Date.now()+CODE_TTL).toISOString(),attempts:0,used:false,verified:false,resetToken:'',createdAt:now()};
  await mutateDBAsync((d:any)=>{ d.password_resets=(d.password_resets||[]).filter((r:any)=>r.userId!==u.id||r.used); d.password_resets.unshift(rec); audit(d,'system','PASSWORD_RESET_CODE_SENT',u.id,{}); });
  const site=String(db.settings.siteName||'বোয়ালখালী কানেক্ট');
  const {subject,text,html}=resetCodeEmail(site,code);
  const out=await sendMail(db,u.email,subject,text,html);
  if(out.error){ await mutateDBAsync((d:any)=>{ d.password_resets=(d.password_resets||[]).filter((r:any)=>r.id!==rec.id); }); return NextResponse.json({ok:true,mode:'send-failed'}); }
  return NextResponse.json({ok:true});
}
