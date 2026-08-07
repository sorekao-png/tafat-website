import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LASSO_READY_EVENT,
  LASSO_SNIPPET_URL,
  handleLassoConsent,
  loadLassoScriptOnce,
  registerLassoInitOnce,
  startLasso,
} from "./lasso";

/** Fresh window/document mocks per test, mirroring measurement.test.ts style. */
function installMockDom(getItem: () => string | null = () => null) {
  const windowListeners: Record<string, EventListener[]> = {};
  const documentListeners: Record<string, EventListener[]> = {};
  const appended: Array<Record<string, unknown>> = [];
  let existingScript: unknown = null;
  const windowMock = {
    addEventListener: (type: string, fn: EventListener) => {
      (windowListeners[type] ||= []).push(fn);
    },
    removeEventListener: (type: string, fn: EventListener) => {
      windowListeners[type] = (windowListeners[type] || []).filter((f) => f !== fn);
    },
    localStorage: { getItem },
  };
  const documentMock = {
    addEventListener: (type: string, fn: EventListener) => {
      (documentListeners[type] ||= []).push(fn);
    },
    removeEventListener: (type: string, fn: EventListener) => {
      documentListeners[type] = (documentListeners[type] || []).filter((f) => f !== fn);
    },
    querySelector: (selector: string) =>
      selector === 'script[data-tafat-lasso="true"]' ? existingScript : null,
    createElement: () => {
      const el: Record<string, unknown> & { dataset: Record<string, string>; _src: string } = {
        dataset: {},
        _src: "",
        set src(value: string) {
          this._src = value;
        },
      };
      return el;
    },
    head: { appendChild: (node: Record<string, unknown>) => appended.push(node) },
  };
  globalThis.window = windowMock as unknown as Window & typeof globalThis;
  globalThis.document = documentMock as unknown as Document;
  return {
    windowListeners,
    documentListeners,
    appended,
    setExistingScript: (value: unknown) => {
      existingScript = value;
    },
  };
}

describe("Lasso global wiring", () => {
  test("the root layout mounts the consent-gated Lasso boundary", () => {
    const root = readFileSync(join(process.cwd(), "src/routes/__root.tsx"), "utf8");
    expect(root).toContain('from "~/lib/lasso"');
    expect(root).toContain("startLasso");
    expect(root).toContain("ConsentAwareLasso");
  });

  test("the art route no longer starts Lasso itself", () => {
    const art = readFileSync(join(process.cwd(), "src/routes/art-creative-studio.tsx"), "utf8");
    expect(art).not.toContain("lib/lasso");
    expect(art).not.toContain("startLasso");
    expect(art).not.toContain("Lasso");
    expect(art).toContain("<ConsentBanner />");
  });

  test("no route other than the root layout loads Lasso", () => {
    const routesDir = join(process.cwd(), "src/routes");
    const otherRoutes = [
      "index.tsx",
      "privacy.tsx",
      "terms.tsx",
      "editorial-standards.tsx",
      "health-wellness.tsx",
      "health-wellness.the-complete-guide-to-magnesium.tsx",
      "health-wellness.vitamin-d-guide.tsx",
    ];
    for (const file of otherRoutes) {
      const src = readFileSync(join(routesDir, file), "utf8");
      // The consent-gated boundary lives only in the root layout: no other
      // route may import the loader or inject the snippet.
      expect(src).not.toContain("lib/lasso");
      expect(src).not.toContain("startLasso");
      expect(src).not.toContain(LASSO_SNIPPET_URL);
    }
    // The privacy page may *describe* the Lasso tool in its disclosure text,
    // but must not load it: verify the mention is prose, not an import.
    const privacy = readFileSync(join(routesDir, "privacy.tsx"), "utf8");
    expect(privacy).toContain("Lasso");
    expect(privacy).not.toContain("lib/lasso");
  });
});

