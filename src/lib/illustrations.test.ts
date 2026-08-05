import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HOME_CATEGORIES, HEALTH_TOPICS } from "./categories";
import { illustrationByKey, MagnesiumHeroIllustration } from "./illustrations";

const ROUTE = process.cwd();

describe("TAFAT illustration language", () => {
  test("every category art key resolves to a renderable illustration component", () => {
    for (const c of [...HOME_CATEGORIES, ...HEALTH_TOPICS]) {
      const Ill = illustrationByKey[c.art];
      expect(typeof Ill, `missing illustration for ${c.art}`).toBe("function");
    }
    // Future-category treatment exists for Technology, Coffee, Books and Art.
    for (const key of ["technology", "coffee", "books", "art"]) {
      expect(typeof illustrationByKey[key]).toBe("function");
    }
  });

  test("live categories are exactly Digital and Health & Wellness; future ones are honest 'soon' cards", () => {
    const live = HOME_CATEGORIES.filter((c) => c.status === "live");
    expect(live.map((c) => c.name).sort()).toEqual(["Digital", "Health & Wellness"]);
    for (const c of HOME_CATEGORIES.filter((c) => c.status === "soon")) {
      expect(c.href).toBeNull(); // never link a visitor to a non-existent page
      expect(c.tagline.toLowerCase()).toContain("coming soon");
    }
    // Live cards must point at existing surfaces.
    const digital = HOME_CATEGORIES.find((c) => c.id === "digital");
    const health = HOME_CATEGORIES.find((c) => c.id === "health-wellness");
    expect(digital?.href).toBe("/#discover");
    expect(health?.href).toBe("/health-wellness");
  });

  test("health topics preserve their original six names and destinations", () => {
    expect(HEALTH_TOPICS.map((t) => t.name)).toEqual([
      "Vitamins & Minerals",
      "Sleep & Rest",
      "Gut Health",
      "Hydration & Electrolytes",
      "Healthy Movement",
      "General Wellness",
    ]);
    expect(HEALTH_TOPICS[0].href).toBe("/health-wellness/the-complete-guide-to-magnesium");
    expect(HEALTH_TOPICS.slice(1).every((t) => t.href === "#coming-soon")).toBe(true);
  });

  test("hero illustration is a self-contained accessible SVG", () => {
    const html = MagnesiumHeroIllustration({});
    expect(html.props.role).toBe("img");
    expect(html.props["aria-labelledby"]).toBe("magnesium-hero-title");
  });

  test("illustration SVGs are decorative by default (aria-hidden, no focus)", () => {
    for (const key of ["digital", "health", "coffee"]) {
      const el = illustrationByKey[key]({});
      expect(el.props["aria-hidden"]).toBe("true");
      expect(el.props.focusable).toBe("false");
    }
  });
});

describe("editorial CSS accessibility and motion guards", () => {
  const css = readFileSync(join(ROUTE, "src/styles/app.css"), "utf8");

  test("reduced-motion kill switch exists", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("transition-duration: 0.01ms !important");
  });

  test("entrance animation only runs when motion is allowed", () => {
    expect(css).toContain("prefers-reduced-motion: no-preference");
    expect(css).toContain("@keyframes tafat-rise");
  });

  test("reading widths and illustration palette tokens are defined", () => {
    expect(css).toContain("--font-reader");
    expect(css).toContain("--ill-ink");
    expect(css).toContain("max-width: 720px");
  });

  test("focus-visible styles exist for keyboard users", () => {
    expect(css).toContain(":focus-visible");
  });
});
