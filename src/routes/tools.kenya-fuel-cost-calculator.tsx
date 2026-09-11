import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, Select, TextInput } from "@/components/kit";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/format";

const tool = getTool("kenya-fuel-cost-calculator");

const FAQS = [
  {
    q: "Why do I have to enter the fuel price myself?",
    a: "Kenyan pump prices are reviewed monthly by EPRA and differ by town. Hard-coding a price would go stale immediately, so the tool asks for the price you actually pay.",
  },
  {
    q: "What consumption figure should I use?",
    a: "Use litres per 100 km from your own records if you have them. Manufacturer figures are usually optimistic, especially in city traffic.",
  },
  {
    q: "How do I convert km per litre to litres per 100 km?",
    a: "Divide 100 by your km per litre. A car doing 12.5 km/l uses 8 litres per 100 km.",
  },
  {
    q: "Does it account for traffic or load?",
    a: "No. Heavy traffic, a full load, roof racks and hilly routes all raise consumption — add a margin for those.",
  },
];

export const Route = createFileRoute("/tools/kenya-fuel-cost-calculator")({
  head: () =>
    pageHead({
      title: "Kenya Fuel Cost Calculator",
      description:
        "Work out litres needed, total fuel cost and cost per kilometre for any trip, using the fuel price you actually pay at the pump.",
      path: "/tools/kenya-fuel-cost-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/kenya-fuel-cost-calculator"),
    }),
  component: FuelPage,
});

function FuelPage() {
  const [distance, setDistance] = useState("");
  const [consumption, setConsumption] = useState("");
  const [price, setPrice] = useState("");
  const [trip, setTrip] = useState<"one-way" | "round">("one-way");

  const d = parseNumber(distance);
  const c = parseNumber(consumption);
  const p = parseNumber(price);

  const filled = distance.trim() !== "" && consumption.trim() !== "" && price.trim() !== "";
  let error: string | undefined;
  if (filled) {
    if (d === null || c === null || p === null) error = "Enter valid numbers in all three fields.";
    else if (d <= 0) error = "Distance must be greater than zero.";
    else if (c <= 0) error = "Fuel consumption must be greater than zero.";
    else if (p <= 0) error = "Fuel price must be greater than zero.";
  }

  let result: { totalDistance: number; litres: number; cost: number; perKm: number } | null = null;
  if (filled && !error && d !== null && c !== null && p !== null) {
    const totalDistance = trip === "round" ? d * 2 : d;
    const litres = (totalDistance / 100) * c;
    const cost = litres * p;
    result = { totalDistance, litres, cost, perKm: cost / totalDistance };
  }

  return (
    <ToolPage
      tool={tool}
      intro="Plan a journey budget: how many litres you will burn, what the fuel will cost, and what that works out to per kilometre."
      howItWorks={
        <>
          <p>
            Litres needed is distance ÷ 100 × your consumption in litres per 100 km. Multiplying that by the
            pump price gives the trip cost, and dividing the cost by the distance gives cost per kilometre —
            the figure to use when charging mileage or comparing two vehicles.
          </p>
          <p>
            Choosing round trip doubles the distance before anything else is calculated.
          </p>
        </>
      }
      example={
        <p>
          Nairobi to Nakuru is about 160 km. A car using 8 litres per 100 km on a round trip needs{" "}
          <strong>25.6 litres</strong>. At a pump price of KES 180 per litre that is about{" "}
          <strong>KES 4,608</strong>, or roughly KES 14.40 per kilometre.
        </p>
      }
      tips={[
        "Fill your tank, note the odometer, then refill after a few hundred kilometres — that gives your real consumption rather than the brochure figure.",
        "Check the EPRA maximum pump price for your town at the start of each month and update the price you enter here.",
        "Highway driving at a steady speed usually beats the manufacturer figure; Nairobi traffic usually does not.",
        "Tyre pressure, a clogged air filter and unnecessary weight each cost a few percent in fuel.",
      ]}
      faqs={FAQS}
      related={["car-import-duty-calculator", "unit-converter", "percentage-calculator", "salary-calculator"]}
      disclaimer="Fuel prices in Kenya change monthly and vary by town. Enter the price you actually pay — no price is assumed or supplied by this tool."
    >
      <Card className="space-y-4">
        <Field label="Distance (km, one way)" htmlFor="distance">
          <TextInput
            id="distance"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g. 160"
          />
        </Field>
        <Field
          label="Fuel consumption (litres per 100 km)"
          htmlFor="consumption"
          hint="Divide 100 by your km per litre if that is what you know."
        >
          <TextInput
            id="consumption"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            placeholder="e.g. 8"
          />
        </Field>
        <Field label="Fuel price per litre (KES)" htmlFor="price" error={error}>
          <TextInput
            id="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 180"
          />
        </Field>
        <Field label="Trip type" htmlFor="trip">
          <Select id="trip" value={trip} onChange={(e) => setTrip(e.target.value as "one-way" | "round")}>
            <option value="one-way">One-way</option>
            <option value="round">Round trip</option>
          </Select>
        </Field>

        <Button
          variant="ghost"
          onClick={() => {
            setDistance("");
            setConsumption("");
            setPrice("");
            setTrip("one-way");
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <ResultRow label="Total distance" value={`${formatNumber(result.totalDistance)} km`} />
              <ResultRow label="Litres required" value={`${formatNumber(result.litres, 2)} L`} />
              <ResultRow label="Estimated fuel cost" value={formatCurrency(result.cost)} emphasis />
              <ResultRow label="Cost per kilometre" value={formatCurrency(result.perKm, "KES", 2)} />
              <div className="mt-3">
                <CopyButton
                  value={`${formatNumber(result.litres, 2)} L, ${formatCurrency(result.cost)} for ${formatNumber(result.totalDistance)} km`}
                  label="Copy summary"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter distance, consumption and fuel price to see the cost.
            </p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
