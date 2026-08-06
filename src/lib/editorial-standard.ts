/**
 * Premium editorial standard content (homepage section + dedicated page).
 *
 * The strings in this file are the owner-supplied editorial copy for the
 * TAFAT Editorial Standard section and its dedicated page. `editorial-standard.test.ts`
 * guards the exact wording, the exact set and order of the six principles,
 * the Learn More route and the section placement so a future edit cannot
 * silently drift from the supplied copy.
 */

/** Anchor id of the premium section on the homepage (directly below the hero). */
export const EDITORIAL_SECTION_ID = "editorial-standard";

/** Section / page heading — exact supplied copy. */
export const EDITORIAL_TITLE = "The TAFAT Editorial Standard";

/** Subheading — exact supplied copy. */
export const EDITORIAL_SUBTITLE = "Clarity before you buy.";

/** Short editorial intro shown under the subheading. */
export const EDITORIAL_INTRO =
  "At TAFAT, we believe every recommendation should be earned, not assumed. Our goal is not to tell you what to buy. Our goal is to help you understand why you might choose one option over another. Every article and product evaluation follows the same editorial process. We compare evidence, quality, transparency, value, and practical usefulness before making a recommendation. If we cannot confidently recommend a product based on our current evaluation, we simply won't.";

/** Heading above the principle cards — exact supplied label. */
export const PRINCIPLES_TITLE = "Our Principles";

export type EditorialPrinciple = {
  /** Principle name — exact supplied copy. */
  name: string;
  /** Explanatory text for the principle. */
  copy: string;
  /** Key into `principleIconByKey` in illustrations.tsx. */
  art: string;
};

/** The six principles, in the exact supplied order and wording. */
export const EDITORIAL_PRINCIPLES: readonly EditorialPrinciple[] = [
  {
    name: "Evidence First",
    copy: "We begin with the best available evidence, not advertising claims or popularity.",
    art: "flask",
  },
  {
    name: "Transparency",
    copy: "We explain how we reached our conclusions so readers can make informed decisions.",
    art: "eye",
  },
  {
    name: "Quality Over Hype",
    copy: "We value thoughtful formulation, honest labelling, and practical usefulness over marketing promises.",
    art: "star",
  },
  {
    name: "Value Matters",
    copy: "The most expensive product is not always the best.\n\nThe cheapest product is not always the best value.\n\nWe consider quality together with price.",
    art: "tag",
  },
  {
    name: "Independent Evaluation",
    copy: "Recommendations are based on our published evaluation process.\n\nAffiliate partnerships never determine our conclusions.",
    art: "scale",
  },
  {
    name: "Continuous Review",
    copy: "Science evolves.\n\nProducts change.\n\nFormulations improve.\n\nPrices change.\n\nWhen new evidence becomes available, we review our evaluations and update our recommendations when appropriate.",
    art: "review",
  },
] as const;

/** Important note block — label and exact owner-supplied copy. */
export const IMPORTANT_NOTE_TITLE = "Important Note";
export const IMPORTANT_NOTE_COPY =
  "TAFAT does not claim that any recommendation is the only or universally best choice.\n\nOur evaluations reflect the information available at the time of publication together with our published editorial standards.\n\nDifferent products may suit different people, health conditions, budgets, and preferences.\n\nOur goal is to provide a clear, balanced starting point so readers can make informed decisions with confidence.";

/** Our Promise block — exact owner-supplied copy. */
export const OUR_PROMISE_TITLE = "Our Promise";
export const OUR_PROMISE_COPY =
  "We hope TAFAT becomes the last website you need to visit before making an informed purchase.\n\nNot because we ask you to trust us.\n\nBecause we show you exactly how we reached our conclusions.";

/** Small footer beneath the section. */
export const INTEGRITY_TITLE = "Editorial Integrity";
export const INTEGRITY_DISCLOSURE =
  "We may earn a commission when you purchase through some links on this website.\n\nThis never changes our evaluation process, our recommendations, or our commitment to honest, evidence-based reviews.";
/** The exact final sentence of the section footer. */
export const INTEGRITY_LOYALTY =
  "Our loyalty is to the evidence and to our readers, not to any brand, manufacturer, or affiliate programme.";

/** Learn More button label and destination. */
export const LEARN_MORE_LABEL = "Learn More";
export const EDITORIAL_STANDARDS_PATH = "/editorial-standards";
