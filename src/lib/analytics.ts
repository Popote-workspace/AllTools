import { ANALYTICS_ENABLED } from "@/config/site";

/**
 * Minimal analytics abstraction. Disabled by default.
 * Never pass personal data or calculator input values to these functions.
 */

type EventProps = Record<string, string | number | boolean>;

export function trackPageView(path: string) {
  if (!ANALYTICS_ENABLED) return;
  // Placeholder for a future provider (e.g. Google Analytics).
  void path;
}

export function trackEvent(name: string, props?: EventProps) {
  if (!ANALYTICS_ENABLED) return;
  void name;
  void props;
}
