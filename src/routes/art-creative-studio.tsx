import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { ConsentBanner } from "../lib/consent-banner";
import { ArtIllustration, illustrationByKey } from "../lib/illustrations";
import { startLassoForRoute } from "../lib/lasso";
import { trackEvent } from "../lib/measurement";
import { collectionPageJsonLd, ldScript } from "../lib/seo";

const description = "Explore evidence-led guides to artist materials, studio setup, and creative practice from TAFAT.";
const canonical = "https://tafat.co.uk/art-creative-studio";
const ROUTE_ID = "/art-creative-studio";
const topics = [
  ["Acrylic Paint", "Clear guidance for choosing acrylics and understanding how they behave."],
  ["Watercolour", "Thoughtful notes on pigments, paper, brushes, and technique."],
  ["Oil Paint", "A considered starting point for materials, mediums, and studio care."],
  ["Artist Brushes", "Learn what shapes, fibres, and construction can mean in practice."],
  ["Canvas", "A future guide to surfaces, preparation, and choosing with confidence."],
  ["Easels", "Practical context for stability, adjustability, and working comfortably."],
  ["Colour Theory", "Build a clearer understanding of colour relationships and choices."],
  ["Studio Setup", "Plan a useful creative space around your process and constraints."],
] as const;

export const Route = createFileRoute("/art-creative-studio")({
  head: (ctx) => {
    // Leaf-owns-the-head strategy: this category route owns the page head only
    // when it is the deepest matched route. If a child route is ever added
    // beneath it, the child owns the head and nothing is emitted here.
    const isLeaf = ctx.matches[ctx.matches.length - 1]?.routeId === ROUTE_ID;
    if (!isLeaf) return {};
    return {
      meta: [
        { title: "Art & Creative Studio Evidence Guides | TAFAT" },
        { name: "description", content: description },
        { property: "og:title", content: "Art & Creative Studio Evidence Guides | TAFAT" },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        ldScript(
          collectionPageJsonLd({
            name: "Art & Creative Studio",
            description,
            path: "/art-creative-studio",
            breadcrumb: [
              { name: "Home", path: "/" },
              { name: "Art & Creative Studio", path: "/art-creative-studio" },
            ],
          }),
        ),
      ],
    };
  },
  component: ArtCreativeStudio,
});

function ArtCreativeStudio() {
  const Art = illustrationByKey.art;
  const { pathname } = useLocation();
  useEffect(() => {
    startLassoForRoute(pathname);
    if (pathname === "/art-creative-studio") trackEvent("art_guide_view");
  }, [pathname]);
  return <div className="site-shell">
    <header className="nav wrap"><a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a><nav><a href="/#discover">Discover</a><a href="/health-wellness">Health &amp; Wellness</a><a href="/art-creative-studio" aria-current="page">Art &amp; Creative Studio</a><a href="/#how-we-review">Our approach</a></nav><a className="nav-pill" href="/#stay-in-loop">Sign in / join</a></header>
    <main>
      <section className="category-hero wrap"><p className="eyebrow"><span className="spark">✦</span> TAFAT Evidence Library</p><h1>Art &amp; <em>Creative Studio</em></h1><p className="category-intro">Great art begins long before the first brush touches the canvas. Choosing quality materials, understanding how they work, and investing wisely can save frustration, improve results, and help artists create with confidence.</p><p className="affiliate-banner">Affiliate disclosure: there are no product recommendations or affiliate links in this category yet.</p></section>
      <section className="art-guide-download wrap" aria-labelledby="art-guide-heading"><div className="art-guide-copy"><p className="eyebrow">A free illustrated guide</p><h2 id="art-guide-heading">The Art &amp; Creative Studio Guide</h2><p>Explore artist materials, studio essentials, colour, and buying decisions in one clear, visual guide. Read it online or download the complete illustrated PDF — no email required.</p><div className="art-guide-badges"><span>14 illustrated pages</span><span>Independent &amp; research-based</span><span>Free to read</span></div><div className="hero-actions"><a className="primary-button" href="/downloads/tafat-art-creative-studio-guide.pdf" download onClick={() => trackEvent("art_guide_download", { guide: "art-creative-studio" })}>Download the guide <span aria-hidden="true">↓</span></a><a className="secondary-button" href="#featured-heading">Explore the topics <span aria-hidden="true">→</span></a></div></div><div className="art-guide-booklet" aria-label="Preview of the illustrated guide"><img className="booklet-cover" src="/downloads/art-guide-pages/01_overview.png" alt="Art & Creative Studio Guide cover"/><img className="booklet-page booklet-page-one" src="/downloads/art-guide-pages/02_acrylic_paint.png" alt="Guide page about acrylic paint"/><img className="booklet-page booklet-page-two" src="/downloads/art-guide-pages/08_colour_theory.png" alt="Guide page about colour theory"/></div></section>
      <section className="category-section wrap" aria-labelledby="featured-heading"><div className="section-heading"><div><p className="eyebrow">A considered collection</p><h2 id="featured-heading">Featured Evidence Guides</h2></div></div><div className="creative-topic-grid">{topics.map(([name, copy], index) => { const Ill = index === 0 ? ArtIllustration : Art; return <article className="creative-topic-card" key={name}><span className="creative-topic-art" aria-hidden="true"><Ill /></span><div><h3>{name}</h3><p>{copy}</p><span className="coming-soon-label">Coming soon</span></div></article>; })}</div></section>
      <section className="evaluation-section"><div className="wrap evaluation-inner"><div><p className="eyebrow">A transparent next step</p><h2>TAFAT Product Evaluations</h2><p>We are currently evaluating artist supplies using the TAFAT Editorial Standard. Recommendations will only be published after comparing quality, durability, transparency, value, and real-world performance.</p><a className="primary-button" href="/editorial-standards">Learn About Our Evaluation Process <span aria-hidden="true">→</span></a></div><span className="evaluation-art" aria-hidden="true"><ArtIllustration /></span></div></section>
    </main>
    <footer className="footer wrap"><a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a><p>Good things, found thoughtfully.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/editorial-standards">Editorial Standards</a></div><small>© 2026 Tafat · Recommendations are published only after transparent evaluation.</small></footer>
    <ConsentBanner />
  </div>;
}
