/**
 * Kenya PAYE estimation parameters.
 *
 * These values are kept separate from the calculation logic so they can be
 * updated quickly when rates change. They are ESTIMATES for planning only —
 * always verify current rates with the Kenya Revenue Authority.
 */

export const PAYE_CONFIG = {
  lastUpdated: "2025-01",
  currency: "KES",

  /** Monthly PAYE bands, applied progressively. */
  bands: [
    { upTo: 24000, rate: 0.1 },
    { upTo: 32333, rate: 0.25 },
    { upTo: 500000, rate: 0.3 },
    { upTo: 800000, rate: 0.325 },
    { upTo: Infinity, rate: 0.35 },
  ],

  /** Monthly personal relief. */
  personalRelief: 2400,

  /** Pension contribution deductible from taxable pay (monthly cap). */
  pensionReliefCap: 30000,

  /** Social Health Insurance Fund: percentage of gross pay. */
  shif: { rate: 0.0275, minimum: 300 },

  /** Affordable Housing Levy: percentage of gross pay. */
  housingLevy: { rate: 0.015 },

  /** NSSF Tier I + Tier II employee contribution (monthly cap). */
  nssf: { rate: 0.06, cap: 4320 },

  sources: [
    { label: "Kenya Revenue Authority — PAYE", url: "https://www.kra.go.ke/individual/calculate-tax/getting-tax-right/paye" },
  ],
};

export type PayeInput = {
  grossSalary: number;
  allowances: number;
  benefits: number;
  pension: number;
  otherDeductions: number;
};

export type PayeResult = {
  grossIncome: number;
  pensionRelief: number;
  shif: number;
  housingLevy: number;
  nssf: number;
  taxableIncome: number;
  payeBeforeRelief: number;
  personalRelief: number;
  paye: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
};

export function calculatePaye(input: PayeInput): PayeResult {
  const c = PAYE_CONFIG;
  const grossIncome = input.grossSalary + input.allowances + input.benefits;

  const nssf = Math.min(grossIncome * c.nssf.rate, c.nssf.cap);
  const pensionRelief = Math.min(input.pension, c.pensionReliefCap);
  const shif = Math.max(grossIncome * c.shif.rate, c.shif.minimum);
  const housingLevy = grossIncome * c.housingLevy.rate;

  const taxableIncome = Math.max(0, grossIncome - pensionRelief - nssf - shif - housingLevy);

  let remaining = taxableIncome;
  let previousCap = 0;
  let payeBeforeRelief = 0;
  for (const band of c.bands) {
    if (remaining <= 0) break;
    const width = band.upTo - previousCap;
    const slice = Math.min(remaining, width);
    payeBeforeRelief += slice * band.rate;
    remaining -= slice;
    previousCap = band.upTo;
  }

  const paye = Math.max(0, payeBeforeRelief - c.personalRelief);
  const totalDeductions = paye + nssf + shif + housingLevy + input.pension + input.otherDeductions;
  const netSalary = grossIncome - totalDeductions;

  return {
    grossIncome,
    pensionRelief,
    shif,
    housingLevy,
    nssf,
    taxableIncome,
    payeBeforeRelief,
    personalRelief: c.personalRelief,
    paye,
    otherDeductions: input.otherDeductions,
    totalDeductions,
    netSalary,
  };
}
