# AllTools

Free, fast, privacy-friendly online tools for Kenya and beyond. Every calculator runs entirely in the browser — no accounts, no backend, no data collection.

## Tools (15)

Acre ↔ Hectare Converter · Percentage Calculator · Age Calculator · Loan Calculator · Kenya PAYE Calculator · Salary Calculator · House Construction Cost Calculator · Car Import Duty Calculator · CV ATS Checker · Election Countdown · Unit Converter · Word Counter · PDF Tools (merge, split, compress) · Kenya Fuel Cost Calculator · Date Difference Calculator

## Stack

React 19 · TypeScript · TanStack Router/Start · Vite · Tailwind CSS v4 · Lucide icons · pdf-lib (lazy-loaded, PDF merge only)

## Local development

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
npm run preview
```

## Configuration

All editable figures live in `src/config/`:

| File | Contents |
|---|---|
| `site.ts` | Site name, contact email, election date, AdSense & analytics switches |
| `tax.ts` | Kenya PAYE bands, reliefs, SHIF, housing levy, NSSF — with sources and last-updated date |
| `construction.ts` | Cost per m² assumptions |
| `importDuty.ts` | Import duty, excise, VAT, levies — **unverified assumptions**, confirm with KRA |

## Ads & analytics

Both are **disabled** by default (`ADSENSE_ENABLED = false`, `ANALYTICS_ENABLED = false` in `src/config/site.ts`). Ad slots render nothing while disabled. To enable after AdSense approval, set the flag and publisher ID. Calculator inputs are never sent to analytics.

## SEO

Every page has its own title, description, canonical link, Open Graph tags and JSON-LD. `public/robots.txt` allows all crawlers. **Add a `sitemap.xml` once your final domain is known**, and add a `Sitemap:` line to robots.txt.

## Deployment

Deployed to **Netlify** through Netlify's official TanStack Start integration, `@netlify/vite-plugin-tanstack-start` (installed as a dev dependency and added in `vite.config.ts`, where Nitro is switched off so only one server build is produced).

- `npm run build` writes the browser build to `dist/client` (Netlify's publish directory) and the server bundle to `dist/server`, then emits the function handler at `.netlify/v1/functions/server.mjs` with `path: "/*"` and `preferStatic: true`.
- `netlify.toml` only sets the build command and publish directory: `command = "npm run build"`, `publish = "dist/client"`.
- SSR, server routes and server functions run as a Netlify Function; static files are served first. Because the function answers every path, **no SPA fallback redirect is needed** — adding `/*` → `/index.html` would shadow the function and break deep links and the 404 page.
- No environment variables, secrets or paid services are required. Ads and analytics stay disabled in `src/config/site.ts`.
- Checked locally by running the built function handler and requesting real paths: `/`, `/tools/paye-calculator`, `/tools/pdf-tools` and `/contact` return 200 with server-rendered HTML, and an unknown path returns 404.


## Limitations

- Tax and import-duty figures are estimates; always confirm with KRA.
- PDF compression Medium/Strong rasterises pages (text no longer selectable); PDF↔image conversion not implemented.
- Business-day counts exclude weekends only, not public holidays.