describe("Lasso consent gating", () => {
  test("does not load before consent or after rejection", () => {
    const dom = installMockDom();
    expect(handleLassoConsent("unknown")).toBe(false);
    expect(dom.appended).toHaveLength(0);
    expect(dom.documentListeners[LASSO_READY_EVENT] ?? []).toHaveLength(0);
    expect(handleLassoConsent("denied")).toBe(false);
    expect(dom.appended).toHaveLength(0);
    expect(dom.documentListeners[LASSO_READY_EVENT] ?? []).toHaveLength(0);
    expect(handleLassoConsent(undefined)).toBe(false);
    expect(handleLassoConsent(null)).toBe(false);
    expect(dom.appended).toHaveLength(0);
  });

  test("loads the owner snippet only after Allow optional (analytics)", () => {
    const dom = installMockDom();
    expect(handleLassoConsent("analytics")).toBe(true);
    expect(dom.appended).toHaveLength(1);
    expect(dom.appended[0]._src).toBe(LASSO_SNIPPET_URL);
    expect((dom.appended[0].dataset as Record<string, string>).tafatLasso).toBe("true");
    expect(dom.documentListeners[LASSO_READY_EVENT]).toHaveLength(1);
  });

  test("startLasso applies stored consent immediately on every route", () => {
    const dom = installMockDom(() => "analytics");
    const cleanup = startLasso();
    expect(dom.appended).toHaveLength(1);
    expect(dom.windowListeners["tafat-consent"]).toHaveLength(1);
    cleanup();
  });

  test("startLasso stays off without stored consent or after rejection", () => {
    const dom = installMockDom(() => "denied");
    const cleanup = startLasso();
    expect(dom.appended).toHaveLength(0);
    expect(dom.documentListeners[LASSO_READY_EVENT] ?? []).toHaveLength(0);
    cleanup();
  });

  test("startLasso follows later consent choices and never duplicates", () => {
    const dom = installMockDom(() => null); // no stored choice yet
    const cleanup = startLasso();
    expect(dom.appended).toHaveLength(0);
    const listeners = dom.windowListeners["tafat-consent"];
    expect(listeners).toHaveLength(1);
    // No thanks -> nothing loads
    (listeners[0] as (e: Event) => void)({ detail: "denied" } as Event);
    expect(dom.appended).toHaveLength(0);
    expect(dom.documentListeners[LASSO_READY_EVENT] ?? []).toHaveLength(0);
    // Allow optional -> loads exactly once
    (listeners[0] as (e: Event) => void)({ detail: "analytics" } as Event);
    expect(dom.appended).toHaveLength(1);
    expect(dom.documentListeners[LASSO_READY_EVENT]).toHaveLength(1);
    // Later No thanks cannot unload or duplicate
    (listeners[0] as (e: Event) => void)({ detail: "denied" } as Event);
    expect(dom.appended).toHaveLength(1);
    // Later Allow optional cannot duplicate
    (listeners[0] as (e: Event) => void)({ detail: "analytics" } as Event);
    expect(dom.appended).toHaveLength(1);
    expect(dom.documentListeners[LASSO_READY_EVENT]).toHaveLength(1);
    // Cleanup removes the window listener
    cleanup();
    expect(dom.windowListeners["tafat-consent"]).toHaveLength(0);
  });

  test("duplicate startLasso mounts register one listener and one script", () => {
    const dom = installMockDom(() => "analytics");
    const cleanupA = startLasso();
    const cleanupB = startLasso(); // second mount must be a no-op
    expect(dom.windowListeners["tafat-consent"]).toHaveLength(1);
    expect(dom.appended).toHaveLength(1);
    cleanupA();
    cleanupB(); // no-op cleanup is safe
    expect(dom.windowListeners["tafat-consent"]).toHaveLength(0);
  });

  test("restart after cleanup re-wires without duplicating the script", () => {
    const dom = installMockDom(() => "analytics");
    const cleanupA = startLasso();
    expect(dom.appended).toHaveLength(1);
    cleanupA();
    // A re-mount (e.g. StrictMode double-effect) wires the listener again but
    // the once-only guards keep a single script and single ready listener.
    const cleanupB = startLasso();
    expect(dom.windowListeners["tafat-consent"]).toHaveLength(1);
    expect(dom.appended).toHaveLength(1);
    expect(dom.documentListeners[LASSO_READY_EVENT]).toHaveLength(1);
    cleanupB();
  });
});

describe("Lasso duplicate prevention", () => {
  test("loadLassoScriptOnce appends exactly one script", () => {
    const dom = installMockDom();
    expect(loadLassoScriptOnce()).toBe(true);
    expect(loadLassoScriptOnce()).toBe(false);
    expect(loadLassoScriptOnce()).toBe(false);
    expect(dom.appended).toHaveLength(1);
  });

  test("registerLassoInitOnce registers exactly one listener", () => {
    const dom = installMockDom();
    expect(registerLassoInitOnce()).toBe(true);
    expect(registerLassoInitOnce()).toBe(false);
    expect(registerLassoInitOnce()).toBe(false);
    expect(dom.documentListeners[LASSO_READY_EVENT]).toHaveLength(1);
  });

  test("skips injection when a data-tafat-lasso script already exists", () => {
    const dom = installMockDom();
    dom.setExistingScript({});
    expect(loadLassoScriptOnce()).toBe(false);
    expect(dom.appended).toHaveLength(0);
    // Subsequent consent does not append a second script either.
    expect(handleLassoConsent("analytics")).toBe(false);
    expect(dom.appended).toHaveLength(0);
  });
});

