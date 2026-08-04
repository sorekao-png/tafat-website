declare global {
  interface Window { dataLayer?: unknown[]; }
}

export type ConsentState = "unknown" | "denied" | "analytics";

/** Public, non-secret IDs only. Leave unset until the owner creates each property. */
export const measurementConfig = {
  gtmId: import.meta.env.VITE_GTM_ID?.trim() || "",
  ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim() || "",
  clarityProjectId: import.meta.env.VITE_CLARITY_PROJECT_ID?.trim() || "",
  bingVerification: import.meta.env.VITE_BING_VERIFICATION?.trim() || "",
};

export const CONSENT_KEY = "tafat-consent-v1";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "analytics" || value === "denied" ? value : "unknown";
}

export function writeConsent(value: Exclude<ConsentState, "unknown">) {
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent("tafat-consent", { detail: value }));
}
