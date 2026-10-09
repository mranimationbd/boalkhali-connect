import {LOGO_DATA} from '@/lib/logoData'; import {bytesRes} from '@/lib/imgRoute';
export async function GET(){ return bytesRes(LOGO_DATA); }
