import { describe, expect, test } from "bun:test";
import {
  consentDefaults,
  initializeGoogleConsent,
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
});
