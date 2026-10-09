# Boalkhali Connect — Universal CMS Architecture

Phase 0 audit + design (2026-10-09). Implementation follows this document; the
"Shipped" section at the end is updated with what actually landed.

## 1. Existing system map (audited, not assumed)

- **Admin shell**: `app/admin/layout.tsx` loads `currentUser()`, restricts to
  ADMIN/SUPER_ADMIN/MODERATOR, filters the sidebar `MENU` server-side through
  `hasPermission(role, perm)` from `lib/permissions.ts`, renders
  `app/admin/AdminShell.tsx`. Every admin page independently calls
  `requireAdminPage(perm)` (`lib/auth.ts`) which redirects non-staff to /login
  and under-permissioned staff to /admin before any data renders.
- **Permissions**: `lib/permissions.ts` — `ALL_PERMISSIONS`,
  `ROLE_PERMISSIONS` (SUPER_ADMIN = all; ADMIN = all minus `roles.manage` +
  `export.data`; MODERATOR = small set; citizens none), `PERMISSION_LABELS`.
- **Storage**: `lib/db.ts`. Two tiers:
  - Legacy single document `bk_state/main` (Firestore) / `data/db.json` (file
    backend): settings, categories, doctors, audit_logs, announcements…
  - Per-record HOT collections (`HOT_COLLECTIONS`: users, posts, sessions,
    blood_requests, blood_donors, complaints, secret_reports, post_comments,
    saved_posts) stored as `bk_<name>/{id}` Firestore docs or
    `data/hot/<name>/<id>.json` files. `readDBAsync()` overlays hot collections
    onto the legacy state; `mutateDBAsync()` diffs base→new per record and
    applies doc-level puts/deletes, so concurrent writers of different records
    never collide. New collections must be added to both `HOT_COLLECTIONS` and
    `DB_COLLECTIONS` (normalizer). Hot arrays are stripped from the legacy doc
    on write (`_legacyOf`), so the 1 MB ceiling is never threatened by them.
- **Media**: `lib/imageStore.ts` — images live in Firestore collection
  `bk_images` (meta doc + ≤700 KB base64 chunk docs) or local files in
  UPLOAD_DIR; served at `/api/uploads/<name>`; 5 GB quota counter in
  db.meta.uploadBytesUsed. Firebase Storage is Blaze-gated and deliberately
  OFF — the CMS must NOT enable it; CMS media rides `bk_images` via the
  existing `/api/upload` route (jpg/png/webp, ≤5 MB, any logged-in user).
- **Existing collections**: users, posts, categories (with `subcategories[]`),
  locations, doctors, blood_*, restaurants, jobs, complaints, secret_reports,
  advertisements, announcements, audit_logs, settings (legacy doc), etc.
- **API pattern**: routes under `app/api/admin/*` use `requireRole([...])` +
  `hasPermission()` checks, `mutateDBAsync` for writes, `audit()` for the audit
  log, Bengali error codes via `lib/errMsg.ts`.
- **Public patterns**: server pages read via `readDBAsync()` with
  `dynamic='force-dynamic'`; `lib/search.ts` `searchAll()` powers both
  `/api/search` and the server-rendered `/search` page; `app/sitemap.ts`
  builds from `SITE_URL` + categories + places.

## 2. CMS design

### 2.1 Collections (per-record tier, never the legacy doc)
- `content_types` — one doc per type. Shape:
  `{id, slug (unique), nameBn, nameEn, description, icon, publicListing,
  enabled, order, fields:[{key,label,type,required,defaultValue,options[],
  order,showInCard,showInDetail}], cardFields:[keys], schemaVersion,
  builtin, createdBy, createdAt, updatedAt}`
- `contents` — one doc per content item. Shape:
  `{id, typeSlug, slug (unique per type), titleBn, titleEn, shortDesc,
  fullDesc, categorySlug, subcategorySlug, tags[], featured,
  status: DRAFT|PENDING|PUBLISHED|UNPUBLISHED|ARCHIVED|TRASHED,
  fields:{dynamic values per type schema}, images:[{url,caption,alt,featured}],
  location:{district,upazila,union,area,address,mapsUrl,lat,lng},
  seo:{title,description,ogImage,canonical}, createdBy, updatedBy,
  createdAt, updatedAt, publishedAt, schemaVersion}`
