// Image weight diet (A-09/B-06): the logo, 19 category icons and visit illustrations ship as
// cacheable files from these routes instead of megabyte data URIs inlined into every HTML page.
// The base64 source modules stay (server-side only now); clients reference URLs only.
import {NextResponse} from 'next/server';
export function bytesRes(dataUri:string,immutable=true){ const b64=dataUri.split(',')[1]||''; const type=dataUri.slice(5,dataUri.indexOf(';')); const buf=Buffer.from(b64,'base64'); return new NextResponse(buf,{headers:{'content-type':type||'image/png','cache-control':immutable?'public, max-age=31536000, immutable':'public, max-age=3600'}}); }
export function notFound(){ return NextResponse.json({error:'NOT_FOUND'},{status:404}); }
