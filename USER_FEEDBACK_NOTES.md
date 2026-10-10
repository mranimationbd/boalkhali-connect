# USER FEEDBACK — সমস্যার তালিকা (একসাথে ফিক্স হবে)

নিয়ম (2026-10-09, user): বারবার deploy করা যাবে না (লিমিট শেষ হয়ে যাবে)। user যে সমস্যাগুলো বলবেন সব এখানে নোট হবে; পরে user "করো" বললে এক ব্যাচে সব ঠিক করে একবারই deploy। ততক্ষণ live সাইটে কোনো push/deploy নয়। Local তৈরি কাজ (P0 ব্যাচের অংশবিশেষ) parked আছে — commit হয়নি (HEAD 4dc7dd4)।

## নোট করা সমস্যা

## ✅ সমাধান হয়েছে (2026-10-09, user "ঠিক করো" → একটাই deploy)
- F1 ✅ ADMIN/SUPER_ADMIN IP লগ দেখতে+export পারে (commit fe5281c) — live: /api/admin/analytics/logs 200, লক-বার্তা নেই।
- F2 ✅ সেটিংসের ৩ ট্যাবই আসল কন্টেন্টসহ কার্যকর (8db19cd) — live page-এ তিন ট্যাবই আছে; save settings API গেটেড।
- F3 ✅ ওভারভিউ বোতাম #admin-overview অ্যাংকরে যুক্ত (026029f) — live HTML-এ link+target দুটোই আছে।
- F4 ✅ "admin" লিখে লগইন আবার চলে (0123293, email-ভিত্তিক fallback) — live যাচাই: SUPER_ADMIN লগইন সফল।
- একবারই push (2 ব্যাচ) → Vercel deploy; এরপর user-এর নির্দেশে দুই এজেন্টের লাইভ অডিট চলছে (~/workspace/audit_live/)।

### F1 — অ্যাডমিন লগইনের পরও IP লগ দেখা যায় না (2026-10-09 09:48)
- জায়গা: /admin/analytics → "ভিজিটর লগ (IPসহ)" সেকশন: "🔒 IP লগ দেখার অনুমতি আপনার রোলে নেই... (বর্তমানে সুপার অ্যাডমিন)"
- কারণ: নকশা অনুযায়ী analytics.ip.view শুধু SUPER_ADMIN-এর; user লগইন করেন admin/admin (ADMIN রোল) দিয়ে, তাই দেখতে পান না।
- ফিক্স (ব্যাচে): ADMIN রোলকে analytics.ip.view (+export?) দেওয়া — owner-এর স্পষ্ট প্রত্যাশা: অ্যাডমিন লগইন করলেই IP লগ দেখা যাবে। lib/permissions.ts-এ ADMIN-এর তালিকায় যোগ করতে হবে।

### F2 — /admin/settings-এ দুটি ট্যাব ক্লিক হয় না (2026-10-09 09:48, screenshot)
- জায়গা: সেটিংস পেজের ট্যাব সারি: "সাধারণ সেটিংস" ও "নোটিফিকেশন" (user মার্ক করেছেন) ক্লিক করা যাচ্ছে না; শুধু "ফিচার কন্ট্রোল" সক্রিয় দেখাচ্ছে।
- ফিক্স (ব্যাচে): তিনটি ট্যাবই কার্যকর করা (সাধারণ সেটিংস + নোটিফিকেশন প্যানেল আসল কন্টেন্টসহ) অথবা অকার্যকর ট্যাব সরিয়ে দেওয়া — user experience অনুযায়ী কার্যকর করাই ভালো; যাচাই: মোবাইলে screenshot-সহ ক্লিক পরীক্ষা।

### F3 — অ্যাডমিন ড্যাশবোর্ডে "ওভারভিউ" বোতামে ক্লিক করলে কিছু আসে না (2026-10-09 09:51, screenshot)
- জায়গা: /admin ড্যাশবোর্ড, সার্চ বাক্সের ডানদিকের সবুজ "ওভারভিউ" বোতাম — ক্লিক করলে কিছুই হয় না (মৃত বোতাম)।
- ফিক্স (ব্যাচে): বোতামটি কার্যকর করা (ওভারভিউ সেকশনে স্ক্রল/ড্যাশবোর্ড সামারি দেখানো) অথবা অকার্যকর হলে সরিয়ে দেওয়া; মোবাইলে ক্লিক-পরীক্ষাসহ যাচাই।

### F4 — রোল বদলের পর "admin" লিখে লগইন ভাঙা (2026-10-09, user-এর আদেশে রোল বদল সম্পন্ন)
- সম্পন্ন: habiburrahman962540@gmail.com (u_owner) SUPER_ADMIN → CITIZEN; admin (u_admin) ADMIN → SUPER_ADMIN। দুটোই live যাচাই করা।
- পার্শ্বপ্রতিক্রিয়া: login route-এর shortcut `identifier==='admin'` হলে `role==='ADMIN'` অ্যাকাউন্ট খোঁজে — এখন কেউ ADMIN রোলে নেই বলে শুধু "admin" লিখে লগইন INVALID_CREDENTIALS দেয়। ইমেইল দিয়ে (admin@boalkhali.local / admin) লগইন ঠিকঠাক চলে।
- ফিক্স (ব্যাচে বা user অনুমতি দিলে এখনই): app/api/auth/login/route.ts fallback → SUPER_ADMIN/ADMIN দুটোই মেলানো (অথবা email admin@boalkhali.local সরাসরি), এক লাইনের পরিবর্তন।

