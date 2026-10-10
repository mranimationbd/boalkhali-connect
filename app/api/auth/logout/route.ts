export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {cookies} from 'next/headers'; import {readDBAsync,writeDBAsync} from '@/lib/db';
async function clearSession(){ const sid=cookies().get('sc_session')?.value; if(sid){ try{ const db=await readDBAsync(); const n=db.sessions.length; db.sessions=db.sessions.filter((s:any)=>s.id!==sid); if(db.sessions.length!==n) await writeDBAsync(db); }catch{} } cookies().delete('sc_session'); }
export async function POST(){ await clearSession(); return NextResponse.json({ok:true}) }
// A browser navigation must never land on raw JSON (the old profile form POSTed here and
// stranded users on {"ok":true}): clear the session, then send them home with a 303.
export async function GET(req:Request){ await clearSession(); return NextResponse.redirect(new URL('/',req.url),303) }
