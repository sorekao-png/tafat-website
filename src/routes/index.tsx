import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

type Product = {
  name: string; category: "Digital" | "Health"; description: string; tags: string[]; price: string; accent: string; href: string; badge?: string;
};

// Owner edit path: update this typed list, then run `bun run publish`. No user-submitted
// product data is accepted by this static MVP.
const products: Product[] = [
  { name: "The Focus Reset", category: "Digital", description: "A gentle, practical system for clearer days and better follow-through.", tags: ["focus", "productivity", "habits"], price: "From $19", accent: "peach", href: "https://www.digistore24.com/" , badge: "Editor pick" },
  { name: "Calm Kitchen", category: "Health", description: "Simple nutrition education and recipes for a more nourishing routine.", tags: ["nutrition", "recipes", "wellness"], price: "From $27", accent: "sage", href: "https://www.digistore24.com/" },
  { name: "Creator Launch Kit", category: "Digital", description: "Templates and thoughtful guidance to take an idea from notes to launch.", tags: ["creator", "business", "templates"], price: "From $24", accent: "lavender", href: "https://www.digistore24.com/" },
  { name: "Everyday Mobility", category: "Health", description: "Low-pressure movement sessions designed to fit real-life schedules.", tags: ["movement", "mobility", "fitness"], price: "From $17", accent: "sky", href: "https://www.digistore24.com/" },
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
    <header className="nav wrap"><a className="brand" href="/" aria-label="Tafat home"><span className="brand-mark">t</span><span>tafat</span></a><nav><a href="#discover">Discover</a><a href="/health-wellness">Health &amp; Wellness</a><a href="#about">Our approach</a><a href="#stay-in-loop">Stay in the loop</a></nav><a className="nav-pill" href="#stay-in-loop">Sign in / join</a></header>
    <main>
      <section className="hero wrap"><div className="eyebrow"><span className="spark">✦</span> Curated with care</div><h1>Find something good<br /><em>for your next step.</em></h1><p className="hero-copy">Tafat makes it easier to discover thoughtful digital tools, productivity templates, nutrition resources, and gentle wellbeing ideas — without the endless scrolling.</p><div className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, topic, benefit, or keyword..." aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}<kbd>⌘ K</kbd></div><div className="quick-links"><span>Try:</span>{["focus", "nutrition", "templates", "movement"].map((tag) => <button key={tag} onClick={() => setQuery(tag)}>{tag}</button>)}</div></section>
      <section id="discover" className="catalog wrap"><div className="section-heading"><div><p className="eyebrow">A considered collection</p><h2>Explore the good stuff</h2></div><div className="filters" role="group" aria-label="Filter by category">{(["All", "Digital", "Health"] as const).map((item) => item === "Health" ? <a className="filter-link" key={item} href="/health-wellness">{item}</a> : <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><p className="result-count">{filtered.length} {filtered.length === 1 ? "find" : "finds"} for you</p><div className="product-grid">{filtered.map((p) => <article className={`product-card ${p.accent}`} key={p.name}><div className="card-art"><span>{p.category === "Digital" ? "✧" : "☼"}</span>{p.badge && <b>{p.badge}</b>}</div><div className="card-body"><div className="card-meta"><span>{p.category}</span><span>{p.price}</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="tag-row">{p.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><a className="discover-link" href={p.href} target="_blank" rel="noopener noreferrer nofollow">View find <span>↗</span></a><small className="affiliate-note">Affiliate link · we may earn a commission</small></div></article>)}</div>{filtered.length === 0 && <div className="empty">No finds yet. Try a broader search or <button onClick={() => {setQuery(""); setCategory("All")}}>reset filters</button>.</div>}</section>
      <section id="guides" className="guide-section wrap"><div className="section-heading"><div><p className="eyebrow">TAFAT Evidence Guides</p><h2>Guides worth reading</h2></div></div><a className="guide-card" href="/health-wellness/the-complete-guide-to-magnesium"><span className="guide-card-badge">New</span><h3>The Complete Guide to Magnesium</h3><p>What magnesium is, why it matters, how much you need, food sources, supplement forms, label reading, health claims, safety and interactions — one evidence-based guide.</p><span className="guide-card-cta">Read the guide <span>→</span></span></a></section>
      <section id="about" className="approach"><div className="wrap approach-inner"><div><p className="eyebrow">Why Tafat</p><h2>Less noise.<br /><em>More signal.</em></h2></div><div className="approach-copy"><p>We look for useful ideas, clear value, and products that respect your time. Every find is independently selected and plainly labeled.</p><div className="principles"><span><i>01</i>Curated, not crowded</span><span><i>02</i>Honest about links</span><span><i>03</i>Your choice, always</span></div></div></div></section>
      <section id="stay-in-loop" className="signup wrap"><div className="signup-inner"><div><p className="eyebrow">A little goodness, occasionally</p><h2>Get the next good find.</h2><p>Join the list for fresh recommendations. No spam, easy unsubscribe.</p></div><form onSubmit={submitEmail}><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /><button type="submit">Join the list <span>→</span></button>{message && <small role="status">{message}</small>}<small>Preview only: email capture is not connected or stored. A future MailerLite connection will use a server-side env key.</small></form></div></section>
    </main>
    <footer className="footer wrap"><a className="brand" href="/"><span className="brand-mark">t</span><span>tafat</span></a><p>Good things, found thoughtfully.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@tafat.example">Contact</a></div><small>© 2026 Tafat · Affiliate relationships are disclosed on every find.</small></footer>
    <ConsentBanner />
  </div>;
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