- CMS scalars (contents-per-page, editor default status) go into the existing
  legacy `settings` object (`cmsContentsPerPage`, `cmsEditorDefaultStatus`)
  via `SETTINGS_DEFAULTS` — small, already-supported mechanism.

### 2.2 Status workflow
create → DRAFT (or PENDING when the creator lacks publish permission and the
editor-default setting is PENDING; PUBLISHED only with `content.publish`).
publish (PENDING/DRAFT/UNPUBLISHED/ARCHIVED→PUBLISHED, sets publishedAt) ·
unpublish (PUBLISHED→UNPUBLISHED) · archive (→ARCHIVED) · restore
(ARCHIVED/TRASHED→DRAFT) · trash (→TRASHED) · permanent delete (only from
TRASHED). Duplicate copies as DRAFT with a fresh unique slug. Only PUBLISHED
items of enabled, `publicListing` types are visible publicly; everything else
404s on public routes and is excluded from public search and the sitemap.

### 2.3 Permissions (added to lib/permissions.ts)
`content.view/create/edit/publish/archive/restore/delete`,
`content_types.manage`, `media.manage` (`categories.manage` already exists).
SUPER_ADMIN = all; ADMIN = all except roles.manage/export.data (owner runs
the panel as admin — gets every CMS permission); MODERATOR =
content.view/create/edit only (cannot publish/archive/delete). Enforced in
every API route via requireRole + hasPermission; menu hiding is only a
convenience layer on top.

### 2.4 Validation & safety
- Server-side validation generated from the type's field schema
  (lib/cms.ts): required, type coercion (Number/Date/Email/Phone/URL),
  length caps, select/multi-select option membership. Slug auto-generated from
  the title (Bengali-safe) with manual override; uniqueness per type enforced
  with a hard rejection.
- `sanitizeContentType()` coerces any stored type doc into a safe shape
  (unknown field types dropped, arrays guaranteed) so a malformed schema can
  never crash a public page; public rendering only reads whitelisted shapes.
- RichText fields are stored as plain text and rendered as escaped paragraphs
  — no raw HTML from the DB is ever injected.

### 2.5 Admin UI
One sidebar entry `🗂️ কনটেন্ট CMS` → `/admin/content`, with tabs matching the
owner's menu (All Content, Add New, Categories, Subcategories (inside
Categories tab), Locations, Media Library, Drafts, Pending Review, Published,
Archived, Trash, Content Types, Content Settings). Status tabs are the same
management table pre-filtered (real implementation, not decoration). The
dashboard gains a CMS summary card computed from live DB counts.

### 2.6 Public routes
- `/content` — index of public content types (linked from the footer).
- `/content/[typeSlug]` — listing of PUBLISHED items, cards built from the
  type's `cardFields`.
- `/content/[typeSlug]/[slug]` — detail: whitelisted fields in schema order
  (showInDetail), gallery, maps link/embed when mapsUrl or lat/lng present,
  SEO meta/OG from the item's seo block, JSON-LD (schema.org/Thing) built only
  from stored values.
- Sitemap gains type listings + published items only. Public search
  (`searchAll`) gains published contents only.

### 2.7 Seed data
23 built-in content types (দর্শনীয় স্থান … অন্যান্য — the owner's spec list
contains 23 items) ship as DATA in
`lib/cms.ts` (`BUILTIN_CONTENT_TYPES`) and are inserted lazily, once, the
first time the types collection is read while empty (idempotent, marker =
non-empty check). They carry `builtin:true` but remain fully editable,
renamable, reorderable and deactivatable like any admin-created type.

## 3. Shipped

Built in 6 local commits on master (ae2d58f → e1529fb + fixes), verified
against a throwaway copy of the app (`~/workspace/bk-temp-app`, fresh seeded
DB) with a 62-check scripted battery
(`~/workspace/bk-test/cms_acceptance.py`): **59 PASS / 3 FAIL** — the 3
failures are one shared platform trait, documented below.

