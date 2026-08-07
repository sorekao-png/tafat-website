import { readConsent } from "./measurement";

declare global {
  interface Window {
    __tafatLassoLoaded?: boolean;
    __tafatLassoInitRegistered?: boolean;
    __tafatLassoInitialized?: boolean;
    __tafatLassoStarted?: boolean;
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
    // Invoke exactly as the owner's integration does (e.detail.init()): the
    // vendor's init reads `this` from the payload object, so detaching the
    // function would make it throw.
    init.call(detail);
    window.__tafatLassoInitialized = true;
    return true;
  } catch (error) {
    if (typeof console !== "undefined") console.error("[TAFAT-LASSO] init failed", error);
    return false;
  }
}

/** Bound the guarded init replay so the vendor payload is never polled forever. */
const MAX_INIT_RETRIES = 10;
const INIT_RETRY_DELAY_MS = 250;

/**
 * The vendor marks the ready event as dispatched before `e.detail.init()` is
 * always attached to its LSAFFEvents payload. When the one-shot event cannot
 * run init yet, retry briefly against the same payload so the owner's
 * `e.detail.init()` call still happens exactly once, without infinite polling.
 */
function scheduleInitRetry(): void {
  if (typeof window === "undefined" || window.__tafatLassoInitialized) return;
  let attempts = 0;
  const retry = () => {
    if (typeof window === "undefined" || window.__tafatLassoInitialized) return;
    if (initFromDetail(window.LSAFFEvents)) {
      runInit(window.LSAFFEvents);
      return; // real init call attempted — never retry again
    }
    attempts += 1;
    if (attempts < MAX_INIT_RETRIES) setTimeout(retry, INIT_RETRY_DELAY_MS);
  };
  setTimeout(retry, INIT_RETRY_DELAY_MS);
}

function runAlreadyDispatchedInit(): boolean {
  if (typeof window === "undefined") return false;
  // The owner snippet marks this when it has already dispatched the event.
  // Its public event payload is also exposed as LSAFFEvents.
  if (window.__LSAFF_EVT_DISPATCHED__ !== true) return false;
  if (runInit(window.LSAFFEvents) || window.__tafatLassoInitialized) return true;
  scheduleInitRetry();
  return false;
}

/**
 * Register the LSAFFEventLoaded listener exactly once per page load.
 * The listener calls `e.detail.init()` exactly as the owner's integration
 * expects, and is defensive: malformed events or a throwing init can never
 * break the page, and a late-attached vendor init is replayed briefly.
 */
export function registerLassoInitOnce(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (window.__tafatLassoInitRegistered) return false;
  window.__tafatLassoInitRegistered = true;
  document.addEventListener(LASSO_READY_EVENT, (event) => {
    if (!runInit((event as CustomEvent).detail) && !window.__tafatLassoInitialized) {
      scheduleInitRetry();
    }
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
 * Consent-gated Lasso boundary, mounted exactly once from the root layout so
 * every page (homepage, Discover, categories, guides, and future routes) can
 * process affiliate links after the visitor opts in.
 * - No-ops before consent and after rejection.
 * - Applies the visitor's stored consent immediately.
 * - Reacts to later consent choices via the `tafat-consent` event.
 * - Calling it again while already started is a no-op, so a duplicate mount
 *   can never register a second listener or second script.
 * - Returns a cleanup function that removes the listener and lets a
 *   re-mount (e.g. StrictMode double-effect) start fresh.
 */
export function startLasso(): () => void {
  const noop = () => {};
  if (typeof window === "undefined") return noop;
  if (window.__tafatLassoStarted) return noop;
  window.__tafatLassoStarted = true;
  const onConsent = (event: Event) => handleLassoConsent((event as CustomEvent).detail);
  handleLassoConsent(readConsent());
  window.addEventListener(LASSO_CONSENT_EVENT, onConsent);
  return () => {
    window.removeEventListener(LASSO_CONSENT_EVENT, onConsent);
    window.__tafatLassoStarted = false;
  };
}
