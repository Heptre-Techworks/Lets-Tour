# Lets-Tour — Repository Knowledge Map

> **Purpose:** A single, authoritative orientation document for any human or AI tool
> working in this repo. Read this first, then jump to the specific file paths it points
> to. Paths are clickable relative to the repo root.
>
> **Last mapped:** 2026-07-19 · **Branch:** `main`

---

## 1. What this project is

**Lets-Tour** is a premium travel-agency website + headless CMS. Marketing/content team
manages destinations, packages, itineraries, leads, and page layouts through the Payload
admin panel; the public site renders server-side with heavy caching and rich animations.

| Aspect | Value |
|---|---|
| App name | `lets-tour-app` ([package.json](../package.json)) |
| Framework | Next.js **15.4.8** (App Router, React **19.1.0**, Server Components) |
| CMS | Payload CMS **3.53.0** (TypeScript-first, config-as-code) |
| Database | MongoDB (via `@payloadcms/db-mongodb` / mongoose adapter) |
| Media storage | Vercel Blob (`vercelBlobStorage`); S3 adapter present but commented out |
| Email | Nodemailer → Zoho SMTP (`smtppro.zoho.in:465`) |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) + `tailwindcss-animate` |
| Carousels | Embla (`embla-carousel-react` + autoplay) |
| Rich text | Lexical (`@payloadcms/richtext-lexical`) |
| Auth | Payload built-in auth on the `users` collection |
| Deploy target | Vercel (analytics, blob storage, `payload-cloud` plugin) |
| Package manager | pnpm (lockfile: `package-lock.json` present but scripts assume pnpm) |
| Node | 18.20.2+ or >=20.9.0 |

Built by **Heptre Techworks**.

---

## 2. How to run it

```bash
pnpm install
cp .env.example .env      # then fill real values (see §9)
pnpm dev                  # http://localhost:3000  ·  admin at /admin
```

Key scripts ([package.json](../package.json)):

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server (`next dev`) |
| `pnpm build` | Production build; `postbuild` runs `next-sitemap` |
| `pnpm start` | Production server |
| `pnpm generate:types` | **Regenerate `src/payload-types.ts`** after any collection/global change |
| `pnpm generate:importmap` | Regenerate Payload admin import map |
| `pnpm lint` / `lint:fix` | ESLint |
| `pnpm test` | `test:int` (Vitest) + `test:e2e` (Playwright) |

> ⚠️ The README's "Run Development Server" section literally says `m s` — that is a typo/
> personal alias, **not** a real command. Use `pnpm dev`.

**On first boot** (`onInit` in [payload.config.ts](../src/payload.config.ts)) Payload seeds two
admin users if the `users` collection is empty:
`admin@letstour.com / admin123` and `dhanushkumark62@gmail.com / 123456789`.
These are hard-coded default credentials — **change/remove before any real deployment.**

---

## 3. Top-level layout

```
src/
├── payload.config.ts        # ★ THE hub — collections, globals, plugins, email, storage, onInit
├── app/
│   ├── (frontend)/          # Public site (route group)
│   ├── (payload)/           # Admin panel routes (/admin)
│   ├── api/                 # test-email, sheets proxy
│   └── api-custom/          # sheets (duplicate/legacy)
├── collections/             # 30 Payload collections (content model) — see §5
├── globals/                 # Singleton config: ThemeSettings, LandingPage
├── Header/ · Footer/        # Global nav config + React components + hooks
├── PackageLayout/ · DestinationLayout/ · InternationalPackageLayout/  # layout globals
├── blocks/                  # 25 page-builder blocks — see §6
├── heros/                   # 4 hero variants + RenderHero dispatcher
├── components/              # Shared React UI (preloader, FABs, Media, RichText, admin dashboard)
├── hooks/                   # Payload collection hooks (email, revalidation, slug)
├── plugins/                 # Payload plugin wiring + autoRevalidate plugin
├── actions/                 # Next server actions (getMegaMenuData)
├── lib/ · utilities/        # Helpers (caching, URL, meta, media, deepMerge…)
├── fields/                  # Reusable field defs (slug, link, lexical, defaultLexical)
├── access/                  # Access-control fns: anyone, authenticated, authenticatedOrPublished
├── providers/               # React context: Theme, HeaderTheme, PageTransition, DestinationServer
├── search/                  # plugin-search sync + field overrides
└── scripts/                 # One-off migration/debug scripts (run manually)
```

