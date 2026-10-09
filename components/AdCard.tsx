'use client'; import {useEffect,useRef} from 'react';
// Home sponsored card (Wave 1): fires ONE real impression beacon per mount to
// /api/ads/<id>/impression. The CTA, when the ad carries a valid http(s) destination,
// goes through /api/ads/<id>/click which counts the click and then 302-redirects.
export default function AdCard({ad}:{ad:any}){ const sent=useRef(false);
 useEffect(()=>{ if(sent.current) return; sent.current=true; try{ fetch('/api/ads/'+ad.id+'/impression',{method:'POST',keepalive:true}).catch(()=>{}); }catch{} },[ad.id]);
 return <div className="card !bg-emerald-900 text-white"><span className="chip bg-yellow-400 font-bold text-black">স্পনসরড</span><h3 className="mt-2 text-lg font-black">{ad.title}</h3><p className="text-sm opacity-80">{ad.body}</p>{ad.url&&<a href={'/api/ads/'+ad.id+'/click'} className="btn !bg-white !text-emerald-900 mt-3">বিস্তারিত দেখুন →</a>}</div> }
