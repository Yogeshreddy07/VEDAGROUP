# Veda Group local website

Next.js App Router, TypeScript, Tailwind CSS and locally hosted Manrope. Public content is structured in `lib/content.ts`; shared design components live in `components/`. The developer brief remains untouched.

## Run locally

Requires Node.js 20.9 or later; built and checked with Node 22.23.3.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3847. Production preview: `npm run build`, then `npm run start`.

## Validation

```powershell
npm test
npm run typecheck
npm run build
npx playwright install chromium firefox webkit
node scripts/qa.mjs
```

Run browser QA against a fresh production preview. Local rate limiting allows five attempts per ten minutes; restarting the server clears only the local test limiter. QA intentionally reaches this limit. Screenshots and machine-readable results are written to ignored `test-results/`.

## Content editing

Edit service descriptions, audience categories and process stages in `lib/content.ts`. Main page copy lives in its corresponding `app/` page. Metadata is defined beside each page. `content/insights.json` is reserved for approved future articles; it is empty, and Insights has no navigation or sitemap entry. Connect a CMS only when approved article content and an editorial workflow are available. No articles are invented.

## Enquiries

Default mode is `local`: validation and spam/rate-limit protection run, then submitted details are discarded. No email is sent; no enquiry record is stored; no personal enquiry content is logged. Use fictional details only.

Copy `.env.example` to `.env.local` to configure a future integration. Email mode uses the server-side Resend API and requires an approved recipient and verified sender, plus a shared Upstash-compatible Redis REST rate limiter. Never put secrets in public environment variables or source control. Without a shared limiter, email mode fails closed. A provider acceptance response does not prove final inbox delivery. Test approved email routing and provider failures before enabling real enquiries.

Set `SITE_ORIGIN` to the exact public origin for email mode. The production proxy must overwrite `X-Real-IP` with the actual client address. Validate that contract for the selected hosting platform. Production abuse protection and retention decisions need an owner review. The local limiter intentionally uses one shared local bucket.

## Before publication

This project is local only. Nothing has been deployed or published, and no DNS has changed. `robots.txt` and metadata block indexing. Remove those restrictions only after launch approval.

Confirm the legal company identity, logo and brand direction; available services and audiences; public contact details; email recipient and sender; privacy notice and retention; processors and hosting disclosures; and all final copy. Legal routes are clearly marked review drafts. Optional analytics and tracking are disabled; no cookie banner is needed for optional technologies that are not installed.

Host with a supported Next.js Node runtime (Vercel-compatible architecture), HTTPS, and server-only environment variables. Confirm the primary domain/canonicals before launch; DNS remains the owner's launch task. Back up source and lockfile to an owner-controlled private repository. Rotate secrets if compromised; apply dependency updates with the validation commands above. No CMS account, hosting account or administrator credential has been created.

## Assets

Temporary text wordmark only. Manrope is bundled through `@fontsource/manrope` under its included font licence. Photos are downloaded from Unsplash and served locally:

- Architecture: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab
- London: https://images.unsplash.com/photo-1513635269975-59663e0ac1ad

Record owner approval of imagery before launch; the photographs illustrate international places and do not represent Veda Group offices.

## Design and route map

Home → introduction → six services → audiences → relationship-led growth → five-stage approach → about → enquiry CTA. Navy, muted teal, white and neutral grey; consistent typography, borders, spacing and responsive layouts. All six service detail pages include potential situations, support, engagement start and availability qualifications. Legal drafts and inactive Insights are separate routes.

Framework installation reference: https://nextjs.org/docs/app/getting-started/installation
