import {VISIT_IMG_HERO} from '@/lib/visitImgHero'; import {VISIT_IMG_HILL} from '@/lib/visitImgHill'; import {VISIT_IMAGES} from '@/lib/visitImages'; import {bytesRes,notFound} from '@/lib/imgRoute';
const MAP:Record<string,string>={hero:VISIT_IMG_HERO,hill:VISIT_IMG_HILL,haat:VISIT_IMAGES.haat,mazar:VISIT_IMAGES.mazar};
export async function GET(_req:Request,{params}:{params:{key:string}}){ const d=MAP[params.key]; return d?bytesRes(d):notFound(); }
