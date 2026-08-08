import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EDITORIAL_INTRO,
  EDITORIAL_PRINCIPLES,
  EDITORIAL_SECTION_ID,
  EDITORIAL_STANDARDS_PATH,
  EDITORIAL_SUBTITLE,
  EDITORIAL_TITLE,
  IMPORTANT_NOTE_COPY,
  IMPORTANT_NOTE_TITLE,
  INTEGRITY_DISCLOSURE,
  INTEGRITY_LOYALTY,
  INTEGRITY_TITLE,
  LEARN_MORE_LABEL,
  OUR_PROMISE_COPY,
  OUR_PROMISE_TITLE,
  PRINCIPLES_TITLE,
} from "./editorial-standard";
import { principleIconByKey } from "./illustrations";

const INDEX = readFileSync(join(process.cwd(), "src/routes/index.tsx"), "utf8");
const PAGE = readFileSync(join(process.cwd(), "src/routes/editorial-standards.tsx"), "utf8");
const CSS = readFileSync(join(process.cwd(), "src/styles/app.css"), "utf8");

describe("Premium editorial standard copy", () => {
  test("section heading and subheading are the exact supplied strings", () => {
    expect(EDITORIAL_TITLE).toBe("The TAFAT Editorial Standard");
    expect(EDITORIAL_SUBTITLE).toBe("Clarity before you buy.");
  });

  test("principles are exactly the six supplied names, in order", () => {
    expect(EDITORIAL_PRINCIPLES.map((p) => p.name)).toEqual([
      "Evidence First",
      "Transparency",
      "Quality Over Hype",
      "Value Matters",
      "Independent Evaluation",
      "Continuous Review",
    ]);
  });

  test("every principle carries the exact owner-supplied copy and a resolvable icon", () => {
    expect(EDITORIAL_PRINCIPLES.map((p) => p.copy)).toEqual([
      "We begin with the best available evidence, not advertising claims or popularity.",
      "We explain how we reached our conclusions so readers can make informed decisions.",
      "We value thoughtful formulation, honest labelling, and practical usefulness over marketing promises.",
      "The most expensive product is not always the best.\n\nThe cheapest product is not always the best value.\n\nWe consider quality together with price.",
      "Recommendations are based on our published evaluation process.\n\nAffiliate partnerships never determine our conclusions.",
      "Science evolves.\n\nProducts change.\n\nFormulations improve.\n\nPrices change.\n\nWhen new evidence becomes available, we review our evaluations and update our recommendations when appropriate.",
    ]);
    expect(EDITORIAL_PRINCIPLES.length).toBe(6);
    for (const p of EDITORIAL_PRINCIPLES) expect(principleIconByKey[p.art]).toBeDefined();
  });

  test("intro and all supporting blocks use exact owner-supplied copy", () => {
    expect(EDITORIAL_INTRO).toBe(
      "At TAFAT, we believe every recommendation should be earned, not assumed. Our goal is not to tell you what to buy. Our goal is to help you understand why you might choose one option over another. Every article and product evaluation follows the same editorial process. We compare evidence, quality, transparency, value, and practical usefulness before making a recommendation. If we cannot confidently recommend a product based on our current evaluation, we simply won't."
    );
    expect(IMPORTANT_NOTE_COPY).toBe(
      "TAFAT does not claim that any recommendation is the only or universally best choice.\n\nOur evaluations reflect the information available at the time of publication together with our published editorial standards.\n\nDifferent products may suit different people, health conditions, budgets, and preferences.\n\nOur goal is to provide a clear, balanced starting point so readers can make informed decisions with confidence."
    );
    expect(OUR_PROMISE_COPY).toBe(
      "We hope TAFAT becomes the last website you need to visit before making an informed purchase.\n\nNot because we ask you to trust us.\n\nBecause we show you exactly how we reached our conclusions."
    );
    expect(INTEGRITY_DISCLOSURE).toBe(
      "We may earn a commission when you purchase through some links on this website.\n\nThis never changes our evaluation process, our recommendations, or our commitment to honest, evidence-based reviews."
    );
  });

  test("block labels, promise copy, disclosure and loyalty sentence are exact", () => {
    expect(PRINCIPLES_TITLE).toBe("Our Principles");
    expect(IMPORTANT_NOTE_TITLE).toBe("Important Note");
    expect(OUR_PROMISE_TITLE).toBe("Our Promise");
    expect(OUR_PROMISE_COPY).toBe(
      "We hope TAFAT becomes the last website you need to visit before making an informed purchase.\n\nNot because we ask you to trust us.\n\nBecause we show you exactly how we reached our conclusions."
    );
    expect(INTEGRITY_TITLE).toBe("Editorial Integrity");
    expect(INTEGRITY_DISCLOSURE).toBe(
      "We may earn a commission when you purchase through some links on this website.\n\nThis never changes our evaluation process, our recommendations, or our commitment to honest, evidence-based reviews."
    );
    expect(INTEGRITY_LOYALTY).toBe(
      "Our loyalty is to the evidence and to our readers, not to any brand, manufacturer, or affiliate programme."
    );
  });

  test("Learn More label and destination are exact", () => {
    expect(LEARN_MORE_LABEL).toBe("Learn More");
    expect(EDITORIAL_STANDARDS_PATH).toBe("/editorial-standards");
  });
});

