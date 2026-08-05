declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __tafatGa4Runtime?: { order: string[]; loaded: boolean };
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
  gtmId: publicEnv.VITE_GTM_ID?.trim() || "",
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

/**
 * Install the Consent Mode default before loading any Google tag. Keeping this
 * small and side-effect-free until called makes the ordering explicit and testable.
 *
 * Install the canonical Google queue function on the global window. Google tags
 * consume the IArguments entry pushed by this function, so do not replace it
 * with a closure-local queue or an array of rest arguments.
 */
function gtag() {
  window.dataLayer!.push(arguments);
}

export function initializeGoogleConsent() {
  if (typeof window === "undefined") return;
  if (!window.dataLayer) window.dataLayer = [];
  window.gtag = gtag;
  window.gtag("consent", "default", consentDefaults);
  recordGa4Runtime("consent default denied");
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
  window.gtag?.("consent", "update", {
    analytics_storage: state === "analytics" ? "granted" : "denied",
  });
  recordGa4Runtime(`consent update ${state === "analytics" ? "granted" : "denied"}`);
}

/** Send the initial page_view only after the GA4 config command has been queued. */
export function sendGooglePageView(measurementId: string) {
  if (typeof window === "undefined" || !window.gtag || !measurementId) return;
  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
}
