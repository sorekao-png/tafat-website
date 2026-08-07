import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Route as HomeRoute } from "../routes/index";
import { Route as PrivacyRoute } from "../routes/privacy";
import { Route as TermsRoute } from "../routes/terms";
import { Route as HealthWellnessRoute } from "../routes/health-wellness";
import { Route as MagnesiumGuideRoute } from "../routes/health-wellness.the-complete-guide-to-magnesium";
import { Route as VitaminDGuideRoute } from "../routes/health-wellness.vitamin-d-guide";
import { Route as ArtCreativeStudioRoute } from "../routes/art-creative-studio";
import { Route as EditorialStandardsRoute } from "../routes/editorial-standards";
const ROOT = process.cwd();
const SITE = "https://tafat.co.uk";
function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

type Head = {
  meta?: { name?: string; property?: string; content?: string }[];
  links?: { rel?: string; href?: string }[];
  scripts?: { type?: string; children?: string }[];
};

function headOf(route: unknown, routeIds: string[]): Promise<Head> {
  const options = (route as { options?: { head?: (ctx: unknown) => Head } }).options;
  if (!options?.head) throw new Error("route has no head option");
  return Promise.resolve(options.head({ matches: routeIds.map((routeId) => ({ routeId })) }));
}

function canonicalHrefs(head: Head): string[] {
  return (head.links ?? [])
    .filter((l) => l.rel === "canonical")
    .map((l) => l.href ?? "");
}

function ldScripts(head: Head): string[] {
  return (head.scripts ?? [])
    .filter((s) => s.type === "application/ld+json")
    .map((s) => s.children ?? "");
}

function ldJson(head: Head): unknown[] {
  return ldScripts(head).map((children) => JSON.parse(children));
}

/** Collect "@type"+"@id" definitions (objects with BOTH keys) recursively. */
function identityDefinitions(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const n of node) identityDefinitions(n, out);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj["@type"] === "string" && typeof obj["@id"] === "string") {
      out.push(`${obj["@type"]} ${obj["@id"]}`);
    }
    for (const v of Object.values(obj)) identityDefinitions(v, out);
  }
}

/** Count "@type" occurrences recursively (definitions AND references). */
function countType(node: unknown, type: string): number {
  if (Array.isArray(node)) {
    return node.reduce((sum, n) => sum + countType(n, type), 0);
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    let count = obj["@type"] === type ? 1 : 0;
    for (const v of Object.values(obj)) count += countType(v, type);
    return count;
  }
  return 0;
}

/** Collect every "@type" string recursively (top-level, @graph and nested nodes). */
function collectTypes(nodes: unknown[]): string[] {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const n of node) walk(n);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (typeof obj["@type"] === "string") out.push(obj["@type"]);
      for (const v of Object.values(obj)) walk(v);
    }
  };
  walk(nodes);
  return out;
}

// All public routes with their full match chain (root -> parent -> leaf).
const ALL_ROUTES: { name: string; Route: unknown; matches: string[]; path: string }[] = [
  { name: "home", Route: HomeRoute, matches: ["__root", "/"], path: "/" },
  { name: "privacy", Route: PrivacyRoute, matches: ["__root", "/privacy"], path: "/privacy" },
  { name: "terms", Route: TermsRoute, matches: ["__root", "/terms"], path: "/terms" },
  { name: "health-wellness", Route: HealthWellnessRoute, matches: ["__root", "/health-wellness"], path: "/health-wellness" },
  {
    name: "magnesium guide",
    Route: MagnesiumGuideRoute,
    matches: ["__root", "/health-wellness", "/health-wellness/the-complete-guide-to-magnesium"],
    path: "/health-wellness/the-complete-guide-to-magnesium",
  },
  {
    name: "vitamin d guide",
    Route: VitaminDGuideRoute,
    matches: ["__root", "/health-wellness", "/health-wellness/vitamin-d-guide"],
    path: "/health-wellness/vitamin-d-guide",
  },
  { name: "editorial standards", Route: EditorialStandardsRoute, matches: ["__root", "/editorial-standards"], path: "/editorial-standards" },
  { name: "art creative studio", Route: ArtCreativeStudioRoute, matches: ["__root", "/art-creative-studio"], path: "/art-creative-studio" },
];

