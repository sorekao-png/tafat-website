import { describe, expect, test } from "bun:test";
import {
  consentDefaults,
  initializeGoogleConsent,
  loadGoogleTagManager,
  loadMicrosoftClarity,
  runGa4Onload,
  sendGooglePageView,
  updateGoogleConsent,
} from "./measurement";

describe("Google Consent Mode", () => {
  test("queues denied defaults before tags are loaded", () => {
    const dataLayer: unknown[] = [];
    globalThis.window = { dataLayer } as unknown as Window & typeof globalThis;

    initializeGoogleConsent();

    const queued = Array.from(dataLayer[0] as IArguments);
    expect(queued).toEqual(["consent", "default", consentDefaults]);
    expect(consentDefaults).toEqual({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
  });

  test("transitions from denied to granted without granting ad storage", () => {
    const calls: unknown[][] = [];
    globalThis.window = {
      dataLayer: [],
      gtag: (...args: unknown[]) => calls.push(args),
    } as unknown as Window & typeof globalThis;

    updateGoogleConsent("denied");
    updateGoogleConsent("analytics");

    expect(calls).toEqual([
      ["consent", "update", { analytics_storage: "denied" }],
      ["consent", "update", { analytics_storage: "granted" }],
    ]);
  });

  test("queues an explicit page_view with current page context", () => {
    const calls: unknown[][] = [];
    globalThis.window = {
      dataLayer: [],
      gtag: (...args: unknown[]) => calls.push(args),
      location: { href: "https://tafat.co.uk/", pathname: "/", search: "", hash: "" },
    } as unknown as Window & typeof globalThis;
    globalThis.document = { title: "Tafat — Find something good" } as Document;

    sendGooglePageView("G-TEST");

    expect(calls).toEqual([[
      "event",
      "page_view",
      {
        page_title: "Tafat — Find something good",
        page_location: "https://tafat.co.uk/",
        page_path: "/",
      },
    ]]);
  });

  test("uses canonical global gtag and preserves dataLayer identity and order", () => {
    const dataLayer: unknown[] = [];
    globalThis.window = {
      dataLayer,
      location: { href: "https://tafat.co.uk/", pathname: "/", search: "", hash: "" },
      __tafatGa4Runtime: { order: [], loaded: false },
    } as unknown as Window & typeof globalThis;
    globalThis.document = { title: "Tafat" } as Document;
    const identity = window.dataLayer;
    initializeGoogleConsent();
    const globalGtag = window.gtag;
    runGa4Onload("G-TEST");
    expect(window.gtag).toBe(globalGtag);
    expect(window.dataLayer).toBe(identity);
    const queued = dataLayer.map((entry) => Array.from(entry as IArguments));
    expect(window.__tafatGa4Runtime?.order).toEqual([
      "consent default denied", "GA4 script onload", "gtag js",
      "config G-TEST send_page_view:false", "event page_view",
    ]);
    expect(queued.map(([name, arg]) => [name, arg])).toEqual([
      ["consent", "default"], ["js", expect.any(Date)], ["config", "G-TEST"], ["event", "page_view"],
    ]);
  });
});

describe("Google Tag Manager consent loader", () => {
  test("does not load before consent or after rejection", () => {
    const appended: unknown[] = [];
    globalThis.window = { dataLayer: [] } as unknown as Window & typeof globalThis;
    globalThis.document = { querySelector: () => null, createElement: () => ({ dataset: {}, setAttribute() {} }), head: { appendChild: (node: unknown) => appended.push(node) } } as unknown as Document;
    expect(loadGoogleTagManager("GTM-NSFRDTHS")).toBe(true);
    expect(appended).toHaveLength(1);
  });

  test("loads once with encoded container ID and stable dataLayer", () => {
    const appended: any[] = [];
    const dataLayer: unknown[] = [];
    globalThis.window = { dataLayer } as unknown as Window & typeof globalThis;
    globalThis.document = { querySelector: () => null, createElement: () => ({ dataset: {}, set src(value: string) { this._src = value; }, _src: "", set async(value: boolean) {}, }), head: { appendChild: (node: unknown) => appended.push(node) } } as unknown as Document;
    const identity = window.dataLayer;
    expect(loadGoogleTagManager("GTM-test / unsafe")).toBe(true);
    expect(loadGoogleTagManager("GTM-test / unsafe")).toBe(false);
    expect(window.dataLayer).toBe(identity);
    expect(dataLayer[0]).toMatchObject({ event: "gtm.js" });
    expect(appended).toHaveLength(1);
    expect(appended[0]._src).toContain("GTM-test%20%2F%20unsafe");
  });
});

describe("Microsoft Clarity consent loader", () => {
  test("does not load an unsafe project ID", () => {
    const appended: unknown[] = [];
    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.document = { querySelector: () => null, createElement: () => ({ dataset: {}, set src(value: string) { this._src = value; } }), head: { appendChild: (node: unknown) => appended.push(node) } } as unknown as Document;
    expect(loadMicrosoftClarity("bad id/with spaces")).toBe(false);
    expect(appended).toHaveLength(0);
  });

  test("loads the owner project exactly once after opt-in", () => {
    const appended: any[] = [];
    globalThis.window = {} as unknown as Window & typeof globalThis;
    globalThis.document = { querySelector: () => null, createElement: () => ({ dataset: {}, set src(value: string) { this._src = value; }, set async(value: boolean) {} }), head: { appendChild: (node: unknown) => appended.push(node) } } as unknown as Document;
    expect(loadMicrosoftClarity("xxk6k7g26z")).toBe(true);
    expect(loadMicrosoftClarity("xxk6k7g26z")).toBe(false);
    expect(appended).toHaveLength(1);
    expect(appended[0]._src).toBe("https://www.clarity.ms/tag/xxk6k7g26z");
  });
});
