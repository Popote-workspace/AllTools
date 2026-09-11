import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Card } from "@/components/kit";
import { ELECTION } from "@/config/site";

const tool = getTool("election-countdown");

const FAQS = [
  {
    q: "When is the next Kenyan general election?",
    a: "Kenya holds a general election on the second Tuesday of August every five years. Following the 2022 election, that falls on 10 August 2027.",
  },
  {
    q: "Can the date change?",
    a: "Yes. The official date is set by the Independent Electoral and Boundaries Commission and can be affected by legal or constitutional processes. This countdown uses the scheduled date.",
  },
  {
    q: "What time zone does the countdown use?",
    a: "The target is 06:00 East Africa Time on election day, when polling stations open. The countdown itself displays in your device's local time.",
  },
  {
    q: "Does AllTools take a political position?",
    a: "No. This is a neutral date countdown with no commentary, endorsement or affiliation with any party, candidate or institution.",
  },
];

export const Route = createFileRoute("/tools/election-countdown")({
  head: () =>
    pageHead({
      title: "Kenya General Election 2027 Countdown",
      description:
        "Live countdown showing the days, hours, minutes and seconds until the Kenya General Election on 10 August 2027.",
      path: "/tools/election-countdown",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/election-countdown"),
    }),
  component: ElectionPage,
});

function useCountdown(targetIso: string) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) return null;

  const target = new Date(targetIso).getTime();
  if (!Number.isFinite(target)) return null;

  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    passed: false,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-2xl font-extrabold tabular-nums text-primary sm:text-3xl">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function ElectionPage() {
  const countdown = useCountdown(ELECTION.targetIso);

  return (
    <ToolPage
      tool={tool}
      intro={`A live countdown to the Kenya General Election scheduled for ${ELECTION.label}.`}
      howItWorks={
        <>
          <p>
            The countdown compares your device clock against 06:00 East Africa Time on {ELECTION.label},
            the hour polling stations are due to open, and refreshes every second.
          </p>
          <p>
            The target date is stored in a single configuration file, so it can be changed in one place if
            the official date is revised.
          </p>
        </>
      }
      example={
        <p>
          Kenya's general elections follow a five-year cycle held on the second Tuesday of August. The 2022
          election fell on 9 August, which places the next one on <strong>{ELECTION.label}</strong>.
        </p>
      }
      tips={[
        "Voter registration usually runs well before election day — check the IEBC for the current window.",
        "Confirm your registration details and polling station ahead of time rather than on the day.",
        "Election dates are set by the IEBC; treat any date, including this one, as subject to official confirmation.",
      ]}
      faqs={FAQS}
      related={["date-difference-calculator", "age-calculator", "word-counter"]}
      disclaimer="AllTools is not affiliated with the IEBC or any political party and takes no position on any candidate or issue. Official dates are announced by the IEBC."
    >
      <Card>
        <h2 className="text-lg font-bold text-foreground">{ELECTION.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Target date: {ELECTION.label}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
          {countdown ? (
            countdown.passed ? (
              <p className="col-span-full text-base font-semibold text-foreground">
                The target date has passed.
              </p>
            ) : (
              <>
                <Unit value={countdown.days} label="Days" />
                <Unit value={countdown.hours} label="Hours" />
                <Unit value={countdown.minutes} label="Minutes" />
                <Unit value={countdown.seconds} label="Seconds" />
              </>
            )
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">Starting countdown…</p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
