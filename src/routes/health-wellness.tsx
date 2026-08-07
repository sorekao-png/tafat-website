import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { HEALTH_TOPICS } from "../lib/categories";
import { HealthIllustration, illustrationByKey } from "../lib/illustrations";
import { collectionPageJsonLd, ldScript } from "../lib/seo";

const description =
  "Explore thoughtfully selected wellness guides, vitamins, sleep resources, hydration products, gut-health information, and practical recommendations from TAFAT.";

const GUIDE_URL = "/health-wellness/the-complete-guide-to-magnesium";
const CATEGORY_CANONICAL = "https://tafat.co.uk/health-wellness";
const CATEGORY_ROUTE_ID = "/health-wellness";

export const Route = createFileRoute("/health-wellness")({
  head: (ctx) => {
    // Route-level head strategy: page-level metadata (title, description, canonical,
    // og:url, page JSON-LD) belongs to the DEEPEST matched route only. When a child
    // guide (e.g. /health-wellness/the-complete-guide-to-magnesium) is matched it owns
    // the head; this category route emits nothing so the guide page never carries a
    // second canonical link or a CollectionPage JSON-LD.
    const isLeaf = ctx.matches[ctx.matches.length - 1]?.routeId === CATEGORY_ROUTE_ID;
    if (!isLeaf) return {};
    return {
      meta: [
        { title: "Health & Wellness Guides and Recommendations | TAFAT" },
        { name: "description", content: description },
        { property: "og:title", content: "Health & Wellness Guides and Recommendations | TAFAT" },
        { property: "og:description", content: description },
        { property: "og:url", content: CATEGORY_CANONICAL },
      ],
      links: [{ rel: "canonical", href: CATEGORY_CANONICAL }],
      scripts: [
        ldScript(
          collectionPageJsonLd({
            name: "Health & Wellness",
            description,
            path: "/health-wellness",
            breadcrumb: [
              { name: "Home", path: "/" },
              { name: "Health & Wellness", path: "/health-wellness" },
            ],
          }),
        ),
      ],
    };
  },
  component: HealthWellness,
});

function HealthWellness() {
  // When a child route is matched (e.g. the complete magnesium guide), render that
  // child page through <Outlet /> instead of this category listing. The category
  // page at /health-wellness is preserved when it is the deepest match.
  const deepestRouteId = useRouterState({
    select: (s) => s.matches[s.matches.length - 1]?.routeId,
  });
  if (deepestRouteId !== CATEGORY_ROUTE_ID) {
    return <Outlet />;
  }
  return (
    <div className="site-shell">
      <header className="nav wrap">
        <a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a>
        <nav><a href="/#discover">Discover</a><a href="/health-wellness" aria-current="page">Health &amp; Wellness</a><a href="/#how-we-review">Our approach</a></nav>
        <a className="nav-pill" href="/#stay-in-loop">Sign in / join</a>
      </header>
      <main>
        <section className="category-hero wrap">
          <p className="eyebrow"><span className="spark">✦</span> A considered collection</p>
          <h1>Health <em>&amp; Wellness</em></h1>
          <p className="category-intro">TAFAT curates practical wellness resources and product recommendations to help you make more informed choices for your everyday wellbeing.</p>
          <p className="affiliate-banner">Affiliate disclosure: TAFAT may earn a commission from qualifying purchases, at no additional cost to you.</p>
        </section>
        <section className="category-section wrap" aria-labelledby="categories-heading">
          <div className="section-heading"><div><p className="eyebrow">Find your focus</p><h2 id="categories-heading">Explore wellness topics</h2></div></div>
          <div className="category-grid">
            {HEALTH_TOPICS.map((topic) => {const Ill = illustrationByKey[topic.art];return <a className="topic-card" href={topic.href} key={topic.id}><span className="topic-ill" aria-hidden="true"><Ill /></span><span className="topic-copy"><h3>{topic.name}</h3><p>{topic.copy}</p></span><span className="category-arrow" aria-hidden="true">↗</span></a>;})}
          </div>
          <div className="featured-guide" aria-labelledby="featured-guide-heading">
            <div className="featured-guide-copy">
              <p className="eyebrow">Featured guide · Vitamins &amp; Minerals</p>
              <h3 id="featured-guide-heading">The Complete Guide to Magnesium</h3>
              <p>What magnesium is, why it matters, how much you need, food sources, supplement forms, label reading, health claims, safety and interactions — in one evidence-based guide.</p>
              <a className="primary-button" href={GUIDE_URL}>Read the guide</a>
            </div>
            <span className="featured-guide-art" aria-hidden="true"><HealthIllustration /></span>
          </div>
        </section>
        <section className="selected-section" id="coming-soon" aria-labelledby="selected-heading"><div className="wrap"><p className="eyebrow">Coming soon</p><h2 id="selected-heading">Thoughtfully selected</h2><p className="selected-copy">We’re making space for future product cards and educational guides, selected with the same clear, useful approach you expect from TAFAT.</p><div className="future-grid"><div>Product recommendations</div><div>Educational guides</div><div>Practical resources</div></div></div></section>
      </main>
      <footer className="footer wrap"><a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a><p>Good things, found thoughtfully.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/editorial-standards">Editorial Standards</a><a href="mailto:hello@tafat.example">Contact</a></div><small>© 2026 Tafat · Affiliate relationships are disclosed clearly.</small></footer>
    </div>
  );
}
