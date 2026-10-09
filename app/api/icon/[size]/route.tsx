import {ImageResponse} from 'next/og'; import {LOGO_DATA} from '@/lib/logoData';
// Real PNG app icons at exact sizes (A-07/B-04): the manifest previously referenced one
// 512px data-URI, which no browser accepts for install. The logo artwork is rasterized at
// the requested size so 192/512 manifest entries are honest files.
export async function GET(_req:Request,{params}:{params:{size:string}}){ const size=[180,192,512].includes(Number(params.size))?Number(params.size):192; return new ImageResponse((<div style={{display:'flex',width:'100%',height:'100%'}}><img src={LOGO_DATA} width={size} height={size}/></div>),{width:size,height:size,headers:{'cache-control':'public, max-age=31536000, immutable'}}); }
