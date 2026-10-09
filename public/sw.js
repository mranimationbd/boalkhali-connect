// Boalkhali Connect service worker (Wave 3 hardening).
// Rules: API traffic is never answered from cache and NEVER gets the offline page
// (only image-ish API endpoints — /api/img, /api/icon, /api/uploads — are cache-first
// so logos/photos work offline). Account/admin/auth navigations are network-only.
// Public page navigations are network-first with the cached copy, then the offline
// page, as fallback. Build assets are cache-first. Everything is bounded.
const V='sc-v2'; const STATIC_C='static-'+V; const RUN_C='run-'+V; const OFFLINE='/offline.html';
// Paths whose HTML must never be served stale or via the offline fallback.
const PRIVATE_NAV=['/admin','/login','/register','/forgot','/profile','/my-posts','/saved','/create','/notifications','/complaint','/secret','/user'];
async function trim(cacheName,max){ try{ const c=await caches.open(cacheName); const keys=await c.keys(); for(let i=0;i<keys.length-max;i++) await c.delete(keys[i]); }catch{} }
async function cacheFirst(req,cacheName,max){ const c=await caches.open(cacheName); const hit=await c.match(req); if(hit) return hit; const res=await fetch(req); if(res&&res.ok){ c.put(req,res.clone()).then(()=>trim(cacheName,max)).catch(()=>{}); } return res; }
async function pageNetworkFirst(req){ try{ const res=await fetch(req); if(res&&res.ok){ const c=await caches.open(RUN_C); c.put(req,res.clone()).then(()=>trim(RUN_C,30)).catch(()=>{}); } return res; }catch{ const c=await caches.open(RUN_C); const hit=await c.match(req); if(hit) return hit; const s=await caches.open(STATIC_C); const off=await s.match(OFFLINE); return off||new Response('Offline',{status:503,headers:{'content-type':'text/plain; charset=utf-8'}}); } }
self.addEventListener('install',e=>{ e.waitUntil(caches.open(STATIC_C).then(c=>c.add(OFFLINE)).then(()=>self.skipWaiting()).catch(()=>{})); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==STATIC_C&&k!==RUN_C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()).catch(()=>{})); });
self.addEventListener('fetch',e=>{ const req=e.request; if(req.method!=='GET') return; let u; try{ u=new URL(req.url); }catch{ return; } if(u.origin!==self.location.origin) return;
 // API: network-only, except image endpoints which are cache-first. A failed API
 // call must surface as a network error to the page — never the offline HTML.
 if(u.pathname.startsWith('/api/')){ if(u.pathname.startsWith('/api/img/')||u.pathname.startsWith('/api/icon/')||u.pathname.startsWith('/api/uploads/')) e.respondWith(cacheFirst(req,RUN_C,80)); return; }
 if(u.pathname.startsWith('/_next/static/')||u.pathname.startsWith('/uploads/')){ e.respondWith(cacheFirst(req,STATIC_C,120)); return; }
 if(req.mode==='navigate'){ if(PRIVATE_NAV.some(p=>u.pathname===p||u.pathname.startsWith(p+'/'))) return; e.respondWith(pageNetworkFirst(req)); return; }
 // Anything else (fonts, images, manifest…): plain network, no interception games.
});
