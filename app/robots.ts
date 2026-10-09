import {MetadataRoute} from 'next'; import {SITE_URL} from '@/lib/site';
// Absolute sitemap URL (the old public/robots.txt used a relative 'Sitemap: /sitemap.xml',
// invalid per spec). This route handler replaces the static file. Admin/API/account
// surfaces are disallowed (Wave 3): they are staff- or login-only and must never be
// indexed; public pages stay fully crawlable.
export default function robots():MetadataRoute.Robots{ return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/api','/profile','/my-posts','/saved','/notifications','/login','/register','/forgot','/create','/complaint','/secret','/user']}],sitemap:SITE_URL+'/sitemap.xml'}; }