### Data + validation (phase 1)
- `content_types` / `contents` joined HOT_COLLECTIONS + DB_COLLECTIONS
  (per-record Firestore `bk_content_types`/`bk_contents`, never the legacy doc).
- `lib/cms.ts` — schema definition + read-side sanitizer (malformed stored
  data degrades to safe defaults instead of crashing pages), server-side
  validation generated FROM each type's field schema (required/type/length),
  18 field types, slug auto-from-title with manual override, per-type
  uniqueness (explicit duplicates rejected `SLUG_TAKEN`; a title edit never
  silently rewrites the URL — the slug only changes when explicitly sent).
- 23 built-in types seeded lazily as editable data (builtin flag informational
  only; rename/deactivate/delete all work).
- Permissions: `content.view/create/edit/publish/archive/restore/delete`,
  `content_types.manage`, `media.manage` (SUPER_ADMIN all; ADMIN all CMS;
  MODERATOR view/create/edit). Real settings wired: `cmsContentsPerPage`
  (drives the admin list default), `cmsEditorDefaultStatus` (DRAFT/PENDING for
  users without publish rights).

### Admin (phases 2–3) — `/admin/content`
One tabbed screen: All content (search, type/category/status/location/
date-range filters, sort, pagination, bulk publish/archive/trash/delete with
confirm), Add/Edit schema-generated form (dynamic fields, featured image +
gallery with upload progress and format/size guard, SEO block, double-submit
guard), status tabs (Drafts/Pending/Published/Archived/Trash with restore +
confirm-gated permanent delete), Categories & subcategories CRUD with usage
dependency checks, Locations CRUD, Media Library (bk_images with usage scan
across contents/posts/ads; delete blocked with 409 while in use), Content
Type Builder (field add/remove/reorder, required/card/detail flags), and
Content Settings. Dashboard gained a live CMS summary card. Every admin
content action writes an `audit_logs` entry (verified in the battery).

### Public (phase 4)
`/content` type index, `/content/[typeSlug]` schema-card listings,
`/content/[typeSlug]/[slug]` detail (schema-ordered fields, gallery, maps
embed when lat/lng stored, SEO/OG, JSON-LD `Thing` from stored values only).
Non-published items are excluded from listings, public search (`searchAll`
now returns published `contents`) and the sitemap; their URLs render the
site's standard "পাওয়া যায়নি (404)" screen with zero content leakage.
Footer gained a «তথ্য ভাণ্ডার» link.

### Known gaps (honest)
1. ~~**Soft-404 status.**~~ **FIXED (follow-up batch).** The root
   `app/loading.tsx` streaming shell made `notFound()` unable to set the
   HTTP status, so non-published detail URLs answered 200 (acceptance
   checks 4b/11b/13d). The fix gates detail URLs in `middleware.ts`
   (matcher `/content/:path*`, exact two-segment guard in code) via a
   small server probe (`GET /api/content-status`) BEFORE streaming
   starts: unpublished/draft/pending/archived/trashed/unknown items now
   return a real themed **HTTP 404**, published items stream as before,
   and the loading skeleton elsewhere is untouched. (Quirk found en
   route: Next 14.2 mis-compiles the matcher `'/content/:type/:slug'`
   into a single-segment pattern in the middleware manifest — hence the
   deliberately broad matcher.) Note the same soft-404 behavior still
   exists on older non-CMS routes (e.g. `/post/<bad-id>`) — pre-existing
   app-wide trait, unchanged by design; CMS routes are exact now.
   Re-verified end-to-end: full acceptance battery 62 PASS / 0 FAIL,
   and non-published slugs confirmed absent from listing, public search
   and the sitemap.
2. The earlier `npm run build` failure on `/api/og` (satori rejecting the
   woff2-subset fonts from commit 0b7b8e9) was pre-existing; it is fixed in
   e1529fb by converting the same subset fonts to TTF — the OG route now
   prerenders and the production build exits 0.

Verification: `npx tsc --noEmit` clean; fresh `npm run build` exits 0;
real `data/db.json` untouched (md5 ac2458b557fc7001dec14293dab6a4e0).
