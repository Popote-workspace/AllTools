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

This project is built on TanStack Start, which by default produces a server-rendered build. `netlify.toml` is included with an SPA fallback, but verify the build output directory (`dist/client`) on first deploy; for a pure static host you may need to enable prerendering/SPA mode in `vite.config.ts`. No environment variables or secrets are required.

## Limitations

- Tax and import-duty figures are estimates; always confirm with KRA.
- PDF compression Medium/Strong rasterises pages (text no longer selectable); PDF↔image conversion not implemented.
- Business-day counts exclude weekends only, not public holidays.