Config/tooling at root: [next.config.js](../next.config.js), [tailwind.config.mjs](../tailwind.config.mjs),
[tsconfig.json](../tsconfig.json), [eslint.config.mjs](../eslint.config.mjs),
[playwright.config.ts](../playwright.config.ts), [vitest.config.mts](../vitest.config.mts),
[redirects.js](../redirects.js), [next-sitemap.config.cjs](../next-sitemap.config.cjs),
[Dockerfile](../Dockerfile), [docker-compose.yml](../docker-compose.yml),
[components.json](../components.json) (shadcn).

Import alias: `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts` ([tsconfig.json](../tsconfig.json)).

---

## 4. The central hub: `payload.config.ts`

[src/payload.config.ts](../src/payload.config.ts) is the single source of truth. It wires:

- **`collections: [...]`** — all 30 collections (§5).
- **`globals: [Header, Footer, ThemeSettings, SearchFilters, PackageLayout, DestinationLayout, LandingPage]`**.
- **`admin`** — custom `Dashboard` view = [TravelDashboard](../src/components/Admin/TravelDashboard.tsx);
  `beforeLogin` component; live-preview breakpoints (Mobile/Tablet/Desktop).
- **`editor: defaultLexical`** — default rich-text config ([src/fields/defaultLexical.ts](../src/fields/defaultLexical.ts)).
- **`db`** — mongoose adapter, `MONGODB_URI`.
- **`email`** — `nodemailerAdapter` → Zoho (`SMTP_HOST`/`ZOHO_USER`/`ZOHO_PASS`).
- **`plugins`** — spread of `./plugins` (§7) **plus `autoRevalidatePlugin`** and `vercelBlobStorage`.
- **`onInit`** — seeds default admins (see §2).
- **`jobs.access`** — cron/jobs gated by logged-in user OR `Bearer ${CRON_SECRET}`.

> **Rule:** any change to a collection or global's fields requires `pnpm generate:types`
> to keep [src/payload-types.ts](../src/payload-types.ts) (the generated type source used
> everywhere via `@/payload-types`) in sync.

---

## 5. Data model — Collections (`src/collections/`)

30 collections, grouped in the admin sidebar by the `admin.group` property. The domain
core is **Destinations → Packages → itinerary**, surrounded by taxonomy and lead capture.

### Content core
| Collection | Slug | Notes / key fields |
|---|---|---|
| [Packages](../src/collections/Packages/index.ts) | `packages` | **Largest (586 lines).** 4 tabs: Overview (name, slug, overview/description richText, heroImage, gallery, brochure PDF), Itinerary (destinations, `route[]` cities+nights, day-wise `itinerary[]` with activities/meals/places), Pricing (price/currency/discount/rating/inclusions/exclusions/goodToKnow), Configuration (isPublished, highlights, labels, continent/country/region, categories, `categoryPills`, themes, vibe, activities, amenities, accommodationTypes, isFeatured/isFamilyFriendly/isHoneymoon). Hooks: `revalidatePackage`. |
| [Destinations](../src/collections/Destinations/index.ts) | `destinations` | 425 lines. name/slug, short+full description, featuredImage/coverImage/gallery, `heroData`, region, `type` (international/domestic), country, continent, cities, places, startingPrice, discount, isFeatured/isPopular. |
| [InternationalPackage](../src/collections/InternationalPackage/index.ts) | 414 lines. Parallel package model for international trips (has its own `InternationalPackageLayout` global). |
| [Posts](../src/collections/Posts/index.ts) | `posts` | Blog; feeds `plugin-search` + sitemap. |
| [Pages](../src/collections/Pages/index.ts) | `pages` | Block-based page builder (`layout` = blocks array); `home` slug is special (see §8). |
| [Media](../src/collections/Media.ts) | `media` | Upload collection; stored on Vercel Blob; used by `sharp` for image processing. |

### Taxonomy / supporting entities
`Countries`, `Regions`, `Cities`, `Places`, `Themes`, `Vibes`, `Categories`,
`PackageCategories`, `AccommodationTypes`, `Activities`, `Amenities`, `Inclusions`,
`Exclusions`, `MarketingBanners`, `Promotions`, `SocialPosts`, `Reviews`, `Favourites`,
`SearchFilters` (this last one is registered as a **global**, not collection — see config).

