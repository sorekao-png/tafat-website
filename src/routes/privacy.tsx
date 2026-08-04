import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Tafat" },
      { name: "description", content: "Learn how Tafat handles information, cookies, consent, and affiliate links in this preview." },
    ],
    links: [{ rel: "canonical", href: "https://466c73967ef3825450db11330538b29c.ctonew.app/privacy" }],
  }),
  component: Privacy,
});
function Privacy(){return <main className="legal wrap"><a href="/" className="brand"><span className="brand-mark">t</span>tafat</a><h1>Privacy policy</h1><p className="eyebrow">Last updated August 2026</p><h2>In this preview</h2><p>Tafat is a static product discovery preview. We do not operate accounts, store email addresses, or maintain a product database in this version. Information entered into the sign-up form is validated in your browser and is not sent to a server.</p><h2>Cookies and consent</h2><p>Only essential site functionality is intended to operate. Optional analytics are off by default and are not currently installed. You can dismiss the cookie notice at any time.</p><h2>Affiliate links</h2><p>Some links are affiliate links. If you make a purchase, Tafat may receive a commission at no additional cost to you. We label these links clearly.</p><h2>Future updates</h2><p>Before enabling accounts, newsletters, analytics, or personalization, this policy will be updated with the relevant providers, purposes, retention periods, and rights process.</p><p><a href="/">← Back to Tafat</a></p></main>}
