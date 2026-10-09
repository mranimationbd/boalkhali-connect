import Link from 'next/link'; import {notFound} from 'next/navigation'; import type {Metadata} from 'next'; import {Shell} from '@/components/ui'; import {PLACES,placeBySlug,placeThumb,placeMapsUrl,placeEmbedUrl} from '@/lib/places'; import {SITE_URL} from '@/lib/site'; import {MapPin,Navigation,ExternalLink,ArrowLeft} from 'lucide-react';
export const dynamicParams=false;
export function generateStaticParams(){ return PLACES.map(p=>({slug:p.slug})); }
export async function generateMetadata({params}:{params:{slug:string}}):Promise<Metadata>{ const p=placeBySlug(params.slug); if(!p) return {title:'স্থান পাওয়া যায়নি — বোয়ালখালী কানেক্ট'}; const t=placeThumb(p); const img=t.isIllustration?SITE_URL+t.src:t.src; return {title:p.nameBn+' — বোয়ালখালী কানেক্ট',description:p.detailBn.split('\n')[0].slice(0,160),openGraph:{title:p.nameBn,description:p.detailBn.split('\n')[0].slice(0,160),images:[{url:img,alt:p.nameBn}]}}; }
export default function PlacePage({params}:{params:{slug:string}}){ const p=placeBySlug(params.slug); if(!p) notFound(); const p2=p!; const thumb=placeThumb(p2); const paras=p2.detailBn.split('\n').filter(Boolean); const goParas=paras.filter(x=>x.startsWith('কীভাবে যাবেন')); const bodyParas=paras.filter(x=>!x.startsWith('কীভাবে যাবেন')); const ld={'@context':'https://schema.org','@type':'TouristAttraction',name:p2.nameBn,description:paras[0],address:{'@type':'PostalAddress',addressLocality:p2.area+(p2.insideBoalkhali?', বোয়ালখালী, চট্টগ্রাম':', চট্টগ্রাম')},...(p2.precision==='exact'?{geo:{'@type':'GeoCoordinates',latitude:p2.lat,longitude:p2.lng}}:{}),image:p2.photos.map(x=>x.url),url:SITE_URL+'/boalkhali/'+p2.slug};
 return <Shell><main className="mx-auto max-w-4xl space-y-6 p-3 md:p-4">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
  <Link href="/boalkhali" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline"><ArrowLeft size={15}/> সব দর্শনীয় স্থান</Link>
  <figure>
   <img src={thumb.src} alt={p2.nameBn} className="aspect-[16/9] w-full rounded-[24px] object-cover shadow-elev-1"/>
   <figcaption className="mt-1.5 text-[11px] text-gray-500">{thumb.isIllustration?'প্রতীকী ছবি (ইলাস্ট্রেশন — কল্পনাভিত্তিক চিত্র)':'ছবি: '+thumb.credit}</figcaption>
  </figure>
  <div>
   <div className="flex flex-wrap items-center gap-2">
    <h1 className="font-display text-2xl font-black leading-tight md:text-3xl">{p2.nameBn}</h1>
    <span className={'chip '+(p2.insideBoalkhali?'bg-brand-600 text-white':'bg-amber-100 text-amber-800')}>{p2.insideBoalkhali?'বোয়ালখালীর ভিতরে':'বোয়ালখালীর কাছাকাছি'}</span>
    {p2.precision!=='exact' && <span className="chip bg-gray-100 text-gray-600">অবস্থান আনুমানিক</span>}
   </div>
   <p className="mt-1.5 flex items-center gap-1 text-sm font-bold text-brand-700"><MapPin size={14}/>{p2.area}</p>
  </div>
  <div className="space-y-3">
   {bodyParas.map((x,i)=>(<p key={i} className="text-[15px] leading-relaxed text-gray-700">{x}</p>))}
  </div>
  {goParas.length>0 && <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-900"><p className="flex gap-1.5"><Navigation size={15} className="mt-0.5 shrink-0"/><span>{goParas.join(' ')}</span></p></div>}
  {p2.photos.length>1 && <section>
   <h2 className="font-display text-lg font-bold">📷 আরও আসল ছবি</h2>
   <div className="mt-3 grid gap-4 sm:grid-cols-2">
    {p2.photos.slice(1).map((ph,i)=>(<figure key={i}><img src={ph.url} alt={p2.nameBn+' — আসল ছবি '+ph.credit} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover"/><figcaption className="mt-1 text-[11px] text-gray-500">ছবি: <a href={ph.sourcePage} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">{ph.credit}</a></figcaption></figure>))}
   </div>
  </section>}
  <section>
   <h2 className="font-display text-lg font-bold">🗺️ অবস্থান</h2>
   <iframe title={p2.nameBn+' — Google Maps'} src={placeEmbedUrl(p2)} loading="lazy" className="mt-3 h-72 w-full rounded-2xl border border-[var(--line)]" referrerPolicy="no-referrer-when-downgrade"/>
   <a href={placeMapsUrl(p2)} target="_blank" rel="noopener noreferrer" className="btn mt-3 inline-flex items-center gap-1.5">Google Maps-এ লোকেশন দেখুন <ExternalLink size={14}/></a>
  </section>
 </main></Shell>;
}
