/**
 * TAFAT lightweight structured-data checker.
 *
 * Offline by default: invokes every route's head function (same technique as
 * src/lib/seo.test.ts) and validates the canonical/og/JSON-LD invariants:
 *   - exactly one canonical link, on the production host, matching the path
 *   - og:url equals the canonical
 *   - every application/ld+json block parses and has no duplicate identity
 *     definitions, no Product/Review markup, and no preview-host URLs
 *   - expected @type per route (WebSite/Organization on /, CollectionPage on
 *     categories, Article + BreadcrumbList + FAQPage on guides, WebPage on
 *     editorial standards)
 *
 * Optional --live mode additionally fetches each published page from
 * https://tafat.co.uk and re-validates the rendered HTML. This script is a
 * manual QA tool — it is NOT part of the build, and the build never requires
 * network access.
 *
 * Run:      bun run scripts/check-structured-data.ts
 * Live:     bun run scripts/check-structured-data.ts --live
 */
import { Route as HomeRoute } from "../src/routes/index";
import { Route as PrivacyRoute } from "../src/routes/privacy";
import { Route as TermsRoute } from "../src/routes/terms";
import { Route as HealthWellnessRoute } from "../src/routes/health-wellness";
import { Route as MagnesiumGuideRoute } from "../src/routes/health-wellness.the-complete-guide-to-magnesium";
import { Route as VitaminDGuideRoute } from "../src/routes/health-wellness.vitamin-d-guide";
import { Route as ArtCreativeStudioRoute } from "../src/routes/art-creative-studio";
import { Route as EditorialStandardsRoute } from "../src/routes/editorial-standards";

const SITE = "https://tafat.co.uk";
const PREVIEW_HOST = /ctonew\.app|cto\.new/;

type Head = {
  meta?: { name?: string; property?: string; content?: string }[];
  links?: { rel?: string; href?: string }[];
  scripts?: { type?: string; children?: string }[];
};

type RouteDef = { name: string; route: unknown; matches: string[]; path: string; types: string[] };

const ROUTES: RouteDef[] = [
  { name: "home", route: HomeRoute, matches: ["__root", "/"], path: "/", types: ["WebSite", "Organization"] },
  { name: "privacy", route: PrivacyRoute, matches: ["__root", "/privacy"], path: "/privacy", types: [] },
  { name: "terms", route: TermsRoute, matches: ["__root", "/terms"], path: "/terms", types: [] },
  { name: "health-wellness", route: HealthWellnessRoute, matches: ["__root", "/health-wellness"], path: "/health-wellness", types: ["CollectionPage", "BreadcrumbList"] },
  {
    name: "magnesium guide",
    route: MagnesiumGuideRoute,
    matches: ["__root", "/health-wellness", "/health-wellness/the-complete-guide-to-magnesium"],
    path: "/health-wellness/the-complete-guide-to-magnesium",
    types: ["Article", "BreadcrumbList", "FAQPage"],
  },
  {
    name: "vitamin d guide",
    route: VitaminDGuideRoute,
    matches: ["__root", "/health-wellness", "/health-wellness/vitamin-d-guide"],
    path: "/health-wellness/vitamin-d-guide",
    types: ["Article", "BreadcrumbList", "FAQPage"],
  },
  { name: "editorial standards", route: EditorialStandardsRoute, matches: ["__root", "/editorial-standards"], path: "/editorial-standards", types: ["WebPage", "BreadcrumbList"] },
  { name: "art creative studio", route: ArtCreativeStudioRoute, matches: ["__root", "/art-creative-studio"], path: "/art-creative-studio", types: ["CollectionPage", "BreadcrumbList"] },
];

let failures = 0;

function fail(page: string, message: string): void {
  failures += 1;
  console.error(`  ✗ ${page}: ${message}`);
}

async function headFor(route: unknown, routeIds: string[]): Promise<Head> {
  const options = (route as { options?: { head?: (ctx: unknown) => Head } }).options;
  if (!options?.head) throw new Error("route has no head option");
  return options.head({ matches: routeIds.map((routeId) => ({ routeId })) });
}

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

