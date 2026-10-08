// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },

  // Netlify's official TanStack Start integration. It bundles the server entry into a
  // Netlify Function and publishes the client build, so it replaces the Nitro step
  // below. Appended after the wrapper's own plugins, i.e. after tanstackStart().
  plugins: [netlify()],

  // Nitro would emit a Cloudflare build alongside the Netlify one; the Netlify
  // plugin produces the deployable output instead.
  nitro: false,
});
