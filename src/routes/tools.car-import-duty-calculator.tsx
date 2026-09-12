import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, Notice, ResultRow, Select, TextInput } from "@/components/kit";
import { formatCurrency, parseNumber } from "@/lib/format";
import { IMPORT_DUTY_CONFIG as CFG } from "@/config/importDuty";

const tool = getTool("car-import-duty-calculator");

const FAQS = [
  {
    q: "Is this an official KRA assessment?",
    a: "No. KRA values vehicles using its Current Retail Selling Price schedule and its own depreciation table. This tool uses simplified, clearly labelled assumptions.",
  },
  {
    q: "How old can an imported car be?",
    a: `Kenya generally restricts imports to vehicles under ${CFG.maxVehicleAgeYears} years old from the year of first registration. The tool warns you when the age you enter exceeds that.`,
  },
  {
    q: "Why is the final figure so much higher than the car price?",
    a: "Duty, excise and VAT are charged in sequence — excise applies on top of the customs value plus duty, and VAT applies on top of both. The taxes compound.",
  },
  {
    q: "Can I change the rates?",
    a: "Yes. Every rate on this page is editable, and the defaults live in one configuration file so they can be updated when official rates change.",
  },
];

export const Route = createFileRoute("/tools/car-import-duty-calculator")({
  head: () =>
    pageHead({
      title: "Kenya Car Import Duty Calculator",
      description:
        "Estimate customs value, import duty, excise, VAT, levies and total landed cost for importing a vehicle into Kenya. Editable, clearly labelled assumptions.",
      path: "/tools/car-import-duty-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/car-import-duty-calculator"),
    }),
  component: ImportDutyPage,
});

