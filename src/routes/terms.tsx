import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — Tafat" },
      { name: "description", content: "Read the Tafat terms for using this affiliate product discovery catalog and its third-party links." },
    ],
    links: [{ rel: "canonical", href: "https://466c73967ef3825450db11330538b29c.ctonew.app/terms" }],
  }),
  component: Terms,
});
function Terms(){return <main className="legal wrap"><a href="/" className="brand"><span className="brand-mark">t</span>tafat</a><h1>Terms of use</h1><p className="eyebrow">Last updated August 2026</p><h2>What Tafat provides</h2><p>Tafat is a discovery and editorial catalog. Product information is provided for general information and is not a guarantee, endorsement, or substitute for professional advice.</p><h2>Third-party offers</h2><p>When you follow an external product link, you leave Tafat and are subject to that provider’s terms and privacy policy. Links open in a new tab with safe browser isolation.</p><h2>Accuracy</h2><p>We aim to keep listings useful and current, but prices, availability, and terms belong to the third-party provider and may change.</p><p><a href="/">← Back to Tafat</a></p></main>}
