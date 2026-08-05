import { createFileRoute } from "@tanstack/react-router";
import content from "~/lib/magnesium-content.json";
import { useState, type ReactNode } from "react";
import {
  BookIcon,
  FlaskIcon,
  LeafCheckIcon,
  MagnesiumHeroIllustration,
  MeterIcon,
  QuoteIcon,
  ScaleIcon,
  ShieldIcon,
} from "../lib/illustrations";

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

type Entry = { t: string; s: string };
const level = (s: string) => (s.startsWith("Heading1") ? 1 : s.startsWith("Heading2") ? 2 : s.startsWith("Heading3") ? 3 : s.startsWith("Heading4") ? 4 : 0);

/** Render a plain run of entries (used inside editorial boxes). Never alters text. */
function renderSimple(entries: Entry[], baseKey: string): ReactNode[] {
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (bullets.length === 0) return;
    out.push(<ul key={key}>{bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>);
    bullets = [];
  };
  entries.forEach((e, idx) => {
    const k = `${baseKey}-${idx}`;
    if (e.s === "Compact") { bullets.push(e.t); return; }
    flush(`${baseKey}-ul-${idx}`);
    if (e.s.startsWith("Heading4")) { out.push(<h4 key={k}>{e.t}</h4>); return; }
    if (e.s.startsWith("Heading3")) { out.push(<h3 key={k}>{e.t}</h3>); return; }
    if (e.s.startsWith("Heading1") || e.s.startsWith("Heading2")) { out.push(<h2 key={k}>{e.t}</h2>); return; }
    if (e.s === "BlockText") { out.push(<blockquote className="field-note" key={k}>{e.t}</blockquote>); return; }
    if (/^[✓✔☑]/.test(e.t)) { out.push(<p className="check-item" key={k}>{e.t}</p>); return; }
    if (/^[🟡🟢🔴]/.test(e.t)) { out.push(<p className="meter-chip" key={k}>{e.t}</p>); return; }
    out.push(<p key={k}>{e.t}</p>);
  });
  flush(`${baseKey}-ul-end`);
  return out;
}

