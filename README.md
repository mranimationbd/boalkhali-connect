# বোয়ালখালী কানেক্ট — Boalkhali Connect
Production-ready hyperlocal citizen platform for বোয়ালখালী, চট্টগ্রাম.

## Stack
Next.js 14 (App Router, TypeScript), Tailwind, file-backed JSON DB (Firestore-equivalent collections, atomic tmp+rename writes), scrypt auth + cookie session, Open-Meteo real weather, PWA, Lucide icons.

## Run
cp .env.example .env.local  # set ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET
npm install && npm run build && npm start  # http://localhost:3100
Dev: npm run dev

## Demo accounts (seed only — CHANGE IN PRODUCTION)
- citizen@boalkhali.local / Citizen123! (CITIZEN)
- Admin: ADMIN_EMAIL from env / ADMIN_PASSWORD (default ChangeMe_Strong_123! only for local demo, seeded in lib/db.ts — change immediately)
- Owner seed: habiburrahman962540@gmail.com (SUPER_ADMIN, demo password OwnerDemo123! — change)

## DB schema
data/db.json collections: users, roles, categories, subcategories, posts, post_images, locations, saved_posts, restaurants, menus, doctors, blood_donors, blood_requests, jobs, services, service_providers, lost_found, complaints, secret_reports, emergency_alerts, announcements, notifications, advertisements, memberships, reviews, feature_flags, transport_routes, transport_schedules, audit_logs, system_metrics, sessions, tokens. Images in public/uploads (not in DB docs), original+thumb path stored.

## Credentials needed for live deploy (NOT faked)
1. Firebase: NEXT_PUBLIC_FIREBASE_API_KEY + PROJECT_ID + FIREBASE_ADMIN_JSON — from console.firebase.google.com → Project settings. Needed only if migrating from file DB.
2. DuckDNS: DOMAIN + TOKEN — from duckdns.org (logged-in account). Needed for custom hostname + Let's Encrypt on VPS. Existing mranimationbd.duckdns.org belongs to another project (GitHub Pages), not this app.
3. Weather: Open-Meteo needs NO key (implemented). Optional OPENWEATHER_API_KEY from openweathermap.org.
4. Hosting: VPS SSH or Vercel/Render account to run `npm start` behind reverse proxy (nginx/caddy) with HTTPS.

## Deploy architecture
Domain/DuckDNS → HTTPS (Caddy/Nginx + Let's Encrypt) → Reverse proxy → Next.js :3100 → data/db.json + public/uploads. Dockerfile + docker-compose.yml included (docker not installed on this VM, so verified via npm build/start only).

## Security
RBAC server-side in /api/admin/*, scrypt passwords, httpOnly session, rate-limit in-memory on auth/post, upload type/size validation (JPG/PNG/WEBP ≤5MB), sanitize input, audit log for moderation/feature/secret access, secret_reports admin-only (submitter hidden from public). Privacy mode flag on user; note server logs exist — absolute anonymity not claimed.

## PWA / SEO
manifest.webmanifest, icon.svg, sw.js offline fallback, sitemap.ts, robots.txt, OG metadata. Public listings at /post/[id].
