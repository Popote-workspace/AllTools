# AllTools Business & Money Expansion

## Scope
- Preserve the existing 15 completed tools, the in-progress QR, password, and image-compression work, existing design tokens, and Netlify/GitHub setup.
- Add a searchable Business & Money category and 15 distinct tool pages at the requested URLs; keep the homepage styling unchanged unless the user chooses the screenshot redesign.
- Keep all calculations and document generation in the browser. Add no paid services, backend, analytics, or advertising.

## Implementation
- Reuse the existing tool registry, category page, search, navigation, `ToolPage`, UI kit, SEO helper, and `pdf-lib` dependency.
- Build a shared document editor and preview for invoices, quotations, receipts, and delivery notes, with print styles and downloadable PDFs generated locally.
- Build eight dedicated financial calculators around tested pure calculation helpers, including validation, results, explanations, reset, and copy/export actions where requested.
- Build the offline name idea generator, a locally stored weekly shift scheduler with CSV export, and a locally stored expense tracker with filters, summaries, and CSV export.
- Give each new route unique title/description/Open Graph metadata and structured data via the existing route head helper. Preserve `robots.txt`; no existing sitemap is present, so do not invent one.
- Leave `vite.config.ts` and `netlify.toml` untouched because the current production build already emits `dist/client` and the Netlify function.

## Verification
- After each group, run the production build and focused calculation tests before continuing.
- Exercise document previews, PDF downloads, print layouts, calculations, CSV exports, local storage, invalid inputs, category/search/navigation, and phone layouts in a real browser.
- Recheck existing tools and confirm the three unfinished tools remain intact; verify route uniqueness, type errors, build output, and deploy-handler behavior.