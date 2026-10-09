export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {cookies} from 'next/headers'; import {sanitize,id} from '@/lib/db'; import {currentUser} from '@/lib/auth'; import {parseUA,isBotUA,recordVisit} from '@/lib/analytics';
// Visit beacon → unique-visitor-per-day counter (lib/analytics.ts holds the full counting policy).
// The old pageview log (db.visits) is no longer appended to — the new system supersedes it and the
// historical rows stay readable on the admin analytics page. IP comes ONLY from platform proxy
// headers (never the body, never client-supplied identity). Everything here is fail-safe: any
// analytics error returns {ok:true} so a beacon can never break a page.
const dec=(s:string|null)=>{ if(!s) return null; try{return decodeURIComponent(s)}catch{return s} };
function clientIp(req:Request){ const x=(req.headers.get('x-forwarded-for')||'').split(',')[0].trim(); return (x||(req.headers.get('x-real-ip')||'').trim()).slice(0,64); }
export async function POST(req:Request){ const b=await req.json().catch(()=>null); if(!b||typeof b!=='object') return NextResponse.json({error:'INVALID_JSON'},{status:400}); const path=sanitize(b.path).slice(0,200); if(!path||path.length>120||!path.startsWith('/')||path.startsWith('/api/')) return NextResponse.json({error:'INVALID_PATH'},{status:400});
 let vid=''; try{ vid=cookies().get('bk_vid')?.value||''; }catch{} if(vid.length>80) vid=''; const newVid=vid?'':id('vid'); let counted=false;
 try{ if(!path.startsWith('/admin')&&!isBotUA(req.headers.get('user-agent')||'')){ let user:any=null; try{ if(cookies().get('sc_session')?.value) user=await currentUser(); }catch{} const {device,os,browser}=parseUA(req.headers.get('user-agent')||''); const country=dec(req.headers.get('x-vercel-ip-country')||req.headers.get('cf-ipcountry')); counted=await recordVisit({user,identity:user?('u:'+user.id):('v:'+(vid||newVid)),ip:clientIp(req),device,browser,os,country}); } }catch{ counted=false; }
 const res=NextResponse.json({ok:true,counted}); if(newVid) res.cookies.set('bk_vid',newVid,{httpOnly:true,sameSite:'lax',path:'/',maxAge:60*60*24*365}); return res; }
