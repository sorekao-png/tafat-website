import { createFileRoute } from '@tanstack/react-router';
import content from '~/lib/vitamin-d-content.json';
import { useState } from 'react';
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd, ldScript } from '../lib/seo';

const ROUTE_ID = '/health-wellness/vitamin-d-guide';
const canonical = 'https://tafat.co.uk/health-wellness/vitamin-d-guide';
const description =
  'Learn what vitamin D does, how much you may need, why it can accumulate, who is at risk of deficiency, and how to avoid excessive or duplicated doses.';
const OG_IMAGE = 'https://tafat.co.uk/vitamin-d/01_Journey_of_Vitamin_D.png';
const images = [
  '01_Journey_of_Vitamin_D.png',
  '02_How_the_Body_Activates_Vitamin_D.png',
  '03_Where_Vitamin_D_Works_in_the_Body.png',
  '04_Water_vs_Fat_Soluble_Accumulation.png',
  '05_Water_vs_Fat_Soluble_Table.png',
  '06_Understanding_Vitamin_D_Doses.png',
  '07_Where_Vitamin_D_Comes_From.png',
  '08_Vitamin_D_Deficiency_Risk_Factors.png',
  '09_Understanding_Your_Vitamin_D_Blood_Test.png',
  '10_Hidden_Sources_of_Vitamin_D.png',
  '11_When_Vitamin_D_Becomes_Too_Much.png',
];

// FAQ JSON-LD is built only from question/answer pairs that are visibly rendered
// in the guide body: under the "Frequently Asked Questions" heading, each
// Heading4 question is followed by a FirstParagraph answer (rendered as a
// <details> or as a heading + paragraph). No pair is invented.
const faqStart = content.findIndex((x) => x.text === 'Frequently Asked Questions');
const faq: { question: string; answer: string }[] = [];
for (let i = faqStart + 1; i < content.length; i++) {
  const entry = content[i] as { text: string; style: string };
  if (entry.style.startsWith('Heading3')) break; // next major section: The Honest Verdict
  if (entry.style.startsWith('Heading4') && entry.text.trim().endsWith('?')) {
    const answer = content[i + 1] as { text: string; style: string } | undefined;
    if (answer && !answer.style.startsWith('Heading')) {
      faq.push({ question: entry.text, answer: answer.text });
    }
  }
}
const faqLd = faq.length > 0 ? faqPageJsonLd(faq) : null;

