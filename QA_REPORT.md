# Veda Group local QA and handover

Completed 12 October 2026. This is a local build; no deployment, DNS changes or live email delivery took place.

## Implemented

Homepage, About Us, Services, all six service detail pages, Who We Help, Our Approach, Contact, and three owner-review legal routes. Insights is inactive, contains no articles, and is excluded from navigation and the sitemap. Public content follows the developer brief; no invented clients, credentials, office details, contact details, testimonials or statistics are included.

Shared components include responsive navigation and services disclosure, mobile menu with Escape handling, service cards, timeline, breadcrumbs, enquiry form, footer, loading, error and not-found states. Images and fonts are served locally. Canonicals, unique titles/descriptions, Open Graph metadata, sitemap and organisation structured data are implemented. Indexing is deliberately blocked pending approval.

## Checks completed

| Check | Result |
| --- | --- |
| Production build and TypeScript | Passed |
| Enquiry validation unit tests | 5 passed |
| Runtime browser page errors | None observed |
| Route loading | 16 routes returned HTTP 200 |
| Homepage internal links | Passed |
| Desktop automated accessibility | Zero axe violations against WCAG A/AA rules on all 16 routes |
| Mobile automated accessibility | Zero axe violations on the homepage |
| Responsive horizontal overflow | None at 390px and 1440px across all routes; homepage also checked at 768px |
| Mobile navigation | Open, expanded state and Escape close passed |
| Service enquiry preselection | Passed |
| Client validation and local form submission | Passed |
| Cross-origin rejection | HTTP 403 confirmed |
| Invalid server payload | HTTP 422 confirmed |
| Honeypot rejection | HTTP 422 confirmed |
| Oversized request | HTTP 413 confirmed |
| Rate limit | HTTP 429 confirmed |
| Chromium | Full suite passed |
| Firefox and WebKit | Homepage and contact rendering smoke checks passed |
| Production dependency audit | Zero known vulnerabilities reported |

Desktop, mobile and tablet homepage screenshots were visually reviewed. Automated accessibility checks supplement manual review; they do not establish complete accessibility conformance. WebKit testing is not physical Safari device testing. Real-device testing and a measured Lighthouse/Core Web Vitals baseline remain pre-launch checks; no performance score is claimed.

Browser QA output is in `test-results/qa-results.json`, with responsive screenshots in the same ignored directory. Run `node scripts/qa.mjs` against a freshly started production server to reproduce. The abuse tests intentionally exhaust the local limiter.

## Owner dependencies before launch

- Approve logo, colours, typography, imagery and final page copy.
- Confirm legal company identity, any public contact details, and available services and audiences.
- Supply and approve the enquiry recipient and verified sending identity. Configure server-only credentials and a shared rate limiter, set the exact site origin, and test provider acceptance, inbox delivery and failures.
- Review and approve privacy content, retention, processor/hosting disclosures and any required terms with appropriate professional input. Legal pages currently remain explicit preparation drafts.
- Review real deployment proxy behaviour, HTTPS, domain/canonicals and security configuration. Configure production indexing only after final publication approval.
- Approve any future analytics and implement corresponding disclosure and preference controls before enabling them.

No account credentials or admin access have been created. The owner should maintain the source and lockfile in a private repository, control hosting access, back up source, and validate dependency updates. Editing, setup and configuration instructions are in `README.md` and `.env.example`.
