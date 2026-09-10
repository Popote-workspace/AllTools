import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, Select, TextInput } from "@/components/kit";
import { formatCurrency, parseNumber } from "@/lib/format";

const tool = getTool("salary-calculator");

const FAQS = [
  {
    q: "Does this include Kenyan tax?",
    a: "No. This is a general gross-to-net calculator where you supply the deductions. For statutory Kenyan deductions use the PAYE Calculator.",
  },
  {
    q: "What is the difference between monthly and annual view?",
    a: "Monthly view treats every figure as a monthly amount. Annual view multiplies the totals by twelve so you can see the yearly picture.",
  },
  {
    q: "Should allowances be included in gross?",
    a: "Enter base pay as gross salary and list allowances separately. The tool adds them together to give total gross income.",
  },
  {
    q: "Can net pay be negative?",
    a: "If your deductions exceed your gross income, the tool shows the shortfall and flags it, rather than hiding it.",
  },
];

export const Route = createFileRoute("/tools/salary-calculator")({
  head: () =>
    pageHead({
      title: "Salary Calculator",
      description:
        "Turn gross salary, allowances and deductions into estimated take-home pay, with monthly and annual views. Free and instant.",
      path: "/tools/salary-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/salary-calculator"),
    }),
  component: SalaryPage,
});

function SalaryPage() {
  const [gross, setGross] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [view, setView] = useState<"monthly" | "annual">("monthly");

  const g = parseNumber(gross);
  const a = allowances.trim() === "" ? 0 : parseNumber(allowances);
  const d = deductions.trim() === "" ? 0 : parseNumber(deductions);

  let error: string | undefined;
  if (gross.trim() !== "" && g === null) error = "Enter a valid gross salary.";
  else if (a === null || d === null) error = "Enter valid numbers for allowances and deductions.";
  else if ((g ?? 0) < 0 || a < 0 || d < 0) error = "Amounts cannot be negative.";

  const ready = gross.trim() !== "" && !error && g !== null && a !== null && d !== null;
  const multiplier = view === "annual" ? 12 : 1;

  const result = ready
    ? {
        grossIncome: (g + a) * multiplier,
        deductions: d * multiplier,
        net: (g + a - d) * multiplier,
      }
    : null;

  return (
    <ToolPage
      tool={tool}
      intro="Add up gross pay and allowances, subtract your deductions, and see estimated take-home pay monthly or annually."
      howItWorks={
        <>
          <p>
            Gross income is your basic salary plus any allowances. Estimated net pay is that total minus
            everything you list under deductions — tax, pension, sacco contributions, loan repayments or
            anything else taken off at source.
          </p>
          <p>
            Switching to the annual view multiplies each figure by twelve. This tool does not apply tax
            rates itself, which makes it useful in any country and for any deduction structure.
          </p>
        </>
      }
      example={
        <p>
          Gross of KES 90,000 with KES 10,000 in allowances and KES 22,500 of total deductions gives a gross
          income of <strong>KES 100,000</strong> and estimated net pay of <strong>KES 77,500</strong> a
          month, or KES 930,000 a year.
        </p>
      }
      tips={[
        "If you do not know your deductions, run the PAYE Calculator first and bring the total across.",
        "Compare job offers on annual net pay — a higher gross with worse deductions can leave you with less.",
        "Bonuses and one-off payments distort the monthly view; either exclude them or use the annual view.",
        "Keep a note of what you included under deductions so the figure stays comparable month to month.",
      ]}
      faqs={FAQS}
      related={["paye-calculator", "loan-calculator", "percentage-calculator", "cv-ats-checker"]}
      disclaimer="This is an estimate based on the figures you enter and is not payroll or tax advice."
    >
      <Card className="space-y-4">
        <Field label="Gross salary (KES, monthly)" htmlFor="gross">
          <TextInput
            id="gross"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={gross}
            onChange={(e) => setGross(e.target.value)}
            placeholder="e.g. 90000"
          />
        </Field>
        <Field label="Allowances (KES, monthly)" htmlFor="allowances">
          <TextInput
            id="allowances"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={allowances}
            onChange={(e) => setAllowances(e.target.value)}
            placeholder="e.g. 10000"
          />
        </Field>
        <Field
          label="Total deductions (KES, monthly)"
          htmlFor="deductions"
          error={error}
          hint="Tax, pension, sacco, loans and anything else deducted at source."
        >
          <TextInput
            id="deductions"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            placeholder="e.g. 22500"
          />
        </Field>
        <Field label="View" htmlFor="view">
          <Select id="view" value={view} onChange={(e) => setView(e.target.value as "monthly" | "annual")}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </Select>
        </Field>

        <Button
          variant="ghost"
          onClick={() => {
            setGross("");
            setAllowances("");
            setDeductions("");
            setView("monthly");
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <ResultRow label={`Gross income (${view})`} value={formatCurrency(result.grossIncome)} />
              <ResultRow label={`Estimated deductions (${view})`} value={formatCurrency(result.deductions)} />
              <ResultRow label={`Estimated net salary (${view})`} value={formatCurrency(result.net)} emphasis />
              {result.net < 0 ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Your deductions are larger than your gross income — check the figures you entered.
                </p>
              ) : null}
              <div className="mt-3">
                <CopyButton
                  value={`Gross ${formatCurrency(result.grossIncome)}, deductions ${formatCurrency(result.deductions)}, net ${formatCurrency(result.net)} (${view})`}
                  label="Copy summary"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Enter a gross salary to see your take-home pay.</p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
