import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = "https://tafat.co.uk";

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("SEO production host guard", () => {
  test("sitemap.xml contains the five expected tafat.co.uk locs in order", () => {
    const xml = read("public/sitemap.xml");
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      `${SITE}/`,
      `${SITE}/privacy`,
      `${SITE}/terms`,
      `${SITE}/health-wellness`,
      `${SITE}/health-wellness/the-complete-guide-to-magnesium`,
    ]);
  });

  test("sitemap.xml has no preview/canary host entries", () => {
    const xml = read("public/sitemap.xml");
    expect(xml).not.toMatch(/ctonew\.app/);
    expect(xml).not.toMatch(/cto\.new/);
    expect(xml).not.toContain("466c73967ef3825450db11330538b29c");
  });

  test("robots.txt Sitemap reference points at the production host", () => {
    const robots = read("public/robots.txt");
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(robots).not.toMatch(/ctonew\.app/);
    expect(robots).not.toMatch(/cto\.new/);
  });

  test("canonical SEO metadata in source routes uses the production host", () => {
    const root = read("src/routes/__root.tsx");
    const privacy = read("src/routes/privacy.tsx");
    const terms = read("src/routes/terms.tsx");
    const health = read("src/routes/health-wellness.tsx");
    const guide = read("src/routes/health-wellness.the-complete-guide-to-magnesium.tsx");
    const all = [root, privacy, terms, health, guide].join("\n");
    expect(all).toContain(`"https://tafat.co.uk/"`);
    expect(all).toContain(`"https://tafat.co.uk/privacy"`);
    expect(all).toContain(`"https://tafat.co.uk/terms"`);
    expect(all).toContain(`"https://tafat.co.uk/health-wellness"`);
    expect(all).toContain(`"https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium"`);
    expect(all).not.toMatch(/ctonew\.app/);
    expect(all).not.toMatch(/cto\.new/);
  });

  test("magnesium guide emits Article, BreadcrumbList and FAQPage JSON-LD", () => {
    const guide = read("src/routes/health-wellness.the-complete-guide-to-magnesium.tsx");
    expect(guide).toMatch(/"@type"\s*:\s*"Article"/);
    expect(guide).toMatch(/"@type"\s*:\s*"BreadcrumbList"/);
    expect(guide).toMatch(/"@type"\s*:\s*"FAQPage"/);
    // FAQ questions must be visibly answered in the manuscript content.
    const json = JSON.parse(read("src/lib/magnesium-content.json")) as { t: string; s: string }[];
    const start = json.findIndex((x) => x.t === "Honest Answers to the Questions People Ask Most");
    const end = json.findIndex((x, i) => i > start && (x.s.startsWith("Heading1") || x.s.startsWith("Heading2")));
    const block = json.slice(start + 1, end);
    const questions = block.filter((x, i) => x.s.startsWith("Heading3") && x.t.trim().endsWith("?") && block[i + 1] && !block[i + 1].s.startsWith("Heading"));
    expect(questions.length).toBeGreaterThanOrEqual(8);
  });
});
