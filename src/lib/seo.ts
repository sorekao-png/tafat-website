/**
 * Centralized SEO constants and typed JSON-LD builders for TAFAT.
 *
 * Single identity: the TAFAT Organization and WebSite nodes are defined exactly
 * once (on the homepage) with stable @ids. Every other page references those
 * @ids (`{"@id": ...}`) instead of embedding duplicate WebSite/Organization
 * objects, so no page ever carries two competing identities.
 *
 * Logo: TAFAT does not yet publish a live, public logo asset, so the
 * Organization node deliberately omits `logo` — inventing a logo URL would be a
 * false claim.
 */

export const SITE_URL = "https://tafat.co.uk";
export const SITE_NAME = "Tafat";
export const SITE_DESCRIPTION =
  "Discover thoughtfully curated digital tools and wellbeing resources.";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface JsonLdScript {
  type: "application/ld+json";
  children: string;
}

/** Wrap a structured-data object as a script tag payload. */
export function ldScript(ld: Record<string, unknown>): JsonLdScript {
  return { type: "application/ld+json", children: JSON.stringify(ld) };
}

/**
 * Homepage identity graph: the single definition of TAFAT's Organization and
 * WebSite. Every other page references these @ids.
 */
export function homepageIdentityJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: SITE_DESCRIPTION,
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
    ],
  };
}

/** BreadcrumbList node without @context (for nesting inside a page node). */
export function breadcrumbNode(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Standalone BreadcrumbList JSON-LD (guides emit this as its own script). */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return { "@context": "https://schema.org", ...breadcrumbNode(items) };
}

export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  breadcrumb: BreadcrumbItem[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { "@id": WEBSITE_ID },
    breadcrumb: breadcrumbNode(opts.breadcrumb),
  };
}

export function webPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  breadcrumb: BreadcrumbItem[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { "@id": WEBSITE_ID },
    breadcrumb: breadcrumbNode(opts.breadcrumb),
  };
}

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  path: string;
  /** Only set when a date is factually visible on the page (e.g. "August 2026"). */
  datePublished?: string;
  /** Only set when a "last reviewed" date is factually visible on the page. */
  dateModified?: string;
  /** Absolute production image URL. */
  imageUrl?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.imageUrl ? { image: [opts.imageUrl] } : {}),
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntityOfPage: `${SITE_URL}${opts.path}`,
  };
}

/** FAQPage built ONLY from question/answer pairs visibly rendered on the page. */
export function faqPageJsonLd(
  qas: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer },
    })),
  };
}
