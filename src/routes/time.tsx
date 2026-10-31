import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Is daylight saving time handled correctly?",
    a: "Yes. The time zone tools use your browser's built-in time zone database with the official IANA identifiers, so historic and scheduled daylight-saving changes are applied automatically.",
  },
  {
    q: "Where do the public holidays come from?",
    a: "From Nager.Date, a free and open holiday data source covering over 100 countries. Holiday names and dates are shown as published there — they are never invented locally.",
  },
  {
    q: "Are my calendar events private?",
    a: "Yes. Events you add to the calendar are stored only in your own browser. They never reach a server, and you can clear them at any time.",
  },
];

export const Route = createFileRoute("/time")({
  head: () =>
    pageHead({
      title: "Time Zone, Clock & Calendar Tools",
      description:
        "Convert times between world cities, watch a live world clock, plan events on a private calendar, browse public holidays and focus with a Pomodoro timer.",
      path: "/time",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="time"
      title="Time Zone, Clock & Calendar Tools"
      intro="Convert a meeting time across the world, check a city's current time, plan your month and browse public holidays."
      body={[
        "Time questions look simple until daylight saving, week numbers or another country's holiday calendar get involved. These tools lean on your browser's own time zone database — the same data operating systems use — so conversions stay correct across daylight-saving changes.",
        "Personal plans stay personal: events you add to the calendar are kept in your browser only. Public data, such as holiday calendars, comes from the open Nager.Date source with its name shown on the page.",
      ]}
      faqs={FAQS}
    />
  ),
});
