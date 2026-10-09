import {MetadataRoute} from 'next'; import {SITE_URL} from '@/lib/site';
// Absolute sitemap URL (the old public/robots.txt used a relative 'Sitemap: /sitemap.xml',
// invalid per spec). This route handler replaces the static file.
export default function robots():MetadataRoute.Robots{ return {rules:[{userAgent:'*',allow:'/'}],sitemap:SITE_URL+'/sitemap.xml'}; }
