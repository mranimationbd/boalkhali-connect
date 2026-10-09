import {PLACE_ILLUSTRATIONS} from '@/lib/placeImages'; import {bytesRes,notFound} from '@/lib/imgRoute';
export async function GET(_req:Request,{params}:{params:{slug:string}}){ const d=PLACE_ILLUSTRATIONS[params.slug]; return d?bytesRes(d):notFound(); }
