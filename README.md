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

- `VITE_GTM_ID` — Google Tag Manager container ID
- `VITE_GA4_MEASUREMENT_ID` — Google Analytics 4 measurement ID
- `VITE_CLARITY_PROJECT_ID` — Microsoft Clarity project ID
- `VITE_BING_VERIFICATION` — Bing Webmaster verification value

Only add real IDs after the owner has created and verified the corresponding
provider properties. `VITE_*` values are public client configuration, not
secrets. MailerLite is not connected in this MVP, and no MailerLite key should
be added until a consent-aware server integration exists.

### Site URL before launch

The current canonical, robots, and sitemap URLs intentionally point at the
published MVP preview URL. Before connecting a custom production domain, update
that URL in `src/routes/__root.tsx`, `src/routes/privacy.tsx`,
`src/routes/terms.tsx`, `public/robots.txt`, and `public/sitemap.xml`, then
redeploy. Do not claim Search Console ownership until the owner completes
Google verification.

<!-- Deployment preparation is configured in vercel.json. -->
