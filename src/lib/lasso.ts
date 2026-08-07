import { readConsent } from "./measurement";

declare global {
  interface Window {
    __tafatLassoLoaded?: boolean;
    __tafatLassoInitRegistered?: boolean;
    __tafatLassoInitialized?: boolean;
    __LSAFF_EVT_DISPATCHED__?: boolean;
    LSAFFEvents?: unknown;
  }
}

/** Owner-supplied Lasso (Smart Links) snippet URL. */
export const LASSO_SNIPPET_URL = "https://js.codedrink.com/snippet.min.js";
/** Event the Lasso snippet dispatches on `document` when its data is ready. */
export const LASSO_READY_EVENT = "LSAFFEventLoaded";
/** Reused TAFAT consent event (also drives the GTM/GA4/Clarity loaders). */
export const LASSO_CONSENT_EVENT = "tafat-consent";
/** Lasso is scoped to the Art & Creative Studio category page only. */
export const LASSO_SCOPE_PATH = "/art-creative-studio";

/** True only for the exact Lasso-scoped route (trailing slash tolerated). */
export function isLassoRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === LASSO_SCOPE_PATH;
}

function initFromDetail(detail: unknown): (() => void) | null {
  if (
    detail &&
    typeof detail === "object" &&
    typeof (detail as { init?: unknown }).init === "function"
  ) {
    return (detail as { init: () => void }).init;
  }
  return null;
}

function runInit(detail: unknown): boolean {
  if (typeof window === "undefined" || window.__tafatLassoInitialized) return false;
  const init = initFromDetail(detail);
  if (!init) return false;
  try {
    init();
    window.__tafatLassoInitialized = true;
    return true;
  } catch (error) {
    if (typeof console !== "undefined") console.error("[TAFAT-LASSO] init failed", error);
    return false;
  }
}

function runAlreadyDispatchedInit(): boolean {
  if (typeof window === "undefined") return false;
  // The owner snippet marks this when it has already dispatched the event.
  // Its public event payload is also exposed as LSAFFEvents.
  return window.__LSAFF_EVT_DISPATCHED__ === true && runInit(window.LSAFFEvents);
}

/**
 * Register the LSAFFEventLoaded listener exactly once per page load.
 * The listener calls `e.detail.init()` exactly as the owner's integration
 * expects, and is defensive: malformed events or a throwing init can never
 * break the page.
 */
export function registerLassoInitOnce(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (window.__tafatLassoInitRegistered) return false;
  window.__tafatLassoInitRegistered = true;
  document.addEventListener(LASSO_READY_EVENT, (event) => {
    runInit((event as CustomEvent).detail);
  });
  // Registering after the vendor has dispatched would otherwise miss the
  // owner's one-shot event. This remains consent-gated because callers only
  // invoke registration after optional consent.
  runAlreadyDispatchedInit();
  return true;
}

/**
 * Inject the Lasso snippet exactly once, mirroring the owner's
 * `<script type="text/javascript" src="https://js.codedrink.com/snippet.min.js" defer></script>`.
 */
export function loadLassoScriptOnce(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (window.__tafatLassoLoaded) return false;
  if (document.querySelector('script[data-tafat-lasso="true"]')) {
    window.__tafatLassoLoaded = true;
    return false;
  }
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.defer = true;
  script.src = LASSO_SNIPPET_URL;
  script.dataset.tafatLasso = "true";
  document.head.appendChild(script);
  window.__tafatLassoLoaded = true;
  return true;
}

/**
 * Consent gate for Lasso. Only explicit optional analytics/marketing consent
 * ("analytics") may load Lasso; before consent ("unknown") and after
 * rejection ("denied") it stays off. Returns true when the script was loaded.
 */
export function handleLassoConsent(detail: unknown): boolean {
  if (detail !== "analytics") return false;
  registerLassoInitOnce();
  return loadLassoScriptOnce();
}

/**
 * Consent-gated Lasso boundary for a route (mounted from /art-creative-studio).
 * - No-ops on every route outside the Lasso scope.
 * - Applies the visitor's stored consent immediately.
 * - Reacts to later consent choices via the `tafat-consent` event.
 * - Returns a cleanup function that removes the listener.
 */
export function startLassoForRoute(pathname: string): () => void {
  const noop = () => {};
  if (typeof window === "undefined" || !isLassoRoute(pathname)) return noop;
  const onConsent = (event: Event) => handleLassoConsent((event as CustomEvent).detail);
  handleLassoConsent(readConsent());
  window.addEventListener(LASSO_CONSENT_EVENT, onConsent);
  return () => window.removeEventListener(LASSO_CONSENT_EVENT, onConsent);
}
