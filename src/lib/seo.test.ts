import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Route as HealthWellnessRoute } from "../routes/health-wellness";
import { Route as MagnesiumGuideRoute } from "../routes/health-wellness.the-complete-guide-to-magnesium";

const ROOT = process.cwd();
const SITE = "https://tafat.co.uk";

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("SEO production host guard", () => {
  test("sitemap.xml contains the six expected tafat.co.uk locs in order", () => {
    const xml = read("public/sitemap.xml");
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      `${SITE}/`,
      `${SITE}/privacy`,
      `${SITE}/terms`,
      `${SITE}/health-wellness`,
      `${SITE}/health-wellness/the-complete-guide-to-magnesium`,
      `${SITE}/editorial-standards`,
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
    const standards = read("src/routes/editorial-standards.tsx");
    const all = [root, privacy, terms, health, guide, standards].join("\n");
    expect(all).toContain(`"https://tafat.co.uk/"`);
    expect(all).toContain(`"https://tafat.co.uk/privacy"`);
    expect(all).toContain(`"https://tafat.co.uk/terms"`);
    expect(all).toContain(`"https://tafat.co.uk/health-wellness"`);
    expect(all).toContain(`"https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium"`);
    expect(all).toContain(`"https://tafat.co.uk/editorial-standards"`);
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

describe("route-level head strategy (deepest matched route owns the page head)", () => {
  const CATEGORY = "/health-wellness";
  const GUIDE = "/health-wellness/the-complete-guide-to-magnesium";

  function headOf(route: unknown, routeIds: string[]) {
    const options = (route as { options: { head?: (ctx: unknown) => unknown } }).options;
    if (!options.head) throw new Error("route has no head option");
    return Promise.resolve(options.head({ matches: routeIds.map((routeId) => ({ routeId })) }));
  }
  function canonicalHrefs(head: any): string[] {
    return (head.links ?? [])
      .filter((l: { rel?: string }) => l.rel === "canonical")
      .map((l: { href?: string }) => l.href);
  }

  test("root route no longer emits a site-wide canonical (layout route, not a page)", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).not.toContain("canonical");
  });

  test("home route owns the canonical for /", () => {
    const home = read("src/routes/index.tsx");
    expect(home).toContain('rel: "canonical", href: "https://tafat.co.uk/"');
  });

  test("category route emits its canonical only when it is the deepest match", async () => {
    const leafHead = (await headOf(HealthWellnessRoute, ["__root", CATEGORY])) as any;
    expect(canonicalHrefs(leafHead)).toEqual(["https://tafat.co.uk/health-wellness"]);
    expect(leafHead.meta.some((m: { title?: string }) => m.title)).toBe(true);
    expect((leafHead.scripts ?? [])[0].children).toContain('"@type":"CollectionPage"');

    // When the guide child is matched, the category route must emit NO page head:
    // no second canonical, no category meta, no CollectionPage JSON-LD.
    const childHead = (await headOf(HealthWellnessRoute, ["__root", CATEGORY, GUIDE])) as any;
    expect(childHead.links ?? []).toEqual([]);
    expect(childHead.meta ?? []).toEqual([]);
    expect(childHead.scripts ?? []).toEqual([]);
  });

  test("guide route emits exactly its own canonical plus Article/Breadcrumb/FAQ JSON-LD", async () => {
    const head = (await headOf(MagnesiumGuideRoute, ["__root", CATEGORY, GUIDE])) as any;
    expect(canonicalHrefs(head)).toEqual([
      "https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium",
    ]);
    const ld = (head.scripts ?? []).map((s: { children: string }) => s.children).join("\n");
    expect(ld).toContain('"@type":"Article"');
    expect(ld).toContain('"@type":"BreadcrumbList"');
    expect(ld).toContain('"@type":"FAQPage"');
    expect(ld).not.toContain('"@type":"CollectionPage"');
  });

  test("editorial-standards route emits exactly its own canonical plus truthful WebPage and BreadcrumbList JSON-LD", async () => {
    const { Route: StandardsRoute } = await import("../routes/editorial-standards");
    const head = (await headOf(StandardsRoute, ["__root", "/editorial-standards"])) as any;
    expect(canonicalHrefs(head)).toEqual(["https://tafat.co.uk/editorial-standards"]);
    expect(head.meta.some((m: { title?: string }) => m.title === "The TAFAT Editorial Standard | TAFAT")).toBe(true);
    const ld = (head.scripts ?? []).map((s: { children: string }) => s.children).join("\n");
    expect(ld).toContain('"@type":"WebPage"');
    expect(ld).toContain('"@type":"BreadcrumbList"');
    expect(ld).not.toContain('"@type":"Article"');
    expect(ld).not.toContain('datePublished');
  });
});
