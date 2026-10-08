export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,writeDBAsync,sanitize,LOCATIONS} from '@/lib/db'; import {currentUser} from '@/lib/auth';
const BLOOD_GROUPS=['A+','A-','B+','B-','O+','O-','AB+','AB-']; const ROLES=['CITIZEN','BUSINESS','SERVICE_PROVIDER'];
export async function POST(req:Request){ const cu=await currentUser(); if(!cu) return NextResponse.json({error:'LOGIN'},{status:401}); const b=await req.json(); const db=await readDBAsync(); const u=db.users.find((x:any)=>x.id===cu.id); if(!u) return NextResponse.json({error:'NOT_FOUND'},{status:404});
 if(b.phone!==undefined){ const phone=sanitize(b.phone).replace(/[\s-]/g,''); if(!/^01[3-9]\d{8}$/.test(phone)) return NextResponse.json({error:'INVALID_PHONE'},{status:400}); if(db.users.find((x:any)=>x.phone===phone&&x.id!==u.id)) return NextResponse.json({error:'PHONE_EXISTS'},{status:409}); u.phone=phone; }
 if(b.area!==undefined){ if(!LOCATIONS.some((l:any)=>l.name===b.area)) return NextResponse.json({error:'AREA_REQUIRED'},{status:400}); u.area=b.area; }
 if(b.address!==undefined) u.address=sanitize(b.address);
 if(b.accountType!==undefined){ if(!ROLES.includes(String(b.accountType))) return NextResponse.json({error:'INVALID_ROLE'},{status:400}); u.accountType=b.accountType; if(u.role==='CITIZEN'||ROLES.includes(u.role)) u.role=b.accountType; }
 if(b.bloodGroup!==undefined){ if(b.bloodGroup&&!BLOOD_GROUPS.includes(b.bloodGroup)) return NextResponse.json({error:'INVALID_BLOOD_GROUP'},{status:400}); u.bloodGroup=b.bloodGroup; }
 await writeDBAsync(db); return NextResponse.json({ok:true,user:{id:u.id,name:u.name,email:u.email,phone:u.phone||'',area:u.area||'',address:u.address||'',accountType:u.accountType||u.role,bloodGroup:u.bloodGroup||''}}) }