### Lead capture (admin group "Trip Requests")
| Collection | Slug | Purpose |
|---|---|---|
| [Bookings](../src/collections/Bookings.ts) | `bookings` | "Book Now" submissions. `create: () => true` (public); read/update restricted to `agent`/`admin` or owning user. Unique `bookingReference`. Supports guest bookings (guestName/Email/Phone). Hook: `sendLeadEmail`. |
| [CustomTripRequests](../src/collections/CustomTripRequests.ts) | `custom-trip-requests` | "Plan My Trip"/"Curate" forms. Public create, admin-only read. budget/dates/preferences/source/status. Hook: `sendLeadEmail`. |
| [BulkBookingRequests](../src/collections/BulkBookingRequests.ts) | `bulk-booking-requests` | Group/bulk enquiries. |

### Users & auth
[Users](../src/collections/Users/index.ts) — `auth: true`. Roles: **`customer` / `agent` / `admin`**
(select field, `saveToJWT`). Admin-panel access + user CRUD gated to `admin`; users can
edit themselves. This role model drives access control across leads/bookings.

**Access-control helpers** ([src/access/](../src/access/)): `anyone` (public read),
`authenticated` (logged-in), `authenticatedOrPublished` (draft-aware public read).

---

## 6. Page builder — Blocks (`src/blocks/`)

Pages/layouts are composed of **blocks**. The registry + serialization live in
[src/blocks/RenderBlocks.tsx](../src/blocks/RenderBlocks.tsx). Each block folder typically
has: `config.ts` (Payload field schema, exports a `Block`), `Component.tsx` (server render),
and sometimes `Component.client.tsx` (client interactivity).

**`blockType` → component map** (from RenderBlocks.tsx):

`archive`, `content`, `cta`, `formBlock`, `mediaBlock`, `dynamicScroller`, `popularNow`,
`uniformCardCarousel`, `staticImageBlock`, `nonUniformCardCarousel`, `upDownCardCarousel`,
`clientStories`, `destinationHeroCarousel`, `instagramCarousel`, `imageGrid`,
`travelPackageExplorer`, `packageHighlights`, `featureCarousel`, `dynamicForm`, `infoPanel`,
`accreditationsGrid`.

Other block folders present but wired elsewhere: `Banner`, `Code`, `RelatedPosts`,
`HeroSearchBlock`, `PackageHighlights`, `Form` (form-builder).

### Two important mechanisms in RenderBlocks.tsx
1. **`serializeBlockData()`** — strips functions and flattens relationship/media objects
   to plain data before passing server→client, while **preserving Lexical richText**
   (objects containing a `root` key) and nested blocks (`sections`/`items`/`images`).
2. **Context injection** — RenderBlocks accepts `packageContext`, `destinationContext`,
   `slug` and injects them into context-aware blocks so a block set to **"auto"** resolves
   its data from the current page:
   - `packageHighlights` / `infoPanel` ← `packageContext` (dataSource `auto`→`package`)
   - `destinationHeroCarousel` ← `destinationContext` (populateBy `auto`→`destination`)
   - `dynamicScroller` ← `destinationContext`
   - `travelPackageExplorer` / `destinationHeroCarousel` ← `slug`

### DynamicScroller — the "listing engine"
[src/blocks/DynamicScroller/config.ts](../src/blocks/DynamicScroller/config.ts) is the most
important block for editors. It has **Package / Theme / Vibe** sub-sections. Packages can be
populated by: `manual`, `auto (from URL slug)`, `featured`, `featuredDestinations`,
`destinations`, or `vibes`. Titles support `{slug}` auto-replacement. See the admin guide
([admin-user-guide.md](../admin-user-guide.md) §3) for the editor-facing explanation.

### Heros (`src/heros/`)
[RenderHero.tsx](../src/heros/RenderHero.tsx) dispatches to one of: `MainHero`,
`PackageHero`, `DestinationHero`, `PostHero` based on hero `type`. Config in
[src/heros/config.ts](../src/heros/config.ts).

---

## 7. Plugins & cross-cutting hooks