describe("SEO production host guard", () => {
  test("sitemap.xml contains the expected tafat.co.uk locs in order", () => {
    const xml = read("public/sitemap.xml");
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      `${SITE}/`,
      `${SITE}/privacy`,
      `${SITE}/terms`,
      `${SITE}/health-wellness`,
      `${SITE}/health-wellness/the-complete-guide-to-magnesium`,
      `${SITE}/editorial-standards`,
      `${SITE}/health-wellness/vitamin-d-guide`,
      `${SITE}/art-creative-studio`,
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
    const vitaminD = read("src/routes/health-wellness.vitamin-d-guide.tsx");
    const art = read("src/routes/art-creative-studio.tsx");
    const all = [root, privacy, terms, health, guide, standards, vitaminD, art].join("\n");
    expect(all).toContain(`"https://tafat.co.uk/"`);
    expect(all).toContain(`"https://tafat.co.uk/privacy"`);
    expect(all).toContain(`"https://tafat.co.uk/terms"`);
    expect(all).toContain(`"https://tafat.co.uk/health-wellness"`);
    expect(all).toContain(`"https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium"`);
    expect(all).toContain(`"https://tafat.co.uk/editorial-standards"`);
    expect(all).toContain("https://tafat.co.uk/health-wellness/vitamin-d-guide");
    expect(all).toContain("https://tafat.co.uk/art-creative-studio");
    expect(all).not.toMatch(/ctonew\.app/);
    expect(all).not.toMatch(/cto\.new/);
  });
  test("magnesium guide emits Article, BreadcrumbList and FAQPage JSON-LD", () => {
    // The typed builders live in src/lib/seo.ts; the guide route composes them.
    const builders = read("src/lib/seo.ts");
    const guide = read("src/routes/health-wellness.the-complete-guide-to-magnesium.tsx");
    const source = [builders, guide].join("\n");
    expect(source).toMatch(/\"@type\"\s*:\s*\"Article\"/);
    expect(source).toMatch(/\"@type\"\s*:\s*\"BreadcrumbList\"/);
    expect(source).toMatch(/\"@type\"\s*:\s*\"FAQPage\"/);
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
  const VITAMIN_D = "/health-wellness/vitamin-d-guide";

  test("root route no longer emits a site-wide canonical (layout route, not a page)", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).not.toContain("canonical");
    // Root scripts would concatenate onto every matched page; the sitewide
    // WebSite JSON-LD was removed so the homepage owns the single identity.
    expect(root).not.toContain("ld+json");
  });
  test("home route owns the canonical for /", () => {
    const home = read("src/routes/index.tsx");
    expect(home).toContain('rel: "canonical", href: "https://tafat.co.uk/"');
  });
  test("category route emits its canonical only when it is the deepest match", async () => {
    const leafHead = (await headOf(HealthWellnessRoute, ["__root", CATEGORY])) as Head;
    expect(canonicalHrefs(leafHead)).toEqual(["https://tafat.co.uk/health-wellness"]);
    expect(leafHead.meta?.some((m) => m.title)).toBe(true);
    expect(ldScripts(leafHead)[0]).toContain('"@type":"CollectionPage"');
    // When either guide child is matched, the category route must emit NO page head:
    // no second canonical, no category meta, no CollectionPage JSON-LD.
    for (const child of [GUIDE, VITAMIN_D]) {
      const childHead = (await headOf(HealthWellnessRoute, ["__root", CATEGORY, child])) as Head;
      expect(childHead.links ?? []).toEqual([]);
      expect(childHead.meta ?? []).toEqual([]);
      expect(childHead.scripts ?? []).toEqual([]);
    }
  });
  test("magnesium guide route emits exactly its own canonical plus Article/Breadcrumb/FAQ JSON-LD", async () => {
    const head = (await headOf(MagnesiumGuideRoute, ["__root", CATEGORY, GUIDE])) as Head;
    expect(canonicalHrefs(head)).toEqual(["https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium"]);
    const ld = ldScripts(head).join("\n");
    expect(ld).toContain('"@type":"Article"');
    expect(ld).toContain('"@type":"BreadcrumbList"');
    expect(ld).toContain('"@type":"FAQPage"');
    expect(ld).not.toContain('"@type":"CollectionPage"');
  });
  test("Art & Creative Studio route emits exactly one canonical and CollectionPage/BreadcrumbList JSON-LD", async () => {
    const head = (await headOf(ArtCreativeStudioRoute, ["__root", "/art-creative-studio"])) as Head;
    expect(canonicalHrefs(head)).toEqual(["https://tafat.co.uk/art-creative-studio"]);
    const ld = ldScripts(head).join("\n");
    expect(ld).toContain('"@type":"CollectionPage"');
    expect(ld).toContain('"@type":"BreadcrumbList"');
    expect(ld).not.toContain("ctonew.app");
  });
  test("editorial-standards route emits exactly its own canonical plus truthful WebPage and BreadcrumbList JSON-LD", async () => {
    const head = (await headOf(EditorialStandardsRoute, ["__root", "/editorial-standards"])) as Head;
    expect(canonicalHrefs(head)).toEqual(["https://tafat.co.uk/editorial-standards"]);
    expect(head.meta?.some((m) => m.title === "The TAFAT Editorial Standard | TAFAT")).toBe(true);
    const ld = ldScripts(head).join("\n");
    expect(ld).toContain('"@type":"WebPage"');
    expect(ld).toContain('"@type":"BreadcrumbList"');
    expect(ld).not.toContain('"@type":"Article"');
    expect(ld).not.toContain("datePublished");
  });
});

describe("every route: exactly one canonical, production host only, og:url = canonical", () => {
  for (const route of ALL_ROUTES) {
    test(`${route.name} (${route.path})`, async () => {
      const head = await headOf(route.Route, route.matches);
      expect(canonicalHrefs(head)).toEqual([`${SITE}${route.path}`]);
      const ogUrl = head.meta?.find((m) => m.property === "og:url");
      expect(ogUrl?.content).toBe(`${SITE}${route.path}`);
      const serialized = JSON.stringify(head);
      expect(serialized).not.toMatch(/ctonew\.app/);
      expect(serialized).not.toMatch(/cto\.new/);
      expect(serialized).not.toContain("466c73967ef3825450db11330538b29c");
    });
  }
});

describe("every route: JSON-LD parses, expected types, single identity, no Product/Review", () => {
  const EXPECTED: { path: string; types: string[]; notTypes: string[] }[] = [
    { path: "/", types: ["WebSite", "Organization"], notTypes: ["Article", "CollectionPage", "WebPage"] },
    { path: "/privacy", types: [], notTypes: ["WebSite", "Article", "CollectionPage", "WebPage", "Product", "Review"] },
    { path: "/terms", types: [], notTypes: ["WebSite", "Article", "CollectionPage", "WebPage", "Product", "Review"] },
    { path: "/health-wellness", types: ["CollectionPage", "BreadcrumbList"], notTypes: ["Article", "Product", "Review"] },
    {
      path: "/health-wellness/the-complete-guide-to-magnesium",
      types: ["Article", "BreadcrumbList", "FAQPage"],
      notTypes: ["CollectionPage", "Product", "Review"],
    },
    {
      path: "/health-wellness/vitamin-d-guide",
      types: ["Article", "BreadcrumbList", "FAQPage"],
      notTypes: ["CollectionPage", "Product", "Review"],
    },
    { path: "/editorial-standards", types: ["WebPage", "BreadcrumbList"], notTypes: ["Article", "Product", "Review"] },
    { path: "/art-creative-studio", types: ["CollectionPage", "BreadcrumbList"], notTypes: ["Article", "Product", "Review"] },
  ];
  for (const page of EXPECTED) {
    test(`${page.path}`, async () => {
      const route = ALL_ROUTES.find((r) => r.path === page.path)!;
      const head = await headOf(route.Route, route.matches);
      const lds = ldJson(head);
      // Every JSON-LD block must parse and be an object (ldJson already parsed).
      expect(lds.length).toBe(ldScripts(head).length);
      // No Product or Review markup anywhere on the site.
      for (const ld of lds) {
        expect(countType(ld, "Product")).toBe(0);
        expect(countType(ld, "Review")).toBe(0);
      }
      const types = collectTypes(lds);

      for (const t of page.types) expect(types).toContain(t);
      for (const t of page.notTypes) expect(types).not.toContain(t);
      // Single identity: no duplicate @type+@id definitions on a page, and the
      // WebSite node is defined only on the homepage.
      const ids: string[] = [];
      for (const ld of lds) identityDefinitions(ld, ids);
      const seen = new Map<string, number>();
      for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
      for (const [id, count] of seen) {
        expect(count, `duplicate identity definition on ${page.path}: ${id}`).toBe(1);
      }
      const websiteDefs = lds.reduce((sum, ld) => sum + countType(ld, "WebSite"), 0);
      expect(websiteDefs, `WebSite objects on ${page.path}`).toBe(page.path === "/" ? 1 : 0);
      const orgDefs = lds.reduce((sum, ld) => sum + countType(ld, "Organization"), 0);
      expect(orgDefs, `Organization objects on ${page.path}`).toBe(page.path === "/" ? 1 : 0);
      // No preview host inside any JSON-LD block.
      expect(ldScripts(head).join("\n")).not.toMatch(/ctonew\.app/);
      expect(ldScripts(head).join("\n")).not.toMatch(/cto\.new/);
    });
  }
});

describe("vitamin d guide structured data", () => {
  const MATCHES = ["__root", "/health-wellness", "/health-wellness/vitamin-d-guide"];

  test("og:type article, twitter summary_large_image, corrected absolute og:image", async () => {
    const head = await headOf(VitaminDGuideRoute, MATCHES);
    const meta = head.meta ?? [];
    expect(meta.find((m) => m.property === "og:type")?.content).toBe("article");
    expect(meta.find((m) => m.name === "twitter:card")?.content).toBe("summary_large_image");
    expect(meta.find((m) => m.property === "og:image")?.content).toBe("https://tafat.co.uk/vitamin-d/01_Journey_of_Vitamin_D.png");
    expect(meta.find((m) => m.property === "og:url")?.content).toBe("https://tafat.co.uk/health-wellness/vitamin-d-guide");
    const ld = ldScripts(head).join("\n");
    // The old broken og:image/Article image URL was
    // .../health-wellness/vitamin-d-guide/vitamin-d/01_...png — it must be gone.
    expect(ld).not.toContain("/health-wellness/vitamin-d-guide/vitamin-d/");
    expect(ld).toContain("https://tafat.co.uk/vitamin-d/01_Journey_of_Vitamin_D.png");
    expect(ld).toContain('"@type":"Article"');
    expect(ld).toContain('"@type":"FAQPage"');
    // Article publisher/author reference the single Organization @id; no
    // dateModified is claimed because no "last reviewed" date is visible.
    expect(ld).toContain('"publisher":{"@id":"https://tafat.co.uk/#organization"}');
    expect(ld).not.toContain("dateModified");
  });

  test("breadcrumb mirrors the visible hierarchy: Home -> Health & Wellness -> Vitamin D Guide", async () => {
    const head = await headOf(VitaminDGuideRoute, MATCHES);
    const crumb = ldJson(head).find((ld) => (ld as Record<string, unknown>)["@type"] === "BreadcrumbList") as {
      itemListElement: { position: number; name: string; item: string }[];
    };
    expect(crumb.itemListElement.map((i) => i.name)).toEqual(["Home", "Health & Wellness", "Vitamin D Guide"]);
    expect(crumb.itemListElement[0].item).toBe("https://tafat.co.uk/");
    expect(crumb.itemListElement[1].item).toBe("https://tafat.co.uk/health-wellness");
    expect(crumb.itemListElement[2].item).toBe("https://tafat.co.uk/health-wellness/vitamin-d-guide");
  });

  test("FAQPage derives only from visibly rendered Q&A pairs in the manuscript", async () => {
    const json = JSON.parse(read("src/lib/vitamin-d-content.json")) as { text: string; style: string }[];
    const start = json.findIndex((x) => x.text === "Frequently Asked Questions");
    const end = json.findIndex((x, i) => i > start && x.style.startsWith("Heading3"));
    const block = json.slice(start + 1, end);
    const visible = block.filter(
      (x, i) => x.style.startsWith("Heading4") && x.text.trim().endsWith("?") && block[i + 1] && !block[i + 1].style.startsWith("Heading"),
    );
    expect(visible.length).toBeGreaterThanOrEqual(7);
    const head = await headOf(VitaminDGuideRoute, MATCHES);
    const faqLd = ldJson(head).find((ld) => (ld as Record<string, unknown>)["@type"] === "FAQPage") as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(faqLd.mainEntity.length).toBe(visible.length);
    expect(faqLd.mainEntity[0].name).toBe(visible[0].text);
    expect(faqLd.mainEntity[0].acceptedAnswer.text).toBe(visible[0] ? (block[block.indexOf(visible[0]) + 1] as { text: string }).text : "");
  });
});

describe("privacy and terms own their social metadata", () => {
  test("og:url points at each page's own canonical", async () => {
    for (const [Route, path] of [
      [PrivacyRoute, "/privacy"],
      [TermsRoute, "/terms"],
    ] as const) {
      const head = await headOf(Route, ["__root", path]);
      expect(canonicalHrefs(head)).toEqual([`${SITE}${path}`]);
      expect(head.meta?.find((m) => m.property === "og:url")?.content).toBe(`${SITE}${path}`);
      expect(head.meta?.find((m) => m.property === "og:type")?.content).toBe("website");
      expect(head.meta?.find((m) => m.name === "twitter:card")?.content).toBe("summary");
    }
  });
});
