// Canonical public origin for absolute URLs (sitemap/robots/OG). NEXT_PUBLIC_SITE_URL wins,
// then NEXT_PUBLIC_APP_URL; in production the fallback is the real public domain, and only
// development ever sees localhost (A-08/B-03: the sitemap advertised localhost:3100 live).
export const SITE_URL=(process.env.NEXT_PUBLIC_SITE_URL||process.env.NEXT_PUBLIC_APP_URL||(process.env.NODE_ENV==='production'?'https://boalkhali.duckdns.org':'http://localhost:3100')).replace(/\/+$/,'');
