import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, ResultRow, TextInput } from "@/components/kit";
import { formatNumber } from "@/lib/format";

const tool = getTool("date-difference-calculator");

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const FAQS = [
  {
    q: "Are both dates included in the count?",
    a: "No. The result is the number of days between the two dates, so 1 January to 2 January is one day. Add one if your deadline counts both endpoints.",
  },
  {
    q: "How are business days counted?",
    a: "Every day from the start date up to the end date is checked, and Saturdays and Sundays are excluded. Public holidays are not deducted.",
  },
  {
    q: "Why are months and years approximate?",
    a: "Months have different lengths, so any conversion from days to months uses an average of 30.44 days. For exact calendar ages, use the Age Calculator.",
  },
  {
    q: "Can the end date be before the start date?",
    a: "The tool asks you to put them in order rather than returning a negative result that is easy to misread.",
  },
];

export const Route = createFileRoute("/tools/date-difference-calculator")({
  head: () =>
    pageHead({
      title: "Date Difference Calculator",
      description:
        "Count the days, weeks, months, years and business days between two dates, with weekends included or excluded. Free and instant.",
      path: "/tools/date-difference-calculator",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/date-difference-calculator"),
    }),
  component: DateDiffPage,
});

function DateDiffPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [excludeWeekends, setExcludeWeekends] = useState(false);

  const s = parseDate(start);
  const e = parseDate(end);

  let error: string | undefined;
  if (start && !s) error = "Enter a valid start date.";
  else if (end && !e) error = "Enter a valid end date.";
  else if (s && e && s > e) error = "The end date must be on or after the start date.";

  let result: { days: number; weeks: number; months: number; years: number; businessDays: number } | null =
    null;

  if (s && e && !error) {
    const days = Math.round((e.getTime() - s.getTime()) / 86400000);

    let businessDays = 0;
    if (days <= 40000) {
      const cursor = new Date(s.getTime());
      for (let i = 0; i < days; i += 1) {
        cursor.setDate(cursor.getDate() + 1);
        const dow = cursor.getDay();
        if (dow !== 0 && dow !== 6) businessDays += 1;
      }
    }

    result = {
      days,
      weeks: days / 7,
      months: days / 30.436875,
      years: days / 365.2425,
      businessDays,
    };
  }

  const displayedDays = result ? (excludeWeekends ? result.businessDays : result.days) : 0;

  return (
    <ToolPage
      tool={tool}
      intro="Find out exactly how many days, weeks, months and business days sit between two dates."
      howItWorks={
        <>
          <p>
            The gap in days is the difference between the two calendar dates, not counting the start date
            itself. Weeks, months and years are derived from that figure using average lengths — 7 days,
            30.44 days and 365.2425 days respectively — which is why they are labelled approximate.
          </p>
          <p>
            Business days are counted by stepping through every date in the range and skipping Saturdays and
            Sundays. Public holidays are not deducted, so subtract those separately if your deadline depends
            on them.
          </p>
        </>
      }
      example={
        <p>
          From 1 September 2026 to 31 December 2026 is <strong>121 days</strong>, about 17.3 weeks or 4
          months, and <strong>87 business days</strong> once weekends are removed.
        </p>
      }
      tips={[
        "Contract notice periods are usually calendar days unless the contract says working days — check which applies before relying on the business-day figure.",
        "Add one day if your count needs to include both the first and last day, such as a hotel stay or a leave request.",
        "Kenyan public holidays are not deducted from the business-day total; subtract them manually.",
        "For a person's age in exact years and months, the Age Calculator is the better tool.",
      ]}
      faqs={FAQS}
      related={["age-calculator", "election-countdown", "loan-calculator", "word-counter"]}
    >
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="start">
            <TextInput id="start" type="date" value={start} onChange={(ev) => setStart(ev.target.value)} />
          </Field>
          <Field label="End date" htmlFor="end" error={error}>
            <TextInput id="end" type="date" value={end} onChange={(ev) => setEnd(ev.target.value)} />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="weekends"
            type="checkbox"
            checked={excludeWeekends}
            onChange={(ev) => setExcludeWeekends(ev.target.checked)}
            className="size-5 rounded border-input accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <label htmlFor="weekends" className="text-sm font-medium text-foreground">
            Exclude weekends from the headline figure
          </label>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setStart("");
            setEnd("");
            setExcludeWeekends(false);
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {result ? (
            <>
              <ResultRow
                label={excludeWeekends ? "Business days" : "Days"}
                value={formatNumber(displayedDays)}
                emphasis
              />
              <ResultRow label="Total days" value={formatNumber(result.days)} />
              <ResultRow label="Weeks" value={formatNumber(result.weeks, 2)} />
              <ResultRow label="Approximate months" value={formatNumber(result.months, 2)} />
              <ResultRow label="Approximate years" value={formatNumber(result.years, 2)} />
              <ResultRow label="Business days (Mon–Fri)" value={formatNumber(result.businessDays)} />
              <div className="mt-3">
                <CopyButton
                  value={`${formatNumber(result.days)} days (${formatNumber(result.businessDays)} business days)`}
                  label="Copy result"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Choose a start and end date to see the gap.</p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
