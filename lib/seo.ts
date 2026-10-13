import type { Metadata } from 'next';

export function resolveSiteUrl(value = process.env.SITE_URL || 'https://vedagroup.uk') {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL must be an HTTP(S) origin without a path, credentials, query or fragment.');
  return url.origin;
}
export const siteUrl = resolveSiteUrl();
export const siteDescription = 'Veda Group helps businesses and institutions explore international markets, develop commercial relationships and pursue cross-border opportunities.';
export function indexingEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === 'production' && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production') && env.SEO_INDEXING !== 'false';
}
export function absoluteUrl(path: string) { return new URL(path, `${siteUrl}/`).href; }
export function pageMetadata(path: string, title: string, description: string, index = true): Metadata {
  const fullTitle = path === '/' ? 'Veda Group | International Business Development' : `${title} | Veda Group`;
  return {
    title: { absolute: fullTitle }, description, alternates: { canonical: absoluteUrl(path) },
    robots: { index: index && indexingEnabled(), follow: true, googleBot: { index: index && indexingEnabled(), follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type: 'website', siteName: 'Veda Group', locale: 'en_GB', title: fullTitle, description, url: absoluteUrl(path), images: [{ url: absoluteUrl('/opengraph-image'), width: 1200, height: 630, alt: 'Veda Group — International Business Development' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [absoluteUrl('/opengraph-image')] },
  };
}
export function websiteSchema() {
  return { '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Veda Group', url: `${siteUrl}/`, description: siteDescription }, { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Veda Group', alternateName: 'Veda Group International Business Development', url: `${siteUrl}/`, inLanguage: 'en-GB', publisher: { '@id': `${siteUrl}/#organization` } }] };
}
export function pageSchema(path: string, name: string, description: string, type = 'WebPage') {
  const breadcrumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }];
  if (path.startsWith('/services/')) breadcrumbs.push({ '@type': 'ListItem', position: 2, name: 'Services', item: absoluteUrl('/services') });
  if (path !== '/') breadcrumbs.push({ '@type': 'ListItem', position: breadcrumbs.length + 1, name, item: absoluteUrl(path) });
  const graph: Record<string, unknown>[] = [{ '@type': type, '@id': `${absoluteUrl(path)}#webpage`, url: absoluteUrl(path), name, description, inLanguage: 'en-GB', isPartOf: { '@id': `${siteUrl}/#website` }, about: { '@id': `${siteUrl}/#organization` }, ...(path === '/' ? {} : { breadcrumb: { '@id': `${absoluteUrl(path)}#breadcrumb` } }) }];
  if (path !== '/') graph.push({ '@type': 'BreadcrumbList', '@id': `${absoluteUrl(path)}#breadcrumb`, itemListElement: breadcrumbs });
  if (path.startsWith('/services/')) graph.push({ '@type': 'Service', '@id': `${absoluteUrl(path)}#service`, name, description, url: absoluteUrl(path), provider: { '@id': `${siteUrl}/#organization` }, mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` } });
  return { '@context': 'https://schema.org', '@graph': graph };
}
