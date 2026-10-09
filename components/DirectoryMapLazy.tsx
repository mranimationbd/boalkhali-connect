'use client'; import dynamic from 'next/dynamic';
// ssr:false wrapper (next/dynamic cannot live in a Server Component): the MapLibre code —
// library, CSS and markers — loads only when someone actually opens /directory.
const Inner=dynamic(()=>import('./DirectoryMap'),{ssr:false,loading:()=>(<div className="h-80 md:h-[26rem] rounded-2xl border bg-emerald-50 grid place-items-center text-sm text-gray-500">🗺️ মানচিত্র লোড হচ্ছে…</div>)});
export default function DirectoryMapLazy(props:any){ return <Inner {...props}/>; }
