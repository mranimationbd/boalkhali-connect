export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,mutateDBAsync} from '@/lib/db'; import {adUrl} from '@/lib/ads';
// Click-through (Wave 1): a click is counted ONLY when it actually sends the visitor
// to the advertiser's own destination. The target must be stored on the ad and be an
// absolute http(s) URL — anything else (missing, javascript:, relative) bounces home
// WITHOUT counting, so the click number can never be inflated by dead links.
export async function GET(req:Request,{params}:{params:{id:string}}){ const db=await readDBAsync(); const a=(db.advertisements||[]).find((x:any)=>x.id===params.id); const url=a?adUrl(a):''; if(!a||!url) return NextResponse.redirect(new URL('/',req.url));
 try{ await mutateDBAsync((d:any)=>{ const x=(d.advertisements||[]).find((y:any)=>y.id===params.id); if(x) x.clicks=(Number(x.clicks)||0)+1; }); }catch{ /* never trap the visitor behind a counter write */ }
 return NextResponse.redirect(url,302); }
