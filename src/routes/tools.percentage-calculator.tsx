import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, Select, TextInput } from "@/components/kit";
import { formatNumber, parseNumber } from "@/lib/format";

const tool = getTool("percentage-calculator");

type Mode = "of" | "isWhat" | "increase" | "decrease" | "difference";

const MODES: { id: Mode; label: string; a: string; b: string }[] = [
  { id: "of", label: "What is X% of Y?", a: "Percentage (X)", b: "Value (Y)" },
  { id: "isWhat", label: "X is what percentage of Y?", a: "Value (X)", b: "Total (Y)" },
  { id: "increase", label: "Percentage increase", a: "Original value", b: "New value" },
  { id: "decrease", label: "Percentage decrease", a: "Original value", b: "New value" },
  { id: "difference", label: "Percentage difference", a: "First value", b: "Second value" },
];

const FAQS = [
  {
    q: "What is the difference between percentage change and percentage difference?",
    a: "Percentage change compares a new value against an original one, so the order matters. Percentage difference compares two values against their average, so the order does not matter.",
  },
  {
    q: "Why does the tool refuse a zero original value?",
    a: "A percentage change from zero is mathematically undefined — dividing by zero has no answer — so the tool asks for a non-zero starting value instead of showing Infinity.",
  },
  {
    q: "Can it handle negative numbers?",
    a: "Yes, for the basic modes. Percentage change and difference calculations use the size of the original value, so results stay meaningful.",
  },
  {
    q: "How do I calculate a discount?",
    a: "Use 'What is X% of Y?' with the discount rate and the price to find the amount saved, then subtract it from the price.",
  },
];

export const Route = createFileRoute("/tools/percentage-calculator")({
  head: () =>
    pageHead({
      title: "Percentage Calculator",
      description:
        "Calculate a percentage of a number, what percentage one number is of another, percentage increase, decrease and percentage difference. Free and instant.",
      path: "/tools/percentage-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/percentage-calculator"),
    }),
  component: PercentagePage,
});

function PercentagePage() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const config = MODES.find((m) => m.id === mode)!;
  const numA = parseNumber(a);
  const numB = parseNumber(b);

  let error: string | undefined;
  let result: { label: string; value: string } | null = null;

  const bothEntered = a.trim() !== "" && b.trim() !== "";
  if (bothEntered && (numA === null || numB === null)) {
    error = "Enter valid numbers in both fields.";
  } else if (bothEntered && numA !== null && numB !== null) {
    if (mode === "of") {
      result = { label: `${formatNumber(numA)}% of ${formatNumber(numB)}`, value: formatNumber((numA / 100) * numB, 4) };
    } else if (mode === "isWhat") {
      if (numB === 0) error = "The total cannot be zero.";
      else result = { label: "Percentage", value: `${formatNumber((numA / numB) * 100, 4)}%` };
    } else if (mode === "increase" || mode === "decrease") {
      if (numA === 0) error = "The original value cannot be zero.";
      else {
        const change = ((numB - numA) / Math.abs(numA)) * 100;
        const signed = mode === "increase" ? change : -change;
        result = {
          label: mode === "increase" ? "Percentage increase" : "Percentage decrease",
          value: `${formatNumber(signed, 4)}%`,
        };
      }
    } else {
      const avg = (Math.abs(numA) + Math.abs(numB)) / 2;
      if (avg === 0) error = "Both values cannot be zero.";
      else result = { label: "Percentage difference", value: `${formatNumber((Math.abs(numA - numB) / avg) * 100, 4)}%` };
    }
  }

  return (
    <ToolPage
      tool={tool}
      intro="Five percentage calculations in one place: a percentage of a value, a ratio as a percentage, increases, decreases and percentage difference."
      howItWorks={
        <>
          <p>
            Choose a calculation type, then fill in the two values. The formulas used are: X% of Y is
            (X ÷ 100) × Y; X as a percentage of Y is (X ÷ Y) × 100; percentage change is
            ((new − original) ÷ |original|) × 100; and percentage difference is
            (|A − B| ÷ ((|A| + |B|) ÷ 2)) × 100.
          </p>
          <p>
            Any input that would divide by zero is rejected with a message rather than producing an
            unusable result, so you will never see NaN or Infinity here.
          </p>
        </>
      }
      example={
        <p>
          A shop cuts a KES 12,000 phone by 15%. Using &ldquo;What is X% of Y?&rdquo; with 15 and 12000
          gives <strong>1,800</strong> — so the new price is KES 10,200. Checking with &ldquo;percentage
          decrease&rdquo; from 12,000 to 10,200 returns <strong>15%</strong>.
        </p>
      }
      tips={[
        "A 20% rise followed by a 20% fall does not return you to the starting value — each change applies to a different base.",
        "To add VAT at 16%, multiply by 1.16. To remove VAT from a VAT-inclusive price, divide by 1.16.",
        "Use percentage difference when neither value is the 'original', such as comparing two suppliers' quotes.",
        "For salary comparisons, work with annual figures so allowances paid at different frequencies do not distort the percentage.",
      ]}
      faqs={FAQS}
      related={["salary-calculator", "loan-calculator", "unit-converter"]}
    >
      <Card className="space-y-4">
        <Field label="Calculation type" htmlFor="mode">
          <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={config.a} htmlFor="value-a">
            <TextInput
              id="value-a"
              type="number"
              inputMode="decimal"
              step="any"
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label={config.b} htmlFor="value-b" error={error}>
            <TextInput
              id="value-b"
              type="number"
              inputMode="decimal"
              step="any"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setA("");
            setB("");
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          <p className="text-sm text-muted-foreground">{result ? result.label : "Result"}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{result ? result.value : "—"}</p>
          {result ? (
            <div className="mt-3">
              <CopyButton value={result.value} label="Copy result" />
            </div>
          ) : null}
        </div>
      </Card>
    </ToolPage>
  );
}
