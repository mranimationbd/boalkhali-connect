export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {getPublicStats} from '@/lib/analytics';
// PUBLIC visitor statistics (§49): aggregate counters ONLY — exactly {today, month, year, total}.
// No IPs, no logs, no user ids can ever leave through here. History starts when this system was
// deployed; nothing is seeded from the old pageview stats. Aggregates come through a 60s
// in-memory cache (lib/analytics.getPublicStats); on failure the public card hides itself.
export async function GET(){ try{ const data=await getPublicStats(); return NextResponse.json(data,{headers:{'cache-control':'public, max-age=60'}}); }catch{ return NextResponse.json({error:'STATS_UNAVAILABLE'},{status:500}); } }