describe("Homepage premium section", () => {
  test("section sits immediately below the hero and above the discover catalog", () => {
    const hero = INDEX.indexOf('className="hero hero-drip wrap"');
    const section = INDEX.indexOf(`id={EDITORIAL_SECTION_ID} className="editorial-standard"`);
    const discover = INDEX.indexOf('id="discover"');
    expect(hero).toBeGreaterThanOrEqual(0);
    expect(section).toBeGreaterThan(hero);
    expect(discover).toBeGreaterThan(section);
  });

  test("homepage renders the heading, subheading, principle cards, note, promise and integrity footer", () => {
    expect(INDEX).toContain("EDITORIAL_TITLE");
    expect(INDEX).toContain("EDITORIAL_SUBTITLE");
    expect(INDEX).toContain("PRINCIPLES_TITLE");
    expect(INDEX).toContain("className=\"principle-grid\"");
    expect(INDEX).toContain("className=\"principle-card\"");
    expect(INDEX).toContain("IMPORTANT_NOTE_TITLE");
    expect(INDEX).toContain("OUR_PROMISE_COPY");
    expect(INDEX).toContain("className=\"es-integrity\"");
    expect(INDEX).toContain("INTEGRITY_LOYALTY");
  });

  test("Learn More button links to the dedicated page; footer links it too", () => {
    expect(INDEX).toContain(`href={EDITORIAL_STANDARDS_PATH}`);
    expect(INDEX).toContain("LEARN_MORE_LABEL");
    expect(INDEX).toContain('href="/editorial-standards"');
  });
});

describe("Dedicated /editorial-standards page", () => {
  test("route file exists, owns its canonical, and has no preview host references", () => {
    expect(PAGE).toContain('const CANONICAL = "https://tafat.co.uk/editorial-standards"');
    expect(PAGE).toContain('links: [{ rel: "canonical", href: CANONICAL }]');
    expect(PAGE).not.toMatch(/ctonew\.app/);
    expect(PAGE).not.toMatch(/cto\.new/);
  });

  test("page presents the same complete standard content accessibly (h1 + all blocks)", () => {
    expect(PAGE).toContain("<h1");
    expect(PAGE).toContain("EDITORIAL_TITLE");
    expect(PAGE).toContain("EDITORIAL_SUBTITLE");
    expect(PAGE).toContain("PRINCIPLES_TITLE");
    expect(PAGE).toContain("className=\"principle-grid\"");
    expect(PAGE).toContain("IMPORTANT_NOTE_COPY");
    expect(PAGE).toContain("OUR_PROMISE_COPY");
    expect(PAGE).toContain("INTEGRITY_DISCLOSURE");
    expect(PAGE).toContain("INTEGRITY_LOYALTY");
    expect(PAGE).toContain('href="/"');
    expect(PAGE).toContain('href="/health-wellness/the-complete-guide-to-magnesium"');
  });
});

describe("Editorial standard styling", () => {
  test("premium section styles, responsive grid and reduced-motion safety exist", () => {
    expect(CSS).toContain(".editorial-standard");
    expect(CSS).toContain(".principle-grid");
    expect(CSS).toContain(".es-integrity");
    expect(CSS).toContain("@media (max-width: 860px)");
    expect(CSS).toContain("@media (max-width: 600px)");
    expect(CSS).toContain("@media (prefers-reduced-motion: reduce)");
    expect(CSS).toContain("prefers-reduced-motion: no-preference");
  });

  test("principle cards are part of the motion-safe transition set", () => {
    expect(CSS).toMatch(/\.product-card, \.category-card, \.topic-card, \.guide-card, \.standard-item, \.principle-card/);
  });
});
