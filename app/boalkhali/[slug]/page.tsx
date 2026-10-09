import Link from 'next/link'; import {notFound} from 'next/navigation'; import type {Metadata} from 'next'; import {Shell} from '@/components/ui'; import {loadBoalkhaliDb, resolvePlace} from '@/lib/placeView'; import {SITE_URL} from '@/lib/site'; import {MapPin,Navigation,ExternalLink,ArrowLeft} from 'lucide-react';
// CMS-driven place detail: renders the PUBLISHED 'place' content for the slug (admin
// edits in /admin/content show up here); unpublished/deleted items 404 — the middleware
// gate returns a real 404 status for direct hits, notFound() covers soft navigation.
// While the CMS places seed has never run, lib/places.ts data renders as a fallback.
export const dynamic='force-dynamic';
const abs=(u:string)=>u.startsWith('http')?u:SITE_URL+u;
export async function generateMetadata({params}:{params:{slug:string}}):Promise<Metadata>{ const v=resolvePlace(await loadBoalkhaliDb(),params.slug); if(!v) return {title:'স্থান পাওয়া যায়নি — বোয়ালখালী কানেক্ট'}; const desc=v.detail.split('\n')[0].slice(0,160); const img=v.images[0]; return {title:v.name+' — বোয়ালখালী কানেক্ট',description:desc,openGraph:{title:v.name,description:desc,...(img?{images:[{url:abs(img.url),alt:v.name}]}:{})}}; }
export default async function PlacePage({params}:{params:{slug:string}}){ const v=resolvePlace(await loadBoalkhaliDb(),params.slug); if(!v) notFound(); const p=v!; const thumb=p.images[0]; const paras=p.detail.split('\n').filter(Boolean); const goParas=paras.filter(x=>x.startsWith('কীভাবে যাবেন')); const bodyParas=paras.filter(x=>!x.startsWith('কীভাবে যাবেন')); const ld={'@context':'https://schema.org','@type':'TouristAttraction',name:p.name,description:paras[0]||p.short,address:{'@type':'PostalAddress',addressLocality:p.area+(p.inside?', বোয়ালখালী, চট্টগ্রাম':', চট্টগ্রাম')},...((p.lat!==null&&p.lng!==null)?{geo:{'@type':'GeoCoordinates',latitude:p.lat,longitude:p.lng}}:{}),...(p.images.length?{image:p.images.map(x=>abs(x.url))}:{}),url:SITE_URL+'/boalkhali/'+p.slug};
 return <Shell><main className="mx-auto max-w-4xl space-y-6 p-3 md:p-4">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
  <Link href="/boalkhali" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline"><ArrowLeft size={15}/> সব দর্শনীয় স্থান</Link>
  {thumb && <figure>
   <img src={thumb.url} alt={thumb.alt||p.name} className="aspect-[16/9] w-full rounded-[24px] object-cover shadow-elev-1"/>
   <figcaption className="mt-1.5 text-[11px] text-gray-500">{thumb.ill?'প্রতীকী ছবি (ইলাস্ট্রেশন — কল্পনাভিত্তিক চিত্র)':(thumb.caption?'ছবি: '+thumb.caption:'')}</figcaption>
  </figure>}
  <div>
   <div className="flex flex-wrap items-center gap-2">
    <h1 className="font-display text-2xl font-black leading-tight md:text-3xl">{p.name}</h1>
    <span className={'chip '+(p.inside?'bg-brand-600 text-white':'bg-amber-100 text-amber-800')}>{p.inside?'বোয়ালখালীর ভিতরে':'বোয়ালখালীর কাছাকাছি'}</span>
    {p.lat===null && <span className="chip bg-gray-100 text-gray-600">অবস্থান আনুমানিক</span>}
   </div>
   <p className="mt-1.5 flex items-center gap-1 text-sm font-bold text-brand-700"><MapPin size={14}/>{p.area}</p>
  </div>
  <div className="space-y-3">
   {bodyParas.map((x,i)=>(<p key={i} className="text-[15px] leading-relaxed text-gray-700">{x}</p>))}
  </div>
  {goParas.length>0 && <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-900"><p className="flex gap-1.5"><Navigation size={15} className="mt-0.5 shrink-0"/><span>{goParas.join(' ')}</span></p></div>}
  {p.images.length>1 && <section>
   <h2 className="font-display text-lg font-bold">📷 আরও ছবি</h2>
   <div className="mt-3 grid gap-4 sm:grid-cols-2">
    {p.images.slice(1).map((im,i)=>(<figure key={i}><img src={im.url} alt={im.alt||p.name} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover"/><figcaption className="mt-1 text-[11px] text-gray-500">{im.ill?'প্রতীকী ছবি (ইলাস্ট্রেশন)':(im.caption?(im.source?<a href={im.source} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">{'ছবি: '+im.caption}</a>:'ছবি: '+im.caption):'')}</figcaption></figure>))}
   </div>
  </section>}
  <section>
   <h2 className="font-display text-lg font-bold">🗺️ অবস্থান</h2>
   <iframe title={p.name+' — Google Maps'} src={p.embedUrl} loading="lazy" className="mt-3 h-72 w-full rounded-2xl border border-[var(--line)]" referrerPolicy="no-referrer-when-downgrade"/>
   <a href={p.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn mt-3 inline-flex items-center gap-1.5">Google Maps-এ লোকেশন দেখুন <ExternalLink size={14}/></a>
  </section>
 </main></Shell>;
}
