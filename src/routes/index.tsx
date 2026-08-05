import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CLOSING_QUOTE,
  HERO_ACTIONS,
  HERO_SUBHEADINGS,
  HOME_HEADLINE_PARTS,
  PHILOSOPHY_EYEBROW,
  PHILOSOPHY_LINES,
  PHILOSOPHY_PRINCIPLES,
  PHILOSOPHY_SECTION_ID,
  PHILOSOPHY_TITLE,
  STANDARD_ITEMS,
  STANDARD_STATEMENT,
  STANDARD_TITLE,
} from "../lib/home-content";
import { HOME_CATEGORIES } from "../lib/categories";
import { DigitalIllustration, HealthIllustration, illustrationByKey } from "../lib/illustrations";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Tafat — Find something good" }],
    links: [{ rel: "canonical", href: "https://tafat.co.uk/" }],
  }),
  component: Home,
});
type Product = {
  name: string; category: "Digital" | "Health"; description: string; tags: string[]; price: string; accent: string; href: string; badge?: string;
};
// Owner edit path: update this typed list, then run `bun run publish`. No user-submitted
// product data is accepted by this static MVP.
const products: Product[] = [
  { name: "The Focus Reset", category: "Digital", description: "A gentle, practical system for clearer days and better follow-through.", tags: ["focus", "productivity", "habits"], price: "From $19", accent: "peach", href: "https://www.digistore24.com/", badge: "Editor pick" },
  { name: "Calm Kitchen", category: "Health", description: "Simple nutrition education and recipes for a more nourishing routine.", tags: ["nutrition", "recipes", "wellness"], price: "From $27", accent: "sage", href: "https://www.digistore24.com/" },
  { name: "Creator Launch Kit", category: "Digital", description: "Templates and thoughtful guidance to take an idea from notes to launch.", tags: ["creator", "business", "templates"], price: "From $24", accent: "lavender", href: "https://www.digistore24.com/" },
  { name: "Everyday Mobility", category: "Health", description: "Low-pressure movement sessions designed to fit real-life schedules.", tags: ["movement", "mobility", "fitness"], price: "From $17", accent: "sky", href: "https://www.digistore24.com/" },
];
const standardIcons = [
  // Scientific evidence — flask
  <svg key="evidence" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v5.2L4.6 16.9A2 2 0 0 0 6.3 20h11.4a2 2 0 0 0 1.7-3.1L14 8.2V3" /><path d="M7.4 14.5h9.2" /></svg>,
  // Ingredient quality — leaf
  <svg key="leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20.5A7.5 7.5 0 0 1 3.5 13C3.5 8.6 7 4.4 13.5 3.5c4.6-.7 7 1.6 7 6 0 5.2-4 11-9.5 11z" /><path d="M3.5 20.5C7 15.5 11.5 11.5 17 8.5" /></svg>,
  // Transparency — eye
  <svg key="eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.6" /></svg>,
  // Value for money — tag
  <svg key="tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.3 13.4 13.4 20.3a2 2 0 0 1-2.8 0L3 12.7V3h9.7l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="8.2" cy="8.2" r="1.5" /></svg>,
  // Practical usefulness — check circle
  <svg key="useful" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.8" /><path d="m8.4 12.2 2.4 2.4 4.8-5.2" /></svg>,
  // Safety considerations — shield
  <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 2.8v5.4c0 4.7-3.2 8-7 9.8-3.8-1.8-7-5.1-7-9.8V5.8z" /><path d="m9.2 11.8 2 2 3.6-3.9" /></svg>,
  // Independent comparison — balance scale
  <svg key="scale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5v17M8.5 20.5h7M7 4h10M7 4l-3.3 6.8a3.1 3.1 0 0 0 5.4 0L7 4zM17 4l-3.3 6.8a3.1 3.1 0 0 0 5.4 0L17 4z" /></svg>,
];
function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => products.filter((p) => {
    const haystack = [p.name, p.category, p.description, ...p.tags].join(" ").toLowerCase();
    return (category === "All" || p.category === category) && haystack.includes(query.toLowerCase().trim());
  }), [query, category]);
  function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setMessage("Enter a valid email to continue."); return; }
    setMessage("Thanks — sign-up is ready, but no email is stored in this preview.");
    setEmail("");
  }
  return <div className="site-shell">
    <header className="nav wrap"><a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a><nav><a href="#discover">Discover</a><a href="/health-wellness">Health &amp; Wellness</a><a href={`#${PHILOSOPHY_SECTION_ID}`}>Our approach</a><a href="#stay-in-loop">Stay in the loop</a></nav><a className="nav-pill" href="#stay-in-loop">Sign in / join</a></header>
    <main>
      <section className="hero wrap"><div className="eyebrow"><span className="spark">✦</span> Curated with care</div><h1>{HOME_HEADLINE_PARTS[0]}<br /><em>{HOME_HEADLINE_PARTS[1]}</em></h1>{HERO_SUBHEADINGS.map((line) => <p className="hero-copy" key={line}>{line}</p>)}<div className="hero-actions">{HERO_ACTIONS.map((action) => <a className={action.href.startsWith("#") ? "secondary-button" : "primary-button"} key={action.label} href={action.href}>{action.label}</a>)}</div><div className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, topic, benefit, or keyword..." aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}<kbd>⌘ K</kbd></div><div className="quick-links"><span>Try:</span>{["focus", "nutrition", "templates", "movement"].map((tag) => <button key={tag} onClick={() => setQuery(tag)}>{tag}</button>)}</div></section>
      <section id="discover" className="catalog wrap"><div className="section-heading"><div><p className="eyebrow">A considered collection</p><h2>Explore the good stuff</h2></div><div className="filters" role="group" aria-label="Filter by category">{(["All", "Digital", "Health"] as const).map((item) => item === "Health" ? <a className="filter-link" key={item} href="/health-wellness">{item}</a> : <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><p className="result-count">{filtered.length} {filtered.length === 1 ? "find" : "finds"} for you</p><div className="product-grid">{filtered.map((p) => <article className={`product-card ${p.accent}`} key={p.name}><div className="card-art">{p.category === "Digital" ? <DigitalCardArt /> : <HealthCardArt />}{p.badge && <b>{p.badge}</b>}</div><div className="card-body"><div className="card-meta"><span>{p.category}</span><span>{p.price}</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="tag-row">{p.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><a className="discover-link" href={p.href} target="_blank" rel="noopener noreferrer nofollow">View find <span>↗</span></a><small className="affiliate-note">Affiliate link · we may earn a commission</small></div></article>)}</div>{filtered.length === 0 && <div className="empty">No finds yet. Try a broader search or <button onClick={() => {setQuery(""); setCategory("All")}}>reset filters</button>.</div>}</section>
      <section id="browse-categories" className="category-browse wrap" aria-labelledby="browse-title"><div className="section-heading"><div><p className="eyebrow">Ways to browse</p><h2 id="browse-title">Explore by category</h2></div><p className="browse-note">Six shelves, one standard: evidence first.</p></div><div className="category-grid home">{HOME_CATEGORIES.map((c) => {const Ill = illustrationByKey[c.art];const inner = <><span className={`category-ill ${c.accent}`} aria-hidden="true"><Ill /></span><span className="category-copy"><h3>{c.name}</h3><p>{c.tagline}</p></span>{c.status === "soon" ? <span className="category-status">Coming soon</span> : <span className="category-arrow" aria-hidden="true">↗</span>}</>;return c.href ? <a className="category-card" href={c.href} key={c.id}>{inner}</a> : <div className="category-card is-soon" key={c.id}>{inner}</div>;})}</div></section>
      <section id="guides" className="guide-section wrap"><div className="section-heading"><div><p className="eyebrow">TAFAT Evidence Guides</p><h2>Guides worth reading</h2></div></div><a className="guide-card" href="/health-wellness/the-complete-guide-to-magnesium"><span className="guide-card-badge">New</span><h3>The Complete Guide to Magnesium</h3><p>What magnesium is, why it matters, how much you need, food sources, supplement forms, label reading, health claims, safety and interactions — one evidence-based guide.</p><span className="guide-card-cta">Read the guide <span>→</span></span></a></section>
      <section id={PHILOSOPHY_SECTION_ID} className="approach philosophy" aria-labelledby="philosophy-title"><div className="wrap approach-inner"><div><p className="eyebrow">{PHILOSOPHY_EYEBROW}</p><h2 id="philosophy-title">{PHILOSOPHY_TITLE}</h2></div><div className="philosophy-copy"><p>{PHILOSOPHY_LINES[0]}</p><p>{PHILOSOPHY_LINES[1]}</p><p className="philosophy-turn">{PHILOSOPHY_LINES[2]}</p><div className="principles">{PHILOSOPHY_PRINCIPLES.map((idx, i) => <span key={idx}><i>{String(i + 1).padStart(2, "0")}</i>{PHILOSOPHY_LINES[idx]}</span>)}</div><p className="philosophy-trust">{PHILOSOPHY_LINES[6]}</p></div></div><div className="wrap standard-block"><h3 className="standard-title">{STANDARD_TITLE}</h3><div className="standard-grid">{STANDARD_ITEMS.map((label, i) => <div className="standard-item" key={label}><span className="standard-icon">{standardIcons[i]}</span><span className="standard-label">{label}</span></div>)}</div><p className="standard-statement">{STANDARD_STATEMENT}</p></div><div className="wrap"><blockquote className="closing-quote"><span className="quote-mark" aria-hidden="true">“</span><span>{CLOSING_QUOTE}</span></blockquote></div></section>
      <section id="stay-in-loop" className="signup wrap"><div className="signup-inner"><div><p className="eyebrow">A little goodness, occasionally</p><h2>Get the next good find.</h2><p>Join the list for fresh recommendations. No spam, easy unsubscribe.</p></div><form onSubmit={submitEmail}><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /><button type="submit">Join the list <span>→</span></button>{message && <small role="status">{message}</small>}<small>Preview only: email capture is not connected or stored. A future MailerLite connection will use a server-side env key.</small></form></div></section>
    </main>
    <footer className="footer wrap"><a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a><p>Good things, found thoughtfully.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@tafat.example">Contact</a></div><small>© 2026 Tafat · Affiliate relationships are disclosed on every find.</small></footer>
    <ConsentBanner />
  </div>;
}
function DigitalCardArt() {
  return (
    <span className="product-art" aria-hidden="true">
      <DigitalIllustration />
    </span>
  );
}
function HealthCardArt() {
  return (
    <span className="product-art" aria-hidden="true">
      <HealthIllustration />
    </span>
  );
}
function ConsentBanner() {
  const [visible, setVisible] = useState(true);
  const choose = (value: "denied" | "analytics") => {
    localStorage.setItem("tafat-consent-v1", value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("tafat-consent", { detail: value }));
  };
  if (!visible) return null;
  return <aside className="consent" role="dialog" aria-label="Cookie preferences"><div><strong>Your privacy, your choice.</strong><p>We use only essential cookies in this preview. Optional analytics are off by default. See our <a href="/privacy">privacy policy</a>.</p></div><div className="consent-actions"><button className="text-button" onClick={() => choose("denied")}>No thanks</button><button className="primary-button" onClick={() => choose("analytics")}>Allow optional</button></div></aside>;
}
