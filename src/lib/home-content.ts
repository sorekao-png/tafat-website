/**
 * Homepage editorial content.
 *
 * The copy in this file is the owner-supplied editorial philosophy for the TAFAT
 * homepage. `home-content.test.ts` guards the exact strings, button labels and
 * hrefs so a future edit cannot silently drift from the supplied wording.
 */

export const HOME_HEADLINE_PARTS = ["Less noise.", "More signal."];

export const HERO_SUBHEADINGS = [
  "Every recommendation begins with research, not commission.",
  "We compare evidence, ingredients, value, transparency, and practical usefulness before we recommend anything. If we cannot confidently recommend a product, we simply won't.",
  "Our goal is not to help you buy more. It is to help you buy wisely.",
] as const;

export const HERO_ACTIONS = [
  { label: "Explore Evidence Guides", href: "/health-wellness/the-complete-guide-to-magnesium" },
  { label: "How We Review Products", href: "#how-we-review" },
] as const;

/** Anchor of the philosophy section; the "How We Review Products" button must
 *  resolve to an element with this id on the homepage (guarded by test). */
export const PHILOSOPHY_SECTION_ID = "how-we-review";

export const PHILOSOPHY_EYEBROW = "Our philosophy";

export const PHILOSOPHY_TITLE = "Why TAFAT Exists";

export const PHILOSOPHY_LINES = [
  "The internet is full of lists claiming everything is \"the best.\"",
  "Too often, products are recommended because they pay well rather than because they deserve to be recommended.",
  "TAFAT was created to be different.",
  "Every guide begins with evidence.",
  "Every review follows the same evaluation process.",
  "Every recommendation is made with the reader's interests first.",
  "We believe trust is earned one article at a time.",
] as const;

/** Lines 3–5 are rendered as the numbered "principles" list on the homepage;
 *  the pivot (2) and the trust close (6) are rendered as emphasized text. */
export const PHILOSOPHY_PRINCIPLES = [3, 4, 5] as const;

export const STANDARD_TITLE = "Editorial Standard";

export const STANDARD_ITEMS = [
  "Scientific evidence",
  "Ingredient quality",
  "Transparency",
  "Value for money",
  "Practical usefulness",
  "Safety considerations",
  "Independent comparison with alternatives",
] as const;

export const STANDARD_STATEMENT =
  "When the evidence is strong, we will say so. When the evidence is limited, we will say that too. When we cannot confidently recommend a product, we won't.";

export const CLOSING_QUOTE =
  "We hope TAFAT becomes the last website you need to visit before making an informed purchase.";
