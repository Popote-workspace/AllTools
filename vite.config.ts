// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
export default defineConfig(async ({ command }) => {
  // Avoid loading the Netlify runtime shim during local config discovery; its
  // Cache API setup conflicts with the preview host's Window global.
  const netlifyPlugin =
    command === "build" ? (await import("@netlify/vite-plugin-tanstack-start")).default() : undefined;

  return {
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    },

    // Netlify's integration bundles the server entry into a Netlify Function and
    // publishes the client build. It replaces the Nitro build target below.
    plugins: netlifyPlugin ? [netlifyPlugin] : [],

    // Nitro would emit a Cloudflare build alongside the Netlify one.
    nitro: false,
  };
});
