import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CLOSING_QUOTE,
  HERO_ACTIONS,
  HERO_SUBHEADINGS,
  HOME_HEADLINE_PARTS,
  PHILOSOPHY_LINES,
  PHILOSOPHY_PRINCIPLES,
  PHILOSOPHY_SECTION_ID,
  PHILOSOPHY_TITLE,
  STANDARD_ITEMS,
  STANDARD_STATEMENT,
  STANDARD_TITLE,
} from "./home-content";

const INDEX = readFileSync(join(process.cwd(), "src/routes/index.tsx"), "utf8");

describe("Homepage editorial philosophy copy", () => {
  test("headline is exactly 'Less noise. More signal.'", () => {
    expect(HOME_HEADLINE_PARTS).toEqual(["Less noise.", "More signal."]);
  });

  test("hero subheadings are the exact supplied paragraphs", () => {
    expect(HERO_SUBHEADINGS).toEqual([
      "Every recommendation begins with research, not commission.",
      "We compare evidence, ingredients, value, transparency, and practical usefulness before we recommend anything. If we cannot confidently recommend a product, we simply won't.",
      "Our goal is not to help you buy more. It is to help you buy wisely.",
    ]);
  });

  test("hero buttons have the exact labels and meaningful hrefs", () => {
    expect(HERO_ACTIONS).toEqual([
      { label: "Explore Evidence Guides", href: "/health-wellness/the-complete-guide-to-magnesium" },
      { label: "How We Review Products", href: "#how-we-review" },
    ]);
  });

  test("philosophy section title and lines are exact", () => {
    expect(PHILOSOPHY_TITLE).toBe("Why TAFAT Exists");
    expect(PHILOSOPHY_LINES).toEqual([
      'The internet is full of lists claiming everything is "the best."',
      "Too often, products are recommended because they pay well rather than because they deserve to be recommended.",
      "TAFAT was created to be different.",
      "Every guide begins with evidence.",
      "Every review follows the same evaluation process.",
      "Every recommendation is made with the reader's interests first.",
      "We believe trust is earned one article at a time.",
    ]);
    // The numbered principles list must be exactly the three "Every…" lines
    // (indices 3–5), and the trust close (index 6) must render only once, as
    // the emphasized closing line — guards against off-by-one drift.
    expect(PHILOSOPHY_PRINCIPLES).toEqual([3, 4, 5]);
    for (const idx of PHILOSOPHY_PRINCIPLES) {
      expect(PHILOSOPHY_LINES[idx].startsWith("Every ")).toBe(true);
    }
    expect(PHILOSOPHY_LINES[6]).toBe("We believe trust is earned one article at a time.");
  });

  test("editorial standard grid has exactly the seven supplied items", () => {
    expect(STANDARD_TITLE).toBe("Editorial Standard");
    expect(STANDARD_ITEMS).toEqual([
      "Scientific evidence",
      "Ingredient quality",
      "Transparency",
      "Value for money",
      "Practical usefulness",
      "Safety considerations",
      "Independent comparison with alternatives",
    ]);
  });

  test("statement and closing quote are exact", () => {
    expect(STANDARD_STATEMENT).toBe(
      "When the evidence is strong, we will say so. When the evidence is limited, we will say that too. When we cannot confidently recommend a product, we won't."
    );
    expect(CLOSING_QUOTE).toBe(
      "We hope TAFAT becomes the last website you need to visit before making an informed purchase."
    );
  });

  test("homepage renders the philosophy section id the buttons link to (no dead anchor)", () => {
    expect(PHILOSOPHY_SECTION_ID).toBe("how-we-review");
    expect(INDEX).toContain('id={PHILOSOPHY_SECTION_ID}');
    expect(INDEX).toContain('href={`#${PHILOSOPHY_SECTION_ID}`}');
    expect(INDEX).toContain("className=\"hero-actions\"");
    expect(INDEX).toContain("className=\"standard-grid\"");
    expect(INDEX).toContain("className=\"closing-quote\"");
    // Navigation on other routes must still resolve to the philosophy anchor.
    const health = readFileSync(join(process.cwd(), "src/routes/health-wellness.tsx"), "utf8");
    const guide = readFileSync(join(process.cwd(), "src/routes/health-wellness.the-complete-guide-to-magnesium.tsx"), "utf8");
    expect(health).toContain('href="/#how-we-review"');
    expect(guide).toContain('href="/#how-we-review"');
    expect(health).not.toContain('href="/#about"');
    expect(guide).not.toContain('href="/#about"');
  });

  test("homepage canonical and search/catalog/consent surface are preserved", () => {
    expect(INDEX).toContain('rel: "canonical", href: "https://tafat.co.uk/"');
    expect(INDEX).toContain("search-box");
    expect(INDEX).toContain("product-grid");
    expect(INDEX).toContain("<ConsentBanner />");
    expect(INDEX).toContain("affiliate-note");
    expect(INDEX).toContain("stay-in-loop");
    expect(INDEX).toContain('href="/privacy"');
    expect(INDEX).toContain('href="/terms"');
  });
});
