import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, TextInput } from "@/components/kit";
import { formatNumber, parseNumber } from "@/lib/format";

const ACRE_TO_HECTARE = 0.40468564224;
const tool = getTool("acre-hectare-converter");

const FAQS = [
  { q: "How many hectares is one acre?", a: "One acre equals exactly 0.40468564224 hectares." },
  { q: "How many acres is one hectare?", a: "One hectare equals approximately 2.4710538147 acres." },
  {
    q: "How big is an acre in square metres?",
    a: "An acre is about 4,046.86 square metres. A hectare is exactly 10,000 square metres.",
  },
  {
    q: "Which unit is used on Kenyan title deeds?",
    a: "Official land records generally use hectares, while agents and sellers often quote acres. Converting between the two is the usual reason people use this tool.",
  },
];

export const Route = createFileRoute("/tools/acre-hectare-converter")({
  head: () =>
    pageHead({
      title: "Acre to Hectare Converter",
      description:
        "Convert acres to hectares and hectares to acres instantly using the exact factor of 0.40468564224. Free, accurate and mobile friendly.",
      path: "/tools/acre-hectare-converter",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/acre-hectare-converter"),
    }),
  component: AcreHectarePage,
});

function AcreHectarePage() {
  const [value, setValue] = useState("");
  const [fromAcres, setFromAcres] = useState(true);

  const parsed = parseNumber(value);
  const error =
    value.trim() === ""
      ? undefined
      : parsed === null
        ? "Enter a valid number."
        : parsed < 0
          ? "Land area cannot be negative."
          : undefined;

  const valid = parsed !== null && parsed >= 0;
  const result = valid ? (fromAcres ? parsed * ACRE_TO_HECTARE : parsed / ACRE_TO_HECTARE) : null;

  const fromLabel = fromAcres ? "Acres" : "Hectares";
  const toLabel = fromAcres ? "Hectares" : "Acres";
  const resultText = result === null ? "" : `${formatNumber(result, 6)} ${toLabel.toLowerCase()}`;

  return (
    <ToolPage
      tool={tool}
      intro="Convert land size between acres and hectares using the exact international conversion factor, in either direction."
      howItWorks={
        <>
          <p>
            One acre is defined as exactly 0.40468564224 hectares. To go from acres to hectares the tool
            multiplies by that factor; to go the other way it divides by it. Nothing is rounded internally —
            only the displayed answer is shortened to six decimal places.
          </p>
          <p>
            Use the swap button to flip the direction without retyping your figure. The copy button puts the
            full result on your clipboard.
          </p>
        </>
      }
      example={
        <p>
          A 2.5 acre plot: 2.5 × 0.40468564224 = <strong>1.011714 hectares</strong>. Going the other way, a
          0.8 hectare parcel is 0.8 ÷ 0.40468564224 = <strong>1.976843 acres</strong>.
        </p>
      }
      tips={[
        "Land agents in Kenya usually quote acres, while title documents and survey maps use hectares — check which unit a listing means before comparing prices.",
        "An eighth of an acre, the common Kenyan plot size, is 0.050586 hectares or about 506 square metres.",
        "For very small parcels it is often clearer to work in square metres: multiply hectares by 10,000.",
        "Always confirm the surveyed area on the title deed rather than relying on an advertised figure.",
      ]}
      faqs={FAQS}
      related={["unit-converter", "house-construction-cost-calculator", "percentage-calculator"]}
    >
      <Card className="space-y-4">
        <Field
          label={fromLabel}
          htmlFor="area-input"
          error={error}
          hint={`Enter a value in ${fromLabel.toLowerCase()}.`}
        >
          <TextInput
            id="area-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 2.5"
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setFromAcres((v) => !v)}>
            <ArrowLeftRight className="size-4" aria-hidden />
            Swap to {toLabel.toLowerCase()} → {fromLabel.toLowerCase()}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setValue("");
              setFromAcres(true);
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          <p className="text-sm text-muted-foreground">{toLabel}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {result === null ? "—" : formatNumber(result, 6)}
          </p>
          {result !== null ? (
            <div className="mt-3">
              <CopyButton value={resultText} label="Copy result" />
            </div>
          ) : null}
        </div>
      </Card>
    </ToolPage>
  );
}
