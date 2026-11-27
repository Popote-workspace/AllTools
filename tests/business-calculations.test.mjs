import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateBreakEven,
  calculateCommission,
  calculateDocumentTotals,
  calculateHourlyRate,
  calculateInventoryReorder,
  calculateMarkup,
  calculateMeetingCost,
  calculateProfitMetrics,
  calculateProratedSalary,
  markupFromSellingPrice,
  priceForTargetMargin,
} from "../src/lib/business-calculations.ts";

test("document totals apply discount before tax and round each amount to cents", () => {
  assert.deepEqual(
    calculateDocumentTotals(
      [
        { quantity: 2, unitPrice: 25.25 },
        { quantity: 1, unitPrice: 10 },
      ],
      10,
      16,
    ),
    { subtotal: 60.5, discount: 6.05, taxableAmount: 54.45, tax: 8.71, total: 63.16 },
  );
});

test("profit margin uses revenue as the denominator while markup uses cost", () => {
  assert.deepEqual(calculateProfitMetrics(50, 80, 3), {
    revenue: 240,
    totalCost: 150,
    grossProfit: 90,
    profitPerUnit: 30,
    marginPercent: 37.5,
    markupPercent: 60,
  });
  assert.equal(priceForTargetMargin(80, 25), 106.67);
});

test("markup can be calculated forward and reversed from a target selling price", () => {
  assert.deepEqual(calculateMarkup(80, 25), {
    sellingPrice: 100,
    markupAmount: 20,
    profitMarginPercent: 20,
  });
  assert.deepEqual(markupFromSellingPrice(80, 100), {
    sellingPrice: 100,
    markupAmount: 20,
    profitMarginPercent: 20,
  });
});

test("break-even rounds up to whole units and rejects non-positive contribution", () => {
  assert.deepEqual(calculateBreakEven(1000, 40, 90, 500), {
    contributionPerUnit: 50,
    breakEvenUnits: 20,
    breakEvenRevenue: 1800,
    targetProfitUnits: 30,
  });
  assert.equal(calculateBreakEven(1000, 90, 90), null);
});

test("hourly rate includes annual expenses, tax allowance and profit buffer", () => {
  assert.deepEqual(
    calculateHourlyRate({
      desiredIncome: 60000,
      incomePeriod: "annual",
      hoursPerWeek: 40,
      weeksPerYear: 50,
      billablePercent: 50,
      annualExpenses: 10000,
      taxPercent: 25,
      profitBufferPercent: 10,
      hoursPerDay: 8,
    }),
    {
      annualIncome: 60000,
      annualRevenueTarget: 102666.67,
      billableHoursPerYear: 1000,
      hourlyRate: 102.67,
      dailyRate: 821.36,
      monthlyEquivalent: 8555.56,
    },
  );
});

test("commission supports percentage, fixed-per-sale and volume-tier modes", () => {
  assert.equal(calculateCommission({ sales: [1000, 2000], mode: "percentage", percentage: 5 })?.commission, 150);
  assert.equal(calculateCommission({ sales: [1000, 2000], mode: "fixed", fixedPerSale: 25 })?.commission, 50);
  assert.equal(
    calculateCommission({
      sales: [1000, 2000],
      mode: "tiered",
      threshold: 2500,
      rateBelow: 3,
      rateAtOrAbove: 5,
    })?.commission,
    150,
  );
});

test("inventory reorder point includes lead demand and safety stock", () => {
  assert.deepEqual(calculateInventoryReorder(5, 3, 4, 2, 20), {
    reorderPoint: 14,
    daysRemaining: 1.67,
    recommendedQuantity: 15,
  });
  assert.equal(calculateInventoryReorder(5, 0, 4, 2)?.daysRemaining, null);
});

test("salary proration supports calendar days, weekdays, leave and deductions", () => {
  const weekdayResult = calculateProratedSalary({
    monthlySalary: 3100,
    periodMonth: "2026-02",
    employmentStart: "2026-02-02",
    employmentEnd: "2026-02-13",
    method: "weekdays",
    unpaidLeaveDays: 2,
    deductionPercent: 10,
  });
  assert.deepEqual(weekdayResult, {
    periodDays: 20,
    employedDays: 10,
    unpaidLeaveDays: 2,
    paidDays: 8,
    grossPay: 1240,
    deductions: 124,
    netPay: 1116,
  });
  assert.equal(
    calculateProratedSalary({
      monthlySalary: 3100,
      periodMonth: "2026-02",
      employmentStart: "2026-02-01",
      employmentEnd: "2026-02-14",
      method: "calendar",
      unpaidLeaveDays: 2,
      deductionPercent: 0,
    })?.grossPay,
    1328.57,
  );
});

test("meeting cost includes participant time, extra costs and annual frequency", () => {
  assert.deepEqual(
    calculateMeetingCost({
      participants: 4,
      hourlyRatePerParticipant: 50,
      durationHours: 1.5,
      additionalExpenses: 20,
      meetingsPerWeek: 2,
      workingWeeksPerYear: 50,
    }),
    { costPerMeeting: 320, costPerParticipant: 80, annualCost: 32000 },
  );
});