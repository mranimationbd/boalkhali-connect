import {Shell,SkeletonList} from '@/components/ui';
export default function Loading(){ return <Shell><main className="mx-auto max-w-5xl p-4" aria-busy="true">
 <div className="flex items-center gap-3"><div className="skel h-12 w-12 shrink-0 !rounded-2xl"/><div className="skel h-6 w-40"/></div>
 <div className="skel mt-3 h-3 w-64"/>
 <div className="my-3 flex gap-2"><div className="skel h-10 flex-1 !rounded-xl"/><div className="skel h-10 w-32 !rounded-xl"/><div className="skel h-10 w-24 !rounded-xl"/></div>
 <SkeletonList count={4}/>
</main></Shell> }
