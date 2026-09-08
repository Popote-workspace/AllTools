/**
 * House construction cost assumptions (KES per square metre).
 * Editable defaults — users can override the rate in the tool itself.
 */
export const CONSTRUCTION_CONFIG = {
  lastUpdated: "2025-01",
  currency: "KES",
  /** +/- range applied to produce a low and high estimate. */
  variance: 0.2,
  qualities: [
    { id: "basic", label: "Basic", ratePerSqm: 35000, note: "Simple finishes, standard fittings." },
    { id: "standard", label: "Standard", ratePerSqm: 55000, note: "Good quality finishes and fittings." },
    { id: "premium", label: "Premium", ratePerSqm: 90000, note: "High-end finishes, custom design." },
  ],
};

export type ConstructionQualityId = "basic" | "standard" | "premium";
