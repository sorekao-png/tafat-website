import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Route as GuideRoute } from "../routes/health-wellness.the-complete-guide-to-magnesium";
import content from "./magnesium-content.json";

const ROUTE = process.cwd();

/** Decode the entities React emits in SSR text so we can match manuscript strings. */
function norm(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const html = norm(renderToString(createElement(GuideRoute.options.component)));

describe("magnesium guide editorial renderer", () => {
  test("every manuscript entry survives SSR verbatim (no wording, cautions or claims lost)", () => {
    // The comparison header row is intentionally re-composed into per-column
    // legend chips, so its labels are verified separately below.
    const comparisonHeader =
      "Form, Bio availability, Common Reason People Choose It, Digestive Effect, Evidence";
    for (const entry of content) {
      if (entry.t === comparisonHeader) continue;
      expect(html, `missing manuscript text: ${entry.t.slice(0, 60)}`).toContain(entry.t);
    }
    for (const label of comparisonHeader.split(", ")) {
      expect(html, `missing comparison label: ${label}`).toContain(label);
    }
  });

  test("comparison section renders five comparison cards", () => {
    expect(html).toContain("At a Glance Comparison");
    const cards = html.match(/class="compare-card"/g) ?? [];
    expect(cards.length).toBe(5);
    expect(html).toContain("Magnesium Glycinate");
    expect(html).toContain("Magnesium L-Threonate");
    expect(html).toContain("Bio availability");
  });

  test("myth/fact, research, checklist, verdict, claim and trust blocks render", () => {
    expect(html).toContain('class="myth-card"');
    expect(html).toContain('class="fact-card"');
    expect(html).toContain("editorial-box research");
    expect(html).toContain("editorial-box checklist");
    expect(html).toContain("editorial-box verdict");
    expect(html).toContain('class="claim-card"');
    expect(html).toContain("score-row");
    expect(html).toContain("meter-chip");
    expect(html).toContain("check-item");
  });

  test("TOC anchor ids survive on special blocks (leaf-owned ids preserved)", () => {
    expect(html).toContain('id="at-a-glance-comparison"');
    expect(html).toContain('id="tafat-verdict"');
    expect(html).toContain('id="tafat-verdict-2"');
    expect(html).toContain('id="the-tafat-trust-score"');
    expect(html).toContain('id="myth-or-fact"');
  });

  test("hero illustration is accessible and both manuscript images remain", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain("magnesium-hero-title");
    expect(html).toContain("Hand-drawn illustration of magnesium crystals");
    expect(html).toContain("article-hero-art");
    expect(html).toContain("/magnesium-mineral.jpg");
    expect(html).toContain("/rId9.jpg");
    // Every illustration is decorative inside cards; the hero carries a label.
    expect(html).not.toContain('aria-hidden="true"><title');
  });
});

describe("homepage and category surfaces keep their editorial anchors", () => {
  test("homepage still contains the browse section and illustrated card hooks", () => {
    const index = readFileSync(join(ROUTE, "src/routes/index.tsx"), "utf8");
    expect(index).toContain("category-browse");
    expect(index).toContain("browse-categories");
    expect(index).toContain("product-art");
    expect(index).toContain("DigitalIllustration");
    expect(index).toContain("HealthIllustration");
  });

  test("health-wellness page uses illustrated topic cards and keeps its canonical", () => {
    const health = readFileSync(join(ROUTE, "src/routes/health-wellness.tsx"), "utf8");
    expect(health).toContain("topic-card");
    expect(health).toContain("topic-ill");
    expect(health).toContain("featured-guide-art");
    expect(health).toContain('CATEGORY_CANONICAL = "https://tafat.co.uk/health-wellness"');
    expect(health).toContain('rel: "canonical", href: CATEGORY_CANONICAL');
    expect(health).toContain('GUIDE_URL = "/health-wellness/the-complete-guide-to-magnesium"');
    expect(health).toContain("href={GUIDE_URL}");
  });
});
