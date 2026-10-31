# Roadmap

## In progress — AllTools 2.0: add 15 new tools (30 total)
- [ ] Shared foundation: register 15 new tools + categories (finance, images, time, utilities) in src/data/tools.ts; new category pages; header/footer/homepage updates
- [ ] Batch 1: QR Code Generator, Password Generator, Image Compressor, Image Resizer, Image Format Converter
- [ ] Batch 2: Currency Converter, BMI Calculator, Mortgage Calculator, Compound Interest Calculator, Discount & Sales Tax Calculator
- [ ] Batch 3: Time Zone Converter, World Clock, Calendar & Event Planner, World Holidays, Pomodoro Timer
- [ ] Sitemap.xml for all 30 tools (public URL now known: https://alltoolsware.netlify.app) + robots.txt Sitemap line
- [ ] Verify all 30 tools in browser; typecheck; production build; README/AGENTS updates

## Done
- [x] Netlify deployment fixed with @netlify/vite-plugin-tanstack-start (nitro off). `npm run build` now outputs `dist/client` plus a Netlify Function; verified by running the built handler against real paths.
- [x] Site is live at https://alltoolsware.netlify.app/

## Waiting on user
- [ ] Contact page shows a placeholder email (hello@alltools.example) — needs the real address.
- [ ] GitHub push: connect GitHub in Lovable's settings, then push to https://github.com/Popote-workspace/AllTools
- [ ] Confirm Kenya import-duty and construction-cost figures with KRA.

## Later
- [ ] Kenya public holidays in the date tool's business-day count.
- [ ] Swahili language toggle.
- [ ] More converters.
