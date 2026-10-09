import {CAT_ICON_DATA as A} from '@/lib/catIconDataA'; import {CAT_ICON_DATA as B} from '@/lib/catIconDataB'; import {CAT_ICON_DATA as C} from '@/lib/catIconDataC'; import {bytesRes,notFound} from '@/lib/imgRoute';
const MAP:Record<string,string>={...A,...B,...C};
export async function GET(_req:Request,{params}:{params:{slug:string}}){ const d=MAP[params.slug]; return d?bytesRes(d):notFound(); }
