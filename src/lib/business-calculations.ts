export type BusinessLine = { quantity: number; unitPrice: number };

export type DocumentTotals = {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
};

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100);
}

function fromCents(value: number): number {
  return value / 100;
}

export function calculateDocumentTotals(
  lines: BusinessLine[],
  discountPercent: number,
  taxPercent: number,
): DocumentTotals | null {
  if (
    !Number.isFinite(discountPercent) ||
    !Number.isFinite(taxPercent) ||
    discountPercent < 0 ||
    discountPercent > 100 ||
    taxPercent < 0 ||
    taxPercent > 100 ||
    lines.some(
      (line) =>
        !Number.isFinite(line.quantity) ||
        !Number.isFinite(line.unitPrice) ||
        line.quantity < 0 ||
        line.unitPrice < 0,
    )
  ) {
    return null;
  }

  const subtotalCents = lines.reduce(
    (sum, line) => sum + Math.round(toCents(line.unitPrice) * line.quantity),
    0,
  );
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round((taxableCents * taxPercent) / 100);

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    taxableAmount: fromCents(taxableCents),
    tax: fromCents(taxCents),
    total: fromCents(taxableCents + taxCents),
  };
}

export type ProfitMetrics = {
  revenue: number;
  totalCost: number;
  grossProfit: number;
  profitPerUnit: number;
  marginPercent: number | null;
  markupPercent: number | null;
};

export function calculateProfitMetrics(
  costPerUnit: number,
  sellingPricePerUnit: number,
  quantity = 1,
): ProfitMetrics | null {
  if (
    !Number.isFinite(costPerUnit) ||
    !Number.isFinite(sellingPricePerUnit) ||
    !Number.isFinite(quantity) ||
    costPerUnit < 0 ||
    sellingPricePerUnit < 0 ||
    quantity <= 0
  ) {
    return null;
  }

  const costCents = toCents(costPerUnit);
  const saleCents = toCents(sellingPricePerUnit);
  const revenueCents = Math.round(saleCents * quantity);
  const totalCostCents = Math.round(costCents * quantity);
  const profitCents = revenueCents - totalCostCents;
  const perUnitProfitCents = saleCents - costCents;

  return {
    revenue: fromCents(revenueCents),
    totalCost: fromCents(totalCostCents),
    grossProfit: fromCents(profitCents),
    profitPerUnit: fromCents(perUnitProfitCents),
    marginPercent: revenueCents > 0 ? (profitCents / revenueCents) * 100 : null,
    markupPercent: totalCostCents > 0 ? (profitCents / totalCostCents) * 100 : null,
  };
}

export function priceForTargetMargin(costPerUnit: number, marginPercent: number): number | null {
  if (
    !Number.isFinite(costPerUnit) ||
    !Number.isFinite(marginPercent) ||
    costPerUnit < 0 ||
    marginPercent < 0 ||
    marginPercent >= 100
  ) {
    return null;
  }

  return roundMoney(costPerUnit / (1 - marginPercent / 100));
}

export type MarkupResult = {
  sellingPrice: number;
  markupAmount: number;
  profitMarginPercent: number | null;
};

export function calculateMarkup(cost: number, markupPercent: number): MarkupResult | null {
  if (!Number.isFinite(cost) || !Number.isFinite(markupPercent) || cost < 0 || markupPercent < 0) {
    return null;
  }

  const costCents = toCents(cost);
  const markupCents = Math.round((costCents * markupPercent) / 100);
  const sellingCents = costCents + markupCents;

  return {
    sellingPrice: fromCents(sellingCents),
    markupAmount: fromCents(markupCents),
    profitMarginPercent: sellingCents > 0 ? (markupCents / sellingCents) * 100 : null,
  };
}

export function markupFromSellingPrice(cost: number, sellingPrice: number): MarkupResult | null {
  if (
    !Number.isFinite(cost) ||
    !Number.isFinite(sellingPrice) ||
    cost <= 0 ||
    sellingPrice < 0
  ) {
    return null;
  }

  const costCents = toCents(cost);
  const sellingCents = toCents(sellingPrice);
  const markupCents = sellingCents - costCents;

  return {
    sellingPrice: fromCents(sellingCents),
    markupAmount: fromCents(markupCents),
    profitMarginPercent: sellingCents > 0 ? (markupCents / sellingCents) * 100 : null,
  };
}

export type BreakEvenResult = {
  contributionPerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  targetProfitUnits: number | null;
};

