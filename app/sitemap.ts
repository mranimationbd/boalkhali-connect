import {MetadataRoute} from 'next'; import {SITE_URL} from '@/lib/site'; import {CATEGORIES} from '@/lib/db'; import {PLACES} from '@/lib/places';
const STATIC=['','/categories','/restaurants','/jobs','/blood','/emergency','/boalkhali','/doctors','/search','/about'];
export default function sitemap():MetadataRoute.Sitemap{ const now=new Date(); return [...STATIC.map(p=>({url:SITE_URL+p,lastModified:now})),...CATEGORIES.map(c=>({url:SITE_URL+'/category/'+c.slug,lastModified:now})),...PLACES.map(p=>({url:SITE_URL+'/boalkhali/'+p.slug,lastModified:now}))]; }
