import {id,now,appendHotRecord,sanitizeSearchLog} from './db'; import {bnNorm} from './search'; import {dhakaDay} from './analytics';
// ---- Privacy-safe search analytics (Wave 2, 2026-10-09) ----
// Every non-empty search appends ONE small record to the per-record hot collection
// bk_search_logs: {id, term (Bengali-normalized), resultCount, day (Asia/Dhaka), createdAt}.
// NOTHING identifying is stored — no user id, no session, no IP — so the admin insights
// built on top can only ever answer "what do people look for / not find", never "who".
// Volume control: empty terms are skipped, bot user-agents are skipped by the callers
// (isBotUA), and the collection is hard-capped at SEARCH_LOG_CAP newest records — the
// trim is opportunistic inside appendHotRecord (single-doc write; overflow deleted in
// bounded batches — same bounded-retention pattern as purgeOldIpLogs).
export const SEARCH_LOG_CAP=2000;
export async function logSearch(rawTerm:any,resultCount:any):Promise<boolean>{ const term=bnNorm(rawTerm).slice(0,120); if(!term) return false; const rec=sanitizeSearchLog({id:id('sl'),term,resultCount,day:dhakaDay(),createdAt:now()}); if(!rec) return false; try{ await appendHotRecord('search_logs',rec); return true; }catch{ return false; } }
export type TermStat={term:string,count:number,zeroCount:number,lastDay:string,lastAt:string};
// Aggregate raw log rows (any source shape coerced through sanitizeSearchLog) over the
// last `days` Dhaka days. topTerms = most searched; zeroTerms = terms whose searches kept
// coming back empty — the content-gap signal shown on /admin/insights.
export function searchInsights(db:any,days=30){ const cut=dhakaDay(new Date(Date.now()-(days-1)*864e5)); const byTerm=new Map<string,TermStat>(); let total=0,zeroTotal=0; for(const raw of (db&&db.search_logs)||[]){ const r=sanitizeSearchLog(raw); if(!r||!r.day||r.day<cut) continue; total++; if(r.resultCount===0) zeroTotal++; let s=byTerm.get(r.term); if(!s){ s={term:r.term,count:0,zeroCount:0,lastDay:r.day,lastAt:r.createdAt}; byTerm.set(r.term,s); } s.count++; if(r.resultCount===0) s.zeroCount++; if(r.createdAt>s.lastAt){ s.lastAt=r.createdAt; s.lastDay=r.day; } }
 const all=Array.from(byTerm.values()); const topTerms=[...all].sort((a,b)=>b.count-a.count||b.lastAt.localeCompare(a.lastAt)); const zeroTerms=all.filter(s=>s.zeroCount>0).sort((a,b)=>b.zeroCount-a.zeroCount||b.lastAt.localeCompare(a.lastAt)); return {total,zeroTotal,topTerms,zeroTerms}; }
export function topSearchTerms(db:any,n=8,days=30):string[]{ return searchInsights(db,days).topTerms.slice(0,n).map(s=>s.term); }
