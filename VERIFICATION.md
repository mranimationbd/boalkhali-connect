# Verification — 2026-10-08 (real outputs, server killed after test)
- Node v24.20.0, npm 10.9.4, Next 14.2.5, docker NOT installed (Dockerfile/compose provided, not run)
- `npx tsc --noEmit` → exit 0, no errors
- `npm run build` → ✓ Compiled successfully, 56 routes (citizen + /admin/* + /api/*), First Load JS 87.1 kB shared
- Prod server `npm start -p 3100` → Ready in 1681ms
- GET /api/health → {"ok":true,"dbSizeMB":"0.021","posts":3,"users":3}
- GET /api/posts → seeded Bajaj Discover 125cc etc returned
- GET / → 200, 54274 bytes; contains বোয়ালখালী কানেক্ট ×8, জরুরি রক্ত, কি খুঁজছেন, বোম্বে, Bajaj
- GET /admin unauthenticated → "Unauthorized — Admin only" (RBAC server-side works)
- POST /api/auth/login citizen@boalkhali.local/Citizen123! → 200 CITIZEN; GET /api/auth/me with cookie → totalPosts 1
- GET /api/search?q=B+ → donor রাহিম উদ্দিন B+ কধুরখীল returned
- Weather: Home server-fetches real Open-Meteo API (22.382,91.921) at request time, no key; shows fallback text if API down (not hardcoded)
- NOT claimed: external deployment, Firebase, DuckDNS, email sending, push, payments — all require credentials listed in README/.env.example

## Re-verify 2026-10-08 13:24 +04 (after force-dynamic fix)
- Fixed: all 12 /api/* routes now `export const dynamic='force-dynamic'` (were statically cached — /api/health froze at build time)
- `npx tsc --noEmit` exit 0; `npm run build` exit 0, APIs now ƒ dynamic
- Prod server Ready in 1400ms; /api/health twice: time 09:24:22→09:24:23Z, responseMs 14→1 (live, not cached); / 200; /admin 200 with Unauthorized gate for unauth
