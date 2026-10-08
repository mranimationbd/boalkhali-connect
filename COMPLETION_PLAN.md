# Boalkhali Connect — Completion Plan (researched 2026-10-08)

Research basis: feature patterns of Bikroy, Facebook Marketplace, Nextdoor, Thulo Bazaar, blood platforms (LifeDrop/BloodConnect/HemoSync), web.dev PWA criteria. Status key: ✅ live-verified · 🔨 building · ⬜ queued.

## Already live (verified)
Register/login (email+phone+Google, real Firebase verification email), full registration details + Google profile completion, admin/admin + in-panel credential change, moderation queue (approve/reject/hide/feature/verify/delete), feature toggles, 5GB upload quota, Firestore persistence, 19 categories, saved posts, notifications + settings toggles, blood board + donor search, complaints submit, anonymous secret desk, emergency directory, siren list, audit log, system health, analytics, JSON backup export, sitemap.

## Wave 1 — citizen post power
- ✅ My posts: edit, delete (confirm), mark sold/unavailable, status + rejection reason visible
- ✅ Moderation: reject requires reason; approve/reject creates user notification
- ✅ Post detail: Call + WhatsApp buttons, share (copy link), verified badge, report button → reports collection
- ✅ Comments/Q&A under posts (login required, own-comment delete)

## Wave 2 — account, blood, civic
- ⬜ Change password in profile; "ভুলে গেছেন?" → Firebase password-reset email
- ⬜ Blood: donor registration form (group/phone/area/availability/last donation), blood request create form, own-request fulfill/cancel
- ⬜ My complaints: status tracking (প্রাপ্ত/প্রক্রিয়াধীন/সমাধান)
- ⬜ Jobs: call/WhatsApp apply actions
- ⬜ Public seller profile /user/[id]: verified badge, member since, active posts
- ⬜ Search filters: category, area, price range, sort (newest/price)

## Wave 3 — admin power
- 🔨 User management: role/verify/block/unblock/delete + blocked-login enforcement (in progress 19:34 +04)
- ⬜ Reports queue /admin/reports: dismiss/hide post/block user
- ⬜ Complaint resolution actions in /admin/complaints (status + note)
- ⬜ Announcement broadcast composer (/admin/push): home banner + notify all users
- ⬜ Siren composer in /admin/siren
- ⬜ Volunteer apply (citizen) + approve (admin)
- ⬜ Site settings (name/tagline/contacts) + CSV export (posts/users)

## Wave 4 — platform basics
- ⬜ Footer (about/privacy/terms/contact/maker credit) + legal pages check
- ⬜ Branded 404 page; loading/empty states sweep
- ⬜ PWA: manifest + 192/512 icons + service worker + offline page
- ⬜ OpenGraph metadata on post pages (title/image for shared links)
- ⬜ Mobile bottom nav (হোম/ক্যাটাগরি/পোস্ট/সংরক্ষিত/প্রোফাইল)
- ⬜ Safety tips on create + post detail; hide-phone option per post

## Blocked on user
- GitHub email verification for SSH key → then 19 category PNGs push byte-exact (currently ●→PNG ready locally, commit 9bf3e53; push_files corrupts binaries — verified)
- DuckDNS: pctoonstudio login → IP 75.2.60.5 → https://boalkhali.duckdns.org
- Service-account key rotation (key appeared in chat)
- Before real launch: change demo seed passwords (citizen/owner), remove audit test user
