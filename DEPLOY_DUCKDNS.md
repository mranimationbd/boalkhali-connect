# Deploy like mranimationbd.duckdns.org (2026-10-07) — adapted for full-stack
Yesterday: DuckDNS subdomain (topanimeforbd@gmail.com) -> GitHub Pages repo -> custom domain -> HTTPS (GitHub).
Boalkhali Connect is Next.js with server API/auth/DB, so GitHub Pages (static only) cannot run it alone.

Same-principle production path:
DOMAIN boalkhali.duckdns.org -> HTTPS (Caddy + Let's Encrypt, Caddyfile in repo) -> reverse_proxy 127.0.0.1:3100 -> Next.js (npm start) -> data/db.json + public/uploads

Steps:
1. duckdns.org sign in (same Google account as yesterday), create subdomain: boalkhali
2. Point it to the server public IP (this VM egress seen 2026-10-08: 87.81.230.53 — confirm inbound 80/443 reachable, otherwise use a VPS)
   Update via: DUCKDNS_DOMAIN=boalkhali DUCKDNS_TOKEN=<token> sh scripts/duckdns-update.sh  (response must be OK)
3. On server: cp .env.example .env.local (set ADMIN_EMAIL/PASSWORD, SESSION_SECRET), npm ci, npm run build, npm start (systemd/pm2), run Caddy with Caddyfile
4. Verify: curl -I https://boalkhali.duckdns.org/ , /api/health, login test. Only then claim live.

Exact credential needed from user (only one):
- WHAT: DuckDNS account access OR DuckDNS token for boalkhaliconnect subdomain
- WHY: create/point the subdomain + auto HTTPS; without it no public URL exists
- WHERE: https://www.duckdns.org — sign in with topanimeforbd@gmail.com (same as yesterday), token is on the account page; subdomain created on same page
- WHAT VALUE: either (a) do the browser sign-in takeover like yesterday so Muse creates it, or (b) send the DuckDNS token via secure vault (never in plain chat memory)
