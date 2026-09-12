import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, Select, TextInput } from "@/components/kit";
import { formatNumber, parseNumber } from "@/lib/format";

const tool = getTool("unit-converter");

type Unit = { id: string; label: string; factor: number };
type Category = { id: string; label: string; units: Unit[] };

/** Every factor converts the unit to the category's base unit. */
const CATEGORIES: Category[] = [
  {
    id: "length",
    label: "Length",
    units: [
      { id: "mm", label: "Millimetres (mm)", factor: 0.001 },
      { id: "cm", label: "Centimetres (cm)", factor: 0.01 },
      { id: "m", label: "Metres (m)", factor: 1 },
      { id: "km", label: "Kilometres (km)", factor: 1000 },
      { id: "in", label: "Inches (in)", factor: 0.0254 },
      { id: "ft", label: "Feet (ft)", factor: 0.3048 },
      { id: "yd", label: "Yards (yd)", factor: 0.9144 },
      { id: "mi", label: "Miles (mi)", factor: 1609.344 },
      { id: "nmi", label: "Nautical miles", factor: 1852 },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    units: [
      { id: "mg", label: "Milligrams (mg)", factor: 0.000001 },
      { id: "g", label: "Grams (g)", factor: 0.001 },
      { id: "kg", label: "Kilograms (kg)", factor: 1 },
      { id: "t", label: "Tonnes (t)", factor: 1000 },
      { id: "oz", label: "Ounces (oz)", factor: 0.028349523125 },
      { id: "lb", label: "Pounds (lb)", factor: 0.45359237 },
      { id: "st", label: "Stones (st)", factor: 6.35029318 },
    ],
  },
  {
    id: "area",
    label: "Area",
    units: [
      { id: "sqm", label: "Square metres (m²)", factor: 1 },
      { id: "sqkm", label: "Square kilometres (km²)", factor: 1000000 },
      { id: "sqft", label: "Square feet (ft²)", factor: 0.09290304 },
      { id: "acre", label: "Acres", factor: 4046.8564224 },
      { id: "ha", label: "Hectares", factor: 10000 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    units: [
      { id: "ml", label: "Millilitres (ml)", factor: 0.001 },
      { id: "l", label: "Litres (l)", factor: 1 },
      { id: "m3", label: "Cubic metres (m³)", factor: 1000 },
      { id: "gal", label: "US gallons", factor: 3.785411784 },
      { id: "impgal", label: "Imperial gallons", factor: 4.54609 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    units: [
      { id: "kmh", label: "Kilometres per hour (km/h)", factor: 1 },
      { id: "ms", label: "Metres per second (m/s)", factor: 3.6 },
      { id: "mph", label: "Miles per hour (mph)", factor: 1.609344 },
      { id: "kn", label: "Knots", factor: 1.852 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius (°C)", factor: 1 },
      { id: "f", label: "Fahrenheit (°F)", factor: 1 },
      { id: "k", label: "Kelvin (K)", factor: 1 },
    ],
  },
];

function convertTemperature(value: number, from: string, to: string): number {
  const celsius = from === "c" ? value : from === "f" ? ((value - 32) * 5) / 9 : value - 273.15;
  if (to === "c") return celsius;
  if (to === "f") return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

const FAQS = [
  {
    q: "Are the conversions exact?",
    a: "Yes. Every factor is the internationally defined value — an inch is exactly 0.0254 m and a pound exactly 0.45359237 kg — so results are limited only by rounding for display.",
  },
  {
    q: "Why is temperature handled differently?",
    a: "Temperature scales have different zero points, so they need an offset as well as a ratio. The tool applies the proper Celsius, Fahrenheit and Kelvin formulas.",
  },
  {
    q: "US or imperial gallons?",
    a: "Both are listed separately — an imperial gallon is about 20% larger than a US gallon, so mixing them up matters.",
  },
  {
    q: "Can I convert land measurements?",
    a: "Yes, acres and hectares are in the Area category. For land work specifically, the Acre to Hectare Converter adds the context you need.",
  },
];

export const Route = createFileRoute("/tools/unit-converter")({
  head: () =>
    pageHead({
      title: "Unit Converter",
      description:
        "Convert length, weight, area, volume, speed and temperature between metric and imperial units instantly, using exact standard conversion factors.",
      path: "/tools/unit-converter",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/unit-converter"),
    }),
  component: UnitConverterPage,
});

function UnitConverterPage() {
  const [categoryId, setCategoryId] = useState("length");
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0]!;
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [value, setValue] = useState("");

  function changeCategory(id: string) {
    const next = CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]!;
    setCategoryId(id);
    setFrom(next.units[0]!.id);
    setTo(next.units[1]!.id);
  }

  const amount = parseNumber(value);
  const filled = value.trim() !== "";
  const error = filled && amount === null ? "Enter a valid number." : undefined;

  const fromUnit = category.units.find((u) => u.id === from) ?? category.units[0]!;
  const toUnit = category.units.find((u) => u.id === to) ?? category.units[1]!;

  let result: number | null = null;
  if (filled && amount !== null) {
    result =
      category.id === "temperature"
        ? convertTemperature(amount, fromUnit.id, toUnit.id)
        : (amount * fromUnit.factor) / toUnit.factor;
    if (!Number.isFinite(result)) result = null;
  }

  return (
    <ToolPage
      tool={tool}
      intro="Convert between metric and imperial units for length, weight, area, volume, speed and temperature."
      howItWorks={
        <>
          <p>
            Each unit is defined by its exact relationship to a base unit — metres for length, kilograms for
            weight, square metres for area, litres for volume and km/h for speed. Your value is converted to
            that base and then out to the target unit, so no accuracy is lost by chaining conversions.
          </p>
          <p>
            Temperature works differently because its scales have different zero points, so Celsius,
            Fahrenheit and Kelvin use their proper formulas rather than a simple multiplier.
          </p>
        </>
      }
      example={
        <p>
          Converting 100 km/h to miles per hour gives <strong>62.14 mph</strong>; converting 25°C to
          Fahrenheit gives <strong>77°F</strong>.
        </p>
      }
      tips={[
        "Switching category resets the units so you never convert kilograms into metres by accident.",
        "Use the swap button to reverse a conversion without retyping the value.",
        "For fuel economy, convert litres and kilometres first, then use the Fuel Cost Calculator.",
        "Land sizes in title deeds are often in acres — convert to hectares or square metres for planning applications.",
      ]}
      faqs={FAQS}
      related={["acre-hectare-converter", "kenya-fuel-cost-calculator", "percentage-calculator"]}
    >
      <Card className="space-y-4">
        <Field label="Category" htmlFor="category">
          <Select id="category" value={categoryId} onChange={(e) => changeCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Value" htmlFor="value" error={error}>
          <TextInput
            id="value"
            type="number"
            inputMode="decimal"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 100"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From" htmlFor="from">
            <Select id="from" value={fromUnit.id} onChange={(e) => setFrom(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="To" htmlFor="to">
            <Select id="to" value={toUnit.id} onChange={(e) => setTo(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setFrom(toUnit.id);
              setTo(fromUnit.id);
            }}
          >
            <ArrowLeftRight className="size-4" aria-hidden />
            Swap units
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setValue("");
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result !== null && amount !== null ? (
            <>
              <ResultRow
                label={`${formatNumber(amount, 4)} ${fromUnit.label} =`}
                value={`${formatNumber(result, 6)}`}
                emphasis
              />
              <ResultRow label="Target unit" value={toUnit.label} />
              <div className="mt-3">
                <CopyButton
                  value={`${formatNumber(amount, 4)} ${fromUnit.label} = ${formatNumber(result, 6)} ${toUnit.label}`}
                  label="Copy result"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Enter a value to convert.</p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
