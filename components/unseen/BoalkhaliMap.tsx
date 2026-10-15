'use client';
import {useMemo, useState} from 'react';
import {BOUNDARY, PLACES, VILLAGES, boundaryPath, project, VIEWBOX, UPlace, UVillage} from '@/lib/unseen';

type Layer = 'villages' | 'places' | 'nature';
interface Props {
  compact?: boolean;
  initialLayer?: Layer;
}

const NATURE = [
  {name:'কর্ণফুলী নদী', en:'Karnaphuli River', lon:91.94, lat:22.395, icon:'🌊', desc:'বোয়ালখালীর প্রধান নদী — উপজেলার পশ্চিম সীমানা ঘেঁষে বয়ে গেছে।'},
  {name:'করলডেঙ্গা পাহাড়', en:'Koroldanga Hills', lon:91.975, lat:22.415, icon:'⛰️', desc:'উপজেলার পূর্বে সবুজ পাহাড়শ্রেণি — ট্রেকিং ও প্রকৃতি দেখার জায়গা।'},
  {name:'হালদা সংযোগ খাল', en:'Halda Link Canal', lon:91.93, lat:22.43, icon:'💧', desc:'কৃষি সেচের খাল — বর্ষায় পানিতে ভরপুর থাকে।'},
];

export default function BoalkhaliMap({compact=false, initialLayer='places'}: Props){
  const [layers, setLayers] = useState<Record<Layer, boolean>>({villages: initialLayer==='villages', places: initialLayer!=='villages', nature: false});
  const [sel, setSel] = useState<{kind:string; name:string; sub:string; desc:string; icon:string} | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const path = useMemo(()=>boundaryPath(), []);

  const toggle = (l: Layer)=> setLayers(s=>({...s, [l]: !s[l]}));
  const pick = (kind:string, name:string, sub:string, desc:string, icon:string)=> setSel({kind,name,sub,desc,icon});

  const vb = VIEWBOX.split(' ').map(Number);
  const cx = vb[2]/2, cy = vb[3]/2;
  const view = `${cx - (vb[2]/zoom)/2 + pan[0]} ${cy - (vb[3]/zoom)/2 + pan[1]} ${vb[2]/zoom} ${vb[3]/zoom}`;

  const Marker = ({x,y,icon,label,onClick,color}:{x:number;y:number;icon?:string;label:string;onClick:()=>void;color:string})=>(
    <g onClick={(e)=>{e.stopPropagation(); onClick();}} className="cursor-pointer" style={{pointerEvents:'all'}}>
      <circle cx={x} cy={y} r={compact?7:9} fill={color} stroke="#fff" strokeWidth={2} opacity={0.95}/>
      {icon ? <text x={x} y={y+ (compact?4:5)} textAnchor="middle" fontSize={compact?9:11}>{icon}</text>
        : <circle cx={x} cy={y} r={2.6} fill="#fff"/>}
      <title>{label}</title>
    </g>
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-elev-1">
      {/* layer toggles */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--line)] bg-brand-50/60 px-3 py-2">
        {([['villages','🏘️ গ্রাম'],['places','📍 দর্শনীয়'],['nature','🌿 প্রকৃতি']] as [Layer,string][]).map(([l,label])=>(
          <button key={l} onClick={()=>toggle(l)}
            className={`chip font-bold transition ${layers[l]?'bg-brand-600 text-white':'bg-white text-brand-800 border border-[var(--line)]'}`}>
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={()=>setZoom(z=>Math.min(4, +(z+0.5).toFixed(1)))} className="chip bg-white border border-[var(--line)] font-black" aria-label="জুম ইন">+</button>
          <button onClick={()=>setZoom(z=>Math.max(1, +(z-0.5).toFixed(1)))} className="chip bg-white border border-[var(--line)] font-black" aria-label="জুম আউট">−</button>
          <button onClick={()=>{setZoom(1); setPan([0,0]);}} className="chip bg-white border border-[var(--line)] text-xs font-bold">রিসেট</button>
        </div>
      </div>
      <div className="relative">
        <svg viewBox={view} className={`w-full ${compact?'h-64':'h-[420px] md:h-[520px]'} select-none`} role="img" aria-label="বোয়ালখালীর ইন্টার‌্যাক্টিভ মানচিত্র">
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#eef6f1"/>
          <path d={path} fill="#d9ecdf" stroke="#0a7a54" strokeWidth={2.5/zoom} strokeLinejoin="round"/>
          {layers.villages && VILLAGES.map((v:UVillage)=>{
            const [x,y]=project(v.lon,v.lat);
            return <Marker key={v.name} x={x} y={y} label={v.name+' — '+v.union} color="#2f9e6e"
              onClick={()=>pick('গ্রাম', v.name, v.union, v.note || 'বোয়ালখালীর একটি গ্রাম।', '🏘️')}/>;
          })}
          {layers.nature && NATURE.map(n=>{
            const [x,y]=project(n.lon,n.lat);
            return <Marker key={n.name} x={x} y={y} icon={n.icon} label={n.name} color="#3b82f6"
              onClick={()=>pick('প্রকৃতি', n.name, n.en, n.desc, n.icon)}/>;
          })}
          {layers.places && PLACES.map((p:UPlace)=>{
            const [x,y]=project(p.lon,p.lat);
            return <Marker key={p.id} x={x} y={y} icon={p.icon} label={p.name+' — '+p.union} color="#d97706"
              onClick={()=>pick(p.catBn, p.name, p.union, p.desc, p.icon)}/>;
          })}
        </svg>
        {/* detail panel */}
        {sel && (
          <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-80 rounded-2xl border border-[var(--line)] bg-white/97 p-3.5 shadow-elev-2 backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <p className="chip bg-brand-50 text-brand-800 text-[11px] font-bold">{sel.kind}</p>
              <button onClick={()=>setSel(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none" aria-label="বন্ধ করুন">✕</button>
            </div>
            <p className="font-display mt-1.5 font-bold leading-snug"><span className="mr-1">{sel.icon}</span>{sel.name}</p>
            <p className="text-xs font-bold text-brand-700">{sel.sub}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{sel.desc}</p>
          </div>
        )}
      </div>
      <p className="border-t border-[var(--line)] bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
        মার্কারের অবস্থান আনুমানিক — সীমানা: OpenStreetMap (relation 19690094)।
      </p>
    </div>
  );
}
