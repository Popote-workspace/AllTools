import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, TextInput } from "@/components/kit";
import { formatNumber } from "@/lib/format";

const tool = getTool("age-calculator");

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const FAQS = [
  {
    q: "How is age calculated?",
    a: "The tool counts complete years first, then complete months, then the remaining days — the same way age is stated in everyday life and on official forms.",
  },
  {
    q: "Does it handle leap years?",
    a: "Yes. Calendar arithmetic uses real month lengths, so 29 February birthdays and leap years are handled correctly.",
  },
  {
    q: "Can I calculate age on a past or future date?",
    a: "Yes. The target date defaults to today but can be set to any date after the date of birth.",
  },
  {
    q: "Is my date of birth stored?",
    a: "No. The calculation happens in your browser and nothing is saved or sent anywhere.",
  },
];

export const Route = createFileRoute("/tools/age-calculator")({
  head: () =>
    pageHead({
      title: "Age Calculator",
      description:
        "Calculate exact age in years, months and days from a date of birth, plus how long until the next birthday. Free and instant.",
      path: "/tools/age-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/age-calculator"),
    }),
  component: AgePage,
});

function AgePage() {
  const [dob, setDob] = useState("");
  const [target, setTarget] = useState(todayIso());

  const birth = parseDate(dob);
  const to = parseDate(target);

  let error: string | undefined;
  if (dob && !birth) error = "Enter a valid date of birth.";
  else if (target && !to) error = "Enter a valid target date.";
  else if (birth && to && birth > to) error = "The date of birth must be before the target date.";

  let result: { years: number; months: number; days: number; totalDays: number; nextBirthday: string; daysToBirthday: number } | null =
    null;

  if (birth && to && !error) {
    let years = to.getFullYear() - birth.getFullYear();
    let months = to.getMonth() - birth.getMonth();
    let days = to.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((to.getTime() - birth.getTime()) / 86400000);

    let next = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
    if (next.getTime() <= to.getTime()) {
      next = new Date(to.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysToBirthday = Math.ceil((next.getTime() - to.getTime()) / 86400000);

    result = {
      years,
      months,
      days,
      totalDays,
      nextBirthday: next.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }),
      daysToBirthday,
    };
  }

  const copyText = result
    ? `${result.years} years, ${result.months} months, ${result.days} days`
    : "";

  return (
    <ToolPage
      tool={tool}
      intro="Work out an exact age in years, months and days on any date, and see how many days remain until the next birthday."
      howItWorks={
        <>
          <p>
            Enter a date of birth and a target date. The tool subtracts the two calendar dates piece by
            piece: complete years first, then complete months, then leftover days, borrowing from the
            previous month when the day-of-month has not yet been reached.
          </p>
          <p>
            The target date defaults to today, so leaving it alone gives current age. Setting it to a future
            date answers questions like &ldquo;how old will I be when the contract ends?&rdquo;
          </p>
        </>
      }
      example={
        <p>
          Someone born on 14 March 1998, measured on 8 September 2026, is{" "}
          <strong>28 years, 5 months and 25 days</strong> old, with their next birthday on 14 March 2027.
        </p>
      }
      tips={[
        "Many application forms ask for age as at a specific closing date — set that as the target date rather than using today.",
        "The total days figure is useful for visa, probation and notice-period calculations.",
        "For a gap between two arbitrary dates rather than an age, the Date Difference Calculator gives weeks and business days too.",
        "Double-check the year when typing a date of birth; a mistyped century is the most common source of an odd result.",
      ]}
      faqs={FAQS}
      related={["date-difference-calculator", "election-countdown", "percentage-calculator"]}
    >
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="dob">
            <TextInput id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </Field>
          <Field label="Target date" htmlFor="target" error={error} hint="Defaults to today.">
            <TextInput id="target" type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setDob("");
            setTarget(todayIso());
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {result.years} years, {result.months} months, {result.days} days
              </p>
              <div className="mt-3">
                <ResultRow label="Total days lived" value={formatNumber(result.totalDays)} />
                <ResultRow label="Next birthday" value={result.nextBirthday} />
                <ResultRow label="Days until next birthday" value={formatNumber(result.daysToBirthday)} />
              </div>
              <div className="mt-3">
                <CopyButton value={copyText} label="Copy age" />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Enter a date of birth to see the result.</p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
