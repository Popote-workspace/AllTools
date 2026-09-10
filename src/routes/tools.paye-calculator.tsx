import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, TextInput } from "@/components/kit";
import { formatCurrency, parseNumber } from "@/lib/format";
import { PAYE_CONFIG, calculatePaye } from "@/config/tax";

const tool = getTool("paye-calculator");

const FIELDS = [
  { id: "grossSalary", label: "Gross monthly salary (KES)", placeholder: "e.g. 120000", required: true },
  { id: "allowances", label: "Allowances (KES)", placeholder: "e.g. 15000", required: false },
  { id: "benefits", label: "Non-cash benefits (KES)", placeholder: "e.g. 0", required: false },
  { id: "pension", label: "Pension contribution (KES)", placeholder: "e.g. 0", required: false },
  { id: "otherDeductions", label: "Other deductions (KES)", placeholder: "e.g. 0", required: false },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

const FAQS = [
  {
    q: "Is this the official KRA PAYE calculator?",
    a: "No. AllTools is independent and not affiliated with the Kenya Revenue Authority. This tool applies published rates to give an estimate.",
  },
  {
    q: "What is deducted before tax?",
    a: "The estimate deducts pension contributions (up to the allowable cap), NSSF, SHIF and the affordable housing levy from gross pay before applying the PAYE bands.",
  },
  {
    q: "Why is my payslip different?",
    a: "Employers apply benefit valuations, sacco deductions, loan repayments, backdated adjustments and individual reliefs that this tool cannot know about.",
  },
  {
    q: "How do I update the rates?",
    a: "All bands, reliefs and levy rates live in one configuration file in the site source, so they can be refreshed in a single place when they change.",
  },
];

export const Route = createFileRoute("/tools/paye-calculator")({
  head: () =>
    pageHead({
      title: "Kenya PAYE Calculator",
      description:
        "Estimate Kenyan PAYE, SHIF, NSSF, housing levy and net monthly salary from gross pay, allowances and pension. Rates shown and editable.",
      path: "/tools/paye-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/paye-calculator"),
    }),
  component: PayePage,
});

function PayePage() {
  const [values, setValues] = useState<Record<FieldId, string>>({
    grossSalary: "",
    allowances: "",
    benefits: "",
    pension: "",
    otherDeductions: "",
  });

  function update(id: FieldId, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  const nums = {} as Record<FieldId, number>;
  let error: string | undefined;
  for (const field of FIELDS) {
    const raw = values[field.id];
    if (raw.trim() === "") {
      nums[field.id] = 0;
      continue;
    }
    const parsed = parseNumber(raw);
    if (parsed === null) {
      error = "Enter valid numbers only.";
      break;
    }
    if (parsed < 0) {
      error = "Amounts cannot be negative.";
      break;
    }
    nums[field.id] = parsed;
  }

  const hasGross = values.grossSalary.trim() !== "" && nums.grossSalary > 0;
  const result = !error && hasGross ? calculatePaye(nums) : null;

  return (
    <ToolPage
      tool={tool}
      intro="Estimate your Kenyan PAYE, statutory deductions and take-home pay from a monthly gross salary."
      howItWorks={
        <>
          <p>
            Gross income is your salary plus allowances plus non-cash benefits. From that, the tool deducts
            NSSF, SHIF, the affordable housing levy and any allowable pension contribution to arrive at
            taxable income.
          </p>
          <p>
            PAYE is then charged progressively across the monthly bands — {PAYE_CONFIG.bands.map((b, i) =>
              `${(b.rate * 100).toFixed(1).replace(".0", "")}%`,
            ).join(", ")} — and monthly personal relief of{" "}
            {formatCurrency(PAYE_CONFIG.personalRelief)} is subtracted from the tax due. Net salary is
            gross income less PAYE, statutory deductions, pension and anything you list under other
            deductions.
          </p>
          <p>
            All rates sit in a separate configuration file, so they can be updated quickly without touching
            the calculation logic.
          </p>
        </>
      }
      example={
        <p>
          On a gross of KES 120,000 with no allowances, the tool deducts NSSF, SHIF at{" "}
          {(PAYE_CONFIG.shif.rate * 100).toFixed(2)}% and the housing levy at{" "}
          {(PAYE_CONFIG.housingLevy.rate * 100).toFixed(1)}%, taxes the remainder across the bands, applies
          personal relief, and shows the resulting net pay.
        </p>
      }
      tips={[
        "Include only taxable allowances such as house or car allowance; reimbursed expenses are not part of gross pay.",
        "Pension contributions reduce taxable pay up to the allowable monthly cap, which is why they change both your tax and your net pay.",
        "Compare the estimate against your actual payslip — a large gap usually points to a benefit valuation or a deduction the tool does not know about.",
        "For a simple gross-to-net view without statutory detail, use the Salary Calculator instead.",
      ]}
      faqs={FAQS}
      related={["salary-calculator", "loan-calculator", "percentage-calculator", "kenya-fuel-cost-calculator"]}
      disclaimer="Tax calculations are estimates. Always verify current rates with the Kenya Revenue Authority. AllTools is not an official KRA calculator."
      lastUpdated={PAYE_CONFIG.lastUpdated}
      sources={PAYE_CONFIG.sources}
    >
      <Card className="space-y-4">
        {FIELDS.map((field) => (
          <Field
            key={field.id}
            label={field.label}
            htmlFor={field.id}
            error={field.id === "otherDeductions" ? error : undefined}
          >
            <TextInput
              id={field.id}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={values[field.id]}
              onChange={(e) => update(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </Field>
        ))}

        <Button
          variant="ghost"
          onClick={() =>
            setValues({ grossSalary: "", allowances: "", benefits: "", pension: "", otherDeductions: "" })
          }
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <ResultRow label="Gross income" value={formatCurrency(result.grossIncome)} />
              <ResultRow label="NSSF" value={formatCurrency(result.nssf)} />
              <ResultRow label="SHIF" value={formatCurrency(result.shif)} />
              <ResultRow label="Housing levy" value={formatCurrency(result.housingLevy)} />
              <ResultRow label="Taxable income" value={formatCurrency(result.taxableIncome)} />
              <ResultRow label="Estimated PAYE" value={formatCurrency(result.paye)} />
              <ResultRow label="Other deductions" value={formatCurrency(result.otherDeductions)} />
              <ResultRow label="Total deductions" value={formatCurrency(result.totalDeductions)} />
              <ResultRow label="Estimated net salary" value={formatCurrency(result.netSalary)} emphasis />
              <div className="mt-3">
                <CopyButton
                  value={`Gross ${formatCurrency(result.grossIncome)}, PAYE ${formatCurrency(result.paye)}, net ${formatCurrency(result.netSalary)}`}
                  label="Copy summary"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a gross monthly salary above zero to see the estimate.
            </p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
