'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {Shell, SectionTitle, bn} from '@/components/ui';
import {PLACES} from '@/lib/unseen';

const W = 1080, H = 1350;

function drawMap(canvas: HTMLCanvasElement, visited: string[], name: string){
  const ctx = canvas.getContext('2d');
  if(!ctx) return;
  const spots = PLACES.filter(p=>visited.includes(p.id));
  // background
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#064e3b'); g.addColorStop(.55,'#0a7a54'); g.addColorStop(1,'#065f46');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  // decorative circles
  ctx.globalAlpha = .08; ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(940,180,220,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(120,1180,260,0,7); ctx.fill();
  ctx.globalAlpha = 1;
  // header
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff';
  ctx.font = '700 44px "Hind Siliguri", sans-serif';
  ctx.fillText('🗺️ আমার বোয়ালখালী ভ্রমণ', W/2, 130);
  ctx.font = '400 34px "Hind Siliguri", sans-serif'; ctx.fillStyle = '#d1fae5';
  const today = new Date().toLocaleDateString('bn-BD',{year:'numeric',month:'long',day:'numeric'});
  ctx.fillText((name ? name + ' • ' : '') + today, W/2, 185);
  // counter badge
  ctx.fillStyle = 'rgba(255,255,255,.15)';
  const bw = 560, bx = (W-bw)/2;
  ctx.beginPath(); ctx.roundRect(bx, 230, bw, 110, 55); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = '900 52px "Hind Siliguri", sans-serif';
  ctx.fillText(`${bn(spots.length)} / ${bn(PLACES.length)} জায়গা ঘোরা`, W/2, 300);
  // visited grid
  ctx.textAlign = 'left';
  const cols = 2, cw = 440, ch = 108, gx = 100, gy = 400, gapX = 60, gapY = 18;
  spots.forEach((p,i)=>{
    const col = i%cols, row = Math.floor(i/cols);
    const x = gx + col*(cw+gapX), y = gy + row*(ch+gapY);
    if(y + ch > H-140) return;
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 24); ctx.fill();
    ctx.font = '44px sans-serif'; ctx.fillText(p.icon, x+22, y+70);
    ctx.fillStyle = '#ffffff'; ctx.font = '700 32px "Hind Siliguri", sans-serif';
    let label = p.name;
    while(ctx.measureText(label).width > cw-110 && label.length>4) label = label.slice(0,-2);
    if(label!==p.name) label += '…';
    ctx.fillText(label, x+92, y+68);
  });
  if(spots.length===0){
    ctx.textAlign='center'; ctx.fillStyle='#d1fae5'; ctx.font='400 36px "Hind Siliguri", sans-serif';
    ctx.fillText('এখনো কোনো জায়গা টিক দেননি', W/2, 560);
    ctx.fillText('নিচের তালিকা থেকে ঘোরা জায়গা বেছে নিন', W/2, 615);
  }
  // footer
  ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.75)'; ctx.font='400 30px "Hind Siliguri", sans-serif';
  ctx.fillText('💎 আনসিন বোয়ালখালী', W/2, H-70);
  ctx.font='400 26px "Hind Siliguri", sans-serif'; ctx.fillStyle='rgba(255,255,255,.55)';
  ctx.fillText('boalkhali.duckdns.org/unseen-boalkhali', W/2, H-32);
}

export default function AmarMap(){
  const [visited,setVisited]=useState<string[]>(()=>{
    try{ return JSON.parse(localStorage.getItem('unseen-boalkhali-visited')||'[]'); }catch{ return []; }
  });
  const [name,setName]=useState(()=>{ try{ return localStorage.getItem('unseen-boalkhali-traveler')||''; }catch{ return ''; } });
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    try{ localStorage.setItem('unseen-boalkhali-visited', JSON.stringify(visited)); }catch{}
    if(canvasRef.current) drawMap(canvasRef.current, visited, name.trim());
  },[visited,name]);

  const toggle=(id:string)=>setVisited(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
  const download=()=>{
    const c=canvasRef.current; if(!c) return;
    const a=document.createElement('a');
    a.download='amar-boalkhali-map.png';
    a.href=c.toDataURL('image/png');
    a.click();
  };

  return <Shell><main className="mx-auto max-w-6xl space-y-6 p-3 md:p-4">
    <SectionTitle title="🖼️ আমার ভ্রমণ ম্যাপ" sub="ঘোরা জায়গায় টিক দিন — সুন্দর ছবি বানিয়ে শেয়ার করুন"/>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card !p-4">
        <p className="font-display font-bold">১. যেসব জায়গায় গিয়েছেন টিক দিন ({bn(visited.length)})</p>
        <input value={name} onChange={e=>{setName(e.target.value); try{localStorage.setItem('unseen-boalkhali-traveler',e.target.value);}catch{}}}
          placeholder="আপনার নাম (ঐচ্ছিক)" maxLength={30}
          className="mt-3 w-full rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm outline-none focus:border-brand-600" aria-label="আপনার নাম"/>
        <div className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {PLACES.map(p=>{
            const on=visited.includes(p.id);
            return <button key={p.id} onClick={()=>toggle(p.id)}
              className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition ${on?'border-brand-600 bg-brand-50':'border-[var(--line)] bg-white'}`}>
              <span className="text-2xl" aria-hidden="true">{p.icon}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-bold">{p.name}</span>
              <span className="block text-[11px] text-gray-500">{p.union}</span></span>
              <span className={`ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full border text-sm ${on?'border-brand-600 bg-brand-600 text-white':'border-gray-300 text-transparent'}`}>✓</span>
            </button>;
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>setVisited(PLACES.map(p=>p.id))} className="chip bg-brand-50 text-brand-800 font-bold">সব টিক দিন</button>
          <button onClick={()=>setVisited([])} className="chip bg-gray-100 text-gray-600 font-bold">সব মুছুন</button>
        </div>
      </div>
      <div className="card !p-4 text-center">
        <p className="font-display font-bold">২. প্রিভিউ ও ডাউনলোড</p>
        <canvas ref={canvasRef} width={W} height={H} className="mx-auto mt-3 w-full max-w-[380px] rounded-2xl shadow-elev-2" aria-label="আপনার ভ্রমণ ম্যাপ প্রিভিউ"/>
        <button onClick={download} className="btn mt-4 w-full !py-3 text-base">⬇️ ম্যাপ ডাউনলোড করুন</button>
        <p className="mt-2 text-[11px] text-gray-400">PNG ছবি — ফেসবুক/হোয়াটসঅ্যাপে শেয়ার করুন 📤</p>
      </div>
    </div>
    <p className="text-center text-[11px] text-gray-400"><Link href="/unseen-boalkhali" className="font-bold text-brand-700 underline">← আনসিন বোয়ালখালীতে ফিরুন</Link></p>
  </main></Shell>;
}