export const Route = createFileRoute('/health-wellness/vitamin-d-guide')({
  head: (ctx) => {
    // Leaf-owns-the-head strategy: this guide is a leaf route; when it is the
    // deepest match it owns the page head (single canonical, Article JSON-LD).
    // If a deeper route is ever added, the gate keeps exactly one canonical and
    // no parent-emitted JSON-LD on this page.
    const isLeaf = ctx.matches[ctx.matches.length - 1]?.routeId === ROUTE_ID;
    if (!isLeaf) return {};
    return {
      meta: [
        { title: 'Vitamin D Guide: Benefits, Dosage, Deficiency and Safety | TAFAT' },
        { name: 'description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: 'Vitamin D Guide: Benefits, Dosage, Deficiency and Safety | TAFAT' },
        { property: 'og:description', content: description },
        { property: 'og:image', content: OG_IMAGE },
        { property: 'og:url', content: canonical },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Vitamin D Guide: Benefits, Dosage, Deficiency and Safety | TAFAT' },
        { name: 'twitter:description', content: description },
      ],
      links: [{ rel: 'canonical', href: canonical }],
      scripts: [
        ldScript(
          articleJsonLd({
            headline: 'Vitamin D Guide: Benefits, Dosage, Deficiency and Safety',
            description,
            path: '/health-wellness/vitamin-d-guide',
            datePublished: '2026-08-01',
            imageUrl: OG_IMAGE,
          }),
        ),
        ldScript(
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Health & Wellness', path: '/health-wellness' },
            { name: 'Vitamin D Guide', path: '/health-wellness/vitamin-d-guide' },
          ]),
        ),
        ...(faqLd ? [ldScript(faqLd)] : []),
      ],
    };
  },
  component: Guide,
});
function Guide() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <main className="guide-page wrap">
      <header className="guide-hero">
        <p className="eyebrow">Health & Wellness · Evidence guide</p>
        <h1>Vitamin D: what it does, how much you may need, and how to stay safe</h1>
        <p className="hero-copy">A research-first guide to benefits, dosage, deficiency, accumulation, and safer supplement decisions.</p>
        <div className="guide-meta"><span>12 min</span><span>Beginner</span><span>August 2026</span><span>Evidence status: established basics, context-dependent research</span></div>
      </header>
      <aside className="callout">
        <strong>Medical disclaimer</strong>
        <p>This guide is for general educational purposes and does not diagnose, treat, or replace personalised advice from a qualified healthcare professional. Supplement requirements may differ according to age, pregnancy, medical conditions, medicines, laboratory results, diet, and sunlight exposure.</p>
      </aside>
      <nav className="toc" aria-label="Contents">
        <strong>In this guide</strong>
        <a href="#what-is-vitamin-d">What is vitamin D?</a>
        <a href="#buying-checklist">The TAFAT Buying Checklist</a>
        <a href="#faq">Frequently Asked Questions</a>
        <a href="#verdict">The Honest Verdict</a>
      </nav>
      <ArticleBody open={open} setOpen={setOpen} />
      <section className="guide-products" aria-labelledby="vitamin-d-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TAFAT product evaluation</p>
            <h2 id="vitamin-d-products">Two published options</h2>
          </div>
        </div>
        <p className="guide-products-intro">These are the vitamin D products currently published on this page. They are shown for transparent comparison, not as medical advice or a universal recommendation.</p>
        <p className="affiliate-note guide-products-disclosure">Affiliate link: TAFAT may earn a commission if you choose to purchase, at no extra cost to you. Product details and price may change.</p>
        <article className="product-card guide-product-card">
          <div className="guide-product-image">
            <img src="/vitamin-d/sports-research-vitamin-d3.png" alt="Sports Research Vitamin D3 5000 IU supplement" />
          </div>
          <div className="card-body">
            <div className="card-meta"><span>Vitamin D3</span><span>Verified variant</span></div>
            <h3>Sports Research Vitamin D3</h3>
            <p>5,000 IU / 125 mcg · 360 softgels</p>
            <a className="primary-button guide-product-link" href="https://lasso.to/amazon/vqiM7WN6Kq" target="_blank" rel="nofollow sponsored noopener noreferrer">View Product &amp; Current Price</a>
            <small className="affiliate-note">Affiliate link: TAFAT may earn a commission if you choose to purchase, at no extra cost to you. Product details and price may change.</small>
          </div>
        </article>
        <article className="product-card guide-product-card">
          <figure className="guide-product-media">
            <div className="guide-product-image">
              <img src="/vitamin-d/maryruth-vitamin-d3-liquid-spray.png" alt="MaryRuth Organics Vitamin D3 liquid spray editorial illustration" />
            </div>
            <figcaption className="guide-product-caption">Editorial product illustration. Check current packaging and serving information at the retailer.</figcaption>
          </figure>
          <div className="card-body">
            <div className="card-meta"><span>Vitamin D3</span><span className="guide-product-badge">LOWER-DOSE LIQUID OPTION</span></div>
            <h3>MaryRuth Organics Vitamin D3 Liquid Spray</h3>
            <p className="guide-product-desc">A lower-dose vitamin D3 in a liquid spray format, included here as a liquid-format alternative for transparent comparison — not as medical advice or a universal recommendation.</p>
            <ul className="guide-product-bullets">
              <li>Liquid spray format — an alternative to swallowing capsules or tablets.</li>
              <li>Lower-dose liquid option alongside the capsule format on this page.</li>
              <li>Shown for transparent comparison, not as a recommendation for any specific need.</li>
            </ul>
            <p className="guide-product-consideration">Important consideration: needs vary. Follow the current directions on the product and verify serving information on the retailer or manufacturer listing.</p>
            <a className="primary-button guide-product-link" href="https://lasso.to/amazon/APKOj2S56Z" target="_blank" rel="sponsored nofollow noopener noreferrer">View Product &amp; Current Price</a>
          </div>
        </article>
        <p className="guide-products-placeholder">Another formulation is currently under verification.</p>
      </section>
      <section className="callout">
        <h2>TAFAT Vitamin D Evaluations</h2>
        <p>We are currently evaluating vitamin D products using our published standards for evidence, formulation, transparency, safety, and value. Recommendations will be added only when a product meets the TAFAT Editorial Standard.</p>
        <a className="button" href="/editorial-standards">How TAFAT Evaluates Products</a>
      </section>
      <section className="continue">
        <h2>Continue learning</h2>
        <a href="/health-wellness/the-complete-guide-to-magnesium">The complete guide to magnesium</a>
        <a href="/health-wellness">Health &amp; Wellness</a>
        <a href="/editorial-standards">TAFAT Editorial Standard</a>
      </section>
      <p className="affiliate-note">This evidence guide contains no product recommendations or affiliate links.</p>
    </main>
  );
}
function ArticleBody({ open, setOpen }: { open: string | null; setOpen: (x: string | null) => void }) {
  let img = 0;
  return (
    <article className="guide-content">
      {(content as any[]).map((item, i) => {
        if (item.table) {
          return (
            <div className="table-wrap" key={i}>
              <table>
                <tbody>
                  {item.table.map((r: string[], j: number) => (
                    <tr key={j}>
                      {r.map((c, k) => (
                        <td key={k}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        const t = item.text as string;
        const lower = t.toLowerCase();
        const heading =
          /^(what |how to |understanding |marketing |the tafat|frequently|the honest|taf(at)? final|where |why |can i |is vitamin|should |before|vitamin d and|still uncertain)/i.test(t) ||
          ['Introduction', 'Summary', 'Conclusion'].includes(t);
        if (heading) {
          let id = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return <h2 id={id || (i === 0 ? 'what-is-vitamin-d' : 'section-' + i)} key={i}>{t}</h2>;
        }
        if (/^research highlight/i.test(t))
          return (
            <aside className="callout" key={i}>
              <strong>Research Highlight</strong>
              <p>{t}</p>
            </aside>
          );
        if (/^key point/i.test(t) || /^remember/i.test(t))
          return (
            <aside className="callout key" key={i}>
              <strong>Key Point</strong>
              <p>{t}</p>
            </aside>
          );
        if (/^safety warning/i.test(t))
          return (
            <aside className="callout warning" key={i}>
              <strong>Safety Warning</strong>
              <p>{t}</p>
            </aside>
          );
        if (/^can i |^is vitamin|^should everyone|^can vitamin|^is natural/i.test(t)) {
          return (
            <details id={lower.includes('frequently') ? 'faq' : undefined} key={i}>
              <summary>{t}</summary>
              <p>{(content as any[])[i + 1]?.text}</p>
            </details>
          );
        }
        return <p key={i}>{t}</p>;
      })}
      {images.map((src, i) => (
        <figure className="guide-figure" key={src}>
          <a href={'/vitamin-d/' + src} target="_blank" rel="noopener noreferrer">
            <img src={'/vitamin-d/' + src} alt={src.replace('.png', '').replaceAll('_', ' ')} loading={i ? 'lazy' : 'eager'} />
          </a>
          <figcaption>Vitamin D evidence illustration {i + 1}. Select to open larger.</figcaption>
        </figure>
      ))}
    </article>
  );
}
