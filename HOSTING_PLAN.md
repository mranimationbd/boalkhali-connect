# Boalkhali Connect — Hosting Plan (prepared 2026-10-08, not yet deployed)

## Current verified state (2026-10-08 13:53 +04)
- Local production server: systemd service `boalkhali-connect` ACTIVE, `http://localhost:3100/api/health` OK
  (posts=3, users=3, uploadQuotaGB=5.0 — the user's 5GB posting quota is live locally).
- DuckDNS: `boalkhali.duckdns.org` created (pctoonstudio@gmail.com account, accepted by user "সমস্যা নেই").
  It does NOT yet point at a reachable app server.
- GitHub: local git repo committed (55e35ed), NO remote yet. User's last instruction (13:52 +04):
  "repositories নতুন একটা খুলো" — create a NEW repo for this project.
- This VM is not internet-reachable (verified: external connect refused), so DuckDNS alone cannot serve the app.

## Path the user chose: "হোস্টিং" (GitHub-connected PaaS)
1. Create the new GitHub repo (per user's 13:52 instruction; do not reuse the mranimationbd website repo).
2. Push local commit 55e35ed to it (needs the GitHub token flow already started in chat — fine-grained token,
   only the new repo, Contents: Read and write).
3. Connect the repo in Render (Blueprint, `render.yaml` in repo root) or Railway/Koyeb equivalent.
4. Set production secrets in the PaaS dashboard only: ADMIN_PASSWORD (strong, not the demo), SESSION_SECRET.
   Change the seeded demo passwords (citizen@boalkhali.local, owner demo) before inviting real users.
5. Verify on the PaaS URL first: /, /api/health, citizen login, admin RBAC gate, one test post + image upload
   (quota counter moves), then delete the test post.
6. Only after step 5 passes: point DuckDNS `boalkhali` at the host per the PaaS custom-domain instructions
   (CNAME to the PaaS hostname, or A record to its IP) and enable HTTPS there; then re-verify
   https://boalkhali.duckdns.org end-to-end. Never claim live before this check.

## Persistence warning (decide before real users)
The app stores data in `data/db.json` and images in `public/uploads` (5GB quota enforced in /api/upload).
Free PaaS tiers use ephemeral disks — posts/uploads would vanish on restart/redeploy.
Options: (a) paid Persistent Disk mounted at /app/data + /app/public/uploads, (b) migrate DB/uploads to
Firebase (env placeholders already in .env.example). Local VM keeps working either way as the dev copy.

## What must NOT happen
- Do not touch `mranimationbd.duckdns.org` or its GitHub Pages repo (yesterday's Mr. Animation BD website).
- Do not claim the DuckDNS URL is live until step 6 verification passes (user's NO FAKE SUCCESS rule).