function ImportDutyPage() {
  const [value, setValue] = useState("");
  const [age, setAge] = useState("");
  const [cc, setCc] = useState("");
  const [fuel, setFuel] = useState("petrol");
  const [vehicleType, setVehicleType] = useState("saloon");
  const [other, setOther] = useState("");

  const [dutyRate, setDutyRate] = useState(String(CFG.importDutyRate * 100));
  const [vatRate, setVatRate] = useState(String(CFG.vatRate * 100));

  const v = parseNumber(value);
  const a = age.trim() === "" ? 0 : parseNumber(age);
  const engine = parseNumber(cc);
  const o = other.trim() === "" ? 0 : parseNumber(other);
  const duty = parseNumber(dutyRate);
  const vat = parseNumber(vatRate);

  const isElectric = fuel === "electric";
  const filled = value.trim() !== "" && (isElectric || cc.trim() !== "");

  let error: string | undefined;
  if (filled) {
    if (v === null || a === null || o === null || duty === null || vat === null) {
      error = "Enter valid numbers in every field.";
    } else if (v <= 0) error = "Vehicle value must be greater than zero.";
    else if (a < 0) error = "Vehicle age cannot be negative.";
    else if (!isElectric && (engine === null || engine <= 0)) error = "Enter the engine capacity in cc.";
    else if (o < 0) error = "Other costs cannot be negative.";
    else if (duty < 0 || vat < 0) error = "Rates cannot be negative.";
  }

  let result:
    | {
        customsValue: number;
        importDuty: number;
        excise: number;
        exciseRate: number;
        vat: number;
        levies: { label: string; amount: number }[];
        leviesTotal: number;
        other: number;
        landed: number;
      }
    | null = null;

  if (filled && !error && v !== null && a !== null && o !== null && duty !== null && vat !== null) {
    const depreciation = Math.min(a * CFG.depreciationPerYear, CFG.maxDepreciation);
    const customsValue = v * (1 - depreciation);
    const importDuty = customsValue * (duty / 100);
    const exciseRate = isElectric
      ? CFG.electricExciseRate
      : (CFG.exciseBands.find((b) => (engine ?? 0) <= b.maxCc)?.rate ?? 0.35);
    const excise = (customsValue + importDuty) * exciseRate;
    const vatAmount = (customsValue + importDuty + excise) * (vat / 100);
    const levies = CFG.levies.map((l) => ({ label: l.label, amount: customsValue * l.rate }));
    const leviesTotal = levies.reduce((sum, l) => sum + l.amount, 0);

    result = {
      customsValue,
      importDuty,
      excise,
      exciseRate,
      vat: vatAmount,
      levies,
      leviesTotal,
      other: o,
      landed: customsValue + importDuty + excise + vatAmount + leviesTotal + o,
    };
  }

  const ageWarning = a !== null && a > CFG.maxVehicleAgeYears;

  return (
    <ToolPage
      tool={tool}
      intro="Estimate what it costs to land an imported vehicle in Kenya — customs value, duty, excise, VAT, levies and the total."
      howItWorks={
        <>
          <p>
            The vehicle value is first depreciated by {CFG.depreciationPerYear * 100}% per year of age (up
            to {CFG.maxDepreciation * 100}%) to approximate a customs value. Import duty is charged on that
            value, excise on the value plus duty, and VAT on the value plus duty plus excise — which is why
            the taxes compound so quickly.
          </p>
          <p>
            The Import Declaration Fee and Railway Development Levy are added on the customs value, and
            anything you enter under other costs (shipping, agent fees, registration) is added at the end.
          </p>
          <p>
            Excise depends on engine size, using bands of{" "}
            {CFG.exciseBands.map((b) => `${b.label} at ${b.rate * 100}%`).join(", ")}. Electric vehicles use
            a lower rate of {CFG.electricExciseRate * 100}%.
          </p>
        </>
      }
      example={
        <p>
          A 4-year-old 1800cc petrol saloon valued at KES 1,500,000 depreciates to a customs value of KES
          900,000. Duty at 35% adds KES 315,000, excise at 25% on the running total adds KES 303,750, and
          VAT at 16% adds a further KES 243,000 — before levies, shipping and registration.
        </p>
      }
      tips={[
        "Kenya requires a pre-export inspection certificate and right-hand drive; budget for inspection, shipping and port handling separately.",
        "KRA values vehicles from its own CRSP schedule, not from what you paid — a low invoice will not lower your assessment.",
        "Confirm every rate below against current KRA publications before committing; the defaults here are assumptions, not verified official rates.",
        "Add registration, number plates and clearing agent fees under other costs for a realistic landed figure.",
      ]}
      faqs={FAQS}
      related={["kenya-fuel-cost-calculator", "loan-calculator", "percentage-calculator", "salary-calculator"]}
      disclaimer="This calculator provides an estimate and is not an official customs assessment. The rates below are unverified assumptions that you should confirm with the Kenya Revenue Authority."
      lastUpdated={CFG.lastUpdated}
      sources={CFG.sources}
    >
      <Card className="space-y-4">
        <Notice tone="warning">
          The default rates in this tool are assumptions, not verified official figures. Check them against
          current KRA guidance and edit them below before relying on the result.
        </Notice>

        <Field label="Vehicle value (KES)" htmlFor="value" hint="Purchase or market value before shipping.">
          <TextInput
            id="value"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 1500000"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Vehicle age (years)"
            htmlFor="age"
            hint={ageWarning ? undefined : "Years since first registration."}
            error={ageWarning ? `Vehicles over ${CFG.maxVehicleAgeYears} years old generally cannot be imported.` : undefined}
          >
            <TextInput
              id="age"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 4"
            />
          </Field>
          <Field
            label="Engine capacity (cc)"
            htmlFor="cc"
            hint={isElectric ? "Not needed for electric vehicles." : undefined}
          >
            <TextInput
              id="cc"
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="e.g. 1800"
              disabled={isElectric}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fuel type" htmlFor="fuel">
            <Select id="fuel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
              {CFG.fuelTypes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vehicle type" htmlFor="vehicle-type">
            <Select id="vehicle-type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
              {CFG.vehicleTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Import duty rate (%)" htmlFor="duty-rate" hint="Assumption — editable.">
            <TextInput
              id="duty-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={dutyRate}
              onChange={(e) => setDutyRate(e.target.value)}
            />
          </Field>
          <Field label="VAT rate (%)" htmlFor="vat-rate" hint="Assumption — editable.">
            <TextInput
              id="vat-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Other import costs (KES)"
          htmlFor="other"
          error={error}
          hint="Shipping, inspection, clearing agent, registration."
        >
          <TextInput
            id="other"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="e.g. 250000"
          />
        </Field>

        <Button
          variant="ghost"
          onClick={() => {
            setValue("");
            setAge("");
            setCc("");
            setFuel("petrol");
            setVehicleType("saloon");
            setOther("");
            setDutyRate(String(CFG.importDutyRate * 100));
            setVatRate(String(CFG.vatRate * 100));
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <ResultRow label="Estimated customs value" value={formatCurrency(result.customsValue)} />
              <ResultRow label="Estimated import duty" value={formatCurrency(result.importDuty)} />
              <ResultRow
                label={`Estimated excise (${result.exciseRate * 100}%)`}
                value={formatCurrency(result.excise)}
              />
              <ResultRow label="Estimated VAT" value={formatCurrency(result.vat)} />
              {result.levies.map((l) => (
                <ResultRow key={l.label} label={l.label} value={formatCurrency(l.amount)} />
              ))}
              <ResultRow label="Other charges" value={formatCurrency(result.other)} />
              <ResultRow label="Estimated landed cost" value={formatCurrency(result.landed)} emphasis />
              <div className="mt-3">
                <CopyButton
                  value={`Estimated landed cost ${formatCurrency(result.landed)} (customs value ${formatCurrency(result.customsValue)})`}
                  label="Copy summary"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a vehicle value and engine capacity to see the estimate.
            </p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
