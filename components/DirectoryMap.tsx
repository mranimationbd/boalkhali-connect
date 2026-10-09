'use client'; import {useEffect,useRef,useState} from 'react'; import 'maplibre-gl/dist/maplibre-gl.css';
export type DirMarker={id:string;title:string;typeName:string;area:string;lat:number;lng:number;href:string};
const esc=(s:any)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Keyless MapLibre map (Wave 2): OpenStreetMap raster tiles — no API token exists or is
// needed. Markers come ONLY from records with stored numeric coordinates; an area-level
// place never gets a fabricated pin. WebGL/tile failures degrade to a note — the list
// next to the map is the accessible fallback and always works. The library is imported
// lazily inside the effect (and this component is ssr:false), so no other page pays for it.
export default function DirectoryMap({markers}:{markers:DirMarker[]}){ const box=useRef<HTMLDivElement>(null); const [err,setErr]=useState('');
 useEffect(()=>{ let map:any=null; let dead=false;
  (async()=>{ try{ const ml=await import('maplibre-gl'); if(dead||!box.current) return;
   map=new ml.Map({container:box.current,style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]} as any,center:markers.length?[markers[0].lng,markers[0].lat]:[91.921,22.382],zoom:markers.length?12:11,attributionControl:{compact:true} as any});
   map.addControl(new ml.NavigationControl({showCompass:false}),'top-right');
   map.on('error',()=>{ if(!dead) setErr('মানচিত্রের টাইল লোড করা যায়নি — পাশের তালিকা থেকেই সব তথ্য পাওয়া যাবে।'); });
   const b=new ml.LngLatBounds(); markers.forEach(m=>{ const el=document.createElement('div'); el.className='bk-marker'; el.setAttribute('role','button'); el.setAttribute('aria-label',m.title); const html='<b>'+esc(m.title)+'</b><br/>'+esc(m.typeName)+(m.area?' • '+esc(m.area):'')+'<br/><a href="'+esc(m.href)+'" style="color:#047857;font-weight:700">বিস্তারিত দেখুন →</a>'; new ml.Marker({element:el}).setLngLat([m.lng,m.lat]).setPopup(new ml.Popup({offset:16,maxWidth:'260px'}).setHTML(html)).addTo(map); b.extend([m.lng,m.lat]); });
   if(markers.length>1){ try{ map.fitBounds(b,{padding:44,maxZoom:14,duration:0}); }catch{} }
  }catch{ if(!dead) setErr('মানচিত্র লোড করা যায়নি — পাশের তালিকা থেকেই সব তথ্য পাওয়া যাবে।'); } })();
  return ()=>{ dead=true; try{ map&&map.remove(); }catch{} };
 },[markers]);
 return <div><div ref={box} className="h-80 md:h-[26rem] w-full rounded-2xl overflow-hidden border bg-emerald-50" role="application" aria-label="ডিরেক্টরির মানচিত্র (OpenStreetMap)"/>{err?<p className="text-xs text-red-600 mt-2">⚠️ {err}</p>:<p className="text-[11px] text-gray-400 mt-2">মানচিত্র: © OpenStreetMap contributors • পিনে চাপ দিলে বিস্তারিত লিংক পাবেন</p>}</div>; }
