import { createFileRoute } from "@tanstack/react-router";
import {
  EDITORIAL_INTRO,
  EDITORIAL_PRINCIPLES,
  EDITORIAL_STANDARDS_PATH,
  EDITORIAL_SUBTITLE,
  EDITORIAL_TITLE,
  IMPORTANT_NOTE_COPY,
  IMPORTANT_NOTE_TITLE,
  INTEGRITY_DISCLOSURE,
  INTEGRITY_LOYALTY,
  INTEGRITY_TITLE,
  OUR_PROMISE_COPY,
  OUR_PROMISE_TITLE,
  PRINCIPLES_TITLE,
} from "../lib/editorial-standard";
import { EditorialStandardIllustration, ShieldIcon, principleIconByKey } from "../lib/illustrations";
import { ldScript, webPageJsonLd } from "../lib/seo";

const CANONICAL = "https://tafat.co.uk/editorial-standards";
const ROUTE_ID = "/editorial-standards";
const DESCRIPTION =
  "How TAFAT reviews products: the editorial standard behind every guide and recommendation — our principles, our important note on affiliate links, and our promise to readers.";

export const Route = createFileRoute("/editorial-standards")({
  head: (ctx) => {
    // Route-level head strategy: this page is a leaf route, so when it is the
    // deepest match it owns the page head — exactly one canonical, page metadata,
    // and truthful WebPage + BreadcrumbList JSON-LD.
    const isLeaf = ctx.matches[ctx.matches.length - 1]?.routeId === ROUTE_ID;
    if (!isLeaf) return {};
    return {
      meta: [
        { title: "The TAFAT Editorial Standard | TAFAT" },
        { name: "description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "The TAFAT Editorial Standard | TAFAT" },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: CANONICAL },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "The TAFAT Editorial Standard | TAFAT" },
        { name: "twitter:description", content: DESCRIPTION },
      ],
      links: [{ rel: "canonical", href: CANONICAL }],
      scripts: [
        ldScript(
          webPageJsonLd({
            name: "The TAFAT Editorial Standard",
            description: DESCRIPTION,
            path: "/editorial-standards",
            breadcrumb: [
              { name: "Home", path: "/" },
              { name: "Editorial Standards", path: "/editorial-standards" },
            ],
          }),
        ),
      ],
    };
  },
  component: EditorialStandards,
});

function EditorialStandards() {
  return (
    <div className="site-shell">
      <header className="nav wrap">
        <a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a>
        <nav><a href="/#discover">Discover</a><a href="/health-wellness">Health &amp; Wellness</a><a href="/#how-we-review">Our approach</a><a href={EDITORIAL_STANDARDS_PATH} aria-current="page">Editorial Standards</a></nav>
        <a className="nav-pill" href="/#stay-in-loop">Sign in / join</a>
      </header>
      <main>
        <section className="editorial-standard editorial-standard-page" aria-labelledby="editorial-standard-page-title">
          <div className="wrap">
            <div className="es-illustration" aria-hidden="true"><EditorialStandardIllustration /></div>
            <p className="eyebrow es-eyebrow"><span className="spark">✦</span> How we review</p>
            <h1 id="editorial-standard-page-title">{EDITORIAL_TITLE}</h1>
            <p className="es-subtitle">{EDITORIAL_SUBTITLE}</p>
            <p className="es-intro">{EDITORIAL_INTRO}</p>
            <h2 className="es-principles-title">{PRINCIPLES_TITLE}</h2>
            <div className="principle-grid">
              {EDITORIAL_PRINCIPLES.map((p) => {const Icon = principleIconByKey[p.art];return <article className="principle-card" key={p.name}><span className="principle-icon" aria-hidden="true"><Icon /></span><h3>{p.name}</h3><p>{p.copy}</p></article>;})}
            </div>
            <div className="es-note"><span className="es-note-icon" aria-hidden="true"><ShieldIcon /></span><div><h2>{IMPORTANT_NOTE_TITLE}</h2><p>{IMPORTANT_NOTE_COPY}</p></div></div>
            <div className="es-promise"><p className="eyebrow es-eyebrow">{OUR_PROMISE_TITLE}</p><blockquote><span className="quote-mark" aria-hidden="true">“</span><span>{OUR_PROMISE_COPY}</span></blockquote></div>
            <footer className="es-integrity"><strong>{INTEGRITY_TITLE}</strong><p>{INTEGRITY_DISCLOSURE}</p><p className="es-loyalty">{INTEGRITY_LOYALTY}</p><p className="es-back"><a href="/">← Back to Tafat</a> · <a href="/health-wellness/the-complete-guide-to-magnesium">Read an Evidence Guide</a></p></footer>
          </div>
        </section>
      </main>
      <footer className="footer wrap"><a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a><p>Good things, found thoughtfully.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href={EDITORIAL_STANDARDS_PATH}>Editorial Standards</a><a href="mailto:hello@tafat.example">Contact</a></div><small>© 2026 Tafat · Affiliate relationships are disclosed on every find.</small></footer>
    </div>
  );
}
