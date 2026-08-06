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
  "Before anything earns a place on TAFAT, it must survive the same process: research first, recommendation second. This is the standard every guide and every find is held to.";

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

/**
 * The six principles, in the exact supplied order. The names are supplied
 * copy; the explanatory text is the editorial standard each find is held to.
 */
export const EDITORIAL_PRINCIPLES: readonly EditorialPrinciple[] = [
  {
    name: "Evidence First",
    copy: "Every guide begins with evidence. We read the research, check the sources, and report what it actually shows — including when the evidence is limited.",
    art: "flask",
  },
  {
    name: "Transparency",
    copy: "We say how we evaluated a product, what we looked for, and how we are compensated. If we cannot explain a recommendation, it does not get published.",
    art: "eye",
  },
  {
    name: "Quality Over Hype",
    copy: "When a claim is louder than the evidence behind it, we slow down. Strong claims without strong support do not earn a place on TAFAT.",
    art: "star",
  },
  {
    name: "Value Matters",
    copy: "A recommendation is only worth making if it is worth what it costs. We weigh price against evidence, quality, and practical usefulness.",
    art: "tag",
  },
  {
    name: "Independent Evaluation",
    copy: "We compare every product against the alternatives before we recommend it, and we are never paid to rank anything first.",
    art: "scale",
  },
  {
    name: "Continuous Review",
    copy: "Evidence changes, and so do products. We revisit our guides and reviews so recommendations stay current and honest.",
    art: "review",
  },
] as const;

/** Important note block — label and copy. */
export const IMPORTANT_NOTE_TITLE = "Important Note";
export const IMPORTANT_NOTE_COPY =
  "TAFAT is reader-supported. When you buy through links on this site, we may earn an affiliate commission at no additional cost to you. That never changes what we evaluate or what we recommend — the evidence and your interests come first.";

/** Our Promise block — the promise copy is the exact supplied sentence. */
export const OUR_PROMISE_TITLE = "Our Promise";
export const OUR_PROMISE_COPY =
  "Our loyalty is to the evidence and to our readers, not to any brand, manufacturer, or affiliate programme.";

/** Small footer beneath the section. */
export const INTEGRITY_TITLE = "Editorial Integrity";
export const INTEGRITY_DISCLOSURE =
  "TAFAT may earn a commission from qualifying purchases made through links on this site, at no additional cost to you.";
/** The exact final sentence of the section footer. */
export const INTEGRITY_LOYALTY =
  "Our loyalty is to the evidence and to our readers, not to any brand, manufacturer, or affiliate programme.";

/** Learn More button label and destination. */
export const LEARN_MORE_LABEL = "Learn More";
export const EDITORIAL_STANDARDS_PATH = "/editorial-standards";
