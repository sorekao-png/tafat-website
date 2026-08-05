declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
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
 */
export function initializeGoogleConsent() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer!.push(args));
  window.gtag("consent", "default", consentDefaults);
}

export function updateGoogleConsent(state: Exclude<ConsentState, "unknown">) {
  if (!window.gtag) initializeGoogleConsent();
  window.gtag?.("consent", "update", {
    analytics_storage: state === "analytics" ? "granted" : "denied",
  });
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
