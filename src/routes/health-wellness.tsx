import { createFileRoute } from "@tanstack/react-router";

const description =
  "Explore thoughtfully selected wellness guides, vitamins, sleep resources, hydration products, gut-health information, and practical recommendations from TAFAT.";

const categories = [
  ["Vitamins & Minerals", "Everyday information to help you compare options with care.", "✦"],
  ["Sleep & Rest", "Gentle ideas and resources for building a more restful routine.", "☾"],
  ["Gut Health", "Practical reading and recommendations for informed choices.", "◌"],
  ["Hydration & Electrolytes", "Explore hydration tools and straightforward guidance.", "◒"],
  ["Healthy Movement", "Approachable resources for adding movement to real life.", "↗"],
  ["General Wellness", "Thoughtful wellbeing finds for your everyday routine.", "✧"],
] as const;

export const Route = createFileRoute("/health-wellness")({
  head: () => ({
    meta: [
      { title: "Health & Wellness Guides and Recommendations | TAFAT" },
      { name: "description", content: description },
      { property: "og:title", content: "Health & Wellness Guides and Recommendations | TAFAT" },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://tafat.co.uk/health-wellness" },
    ],
    links: [{ rel: "canonical", href: "https://tafat.co.uk/health-wellness" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Health & Wellness",
          description,
          url: "https://tafat.co.uk/health-wellness",
          isPartOf: { "@type": "WebSite", name: "TAFAT", url: "https://tafat.co.uk/" },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://tafat.co.uk/" },
              { "@type": "ListItem", position: 2, name: "Health & Wellness", item: "https://tafat.co.uk/health-wellness" },
            ],
          },
        }),
      },
    ],
  }),
  component: HealthWellness,
});

function HealthWellness() {
  return (
    <div className="site-shell">
      <header className="nav wrap">
        <a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a>
        <nav><a href="/#discover">Discover</a><a href="/health-wellness" aria-current="page">Health &amp; Wellness</a><a href="/#about">Our approach</a></nav>
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
            {categories.map(([name, copy, symbol]) => <a className="category-card" href="#coming-soon" key={name}><span className="category-symbol" aria-hidden="true">{symbol}</span><span><h3>{name}</h3><p>{copy}</p></span><span className="category-arrow" aria-hidden="true">↗</span></a>)}
          </div>
        </section>
        <section className="selected-section" id="coming-soon" aria-labelledby="selected-heading"><div className="wrap"><p className="eyebrow">Coming soon</p><h2 id="selected-heading">Thoughtfully selected</h2><p className="selected-copy">We’re making space for future product cards and educational guides, selected with the same clear, useful approach you expect from TAFAT.</p><div className="future-grid"><div>Product recommendations</div><div>Educational guides</div><div>Practical resources</div></div></div></section>
      </main>
      <footer className="footer wrap"><a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a><p>Good things, found thoughtfully.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@tafat.example">Contact</a></div><small>© 2026 Tafat · Affiliate relationships are disclosed clearly.</small></footer>
    </div>
  );
}
