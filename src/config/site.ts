/**
 * Central site configuration.
 * Keep all globally tweakable values here so they can be updated in one place.
 */

export const SITE_NAME = "AllTools";
export const SITE_TAGLINE = "Useful tools. Simple answers. Free.";
export const SITE_DESCRIPTION =
  "Free online calculators and converters for everyday life in Kenya and beyond. No sign-up, mobile friendly and fast.";

/** Contact address shown on the Contact page. Update before launch. */
export const CONTACT_EMAIL = "hello@alltools.example";

/**
 * Google AdSense.
 * Ads stay disabled until a real publisher ID is available.
 */
export const ADSENSE_ENABLED = false;
export const ADSENSE_CLIENT_ID = ""; // e.g. "ca-pub-0000000000000000"

/**
 * Analytics. Disabled by default; no personal data and no calculator
 * input values are ever collected.
 */
export const ANALYTICS_ENABLED = false;
export const GA_MEASUREMENT_ID = "";

/** Kenya General Election countdown target (configurable). */
export const ELECTION = {
  title: "Kenya General Election 2027 Countdown",
  /** 10 August 2027, 06:00 EAT (polls open). */
  targetIso: "2027-08-10T06:00:00+03:00",
  label: "10 August 2027",
};
