export const dynamic='force-dynamic';
import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';
import {mutateDBAsync,readDBAsync,uploadCounterBytes,UPLOAD_QUOTA_BYTES} from '@/lib/db';
import {saveImage,deleteImage} from '@/lib/imageStore';

const ALLOWED=['image/jpeg','image/png','image/webp'];
const MAX=5*1024*1024;
const keyOf=(url:string)=>String(url||'').split('/').pop()||'';

/* POST: upload + set profile picture (multipart form, field 'file') */
export async function POST(req:Request){
  const u=await currentUser();
  if(!u) return NextResponse.json({error:'LOGIN'},{status:401});
  let f:File|null=null;
  try{ const fd=await req.formData(); f=fd.get('file') as File; }catch{ return NextResponse.json({error:'NO_FILE'},{status:400}); }
  if(!f) return NextResponse.json({error:'NO_FILE'},{status:400});
  if(!ALLOWED.includes(f.type)) return NextResponse.json({error:'TYPE_NOT_ALLOWED_JPG_PNG_WEBP'},{status:400});
  if(f.size>MAX) return NextResponse.json({error:'MAX_5MB_PER_IMAGE'},{status:400});
  if(f.size===0) return NextResponse.json({error:'EMPTY_FILE'},{status:400});
  const db=await readDBAsync();
  const used=uploadCounterBytes(db);
  if(used+f.size>UPLOAD_QUOTA_BYTES) return NextResponse.json({error:'STORAGE_FULL'},{status:413});
  const ext=f.type==='image/png'?'png':f.type==='image/webp'?'webp':'jpg';
  const name=`avatar-${u.id}-${Date.now()}.${ext}`;
  await saveImage(name,Buffer.from(await f.arrayBuffer()),f.type);
  const url='/api/uploads/'+name;
  let old:string|null=null;
  await mutateDBAsync((d:any)=>{ const x=d.users.find((z:any)=>z.id===u.id); if(x){ old=x.avatar||null; x.avatar=url; } });
  if(old && old.startsWith('/api/uploads/')){ try{ await deleteImage(keyOf(old)); }catch{} }
  return NextResponse.json({ok:true,url});
}

/* DELETE: remove profile picture */
export async function DELETE(){
  const u=await currentUser();
  if(!u) return NextResponse.json({error:'LOGIN'},{status:401});
  let old:string|null=null;
  await mutateDBAsync((d:any)=>{ const x=d.users.find((z:any)=>z.id===u.id); if(x){ old=x.avatar||null; delete x.avatar; } });
  if(old && old.startsWith('/api/uploads/')){ try{ await deleteImage(keyOf(old)); }catch{} }
  return NextResponse.json({ok:true});
}
