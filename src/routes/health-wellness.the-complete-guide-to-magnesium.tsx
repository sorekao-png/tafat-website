import { createFileRoute } from "@tanstack/react-router";
import content from "~/lib/magnesium-content.json";
import { useState, type ReactNode } from "react";

const canonical = "https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium";
const GUIDE_ROUTE_ID = "/health-wellness/the-complete-guide-to-magnesium";
const HERO_IMAGE = "https://tafat.co.uk/magnesium-mineral.jpg";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Table of contents: every major section (Heading1) plus the first Heading2s, capped for readability.
const headings = content.filter((x) => x.s === "Heading1" || x.s === "Heading2").slice(0, 22);

// Deterministic unique anchor ids for every heading entry (duplicate titles get -2, -3…).
const idByIndex = new Map<number, string>();
{
  const seen = new Map<string, number>();
  content.forEach((x, i) => {
    if (x.s.startsWith("Heading1") || x.s.startsWith("Heading2")) {
      const base = slug(x.t);
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      idByIndex.set(i, n === 0 ? base : `${base}-${n + 1}`);
    }
  });
}

// FAQ JSON-LD is built only from question/answer pairs that are visibly rendered in the
// article body: within the "Honest Answers..." section, each Heading3 question is followed
// by a FirstParagraph answer. (The answer paragraph is the text shown under the question.)
const faqStart = content.findIndex((x) => x.t === "Honest Answers to the Questions People Ask Most");
// The FAQ section ends at the next major heading after the first FAQ question.
const faqEnd = content.findIndex((x, i) => i > faqStart && (x.s.startsWith("Heading1") || x.s.startsWith("Heading2")));
const faqBlock = faqStart >= 0 && faqEnd > faqStart ? content.slice(faqStart + 1, faqEnd) : [];
const faq: { question: string; answer: string }[] = [];
for (let i = 0; i < faqBlock.length; i++) {
  const q = faqBlock[i];
  if (q.s.startsWith("Heading3") && q.t.trim().endsWith("?")) {
    const a = faqBlock[i + 1];
    if (a && !a.s.startsWith("Heading")) {
      faq.push({ question: q.t, answer: a.t });
    }
  }
}

const faqLd = faq.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    }
  : null;

export const Route = createFileRoute("/health-wellness/the-complete-guide-to-magnesium")({
  head: (ctx) => {
    // Route-level head strategy: this guide route is a leaf, so whenever it is
    // matched it owns the page head (single canonical, article JSON-LD). If a
    // deeper route is ever added beneath it, the gate below keeps the invariant
    // "the deepest matched route owns the page head".
    const isLeaf = ctx.matches[ctx.matches.length - 1]?.routeId === GUIDE_ROUTE_ID;
    if (!isLeaf) return {};
    return {
    meta: [
      { title: "The Complete Guide to Magnesium: Evidence, Food, Forms and Safety | TAFAT" },
      { name: "description", content: "A complete evidence guide to magnesium: what it is, daily requirements, food sources, supplement forms, health claims, safety and interactions." },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "The Complete Guide to Magnesium | TAFAT" },
      { property: "og:description", content: "An evidence-based guide to magnesium, food sources, supplement forms and safety." },
      { property: "og:url", content: canonical },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Complete Guide to Magnesium | TAFAT" },
      { name: "twitter:description", content: "An evidence-based guide to magnesium, food sources, supplement forms and safety." },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "The Complete Guide to Magnesium",
          description: "An evidence-based guide to magnesium, food sources, supplement forms and safety.",
          datePublished: "2026-08-01",
          dateModified: "2026-08-01",
          image: [HERO_IMAGE],
          author: { "@type": "Organization", name: "TAFAT" },
          publisher: { "@type": "Organization", name: "TAFAT", url: "https://tafat.co.uk/" },
          mainEntityOfPage: canonical,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://tafat.co.uk/" },
            { "@type": "ListItem", position: 2, name: "Health & Wellness", item: "https://tafat.co.uk/health-wellness" },
            { "@type": "ListItem", position: 3, name: "The Complete Guide to Magnesium", item: canonical },
          ],
        }),
      },
      ...(faqLd ? [{ type: "application/ld+json", children: JSON.stringify(faqLd) }] : []),
    ],
    };
  },
  component: Article,
});

