export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,writeDBAsync,audit} from '@/lib/db'; import {requireRole} from '@/lib/auth';
const ASSIGNABLE=['CITIZEN','BUSINESS','SERVICE_PROVIDER','MODERATOR','ADMIN','SUPER_ADMIN'];
const OWNER_EMAIL='habiburrahman962540@gmail.com';
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const actor=(r as any).user; const b=await req.json(); const db=await readDBAsync(); const u=db.users.find((x:any)=>x.id===String(b.id||'')); if(!u) return NextResponse.json({error:'USER_NOT_FOUND'},{status:404});
 const isSelf=u.id===actor.id; const targetSuper=u.role==='SUPER_ADMIN'; const isOwner=String(u.email||'').toLowerCase()===OWNER_EMAIL;
 // সুরক্ষা: নিজেকে ব্লক/ডিলিট নয়; SUPER_ADMIN-কে শুধু SUPER_ADMIN-ই বদলাতে পারবে; মালিকের অ্যাকাউন্ট ডিলিট/ব্লক নয়
 if((b.action==='block'||b.action==='delete')&&isSelf) return NextResponse.json({error:'CANNOT_BLOCK_OR_DELETE_SELF'},{status:403});
 if(targetSuper&&actor.role!=='SUPER_ADMIN') return NextResponse.json({error:'CANNOT_MODIFY_SUPER_ADMIN'},{status:403});
 if(isOwner&&(b.action==='block'||b.action==='delete')) return NextResponse.json({error:'OWNER_PROTECTED'},{status:403});
 if(b.action==='role'){ const role=String(b.role||''); if(!ASSIGNABLE.includes(role)) return NextResponse.json({error:'INVALID_ROLE'},{status:400}); if(role==='SUPER_ADMIN'&&actor.role!=='SUPER_ADMIN') return NextResponse.json({error:'CANNOT_GRANT_SUPER_ADMIN'},{status:403}); const from=u.role; u.role=role; if(u.accountType!==undefined&&(role==='CITIZEN'||role==='BUSINESS'||role==='SERVICE_PROVIDER')) u.accountType=role; audit(db,actor.email,'USER_ROLE',u.id,{from,to:role}); }
 else if(b.action==='verify'){ u.verified=true; audit(db,actor.email,'USER_VERIFY',u.id); }
 else if(b.action==='unverify'){ u.verified=false; audit(db,actor.email,'USER_UNVERIFY',u.id); }
 else if(b.action==='block'){ u.blocked=true; db.sessions=db.sessions.filter((s:any)=>s.userId!==u.id); audit(db,actor.email,'USER_BLOCK',u.id,{email:u.email}); }
 else if(b.action==='unblock'){ u.blocked=false; audit(db,actor.email,'USER_UNBLOCK',u.id,{email:u.email}); }
 else if(b.action==='delete'){ const email=u.email; db.users=db.users.filter((x:any)=>x.id!==u.id); db.sessions=db.sessions.filter((s:any)=>s.userId!==u.id); audit(db,actor.email,'USER_DELETE',u.id,{email}); }
 else return NextResponse.json({error:'INVALID_ACTION'},{status:400});
 await writeDBAsync(db); return NextResponse.json({ok:true,id:u.id,role:u.role,verified:!!u.verified,blocked:!!u.blocked}) }
