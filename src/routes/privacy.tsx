import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Tafat" },
      {
        name: "description",
        content:
          "Learn how Tafat handles optional analytics, consent, information, cookies, and affiliate links in this static preview.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Privacy policy — Tafat" },
      {
        property: "og:description",
        content:
          "Learn how Tafat handles optional analytics, consent, information, cookies, and affiliate links in this static preview.",
      },
      { property: "og:url", content: "https://tafat.co.uk/privacy" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy policy — Tafat" },
      {
        name: "twitter:description",
        content:
          "Learn how Tafat handles optional analytics, consent, information, cookies, and affiliate links in this static preview.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://tafat.co.uk/privacy",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="legal wrap">
      <a href="/" className="brand">
        <span className="brand-mark">t</span>tafat
      </a>
      <h1>Privacy policy</h1>
      <p className="eyebrow">Last updated August 2026</p>

      <h2>In this preview</h2>
      <p>
        Tafat is a static product discovery MVP. We do not operate accounts,
        store email addresses, or maintain a product database in this version.
        Information entered into the sign-up form is validated in your browser
        and is not transmitted to or stored by Tafat.
      </p>

      <h2>Analytics, cookies, and consent</h2>
      <p>
        Optional analytics may be used only after you give optional analytics
        consent. If enabled, Google Analytics 4 (GA4) is used to measure
        aggregated site usage and performance, so we can understand how the
        catalog is used and improve it. Analytics are off until you choose
        “Allow optional” in the cookie notice; rejecting them does not affect
        essential site functionality.
      </p>
      <p>
        Depending on the configuration, GA4 may process device and browser
        information, approximate location derived from your IP address, pages
        viewed and interactions, and identifiers or cookies configured by
        Google. Tafat does not hardcode a measurement ID in this policy or in
        the source; the operator configures it in the hosting environment. GA4
        retention is configurable by the operator in GA4. The operator will
        publish the configured retention period and you may request the current
        details.
      </p>
      <p>
        You can reject optional analytics in the cookie notice. You can also
        withdraw consent by clearing this site's consent choice and cookies in
        your browser (or using the browser's site-data controls), then choosing
        “No thanks” if the notice appears again. Google also provides
        information and controls for its use of data, including the Google
        Analytics opt-out options, in its{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy information
        </a>
        .
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some links are affiliate links. If you make a purchase, Tafat may
        receive a commission at no additional cost to you. We label these links
        clearly.
      </p>
      <p>
        On the Art &amp; Creative Studio page, affiliate links are managed with
        the Lasso tool, which loads from js.codedrink.com only after you choose
        “Allow optional” in the cookie notice. Lasso may use cookies or similar
        storage to recognise clicks and attribute commissions. No products or
        affiliate links are published in that category yet, so the tool does
        not currently decorate any links on the page.
      </p>

      <h2>Future updates</h2>
      <p>
        This static MVP has no accounts, no server-side email storage, and no
        connected signup delivery. If we add accounts, newsletters,
        personalization, or other providers, this policy will be updated with
        the relevant purposes, retention information, and rights process.
      </p>

      <p>
        <a href="/">← Back to Tafat</a>
      </p>
    </main>
  );
}
