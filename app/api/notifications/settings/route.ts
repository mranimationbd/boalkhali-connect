export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,writeDBAsync} from '@/lib/db'; import {currentUser} from '@/lib/auth';
const DEFAULT_PREFS={all:true,emergency:true,blood:true,newPosts:true};
const prefsOf=(u:any)=>({...DEFAULT_PREFS,...(u?.notifPrefs||{})});
export async function GET(){ const u=await currentUser(); if(!u) return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401}); return NextResponse.json({prefs:prefsOf(u)}); }
export async function POST(req:Request){ const u=await currentUser(); if(!u) return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401}); let b:any={}; try{ b=await req.json(); }catch{ return NextResponse.json({error:'INVALID_JSON'},{status:400}); } const prefs={all:!!b.all,emergency:!!b.emergency,blood:!!b.blood,newPosts:!!b.newPosts}; const db=await readDBAsync(); const rec=db.users.find((x:any)=>x.id===u.id); if(!rec) return NextResponse.json({error:'USER_NOT_FOUND'},{status:404}); rec.notifPrefs=prefs; await writeDBAsync(db); return NextResponse.json({ok:true,prefs}); }
