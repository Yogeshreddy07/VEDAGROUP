# Veda Group SEO audit

Audit date: 13 October 2026 (Asia/Calcutta). Confirmed official origin: https://vedagroup.uk. Changes are local and undeployed. Read [SEO_TEST_RESULTS.md](SEO_TEST_RESULTS.md) for measured verification and limitations.

## Release decision

Local improvements are implemented. Production release requires correction of the hosting redirect, rotation of the active exposed Resend key, confirmed production enquiry configuration, and approved privacy disclosures. Search Console ownership and Google-selected canonicals remain unverified. Rankings and sitelinks cannot be guaranteed.

## Repository assessment

The working tree was clean before editing. Reviewed the App Router routes, shared components, content/imagery, SEO helper, sitemap, robots, social image, enquiry endpoint/configuration, rate limiter, motion behavior, environment key presence, framework configuration, dependencies, existing tests/QA scripts, README, QA report and previous SEO plan. Secret values were never printed. The original developer brief and binary assets were retained.

| Component | Initial classification | Finding and disposition |
| --- | --- | --- |
| `app/layout.tsx` entity markup | Broken | Hardcoded Organization-only script displaced `websiteSchema()`. Page schemas referenced missing entity IDs; WebSite was absent. Restored shared escaped graph with stable Organization/WebSite IDs. |
| `lib/seo.ts` metadata/origin helper | Implemented but needs improvement | Validated origin and shared unique metadata worked. Non-Vercel production builds could index staging by default. Require explicit opt-in outside Vercel production and prohibit indexing when SITE_URL is a nonofficial origin. |
| `app/page.tsx` | Correct and verified | Visible brand, clear international business development description, one H1, SSR content, crawlable service/about/contact links. Retained premium design and animations. |
| Services index and ten service routes | Implemented but needs improvement | All ten substantive pages existed, including four beyond the six highlighted in the request. Retained actual scope and regulated-advice limitations; shortened natural metadata and added two relevant service links per page. No new keyword-variation pages. |
| About, Who We Help, Our Approach, Contact | Correct and verified | Distinct metadata, headings, enquiry paths and semantic page schemas. Contact remains dynamically server rendered. |
| Insights and legal routes | Requires owner confirmation | Deliberate noindex and sitemap exclusion retained. Insights has no articles. Legal notices are drafts; privacy text describes local discarding although email mode exists. Owner-approved processing disclosures are essential before taking live enquiries. |
| `app/sitemap.ts` / `searchPages` | Correct and verified | Six main routes plus ten services = 16 URLs. No drafts/errors, artificial timestamps, priorities or frequencies. Retained. |
| `app/robots.ts` | Correct and verified | Production allows public routes and excludes API; previews disallow crawling. Added complementary response headers in config because robots blocking alone is not an indexing/privacy guarantee. |
| `components/structured-data.tsx` | Correct and verified | Escapes `<` in JSON-LD. Retained; now used for global entity graph as originally intended. |
| `app/opengraph-image.tsx`, favicon, local images | Correct and verified | Public image endpoints load. Accurate descriptive alt text; no approved corporate-logo claim. Retained. |
| Canonical host behavior | Broken in production | Live apex redirects 308 to www despite non-www canonical/sitemap identity. HTTP apex introduces a second hop. Host correction requires owner access. Optional application www-to-apex redirect implemented but disabled by default to prevent a loop with the existing host rule. Trailing slash normalization retained explicitly. |
| Preview response headers | Missing | Added `X-Robots-Tag: noindex, nofollow` to nonindexable builds. Private previews also need hosting authentication; indexing controls are not access controls. |
| Fonts/performance | Implemented but needs improvement | Mobile baseline showed slow LCP and intermittent large layout shifts. Kept the same four Manrope weights; added local-font preloading and adjusted Arial fallback through `next/font/local`. Existing imagery, CSS design and motion retained. See before/after laboratory evidence. |
| `scripts/qa-seo.mjs` | Implemented but needs improvement | Existing QA covered metadata but missed the global entity regression. Extended to check entity IDs/references, exact sitemap set, duplicate canonicals, Twitter, internal links, images, console errors, redirects, both build modes and every public route at two widths. Added JavaScript-disabled SSR smoke checks. |
| Enquiry functionality | Correct locally; requires owner confirmation in production | Kept handler, validation, templates and rate limiting unchanged. Unit tests cover mocked delivery/failure paths; browser test intercepts delivery. Local .env supplies email settings but no SITE_ORIGIN/shared Redis settings. Hosting configuration and final inbox delivery are unknown. |
| Credential handling | Requires owner action | Configured key accepted read-only Resend `/domains` request (200): active. No key patterns in six available Git commits; no current key in `.next/static` or `public`. Other exports are outside that scan. Rotation not completed without provider/hosting account access. |
| Search Console | Requires owner confirmation | Existing optional HTML token support retained. Domain verification needs account-specific DNS TXT value. No property verified, sitemap submitted or indexing requested in this task. |
| Security headers/dependencies | Correct and verified within scope | Existing nosniff, frame denial, referrer and permissions headers retained. `npm audit --omit=dev` returned zero known vulnerabilities; this is a package-audit result, not a security certification. |

## Previous plan compared with actual repository

The earlier plan correctly listed 16 substantive routes, centralized canonical metadata, a sitemap without fabricated dates, draft exclusions, visible service breadcrumbs, a social image and optional verification. Those systems were retained. Its Organization/WebSite claim did not match the current layout and is now repaired. Its non-Vercel staging protection relied on remembering an override; this audit makes such builds nonindexable by default. Production access was previously inconclusive; direct HTTP evidence now confirms public access and the host/canonical contradiction. The earlier QA_REPORT describes six services and deliberate indexing blocking; it is historical, not the current ten-service release status. This folder supersedes those release conclusions.

Remaining previous-plan work: verified legal/trading identity, public contact details, approved logo and official profiles, approved legal notices, hosting canonicalization, DNS verification, Search Console baseline, actual field Core Web Vitals, client evidence permissions and genuine articles. Existing client-logo strip was preserved, but the six relationships and permission to use those logos still require owner confirmation; they were not added to schema or independently certified here.

## Production crawl/Ads observations

Public HTTPS www homepage, About, market entry and Contact returned 200; unknown service returned 404. www robots allows crawling and sitemap lists 16 non-www URLs. Simulated Googlebot and AdsBot requests followed the redirect and received server-rendered H1 content. This does not establish real Googlebot IP access, geographic CDN access, Google's rendering result, Ads policy approval or indexing. Check CDN logs and Search Console live inspection. Search and advertising crawlers have separate review requirements; no campaign changes or spend occurred. [Google technical requirements](https://developers.google.com/search/docs/essentials/technical), [Ads destination requirements](https://support.google.com/adspolicy/answer/6368661?hl=en).

## Safe publication boundaries

No DNS, hosting setting, deployment, real enquiry, email or campaign was changed. No fabricated offices, founders, sameAs profiles, outcomes, ratings, FAQs or case studies were published. The active exposed key must be rotated using provider account access; placing a replacement secret in a report or source file is not a rotation workflow. Review [GOOGLE_INDEXING_CHECKLIST.md](GOOGLE_INDEXING_CHECKLIST.md) before release.