## ব্যাচে আরও যা জমা আছে (আগের অডিট/ব্যাচ থেকে)
- P0 ব্যাচ (parked, শুরু হয়নি): /emergency-র ভুয়া সিড নম্বর (0171000001x) সরিয়ে আসল ৯৯৯/১৬২৬৩; Save বোতাম ফিক্স; forgot-password (admin-assisted) চালু; sitemap localhost সরানো; ভুয়া ⭐ রেটিং সরানো; doctor chip যাচাই।
- B6: পারফরম্যান্স (পেজ ভার ২.২MB কমানো), PWA আসল আইকন, error page, ISR ক্যাশিং।
- Firebase key rotation: নতুন key (64109c83...) তৈরি হয়েছিল কিন্তু বসানো হয়নি; ডাউনলোড JSON মুছে ফেলা হয়েছে (2026-10-09)। ব্যাচের সময় নতুন করে rotate করে Vercel env-এ বসাতে হবে + পুরনো key (3786cc14...) বাতিল। Site এখনো পুরনো key-তেই চলছে (নিরাপদ)।
- Demo seed অ্যাকাউন্ট: citizen@boalkhali.local / Citizen123! (u_citizen) prod DB-তে আছে — real launch-এর আগে user-এর সিদ্ধান্তে পাসওয়ার্ড বদল/মুছতে হবে। admin/admin user-এর নিজের আদেশে রাখা।

## ✅ AUDIT BATCH + CMS — LIVE VERIFIED (2026-10-09 13:2x +04)
- A-01 DATA LOSS: **লাইভে 12/12 concurrent post persisted** (per-record collections; bk_posts/{id} ইত্যাদি)। বন্ধ।
- A-02/B-01: /emergency-তে শুধু ৯৯৯/১৬২৬৩/৩৩৩ — লাইভ tel-scan-এ ভুয়া নম্বর 0।
- A-03: Save লাইভ round-trip PASS। A-05: বাংলা সার্চ (বাসা/ডাক্তার) লাইভ PASS। A-06: forgot→admin reset badge→reset_password→login লাইভ PASS।
- A-04: প্রোড scrub সম্পূর্ণ — demo doctor d1, donor bd1, request b1 DELETE (নতুন admin blood DELETE endpointsসহ); public donors/requests এখন খালি-সৎ।
- Mediums: sitemap duckdns, PWA icon 200, /api/health {ok:true} only, home 1.89MB→720KB।
- /boalkhali: 15 স্থান, ছবি+credit, ডিটেইল পেজ, Maps লিংক — লাইভ PASS।
- CMS: 62/62 temp + লাইভ create→publish→200→unpublish→404→trash→permanent delete PASS; unpublished আসল 404 (middleware)।
- বাকি (সৎ): A-13 orphan comment মুছে ফেলা যায় না; A-14 anon /create ফর্ম; A-16 footer counter; B-07 export redaction — পরবর্তী ছোট ব্যাচে। 5yy পোস্ট: user-এর সিদ্ধান্ত বাকি। Firebase key rotation এখনো বাকি।
- সতর্কতা: পুরনো Netlify fallback এখন stale view দেখাবে (hot collections legacy doc-এ নেই) — emergency ছাড়া ওটার ভরসা নয়।

## 📝 নতুন নোট (2026-10-09 17:38 +04) — এখন এডিট নয়, user আরো দেবেন; "সব দেওয়া হয়ে গেছে" বললে এক ব্যাচে হবে
- N1: অ্যাডমিন প্যানেল থেকে দর্শনীয় স্থানগুলো এডিট/ডিলিট করা যাচ্ছে না, এমনকি খুঁজেও পাওয়া যাচ্ছে না। (কারণ অনুমেয়: 15টি স্থান lib/places.ts-তে static কোডে আছে, CMS contents-এ নেই — ফিক্সের সময় এগুলো CMS-এর 'place' type-এ migrate করে /boalkhali পেজ CMS-driven করতে হবে, যাতে admin প্যানেল থেকে edit/delete/publish সব হয়।)
- N2: "নির্মাতা ও পরিচালক: Rahul Devdas" — user-এর দেওয়া এই ক্রেডিট লাইনটি নোট করা হলো (কোথায়/কীভাবে বসবে, ফিক্সের সময় তার নির্দেশনা অনুযায়ী)।

## 🐞 BUGFIX (2026-10-10, user screenshot থেকে রিপোর্ট)
- সমস্যা: /profile থেকে "সাইন আউট" চাপলে ব্রাউজার /api/auth/logout পেজে গিয়ে কাঁচা {"ok":true} JSON দেখাত — কারণ profile পেজে native `<form action="/api/auth/logout" method="post">` ছিল, আর API route-টি শুধু JSON ফেরত দিত (GET handler ছিল না)।
- ফিক্স: (১) app/api/auth/logout/route.ts — session-clear logic আলাদা করে POST আগের মতোই JSON {ok:true} রাখা হয়েছে; নতুন GET handler session clear করে 303 redirect দিয়ে হোমপেজে পাঠায় (ব্রাউজার navigation কখনো JSON-এ আটকাবে না)। (২) app/profile/page.tsx — native form সরিয়ে client LogoutButton (fetch POST → location.href='/'), লেবেল "সাইন আউট", আগের লাল স্টাইলই।
- যাচাই (temp copy, file backend, production build): register→/profile-এ সাইন আউট বোতাম আছে, form নেই; POST logout 200 JSON + session শেষ (/api/auth/me → null); GET logout (cookieসহ) 303 → / + session শেষ; cookie ছাড়া GET-ও 303। Build green. লোকাল commit, এখনো push হয়নি।
