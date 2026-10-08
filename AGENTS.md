<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Deployment

- Netlify is the deploy target: `@netlify/vite-plugin-tanstack-start` in `vite.config.ts` produces the
  Netlify output (client build in `dist/client`, SSR + server functions as a Netlify Function).
  Keep `nitro: false` — a second server build target would emit a conflicting bundle for the same deploy.
- Routing is answered by the server function, not by a static SPA fallback. Do not add a `/*` redirect
  to `netlify.toml`; it shadows the function and breaks SSR, deep links and 404s.
- Verify any deploy change by running the build and importing the generated function handler
  (`.netlify/v1/functions/server.mjs`) to fetch real paths — a green build alone does not prove deploy works.