function Article() {
  const [email, setEmail] = useState("");

  // Render the manuscript as valid HTML: consecutive Compact entries become one <ul>.
  const segments: ReactNode[] = [];
  let bulletGroup: string[] = [];
  const flushBullets = (key: string) => {
    if (bulletGroup.length === 0) return;
    segments.push(<ul key={key}>{bulletGroup.map((b, j) => <li key={j}>{b}</li>)}</ul>);
    bulletGroup = [];
  };
  content.forEach((x, i) => {
    const t = x.t;
    if (x.s === "Compact") { bulletGroup.push(t); return; }
    flushBullets(`ul-${i}`);
    if (x.s.startsWith("Heading1") || x.s.startsWith("Heading2")) { segments.push(<h2 id={idByIndex.get(i)} key={i}>{t}</h2>); return; }
    if (x.s.startsWith("Heading3") || x.s.startsWith("Heading4")) { segments.push(<h3 key={i}>{t}</h3>); return; }
    if (x.s === "BlockText") { segments.push(<blockquote key={i}>{t}</blockquote>); return; }
    segments.push(<p key={i}>{t}</p>);
  });
  flushBullets("ul-end");

  return (
    <div className="site-shell">
      <header className="nav wrap">
        <a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a>
        <nav><a href="/#discover">Discover</a><a href="/health-wellness" aria-current="page">Health &amp; Wellness</a><a href="/#about">Our approach</a></nav>
        <a className="nav-pill" href="/#stay-in-loop">Sign in / join</a>
      </header>
      <main>
        <section className="article-hero wrap">
          <p className="eyebrow">TAFAT Evidence Guide · Health &amp; Wellness</p>
          <h1>The Complete Guide to <em>Magnesium</em></h1>
          <p className="article-dek">What it is, why it matters, where to find it, and how to think clearly about supplements.</p>
          <div className="article-meta">Published August 2026 · Last reviewed August 2026 · 35 minute read</div>
          <img className="article-image" src="/magnesium-mineral.jpg" alt="Illustration from the magnesium manuscript showing the mineral's role in everyday health" width="1536" height="1024" />
        </section>
        <div className="article-layout wrap">
          <aside className="article-toc">
            <strong>In this guide</strong>
            {headings.map((h) => <a href={`#${idByIndex.get(content.indexOf(h))}`} key={h.t}>{h.t}</a>)}
          </aside>
          <article className="article-body">
            <div className="callout warning"><strong>Educational guide, not medical advice.</strong><p>This guide is for education and does not diagnose, prevent, treat or cure disease. Speak with a qualified healthcare professional about your circumstances, medicines or supplements.</p></div>
            {segments}
            <img className="article-image" src="/rId9.jpg" alt="Second illustration extracted from the magnesium manuscript" width="1536" height="1024" />
            <section className="review-placeholder">
              <h2>TAFAT Approved Magnesium Reviews</h2>
              <h3>Coming Soon</h3>
              <p>We will add reviewed products after completing our evidence-based evaluations.</p>
            </section>
            <section className="download">
              <h2>Download the Free PDF Guide</h2>
              <p>Prefer to read offline? Download the text-accessible companion PDF — the full guide in a simple, readable form (it does not include the illustrations or designed layout).</p>
              <a className="primary-button" href="/magnesium-guide.pdf" target="_blank" rel="noopener" download>Download the Free PDF Guide</a>
            </section>
            <section className="signup article-signup">
              <h2>Enjoyed this guide?</h2>
              <p>Download future Evidence Guides free.</p>
              <form onSubmit={(e) => { e.preventDefault(); setEmail(""); }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email address" required />
                <button type="submit">Get future guides</button>
                <small>Preview only: this form does not transmit or store email.</small>
              </form>
            </section>
          </article>
        </div>
      </main>
      <footer className="footer wrap">
        <a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a>
        <p>Good things, found thoughtfully.</p>
        <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@tafat.example">Contact</a></div>
      </footer>
    </div>
  );
}
