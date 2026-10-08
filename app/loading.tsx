import {Shell,SkeletonList,SkeletonCard} from '@/components/ui';
export default function Loading(){ return <Shell><main className="mx-auto max-w-7xl space-y-6 p-3" aria-busy="true">
 <div className="skel h-56 rounded-[28px] md:h-64"/>
 <div className="grid grid-cols-3 gap-3 md:grid-cols-5">{Array.from({length:5}).map((_,i)=>(<div key={i} className="card flex flex-col items-center gap-2 !p-4"><div className="skel h-12 w-12 !rounded-2xl"/><div className="skel h-3 w-16"/></div>))}</div>
 <div><div className="skel h-5 w-44"/><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({length:8}).map((_,i)=>(<div key={i} className="card flex flex-col items-center gap-2 !p-4"><div className="skel h-14 w-14 !rounded-2xl"/><div className="skel h-3 w-20"/></div>))}</div></div>
 <div><div className="skel h-5 w-56"/><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard/><SkeletonCard/><SkeletonCard/></div></div>
 <SkeletonList count={2}/>
</main></Shell> }