function countType(node: unknown, type: string): number {
  if (Array.isArray(node)) return node.reduce((sum, n) => sum + countType(n, type), 0);
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    let count = obj["@type"] === type ? 1 : 0;
    for (const v of Object.values(obj)) count += countType(v, type);
    return count;
  }
  return 0;
}

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

function validate(page: string, canonicalUrls: string[], metas: { property?: string; name?: string; content?: string }[], ldChildren: string[]): void {
  const expected = `${SITE}${ROUTES.find((r) => r.name === page)!.path}`;
  if (canonicalUrls.length !== 1) {
    fail(page, `expected exactly 1 canonical, found ${canonicalUrls.length}: ${canonicalUrls.join(", ")}`);
  } else if (canonicalUrls[0] !== expected) {
    fail(page, `canonical ${canonicalUrls[0]} does not match expected ${expected}`);
  }
  const ogUrl = metas.find((m) => m.property === "og:url")?.content;
  if (ogUrl !== expected) fail(page, `og:url ${ogUrl ?? "(missing)"} does not match canonical ${expected}`);

  const lds: unknown[] = [];
  for (const children of ldChildren) {
    try {
      lds.push(JSON.parse(children));
    } catch (err) {
      fail(page, `JSON-LD does not parse: ${String(err)}`);
    }
  }
  const raw = ldChildren.join("\n");
  if (PREVIEW_HOST.test(raw)) fail(page, "JSON-LD contains a preview/canary host URL");

  const types = collectTypes(lds);
  const route = ROUTES.find((r) => r.name === page)!;
  for (const t of route.types) {
    if (!types.includes(t)) fail(page, `missing expected @type "${t}" (found: ${types.join(", ") || "none"})`);
  }
  for (const t of ["Product", "Review"]) {
    if (types.includes(t)) fail(page, `unexpected @type "${t}"`);
  }
  if (countType(lds, "WebSite") > 1) fail(page, "more than one WebSite node on the page");

  const ids: string[] = [];
  for (const ld of lds) identityDefinitions(ld, ids);
  const seen = new Map<string, number>();
  for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
  for (const [id, count] of seen) {
    if (count > 1) fail(page, `duplicate identity definition: ${id} (${count}x)`);
  }
}

async function main(): Promise<void> {
  const live = process.argv.includes("--live");
  console.log(`TAFAT structured-data check${live ? " (LIVE https://tafat.co.uk)" : " (offline route heads)"}`);
  for (const route of ROUTES) {
    const head = await headFor(route.route, route.matches);
    validate(
      route.name,
      (head.links ?? []).filter((l) => l.rel === "canonical").map((l) => l.href ?? ""),
      head.meta ?? [],
      (head.scripts ?? []).filter((s) => s.type === "application/ld+json").map((s) => s.children ?? ""),
    );
    console.log(`  ✓ ${route.name.padEnd(22)} ${SITE}${route.path}`);
  }

  if (live) {
    console.log("\nLive production check…");
    for (const route of ROUTES) {
      const res = await fetch(`${SITE}${route.path}`);
      if (!res.ok) {
        fail(route.name, `HTTP ${res.status} for ${SITE}${route.path}`);
        continue;
      }
      const html = await res.text();
      const canonicals = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*>/g)].map((m) =>
        /href="([^"]+)"/.exec(m[0])?.[1] ?? "",
      );
      const metas = [...html.matchAll(/<meta[^>]*>/g)].map((m) => {
        const property = /property="([^"]+)"/.exec(m[0])?.[1];
        const name = /name="([^"]+)"/.exec(m[0])?.[1];
        const content = /content="([^"]+)"/.exec(m[0])?.[1];
        return { property, name, content };
      });
      const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      validate(route.name, canonicals, metas, lds);
      console.log(`  ✓ ${route.name.padEnd(22)} ${SITE}${route.path} (${res.status})`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} problem(s) found.`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
