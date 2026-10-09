export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync} from '@/lib/db'; import {rateLimit,clientIp} from '@/lib/auth'; import {guideAnswer} from '@/lib/guide';
// AI Guide v1 (Wave 3): retrieval-only answers from site data (lib/guide). No LLM
// is called — even if a key exists in env it is intentionally unused in v1; the
// generative layer stays blocked on the owner's E1 decision. Rate-limited per IP.
export async function POST(req:Request){ if(!rateLimit('assistant:'+clientIp(req),20)) return NextResponse.json({error:'RATE_LIMIT',message:'অনেকগুলো প্রশ্ন হয়ে গেছে — একটু অপেক্ষা করে আবার জিজ্ঞেস করুন'},{status:429}); const b=await req.json().catch(()=>({})); const db=await readDBAsync(); return NextResponse.json(guideAnswer(db,String((b as any).q||''))); }
