import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";

import appCss from "~/styles/app.css?url";
import {
  initializeGoogleConsent,
  measurementConfig,
  readConsent,
  sendGooglePageView,
  updateGoogleConsent,
} from "~/lib/measurement";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Discover thoughtfully curated digital tools and wellbeing resources at Tafat." },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Tafat" },
      { property: "og:title", content: "Tafat — Find something good" },
      { property: "og:description", content: "Discover thoughtfully curated digital tools and wellbeing resources." },
      { property: "og:url", content: "https://466c73967ef3825450db11330538b29c.ctonew.app/" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Tafat — Find something good" },
      { name: "twitter:description", content: "Discover thoughtfully curated digital tools and wellbeing resources." },
      ...(measurementConfig.bingVerification ? [{ name: "msvalidate.01", content: measurementConfig.bingVerification }] : []),
      { title: "Tafat — Find something good" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://466c73967ef3825450db11330538b29c.ctonew.app/" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Tafat",
        url: "https://466c73967ef3825450db11330538b29c.ctonew.app/",
        description: "Discover thoughtfully curated digital tools and wellbeing resources.",
      }),
    }],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <ConsentAwareMeasurement />
    </RootDocument>
  );
}

function ConsentAwareMeasurement() {
  useEffect(() => {
    // Consent Mode defaults must be queued before any Google tag can load.
    initializeGoogleConsent();
    let loaded = false;
    const load = () => {
      const consent = readConsent();
      if (consent !== "analytics") {
        updateGoogleConsent("denied");
        return;
      }
      updateGoogleConsent("analytics");
      if (loaded) return;
      loaded = true;
      const { gtmId, ga4MeasurementId, clarityProjectId } = measurementConfig;
      if (gtmId) {
        window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
        document.head.appendChild(script);
      }
      if (ga4MeasurementId) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId)}`;
        document.head.appendChild(script);
        window.gtag!("js", new Date());
        window.gtag!("config", ga4MeasurementId, { anonymize_ip: true, send_page_view: false });
        sendGooglePageView(ga4MeasurementId);
      }
      if (clarityProjectId) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`;
        document.head.appendChild(script);
      }
    };
    load();
    window.addEventListener("tafat-consent", load);
    return () => window.removeEventListener("tafat-consent", load);
  }, []);
  return null;
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