describe("Lasso event listener and init behavior", () => {
  test("calls e.detail.init() when LSAFFEventLoaded carries a function init", () => {
    const dom = installMockDom();
    registerLassoInitOnce();
    const listener = dom.documentListeners[LASSO_READY_EVENT][0] as (e: Event) => void;
    let calls = 0;
    const init = () => {
      calls++;
    };
    listener({ detail: { init } } as Event);
    expect(calls).toBe(1);
    // A successful init is idempotently guarded even if the event is re-dispatched.
    listener({ detail: { init } } as Event);
    expect(calls).toBe(1);
  });

  test("ignores malformed events without throwing", () => {
    const dom = installMockDom();
    registerLassoInitOnce();
    const listener = dom.documentListeners[LASSO_READY_EVENT][0] as (e: Event) => void;
    expect(() => listener({} as Event)).not.toThrow();
    expect(() => listener({ detail: undefined } as Event)).not.toThrow();
    expect(() => listener({ detail: null } as Event)).not.toThrow();
    expect(() => listener({ detail: {} } as Event)).not.toThrow();
    expect(() => listener({ detail: { init: "not-a-function" } } as Event)).not.toThrow();
  });

  test("invokes init with the vendor payload as `this`, as e.detail.init() does", () => {
    const dom = installMockDom();
    registerLassoInitOnce();
    const listener = dom.documentListeners[LASSO_READY_EVENT][0] as (e: Event) => void;
    let seen: unknown;
    const payload = {
      marker: "lasso-payload",
      init(this: { marker: string }) {
        seen = this.marker;
      },
    };
    listener({ detail: payload } as Event);
    expect(seen).toBe("lasso-payload");
    expect((window as Window & { __tafatLassoInitialized?: boolean }).__tafatLassoInitialized).toBe(true);
  });

  test("a throwing init is contained and later valid inits still run", () => {
    const dom = installMockDom();
    registerLassoInitOnce();
    const listener = dom.documentListeners[LASSO_READY_EVENT][0] as (e: Event) => void;
    expect(() =>
      listener({
        detail: {
          init: () => {
            throw new Error("boom");
          },
        },
      } as Event),
    ).not.toThrow();
    let calls = 0;
    listener({ detail: { init: () => calls++ } } as Event);
    expect(calls).toBe(1);
  });

  test("initializes from the vendor payload when the ready event already fired", () => {
    const dom = installMockDom();
    let calls = 0;
    (window as Window & { __LSAFF_EVT_DISPATCHED__?: boolean; LSAFFEvents?: unknown }).__LSAFF_EVT_DISPATCHED__ = true;
    (window as Window & { LSAFFEvents?: unknown }).LSAFFEvents = { init: () => calls++ };
    registerLassoInitOnce();
    expect(calls).toBe(1);
    const listener = dom.documentListeners[LASSO_READY_EVENT][0] as (e: Event) => void;
    listener({ detail: { init: () => calls++ } } as Event);
    expect(calls).toBe(1);
  });

  test("replays init when the vendor attaches init after dispatching", async () => {
    const dom = installMockDom();
    (window as Window & { __LSAFF_EVT_DISPATCHED__?: boolean; LSAFFEvents?: unknown }).__LSAFF_EVT_DISPATCHED__ = true;
    (window as Window & { LSAFFEvents?: unknown }).LSAFFEvents = {}; // no init yet
    let calls = 0;
    registerLassoInitOnce();
    expect(calls).toBe(0);
    // The vendor payload gains init shortly after the event was dispatched.
    setTimeout(() => {
      (window as Window & { LSAFFEvents?: unknown }).LSAFFEvents = { init: () => calls++ };
    }, 100);
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(calls).toBe(1);
    // The replay is one-shot: the same late init never runs twice.
    expect((window as Window & { __tafatLassoInitialized?: boolean }).__tafatLassoInitialized).toBe(true);
  });
});
