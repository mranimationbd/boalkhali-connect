import {requireAdminPage} from '@/lib/auth'; import Client from './Client'; export const dynamic='force-dynamic';
export default async function P(){ await requireAdminPage('content.moderate'); return <Client/>; }