/** "At a Glance Comparison" — the manuscript's inline table becomes comparison cards. */
function parseComparison(start: number): { labels: string[]; rows: { name: string; cells: string[] }[]; end: number } | null {
  const labels = (content[start + 1]?.t ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (labels.length < 2) return null;
  const rows: { name: string; cells: string[] }[] = [];
  let cur: { name: string; cells: string[] } | null = null;
  let j = start + 2;
  for (; j < content.length; j++) {
    const e = content[j];
    if (e.s.startsWith("Heading")) break;
    if (e.s === "Compact") { cur?.cells.push(e.t); continue; }
    cur = { name: e.t, cells: [] };
    rows.push(cur);
  }
  return rows.length > 0 ? { labels, rows, end: j } : null;
}

/** "Myth or Fact?" — Myth/Fact heading pairs become two cards. */
function parseMythFact(start: number): { myth: string; fact: string; end: number } | null {
  let myth = "";
  let fact = "";
  let j = start + 1;
  while (j < content.length && !content[j].s.startsWith("Heading1") && !content[j].s.startsWith("Heading2") && !content[j].s.startsWith("Heading3")) {
    const e = content[j];
    if (e.t === "Myth" && content[j + 1] && !content[j + 1].s.startsWith("Heading")) { myth = content[j + 1].t; j += 2; continue; }
    if (e.t === "Fact" && content[j + 1] && !content[j + 1].s.startsWith("Heading")) { fact = content[j + 1].t; j += 2; continue; }
    break;
  }
  return myth && fact ? { myth, fact, end: j } : null;
}

/** "The TAFAT Trust Score™" — label/value pairs become a scored card. */
function parseTrustScore(start: number): { intro: string; heading: string; rows: { label: string; value: number }[]; max: string; note: string; end: number } | null {
  let intro = "";
  let heading = "";
  const rows: { label: string; value: number }[] = [];
  let max = "";
  let note = "";
  let pending: string | null = null;
  let j = start + 1;
  for (; j < content.length; j++) {
    const e = content[j];
    if (e.s.startsWith("Heading1") || e.s.startsWith("Heading2")) break;
    const t = e.t.trim();
    if (e.s === "FirstParagraph" && !intro) { intro = e.t; continue; }
    if (t === "Category Points") { heading = e.t; continue; }
    if (/^\d+$/.test(t)) { if (pending) { rows.push({ label: pending, value: Number(t) }); pending = null; } continue; }
    if (t.startsWith("Maximum score")) { max = e.t; continue; }
    pending = e.t;
  }
  // Any trailing paragraph (e.g. the closing explanation) is preserved verbatim.
  if (pending) note = pending;
  return rows.length > 0 ? { intro, heading, rows, max, note, end: j } : null;
}

/** Editorial box wrapper (research highlight / checklist / verdict). */
function editorialBox(kind: "research" | "checklist" | "verdict", heading: string, id: string | undefined, icon: ReactNode, children: ReactNode[], key: string) {
  return (
    <section className={`editorial-box ${kind}`} key={key}>
      <h2 id={id}><span className="box-icon" aria-hidden="true">{icon}</span>{heading}</h2>
      {children}
    </section>
  );
}

function Article() {
  const [email, setEmail] = useState("");

  // Build the manuscript as styled editorial blocks. Special manuscript blocks
  // (comparison, myth/fact, research highlights, checklists, verdicts, trust
  // score, claims, truth meters) get presentation-only wrappers; every word of
  // the manuscript is preserved exactly, including cautions and health claims.
  const segments: ReactNode[] = [];
  {
    let bulletGroup: string[] = [];
    const flushBullets = (key: string) => {
      if (bulletGroup.length === 0) return;
      segments.push(<ul key={key}>{bulletGroup.map((b, j) => <li key={j}>{b}</li>)}</ul>);
      bulletGroup = [];
    };
    let i = 0;
    while (i < content.length) {
      const x = content[i];
      const t = x.t;
      // Comparison table
      if (t === "At a Glance Comparison") {
        const parsed = parseComparison(i);
        if (parsed) {
          segments.push(
            <section className="editorial-box compare" key={`compare-${i}`}>
              <h2 id={idByIndex.get(i)}><span className="box-icon" aria-hidden="true"><ScaleIcon /></span>{t}</h2>
              <div className="compare-legend" aria-hidden="true">{parsed.labels.map((l) => <span key={l}>{l}</span>)}</div>
              <div className="compare-grid">
                {parsed.rows.map((r) => (
                  <article className="compare-card" key={r.name}>
                    <h3 className="compare-name">{r.name}</h3>
                    {r.cells.map((cell, k) => (
                      <p className="compare-cell" key={k}><strong>{parsed.labels[k + 1] ?? ""}</strong><span>{cell}</span></p>
                    ))}
                  </article>
                ))}
              </div>
            </section>
          );
          i = parsed.end;
          continue;
        }
      }
      // Myth or Fact?
      if (t === "Myth or Fact?") {
        const parsed = parseMythFact(i);
        if (parsed) {
          const h = x.s.startsWith("Heading2") ? <h2 id={idByIndex.get(i)}>Myth or Fact?</h2> : <h3 id={idByIndex.get(i)}>Myth or Fact?</h3>;
          segments.push(
            <div className="myth-block" key={`myth-${i}`}>
              {h}
              <div className="myth-grid">
                <div className="myth-card"><span className="myth-tag"><QuoteIcon />Myth</span><p>{parsed.myth}</p></div>
                <div className="fact-card"><span className="fact-tag"><LeafCheckIcon />Fact</span><p>{parsed.fact}</p></div>
              </div>
            </div>
          );
          i = parsed.end;
          continue;
        }
      }
      // The Claim (claims chapter): heading + quoted claim card
      if (t === "The Claim") {
        segments.push(<h3 key={`claimh-${i}`}>{t}</h3>);
        const next = content[i + 1];
        if (next && next.s === "BlockText") {
          segments.push(<figure className="claim-card" key={`claim-${i}`}><QuoteIcon /><blockquote>{next.t}</blockquote></figure>);
          i += 2;
          continue;
        }
        i += 1;
        continue;
      }
      // Truth Meter / Truth Meter™ chips
      if (t === "Truth Meter" || t === "Truth Meter™") {
        segments.push(<h4 key={`meterh-${i}`}>{t}</h4>);
        const next = content[i + 1];
        if (next && (next.s === "FirstParagraph" || next.s === "BodyText") && /^[🟡🟢🔴]/.test(next.t)) {
          segments.push(<p className="meter-chip" key={`meter-${i}`}>{next.t}</p>);
          i += 2;
          continue;
        }
        i += 1;
        continue;
      }
      // Research highlight / summary boxes
      if (t === "TAFAT Research Highlight" || t === "TAFAT Research Summary") {
        const lvl = level(x.s);
        const children: Entry[] = [];
        let j = i + 1;
        while (j < content.length && level(content[j].s) > lvl) { children.push(content[j]); j++; }
        segments.push(editorialBox("research", t, idByIndex.get(i), <LeafCheckIcon />, renderSimple(children, `research-${i}`), `research-${i}`));
        i = j;
        continue;
      }
      // Checklist boxes
      if (t === "TAFAT Buying Checklist" || t === "The TAFAT Label Checklist" || t === "The TAFAT Safety Checklist") {
        const lvl = level(x.s);
        const children: Entry[] = [];
        let j = i + 1;
        while (j < content.length && level(content[j].s) > lvl) { children.push(content[j]); j++; }
        segments.push(editorialBox("checklist", t, idByIndex.get(i), <BookIcon />, renderSimple(children, `checklist-${i}`), `checklist-${i}`));
        i = j;
        continue;
      }
      // Verdict boxes
      if (t === "TAFAT Verdict" || t === "The TAFAT Verdict" || t === "The Honest Verdict") {
        const lvl = level(x.s);
        const children: Entry[] = [];
        let j = i + 1;
        while (j < content.length && level(content[j].s) > lvl) { children.push(content[j]); j++; }
        segments.push(editorialBox("verdict", t, idByIndex.get(i), <MeterIcon />, renderSimple(children, `verdict-${i}`), `verdict-${i}`));
        i = j;
        continue;
      }
      // Trust score card
      if (t === "The TAFAT Trust Score™") {
        const parsed = parseTrustScore(i);
        if (parsed) {
          segments.push(
            <section className="editorial-box trust" key={`trust-${i}`}>
              <h2 id={idByIndex.get(i)}><span className="box-icon" aria-hidden="true"><MeterIcon /></span>{t}</h2>
              {parsed.intro && <p>{parsed.intro}</p>}
              {parsed.heading && <p className="score-heading">{parsed.heading}</p>}
              <div className="score-card">
                {parsed.rows.map((r) => (
                  <div className="score-row" key={r.label}>
                    <span className="score-label">{r.label}</span>
                    <span className="score-track"><span className="score-fill" style={{ width: `${Math.min(100, r.value * 5)}%` }} /></span>
                    <span className="score-value">{r.value}</span>
                  </div>
                ))}
                {parsed.max && <p className="score-max">{parsed.max}</p>}
              </div>
              {parsed.note && <p className="score-note">{parsed.note}</p>}
            </section>
          );
          i = parsed.end;
          continue;
        }
      }
      // Default entries
      if (x.s === "Compact") { bulletGroup.push(t); i += 1; continue; }
      flushBullets(`ul-${i}`);
      if (x.s.startsWith("Heading1") || x.s.startsWith("Heading2")) { segments.push(<h2 id={idByIndex.get(i)} key={i}>{t}</h2>); i += 1; continue; }
      if (x.s.startsWith("Heading3") || x.s.startsWith("Heading4")) { segments.push(<h3 key={i}>{t}</h3>); i += 1; continue; }
      if (x.s === "BlockText") { segments.push(<blockquote className="field-note" key={i}>{t}</blockquote>); i += 1; continue; }
      if (/^[✓✔☑]/.test(t)) { segments.push(<p className="check-item" key={i}>{t}</p>); i += 1; continue; }
      if (/^[🟡🟢🔴]/.test(t)) { segments.push(<p className="meter-chip" key={i}>{t}</p>); i += 1; continue; }
      segments.push(<p key={i}>{t}</p>);
      i += 1;
    }
    flushBullets("ul-end");
  }

  return (
    <div className="site-shell">
      <header className="nav wrap">
        <a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a>
        <nav><a href="/#discover">Discover</a><a href="/health-wellness" aria-current="page">Health &amp; Wellness</a><a href="/#how-we-review">Our approach</a></nav>
        <a className="nav-pill" href="/#stay-in-loop">Sign in / join</a>
      </header>
      <main>
        <section className="article-hero wrap">
          <p className="eyebrow">TAFAT Evidence Guide · Health &amp; Wellness</p>
          <h1>The Complete Guide to <em>Magnesium</em></h1>
          <p className="article-dek">What it is, why it matters, where to find it, and how to think clearly about supplements.</p>
          <div className="article-meta">Published August 2026 · Last reviewed August 2026 · 35 minute read</div>
          <div className="article-hero-art"><MagnesiumHeroIllustration /></div>
        </section>
        <div className="article-layout wrap">
          <aside className="article-toc">
            <strong>In this guide</strong>
            {headings.map((h) => <a href={`#${idByIndex.get(content.indexOf(h))}`} key={h.t}>{h.t}</a>)}
          </aside>
          <article className="article-body">
            <div className="callout warning"><strong><span className="callout-icon" aria-hidden="true"><ShieldIcon /></span>Educational guide, not medical advice.</strong><p>This guide is for education and does not diagnose, prevent, treat or cure disease. Speak with a qualified healthcare professional about your circumstances, medicines or supplements.</p></div>
            <figure className="article-figure">
              <img className="article-image" src="/magnesium-mineral.jpg" alt="Illustration from the magnesium manuscript showing the mineral's role in everyday health" width="1536" height="1024" />
              <figcaption>The mineral in everyday health — illustration from the TAFAT manuscript.</figcaption>
            </figure>
            {segments}
            <figure className="article-figure">
              <img className="article-image" src="/rId9.jpg" alt="Second illustration extracted from the magnesium manuscript" width="1536" height="1024" />
              <figcaption>Forms of magnesium — complementary illustration from the TAFAT manuscript.</figcaption>
            </figure>
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
