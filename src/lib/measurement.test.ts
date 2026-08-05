import { describe, expect, test } from "bun:test";
import {
  consentDefaults,
  initializeGoogleConsent,
  runGa4Onload,
  sendGooglePageView,
  updateGoogleConsent,
} from "./measurement";

describe("Google Consent Mode", () => {
  test("queues denied defaults before tags are loaded", () => {
    const calls: unknown[][] = [];
    const dataLayer: unknown[] = [];
    globalThis.window = {
      dataLayer,
      gtag: (...args: unknown[]) => calls.push(args),
    } as unknown as Window & typeof globalThis;

    initializeGoogleConsent();

    expect(calls).toEqual([["consent", "default", consentDefaults]]);
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

  test("keeps one dataLayer identity and runs commands on onload in order", () => {
    const dataLayer: unknown[] = [];
    const calls: unknown[][] = [];
    globalThis.window = {
      dataLayer,
      gtag: (...args: unknown[]) => { calls.push(args); dataLayer.push(args); },
      location: { href: "https://tafat.co.uk/", pathname: "/", search: "", hash: "" },
      __tafatGa4Runtime: { order: [], loaded: false },
    } as unknown as Window & typeof globalThis;
    globalThis.document = { title: "Tafat" } as Document;
    const identity = window.dataLayer;
    initializeGoogleConsent();
    runGa4Onload("G-TEST");
    expect(window.dataLayer).toBe(identity);
    expect(window.__tafatGa4Runtime?.order).toEqual([
      "consent default denied", "GA4 script onload", "gtag js",
      "config G-TEST send_page_view:false", "event page_view",
    ]);
    expect(calls.map(([name, arg]) => [name, arg])).toEqual([
      ["consent", "default"], ["js", expect.any(Date)], ["config", "G-TEST"], ["event", "page_view"],
    ]);
  });
});
