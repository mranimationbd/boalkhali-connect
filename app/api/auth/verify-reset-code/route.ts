export const dynamic='force-dynamic';
// Step 2 — verify the 6-digit code. {email,code} → {ok:true,resetToken} on success.
// Code is single-attempt-tracked (max 5 tries), 15-min expiry, single use. On success
// the code is consumed and a single-use reset token (15 min) is issued for step 3.
import {NextResponse} from 'next/server'; import crypto from 'crypto'; import {readDBAsync,mutateDBAsync,sanitize,now,audit} from '@/lib/db'; import {rateLimit,clientIp} from '@/lib/auth'; import {sha256} from '@/lib/mailer';
export async function POST(req:Request){
  if(!rateLimit('vpw:'+clientIp(req),10,60000)) return NextResponse.json({error:'RATE_LIMIT'},{status:429});
  const b=await req.json().catch(()=>null); if(!b) return NextResponse.json({error:'INVALID_JSON'},{status:400});
  const email=sanitize(b.email||'').toLowerCase().trim();
  const code=String(b.code||'').replace(/\D/g,'').slice(0,6);
  if(!email||code.length!==6) return NextResponse.json({error:'INVALID_CODE'},{status:400});
  const out:any=await mutateDBAsync((d:any)=>{
    const rec=(d.password_resets||[]).find((r:any)=>!r.used&&String(r.email||'').toLowerCase()===email);
    if(!rec) return {error:'INVALID_CODE'};
    if(rec.expiresAt<now()){ rec.used=true; return {error:'CODE_EXPIRED'}; }
    if((rec.attempts||0)>=5){ rec.used=true; audit(d,'system','PASSWORD_RESET_LOCKED',rec.userId,{}); return {error:'TOO_MANY_ATTEMPTS'}; }
    if(rec.codeHash!==sha256(code)){ rec.attempts=(rec.attempts||0)+1; return {error:'INVALID_CODE'}; }
    rec.used=true; rec.verified=true;
    rec.resetToken=crypto.randomBytes(32).toString('hex');
    rec.resetExpiresAt=new Date(Date.now()+15*60*1000).toISOString();
    audit(d,'system','PASSWORD_RESET_CODE_VERIFIED',rec.userId,{});
    return {ok:true,resetToken:rec.resetToken};
  });
  if(out.error) return NextResponse.json({error:out.error},{status:400});
  return NextResponse.json({ok:true,resetToken:out.resetToken});
}