### Payload plugins ([src/plugins/index.ts](../src/plugins/index.ts))
- `redirectsPlugin` (collections: pages, posts; `afterChange: revalidateRedirects`)
- `nestedDocsPlugin` (categories, URL from slug chain)
- `seoPlugin` (`generateTitle` → "…| Let's Tour", `generateURL`)
- `formBuilderPlugin` (payments off; richtext confirmation message)
- `searchPlugin` (indexes `posts`; `beforeSync` in [src/search/beforeSync.ts](../src/search/beforeSync.ts))
- `payloadCloudPlugin`

### autoRevalidate plugin ([src/plugins/autoValidate.ts](../src/plugins/autoValidate.ts))
Registered separately in `payload.config.ts`. **Injects revalidation hooks into EVERY
collection and global automatically** (`afterChange`/`afterDelete`), calling the functions in
[src/hooks/revalidateSite.ts](../src/hooks/revalidateSite.ts). That file does
collection-aware Next.js `revalidatePath`/`revalidateTag` — e.g. a `packages` change
revalidates `/packages` + `/packages/[slug]`; unknown/taxonomy collections trigger a full
`revalidatePath('/', 'layout')`. Skippable via `req.context.skipRevalidation`.

### Lead email ([src/hooks/sendLeadEmail.ts](../src/hooks/sendLeadEmail.ts))
`afterChange` hook on `bookings` & `custom-trip-requests`. On `create`, builds an HTML email
(distinct templates for bookings vs custom trips) and sends via Zoho SMTP to
`LEAD_NOTIFICATION_EMAIL`/`SMTP_USER`. Failures are logged, not thrown.

### Other hooks ([src/hooks/](../src/hooks/))
`formatSlug.ts`, `useSlugReplacement.ts`, `populatePublishedAt.ts`, `revalidateRedirects.ts`.
Per-collection hooks live under `collections/*/hooks/` (e.g. `revalidatePackage`).

---

## 8. Frontend rendering & caching

### Routes ([src/app/(frontend)/](../src/app/(frontend)/))
| Route | File | Notes |
|---|---|---|
| `/[slug]` | [`[slug]/page.tsx`](../src/app/(frontend)/[slug]/page.tsx) | Generic Pages. `home` slug pulls hero from the **LandingPage global**. `generateStaticParams` prebuilds all non-home pages. |
| `/packages` · `/packages/[slug]` | `packages/` | Package listing + detail |
| `/destinations` · `/destinations/[slug]` | `destinations/` | Destination listing + detail |
| `/posts` · `/posts/[slug]` · `/posts/page/[n]` | `posts/` | Blog + pagination |
| `/themes/[slug]` | `themes/` | Theme landing pages |
| `/search` | `search/` | Search results (plugin-search) |
| `/(sitemaps)/*.xml` | `(sitemaps)/` | pages/posts/packages/destinations sitemaps |
| `/next/preview`, `/next/exit-preview`, `/next/seed` | `next/` | Draft preview + seeding |

Layout: [src/app/(frontend)/layout.tsx](../src/app/(frontend)/layout.tsx) mounts Header,
Footer, `GlobalPreloader` (the "plane journey" animation), `WhatsAppFAB`, `ScrollToTopFAB`,
theme init, `PageTransitionProvider`, and Vercel Analytics. Fonts: Geist, Inter, Roboto,
Amiri, Kaushan Script, Neuton, and a local NATS font.

### Caching pattern
[src/utilities/getGlobals.ts](../src/utilities/getGlobals.ts) exports `getCachedGlobal` and
`getCachedCollection` — both wrap Payload reads in `unstable_cache` with tags
`global_<slug>` / `collection_<slug>` (10-min default revalidate). These tags are exactly
what `revalidateSite.ts` invalidates on writes, giving a clean write→cache-bust loop. Draft
mode bypasses cache and reads live.

The mega-menu uses a server action [src/actions/getMegaMenuData.ts](../src/actions/getMegaMenuData.ts)
(also `unstable_cache`) fetching published destinations + packages for the header dropdown.

---

## 9. External integrations & env vars

