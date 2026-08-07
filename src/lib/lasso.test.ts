import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LASSO_READY_EVENT,
  LASSO_SNIPPET_URL,
  handleLassoConsent,
  isLassoRoute,
  loadLassoScriptOnce,
  registerLassoInitOnce,
  startLassoForRoute,
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

describe("Lasso route scope", () => {
  test("isLassoRoute matches only the exact art-creative-studio route", () => {
    expect(isLassoRoute("/art-creative-studio")).toBe(true);
    expect(isLassoRoute("/art-creative-studio/")).toBe(true);
    expect(isLassoRoute("/")).toBe(false);
    expect(isLassoRoute("")).toBe(false);
    expect(isLassoRoute("/health-wellness")).toBe(false);
    expect(isLassoRoute("/art-creative-studio-guide")).toBe(false);
    expect(isLassoRoute("/art-creative-studio/materials")).toBe(false);
  });

  test("only the art route wires the consent-gated Lasso boundary", () => {
    const routesDir = join(process.cwd(), "src/routes");
    const art = readFileSync(join(routesDir, "art-creative-studio.tsx"), "utf8");
    expect(art).toContain("startLassoForRoute");
    expect(art).toContain("<ConsentBanner />");
    const otherRoutes = [
      "__root.tsx",
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
      // The Lasso boundary must only be wired from the art route: no other
      // route may import the loader or mount the consent-gated boundary.
      expect(src).not.toContain("lib/lasso");
      expect(src).not.toContain("startLassoForRoute");
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

  test("startLassoForRoute ignores non-scoped routes even with stored consent", () => {
    const dom = installMockDom(() => "analytics");
    const cleanup = startLassoForRoute("/");
    expect(dom.appended).toHaveLength(0);
    expect(dom.windowListeners["tafat-consent"] ?? []).toHaveLength(0);
    cleanup();
  });

  test("startLassoForRoute applies stored consent immediately on the art route", () => {
    const dom = installMockDom(() => "analytics");
    const cleanup = startLassoForRoute("/art-creative-studio");
    expect(dom.appended).toHaveLength(1);
    expect(dom.windowListeners["tafat-consent"]).toHaveLength(1);
    cleanup();
  });

  test("startLassoForRoute follows later consent choices and never duplicates", () => {
    const dom = installMockDom(() => null); // no stored choice yet
    const cleanup = startLassoForRoute("/art-creative-studio");
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
});
