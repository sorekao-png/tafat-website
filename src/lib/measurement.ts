declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __tafatGa4Runtime?: { order: string[]; loaded: boolean };
    __tafatGtmLoaded?: boolean;
    __tafatClarityLoaded?: boolean;
  }
}

export const GA4_DIAGNOSTIC_PREFIX = "[TAFAT-GA4-DIAGNOSTIC]";

function diagnostic(message: string) {
  if (typeof console !== "undefined") console.info(`${GA4_DIAGNOSTIC_PREFIX} ${message}`);
}

export function recordGa4Runtime(step: string) {
  if (typeof window === "undefined") return;
  const state = (window.__tafatGa4Runtime ||= { order: [], loaded: false });
  state.order.push(step);
  diagnostic(step);
}

export type ConsentState = "unknown" | "denied" | "analytics";

/** Public, non-secret IDs only. Leave unset until the owner creates each property. */
const publicEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
export const measurementConfig = {
  gtmId: publicEnv.VITE_GTM_CONTAINER_ID?.trim() || "",
  ga4MeasurementId: publicEnv.VITE_GA4_MEASUREMENT_ID?.trim() || "",
  clarityProjectId: publicEnv.VITE_CLARITY_PROJECT_ID?.trim() || "",
  bingVerification: publicEnv.VITE_BING_VERIFICATION?.trim() || "",
};

export const CONSENT_KEY = "tafat-consent-v1";

export const consentDefaults = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  wait_for_update: 500,
} as const;

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "analytics" || value === "denied" ? value : "unknown";
}

export function writeConsent(value: Exclude<ConsentState, "unknown">) {
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent("tafat-consent", { detail: value }));
}

/** Ensure one stable queue is shared by Consent Mode, GA4, and GTM. */
function ensureDataLayer() {
  if (!window.dataLayer) window.dataLayer = [];
  return window.dataLayer;
}

function gtag() {
  ensureDataLayer().push(arguments);
}

export function initializeGoogleConsent() {
  if (typeof window === "undefined") return;
  ensureDataLayer();
  window.gtag = gtag;
  window.gtag("consent", "default", consentDefaults);
  recordGa4Runtime("consent default denied");
}

/** Load GTM only after optional analytics consent. No noscript fallback is used. */
export function loadGoogleTagManager(containerId: string): boolean {
  if (typeof window === "undefined" || !containerId || window.__tafatGtmLoaded) return false;
  const existing = document.querySelector('script[data-tafat-gtm="true"]');
  if (existing) {
    window.__tafatGtmLoaded = true;
    return false;
  }
  const dataLayer = ensureDataLayer();
  dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.dataset.tafatGtm = "true";
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
  window.__tafatGtmLoaded = true;
  return true;
}

/** Load Microsoft Clarity only after optional analytics consent, once per page. */
export function loadMicrosoftClarity(projectId: string): boolean {
  if (typeof window === "undefined" || !/^[A-Za-z0-9_-]+$/.test(projectId) || window.__tafatClarityLoaded) return false;
  const existing = document.querySelector('script[data-tafat-clarity="true"]');
  if (existing) {
    window.__tafatClarityLoaded = true;
    return false;
  }
  const script = document.createElement("script");
  script.async = true;
  script.dataset.tafatClarity = "true";
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  document.head.appendChild(script);
  window.__tafatClarityLoaded = true;
  return true;
}

/** Commands which must run only after the vendor script has loaded. */
export function runGa4Onload(measurementId: string) {
  if (typeof window === "undefined" || !window.gtag || !measurementId) return;
  const state = (window.__tafatGa4Runtime ||= { order: [], loaded: false });
  if (state.loaded) return;
  state.loaded = true;
  recordGa4Runtime("GA4 script onload");
  recordGa4Runtime("gtag js");
  window.gtag("js", new Date());
  recordGa4Runtime(`config ${measurementId} send_page_view:false`);
  window.gtag("config", measurementId, { anonymize_ip: true, send_page_view: false });
  recordGa4Runtime("event page_view");
  sendGooglePageView(measurementId);
}

export function updateGoogleConsent(state: Exclude<ConsentState, "unknown">) {
  if (!window.gtag) initializeGoogleConsent();
  window.gtag?.("consent", "update", { analytics_storage: state === "analytics" ? "granted" : "denied" });
  recordGa4Runtime(`consent update ${state === "analytics" ? "granted" : "denied"}`);
}

export function sendGooglePageView(measurementId: string) {
  if (typeof window === "undefined" || !window.gtag || !measurementId) return;
  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
}