export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  targetProfit?: number,
): BreakEvenResult | null {
  if (
    ![fixedCosts, variableCostPerUnit, sellingPricePerUnit].every(Number.isFinite) ||
    fixedCosts < 0 ||
    variableCostPerUnit < 0 ||
    sellingPricePerUnit <= variableCostPerUnit ||
    (targetProfit !== undefined && (!Number.isFinite(targetProfit) || targetProfit < 0))
  ) {
    return null;
  }

  const contributionCents = toCents(sellingPricePerUnit) - toCents(variableCostPerUnit);
  const fixedCents = toCents(fixedCosts);
  const targetCents = targetProfit === undefined ? null : toCents(targetProfit);
  const minimumUnits = (amountCents: number) =>
    Math.max(0, Math.ceil((amountCents - 1e-8) / contributionCents));
  const breakEvenUnits = minimumUnits(fixedCents);
  const targetProfitUnits = targetCents === null ? null : minimumUnits(fixedCents + targetCents);

  return {
    contributionPerUnit: fromCents(contributionCents),
    breakEvenUnits,
    breakEvenRevenue: roundMoney(breakEvenUnits * sellingPricePerUnit),
    targetProfitUnits,
  };
}

export type HourlyRateInput = {
  desiredIncome: number;
  incomePeriod: "monthly" | "annual";
  hoursPerWeek: number;
  weeksPerYear: number;
  billablePercent: number;
  annualExpenses: number;
  taxPercent: number;
  profitBufferPercent: number;
  hoursPerDay: number;
};

export type HourlyRateResult = {
  annualIncome: number;
  annualRevenueTarget: number;
  billableHoursPerYear: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyEquivalent: number;
};

export function calculateHourlyRate(input: HourlyRateInput): HourlyRateResult | null {
  const values = [
    input.desiredIncome,
    input.hoursPerWeek,
    input.weeksPerYear,
    input.billablePercent,
    input.annualExpenses,
    input.taxPercent,
    input.profitBufferPercent,
    input.hoursPerDay,
  ];
  if (
    !values.every(Number.isFinite) ||
    input.desiredIncome <= 0 ||
    input.hoursPerWeek <= 0 ||
    input.weeksPerYear <= 0 ||
    input.weeksPerYear > 52 ||
    input.billablePercent <= 0 ||
    input.billablePercent > 100 ||
    input.annualExpenses < 0 ||
    input.taxPercent < 0 ||
    input.taxPercent >= 100 ||
    input.profitBufferPercent < 0 ||
    input.hoursPerDay <= 0 ||
    input.hoursPerDay > 24
  ) {
    return null;
  }

  const annualIncome = input.incomePeriod === "monthly" ? input.desiredIncome * 12 : input.desiredIncome;
  const billableHoursPerYear = input.hoursPerWeek * input.weeksPerYear * (input.billablePercent / 100);
  const beforeTax = (annualIncome + input.annualExpenses) / (1 - input.taxPercent / 100);
  const annualRevenueTarget = beforeTax * (1 + input.profitBufferPercent / 100);
  const hourlyRate = annualRevenueTarget / billableHoursPerYear;

  return {
    annualIncome: roundMoney(annualIncome),
    annualRevenueTarget: roundMoney(annualRevenueTarget),
    billableHoursPerYear: roundMoney(billableHoursPerYear),
    hourlyRate: roundMoney(hourlyRate),
    dailyRate: roundMoney(hourlyRate * input.hoursPerDay),
    monthlyEquivalent: roundMoney(annualRevenueTarget / 12),
  };
}

export type CommissionMode = "percentage" | "fixed" | "tiered";

export type CommissionInput = {
  sales: number[];
  mode: CommissionMode;
  percentage?: number;
  fixedPerSale?: number;
  threshold?: number;
  rateBelow?: number;
  rateAtOrAbove?: number;
};

export type CommissionResult = {
  totalSales: number;
  commission: number;
  effectiveRatePercent: number;
  saleCount: number;
};

export function calculateCommission(input: CommissionInput): CommissionResult | null {
  if (input.sales.some((sale) => !Number.isFinite(sale) || sale < 0)) return null;
  const totalSalesCents = input.sales.reduce((sum, sale) => sum + toCents(sale), 0);
  let commissionCents = 0;

  if (input.mode === "percentage") {
    if (input.percentage === undefined || !Number.isFinite(input.percentage) || input.percentage < 0) {
      return null;
    }
    commissionCents = Math.round((totalSalesCents * input.percentage) / 100);
  } else if (input.mode === "fixed") {
    if (
      input.fixedPerSale === undefined ||
      !Number.isFinite(input.fixedPerSale) ||
      input.fixedPerSale < 0
    ) {
      return null;
    }
    commissionCents = toCents(input.fixedPerSale) * input.sales.length;
  } else {
    if (
      input.threshold === undefined ||
      input.rateBelow === undefined ||
      input.rateAtOrAbove === undefined ||
      ![input.threshold, input.rateBelow, input.rateAtOrAbove].every(Number.isFinite) ||
      input.threshold < 0 ||
      input.rateBelow < 0 ||
      input.rateAtOrAbove < 0
    ) {
      return null;
    }
    const rate = fromCents(totalSalesCents) >= input.threshold ? input.rateAtOrAbove : input.rateBelow;
    commissionCents = Math.round((totalSalesCents * rate) / 100);
  }

  return {
    totalSales: fromCents(totalSalesCents),
    commission: fromCents(commissionCents),
    effectiveRatePercent:
      totalSalesCents > 0 ? (commissionCents / totalSalesCents) * 100 : 0,
    saleCount: input.sales.length,
  };
}

