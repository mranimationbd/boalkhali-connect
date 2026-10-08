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

## Firebase (Firestore DB + Auth) — added 2026-10-08
Live project (browser-verified 2026-10-08): Firebase project `boalkhali-connect-42819` (Spark $0). Firestore
(default) LIVE in location nam5, Production rules locked (deny-all client access; the app reaches it only through
firebase-admin server-side, which bypasses rules). Firebase Authentication: Email/Password + Google providers
ENABLED. Web app config (public identifiers, also in .env.example): apiKey AIzaSyAxyqzBhUivN5UrKRZJKQJqkkiJIbNLDo4,
authDomain boalkhali-connect-42819.firebaseapp.com, projectId boalkhali-connect-42819, appId
1:1025376141258:web:71373f78899d6785b8d933. Remaining manual step: generate a service-account private key in
Firebase Console → Project settings → Service accounts and put FIREBASE_PROJECT_ID (=boalkhali-connect-42819),
FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY ONLY in the host env (Netlify) — never in git/chat.
Backend selection (lib/db.ts): if FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY are ALL set,
the app stores its whole DB state in Firestore document `bk_state/main` (field `json`); otherwise it uses the local
file (data/db.json, or /tmp on serverless). firebase-admin is lazy-loaded server-side only; with no credentials the
file path is used and firebase-admin is never imported — local dev/tests need no Firebase.

Where to get the 3 server values: Firebase Console → (project) → Project settings → Service accounts →
"Generate new private key" → in the downloaded JSON find: project_id → FIREBASE_PROJECT_ID, client_email →
FIREBASE_CLIENT_EMAIL, private_key → FIREBASE_PRIVATE_KEY (paste with \n escapes intact; the code converts them).
Put them ONLY in the host's env settings (e.g. Netlify → Site configuration → Environment variables). Never commit
them, never paste in chat/memory.

Auth: browser Firebase Auth (Google sign-in + email verification mails) activates only when NEXT_PUBLIC_FIREBASE_*
web config is set (Firebase Console → Project settings → Your apps → Web app). Email verification emails are then
sent by Firebase itself. Phone login = phone+password against the profile (no SMS OTP provider). Without the
NEXT_PUBLIC_ config, the Google buttons are hidden and local email/phone+password auth is used.

Admin login: username `admin` (or the admin email) + password = ADMIN_PASSWORD env at seed time, default `admin`
on fresh seeds. Change later inside Admin → Settings → "অ্যাডমিন লগইন পরিবর্তন" (POST /api/admin/credentials,
audit-logged). NOTE: an already-seeded DB keeps its old admin password until the DB is reset/re-seeded.

Growth note: bk_state/main holds the entire DB JSON (~22KB now). Firestore's 1MB document limit means this single-doc
design must be revisited (split collections) well before the state approaches ~800KB.