| Integration | Where | Env vars |
|---|---|---|
| MongoDB | db adapter | `MONGODB_URI` (README also mentions `DATABASE_URI`) |
| Payload secret | config | `PAYLOAD_SECRET` |
| Server URL / CORS | `getServerSideURL` | `NEXT_PUBLIC_SERVER_URL`, `VERCEL_PROJECT_PRODUCTION_URL` |
| Zoho email | config + sendLeadEmail | `ZOHO_USER`, `ZOHO_PASS` (App Password), `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `LEAD_NOTIFICATION_EMAIL` |
| Vercel Blob | storage plugin | `BLOB_READ_WRITE_TOKEN` |
| S3 (disabled) | commented in config | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |
| Cron/jobs auth | `jobs.access` | `CRON_SECRET` |
| Preview | preview route | `PREVIEW_SECRET` |
| Google Sheets proxy | [api/sheets/route.ts](../src/app/api/sheets/route.ts) | Relays POST to a hard-coded Cloud Run URL (`sheets-writer-…run.app`) — server-side to dodge CORS; stamps `Created at`. Also a duplicate at `api-custom/sheets`. |
| Test email | [api/test-email/route.ts](../src/app/api/test-email/route.ts) | GET verifies SMTP + sends a test mail |

### ⚠️ Security notes (worth flagging to the team)
- **[.env.example](../.env.example) contains real-looking committed secrets** (a MongoDB
  Atlas SRV string with credentials, S3 keys, PAYLOAD_SECRET) — even though commented out.
  These should be rotated and scrubbed from git history.
- **Hard-coded default admin passwords** in `onInit` (`admin123`, `123456789`).
- The Google Sheets Cloud Run endpoint is hard-coded and unauthenticated in the proxy.

---

## 10. Testing & quality

- **Integration:** Vitest ([vitest.config.mts](../vitest.config.mts), [tests/int/](../tests/int/)).
- **E2E:** Playwright ([playwright.config.ts](../playwright.config.ts), [tests/e2e/](../tests/e2e/)).
- **Lint/format:** ESLint (`next lint`) + Prettier (`.prettierrc.json`).
- `test-lead-request.http` — manual HTTP request fixture for lead endpoints.
- `src/scripts/` — **manually-run** migration/debug utilities (migrate richtext, migrate
  countries, backup-db, debug-layout, fix-menu-data, etc.). Not part of the app runtime.

---

## 11. Where to make common changes (playbook)

| Task | Start here |
|---|---|
| Add/modify a content type | `src/collections/…` → register in [payload.config.ts](../src/payload.config.ts) → `pnpm generate:types` |
| Add a page-builder block | `src/blocks/<Name>/{config.ts,Component.tsx}` → register in [RenderBlocks.tsx](../src/blocks/RenderBlocks.tsx) → add its config to the host collection/global's blocks field |
| Change nav / footer / theme | `src/Header/config.ts`, `src/Footer/config.ts`, `src/globals/ThemeSettings.ts` |
| Change the home hero | `src/globals/LandingPage.ts` (rendered by `/[slug]` when slug=`home`) |
| Lead email content | [src/hooks/sendLeadEmail.ts](../src/hooks/sendLeadEmail.ts) |
| Cache/revalidation behavior | [src/hooks/revalidateSite.ts](../src/hooks/revalidateSite.ts) + [src/utilities/getGlobals.ts](../src/utilities/getGlobals.ts) |
| Access rules | `src/access/` + per-collection `access` blocks; roles in [Users](../src/collections/Users/index.ts) |
| New public page/route | `src/app/(frontend)/…` |
| Redirects | [redirects.js](../redirects.js) (+ redirects plugin for CMS-managed ones) |
| Allowed image hosts | [next.config.js](../next.config.js) `images.remotePatterns` |

---

## 12. Quick reference — glossary

- **Destination** — root geographic entity (e.g. "Kashmir", "Bali"); owns cities & places.
- **Package** — a sellable trip linked to destination(s), with day-wise itinerary, pricing,
  themes, vibe, inclusions/exclusions.
- **Place** — attraction/POI under a destination ("Things to Do").
- **Theme** (many per package) vs **Vibe** (one primary) — filtering/tab taxonomies used by
  DynamicScroller.
- **Block** — a composable content unit in a Page/layout's `layout` array.
- **Global** — a singleton config document (Header, Footer, ThemeSettings, LandingPage,
  layout globals, SearchFilters).
- **Lead** — a Booking, CustomTripRequest, or BulkBookingRequest submission.

---

## 13. Companion docs

- [README.md](../README.md) — setup + high-level architecture (has Mermaid diagrams).
- [admin-user-guide.md](../admin-user-guide.md) — **content-editor guide** (dashboard,
  content hierarchy, page building, managing trip requests, globals). Read this to
  understand the CMS from the editor's point of view.
