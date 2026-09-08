/** Safe numeric helpers — these guarantee no NaN / Infinity ever renders. */

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Parses a user-typed string. Returns null when it is not a usable number. */
export function parseNumber(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  if (!isFiniteNumber(value)) return "—";
  return new Intl.NumberFormat("en-KE", { maximumFractionDigits }).format(value);
}

export function formatCurrency(value: number, currency = "KES", maximumFractionDigits = 0): string {
  if (!isFiniteNumber(value)) return "—";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  if (!isFiniteNumber(value)) return "—";
  return `${formatNumber(value, digits)}%`;
}
