import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, Select, TextInput } from "@/components/kit";
import { formatCurrency, parseNumber } from "@/lib/format";

const tool = getTool("loan-calculator");

const FAQS = [
  {
    q: "Which repayment method does this use?",
    a: "It uses the standard amortising (reducing balance) formula, where every instalment is the same amount and the split between interest and principal shifts over time.",
  },
  {
    q: "Does it include fees?",
    a: "No. Arrangement fees, insurance, excise duty on fees and legal costs are not included, so a real loan usually costs more than this estimate.",
  },
  {
    q: "What if my loan uses a flat interest rate?",
    a: "Flat-rate loans charge interest on the original amount for the whole term and cost more than the reducing-balance figure shown here. Ask your lender which method applies.",
  },
  {
    q: "Can I use it for a mortgage?",
    a: "Yes, the maths is the same. Enter the term in years and remember that rates on long mortgages often change over the life of the loan.",
  },
];

export const Route = createFileRoute("/tools/loan-calculator")({
  head: () =>
    pageHead({
      title: "Loan Calculator",
      description:
        "Estimate monthly loan repayments, total interest and total repayment from the amount, annual interest rate and term. Free reducing-balance calculator.",
      path: "/tools/loan-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/loan-calculator"),
    }),
  component: LoanPage,
});

function LoanPage() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");

  const p = parseNumber(amount);
  const r = parseNumber(rate);
  const t = parseNumber(term);

  const filled = amount.trim() !== "" && rate.trim() !== "" && term.trim() !== "";
  let error: string | undefined;
  if (filled) {
    if (p === null || r === null || t === null) error = "Enter valid numbers in all three fields.";
    else if (p <= 0) error = "The loan amount must be greater than zero.";
    else if (r < 0) error = "The interest rate cannot be negative.";
    else if (t <= 0) error = "The loan term must be greater than zero.";
    else if (r > 200) error = "Enter the annual rate as a percentage, for example 14.5.";
  }

  let result: { monthly: number; total: number; interest: number } | null = null;
  if (filled && !error && p !== null && r !== null && t !== null) {
    const months = Math.round(termUnit === "years" ? t * 12 : t);
    if (months < 1) {
      error = "The loan term must be at least one month.";
    } else {
      const monthlyRate = r / 100 / 12;
      const monthly =
        monthlyRate === 0
          ? p / months
          : (p * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      const total = monthly * months;
      if (Number.isFinite(monthly) && Number.isFinite(total)) {
        result = { monthly, total, interest: total - p };
      } else {
        error = "Those values are too large to calculate. Try smaller numbers.";
      }
    }
  }

  return (
    <ToolPage
      tool={tool}
      intro="See what a loan really costs: the monthly instalment, the total you repay and how much of that is interest."
      howItWorks={
        <>
          <p>
            The calculator uses the standard amortising loan formula: M = P × i ÷ (1 − (1 + i)⁻ⁿ), where P
            is the amount borrowed, i is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the
            number of monthly instalments.
          </p>
          <p>
            Total repayment is the instalment multiplied by the number of months, and total interest is
            that figure minus the amount borrowed. A zero interest rate is handled separately so the
            calculation never divides by zero.
          </p>
        </>
      }
      example={
        <p>
          Borrowing KES 500,000 over 3 years at 14% a year gives a monthly instalment of about{" "}
          <strong>KES 17,090</strong>, a total repayment near <strong>KES 615,000</strong> and roughly{" "}
          <strong>KES 115,000</strong> in interest.
        </p>
      }
      tips={[
        "Compare loans on total repayment, not just the monthly instalment — a longer term lowers the instalment while raising the total cost.",
        "Ask lenders for the annual percentage rate on a reducing balance so you are comparing like with like.",
        "Add arrangement fees and insurance to the total before deciding; they are not part of this calculation.",
        "Paying a little extra each month reduces the interest sharply on long loans, because interest is charged on the remaining balance.",
      ]}
      faqs={FAQS}
      related={["salary-calculator", "percentage-calculator", "date-difference-calculator", "paye-calculator"]}
      disclaimer="Results are estimates and should not be considered financial advice. Confirm figures with your lender before borrowing."
    >
      <Card className="space-y-4">
        <Field label="Loan amount (KES)" htmlFor="amount">
          <TextInput
            id="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500000"
          />
        </Field>

        <Field label="Annual interest rate (%)" htmlFor="rate">
          <TextInput
            id="rate"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 14"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Loan term" htmlFor="term" error={error}>
            <TextInput
              id="term"
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. 3"
            />
          </Field>
          <Field label="Term unit" htmlFor="term-unit">
            <Select
              id="term-unit"
              value={termUnit}
              onChange={(e) => setTermUnit(e.target.value as "years" | "months")}
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </Select>
          </Field>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setAmount("");
            setRate("");
            setTerm("");
            setTermUnit("years");
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <ResultRow label="Monthly payment" value={formatCurrency(result.monthly)} emphasis />
              <ResultRow label="Total repayment" value={formatCurrency(result.total)} />
              <ResultRow label="Total interest" value={formatCurrency(result.interest)} />
              <div className="mt-3">
                <CopyButton
                  value={`Monthly ${formatCurrency(result.monthly)}, total ${formatCurrency(result.total)}, interest ${formatCurrency(result.interest)}`}
                  label="Copy summary"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter the amount, rate and term to see your repayment.
            </p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