export type InventoryResult = {
  reorderPoint: number;
  daysRemaining: number | null;
  recommendedQuantity: number;
};

export function calculateInventoryReorder(
  currentStock: number,
  averageDailyUsage: number,
  leadTimeDays: number,
  safetyStock: number,
  targetStock?: number,
): InventoryResult | null {
  const values = [currentStock, averageDailyUsage, leadTimeDays, safetyStock];
  if (
    !values.every(Number.isFinite) ||
    values.some((value) => value < 0) ||
    (targetStock !== undefined && (!Number.isFinite(targetStock) || targetStock < 0))
  ) {
    return null;
  }

  const reorderPoint = Math.ceil(averageDailyUsage * leadTimeDays + safetyStock);
  return {
    reorderPoint,
    daysRemaining: averageDailyUsage > 0 ? roundMoney(currentStock / averageDailyUsage) : null,
    recommendedQuantity: Math.max(
      0,
      (targetStock === undefined ? reorderPoint : targetStock) - currentStock,
    ),
  };
}

export type ProrationMethod = "calendar" | "weekdays";

export type ProratedSalaryResult = {
  periodDays: number;
  employedDays: number;
  unpaidLeaveDays: number;
  paidDays: number;
  grossPay: number;
  deductions: number;
  netPay: number;
};

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function calculateProratedSalary(input: {
  monthlySalary: number;
  periodMonth: string;
  employmentStart: string;
  employmentEnd: string;
  method: ProrationMethod;
  unpaidLeaveDays: number;
  deductionPercent: number;
}): ProratedSalaryResult | null {
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(input.periodMonth);
  const start = parseIsoDate(input.employmentStart);
  const end = parseIsoDate(input.employmentEnd);
  if (
    !Number.isFinite(input.monthlySalary) ||
    input.monthlySalary < 0 ||
    !Number.isFinite(input.unpaidLeaveDays) ||
    input.unpaidLeaveDays < 0 ||
    !Number.isFinite(input.deductionPercent) ||
    input.deductionPercent < 0 ||
    input.deductionPercent > 100 ||
    !monthMatch ||
    !start ||
    !end ||
    input.employmentStart > input.employmentEnd
  ) {
    return null;
  }

  const year = Number(monthMatch[1]);
  const month = Number(monthMatch[2]);
  if (month < 1 || month > 12) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let periodDays = 0;
  let employedDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const weekday = date.getUTCDay();
    const counts = input.method === "calendar" || (weekday !== 0 && weekday !== 6);
    if (!counts) continue;
    periodDays += 1;
    const iso = date.toISOString().slice(0, 10);
    if (iso >= input.employmentStart && iso <= input.employmentEnd) employedDays += 1;
  }

  if (periodDays === 0 || input.unpaidLeaveDays > employedDays) return null;
  const paidDays = employedDays - input.unpaidLeaveDays;
  const grossPay = roundMoney((toCents(input.monthlySalary) * paidDays) / periodDays / 100);
  const deductions = roundMoney((toCents(grossPay) * input.deductionPercent) / 10_000);

  return {
    periodDays,
    employedDays,
    unpaidLeaveDays: input.unpaidLeaveDays,
    paidDays,
    grossPay,
    deductions,
    netPay: roundMoney(grossPay - deductions),
  };
}

export type MeetingCostResult = {
  costPerMeeting: number;
  costPerParticipant: number;
  annualCost: number;
};

export function calculateMeetingCost(input: {
  participants: number;
  hourlyRatePerParticipant: number;
  durationHours: number;
  additionalExpenses: number;
  meetingsPerWeek: number;
  workingWeeksPerYear: number;
}): MeetingCostResult | null {
  const values = Object.values(input);
  if (
    !values.every(Number.isFinite) ||
    input.participants < 1 ||
    input.hourlyRatePerParticipant < 0 ||
    input.durationHours <= 0 ||
    input.additionalExpenses < 0 ||
    input.meetingsPerWeek < 0 ||
    input.workingWeeksPerYear < 0 ||
    input.workingWeeksPerYear > 52
  ) {
    return null;
  }

  const costPerMeeting = roundMoney(
    input.participants * input.hourlyRatePerParticipant * input.durationHours + input.additionalExpenses,
  );
  return {
    costPerMeeting,
    costPerParticipant: roundMoney(costPerMeeting / input.participants),
    annualCost: roundMoney(costPerMeeting * input.meetingsPerWeek * input.workingWeeksPerYear),
  };
}