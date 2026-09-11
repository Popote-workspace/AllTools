import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, Select, TextInput } from "@/components/kit";
import { formatCurrency, parseNumber } from "@/lib/format";
import { CONSTRUCTION_CONFIG, type ConstructionQualityId } from "@/config/construction";

const tool = getTool("house-construction-cost-calculator");

const FAQS = [
  {
    q: "Where do the default rates come from?",
    a: "They are editable planning assumptions for typical Kenyan residential builds, not a published price index. Replace them with a quantity surveyor's figure whenever you have one.",
  },
  {
    q: "What does the low and high range mean?",
    a: `The range applies ±${CONSTRUCTION_CONFIG.variance * 100}% to the estimate, reflecting how much real costs move with location, materials and labour.`,
  },
  {
    q: "Does this include land, fees and services?",
    a: "No. The estimate covers construction only. Land, professional fees, approvals, boundary walls, landscaping and connection charges are extra.",
  },
  {
    q: "How do I convert my plans to square metres?",
    a: "Add up the built floor area of every level. If your plans are in square feet, divide by 10.7639.",
  },
];

export const Route = createFileRoute("/tools/house-construction-cost-calculator")({
  head: () =>
    pageHead({
      title: "House Construction Cost Calculator",
      description:
        "Estimate the cost of building a house from floor area and finish quality, with editable cost per square metre and a low-to-high range.",
      path: "/tools/house-construction-cost-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/house-construction-cost-calculator"),
    }),
  component: ConstructionPage,
});

function ConstructionPage() {
  const [size, setSize] = useState("");
  const [quality, setQuality] = useState<ConstructionQualityId>("standard");
  const defaultRate =
    CONSTRUCTION_CONFIG.qualities.find((q) => q.id === quality)?.ratePerSqm ?? 55000;
  const [rate, setRate] = useState(String(defaultRate));

  useEffect(() => {
    const next = CONSTRUCTION_CONFIG.qualities.find((q) => q.id === quality)?.ratePerSqm;
    if (next) setRate(String(next));
  }, [quality]);

  const area = parseNumber(size);
  const ratePerSqm = parseNumber(rate);

  let error: string | undefined;
  if (size.trim() !== "" && area === null) error = "Enter a valid floor area.";
  else if (area !== null && area <= 0) error = "Floor area must be greater than zero.";
  else if (area !== null && area > 100000) error = "That floor area looks too large — check the figure.";
  else if (ratePerSqm === null || ratePerSqm <= 0) error = "Enter a cost per square metre above zero.";

  const ready = size.trim() !== "" && !error && area !== null && ratePerSqm !== null;
  const estimate = ready ? area * ratePerSqm : null;
  const low = estimate === null ? null : estimate * (1 - CONSTRUCTION_CONFIG.variance);
  const high = estimate === null ? null : estimate * (1 + CONSTRUCTION_CONFIG.variance);

  const qualityNote = CONSTRUCTION_CONFIG.qualities.find((q) => q.id === quality)?.note;

  return (
    <ToolPage
      tool={tool}
      intro="Get a ballpark construction budget from your floor area and finish level, then refine it with your own cost per square metre."
      howItWorks={
        <>
          <p>
            The estimate is floor area multiplied by a cost per square metre. Choosing a quality level loads
            a default rate, which you can then overwrite with a figure from your contractor or quantity
            surveyor — that is almost always the more accurate number.
          </p>
          <p>
            A low and high figure is shown at ±{CONSTRUCTION_CONFIG.variance * 100}% of the estimate,
            because real building costs vary widely between counties, sites and seasons.
          </p>
        </>
      }
      example={
        <p>
          A 120 m² bungalow at a standard finish rate of KES 55,000 per square metre estimates at{" "}
          <strong>KES 6,600,000</strong>, with a range of roughly KES 5.28M to KES 7.92M once variation is
          allowed for.
        </p>
      }
      tips={[
        "Get at least three contractor quotes and compare them against this estimate rather than replacing it.",
        "Foundations on sloping or black-cotton soil can add substantially to cost and are not reflected in a simple per-square-metre rate.",
        "Budget separately for professional fees, county approvals, a perimeter wall, water and power connections.",
        "Keep a contingency of at least 10% — material prices move during a build.",
      ]}
      faqs={FAQS}
      related={["acre-hectare-converter", "loan-calculator", "unit-converter", "percentage-calculator"]}
      disclaimer="Actual construction costs vary by location, materials, labour, ground conditions and design. This is a planning estimate only, not a quotation."
      lastUpdated={CONSTRUCTION_CONFIG.lastUpdated}
    >
      <Card className="space-y-4">
        <Field label="House size (square metres)" htmlFor="size">
          <TextInput
            id="size"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g. 120"
          />
        </Field>

        <Field label="Construction quality" htmlFor="quality" hint={qualityNote}>
          <Select
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value as ConstructionQualityId)}
          >
            {CONSTRUCTION_CONFIG.qualities.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Cost per square metre (KES)"
          htmlFor="rate"
          error={error}
          hint="Editable — replace with your own quoted rate for a better estimate."
        >
          <TextInput
            id="rate"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>

        <Button
          variant="ghost"
          onClick={() => {
            setSize("");
            setQuality("standard");
            setRate(String(CONSTRUCTION_CONFIG.qualities[1]?.ratePerSqm ?? 55000));
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {estimate !== null && low !== null && high !== null ? (
            <>
              <ResultRow label="Estimated cost" value={formatCurrency(estimate)} emphasis />
              <ResultRow label="Low estimate" value={formatCurrency(low)} />
              <ResultRow label="High estimate" value={formatCurrency(high)} />
              <div className="mt-3">
                <CopyButton
                  value={`Estimated ${formatCurrency(estimate)} (range ${formatCurrency(low)} – ${formatCurrency(high)})`}
                  label="Copy estimate"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Enter a floor area to see the estimate.</p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
