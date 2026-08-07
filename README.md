# Tafat

Tafat is a TanStack Start + Vite affiliate product discovery catalog. The current
MVP includes searchable Digital and Health products, clearly disclosed affiliate
links, cookie consent, consent-gated measurement hooks, and privacy and terms
routes.

## Local development

Requires Bun. Install exactly from the lockfile and run the Vite dev server:

```sh
bun install --frozen-lockfile
bun run dev
```

Production verification:

```sh
bun run build
```

## Vercel deployment

This repository includes `vercel.json`. Vercel should use:

- **Framework preset:** Other (the config sets `framework` to `null`)
- **Install command:** `bun install --frozen-lockfile`
- **Build command:** `bash ./build-vercel.sh`
- **Output directory:** `.vercel/output`
- **Node runtime:** Node.js 22.x for the SSR function

`build-vercel.sh` creates a Vercel Build Output API v3 bundle. It builds the
TanStack SSR handler, bundles it with `vercel-entry.ts`, and serves static assets
through the same SSR function. No Vercel token or provider credentials are
stored in this repository. This change prepares the project for Vercel; it does
not itself deploy the project.

### Optional environment variables

No environment variables are required for the MVP to build or run. Measurement
providers are disabled when these values are absent and are loaded only after
optional analytics consent:

- `VITE_GTM_CONTAINER_ID` — Google Tag Manager container ID
- `VITE_GA4_MEASUREMENT_ID` — Google Analytics 4 measurement ID
- `VITE_CLARITY_PROJECT_ID` — Microsoft Clarity project ID
- `VITE_BING_VERIFICATION` — Bing Webmaster verification value

Only add real IDs after the owner has created and verified the corresponding
provider properties. `VITE_*` values are public client configuration, not
secrets. MailerLite is not connected in this MVP, and no MailerLite key should
be added until a consent-aware server integration exists.

### Site URL
Canonical, robots, sitemap, og:url, and structured-data URLs all point at the
production host `https://tafat.co.uk` (see `src/lib/seo.ts`). No per-domain
edits are needed before launch — this is the only host used in metadata.
Search Console ownership verification is prepared via
`public/google5f35c39333f2b76f.html`; verifying the property in Google Search
Console and confirming sitemap processing remain owner actions.
