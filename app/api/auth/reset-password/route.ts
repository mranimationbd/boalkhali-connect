export const dynamic='force-dynamic';
// Step 3 — set the new password. {resetToken,password} → {ok:true}.
// Token is single-use with 15-min expiry. On success the user's password is replaced
// (scrypt, same as registration), ALL sessions are revoked (must log in again), and
// every pending reset record for the user is cleared.
import {NextResponse} from 'next/server'; import {readDBAsync,mutateDBAsync,sanitize,now,audit} from '@/lib/db'; import {rateLimit,clientIp,hashPw} from '@/lib/auth';
export async function POST(req:Request){
  if(!rateLimit('rpw:'+clientIp(req),10,60000)) return NextResponse.json({error:'RATE_LIMIT'},{status:429});
  const b=await req.json().catch(()=>null); if(!b) return NextResponse.json({error:'INVALID_JSON'},{status:400});
  const token=String(b.resetToken||'').trim();
  const newPw=String(b['password']||'');
  if(!token) return NextResponse.json({error:'INVALID_TOKEN'},{status:400});
  if(newPw.length<6) return NextResponse.json({error:'PASSWORD_SHORT'},{status:400});
  if(newPw.length>128) return NextResponse.json({error:'PASSWORD_TOO_LONG'},{status:400});
  const out:any=await mutateDBAsync((d:any)=>{
    const rec=(d.password_resets||[]).find((r:any)=>r.verified&&!r.consumed&&r.resetToken===token);
    if(!rec) return {error:'INVALID_TOKEN'};
    if(!rec.resetExpiresAt||rec.resetExpiresAt<now()) return {error:'TOKEN_EXPIRED'};
    const u=(d.users||[]).find((x:any)=>x.id===rec.userId);
    if(!u) return {error:'INVALID_TOKEN'};
    u.passwordHash=hashPw(newPw); u.updatedAt=now();
    rec.consumed=true;
    d.password_resets=(d.password_resets||[]).filter((r:any)=>r.userId!==u.id);
    d.sessions=(d.sessions||[]).filter((s:any)=>s.userId!==u.id);
    audit(d,u.email,'PASSWORD_RESET_DONE',u.id,{});
    return {ok:true};
  });
  if(out.error) return NextResponse.json({error:out.error},{status:400});
  return NextResponse.json({ok:true});
}
