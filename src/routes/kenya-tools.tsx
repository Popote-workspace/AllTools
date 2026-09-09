import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Are these official Kenyan government calculators?",
    a: "No. AllTools is an independent site. The Kenyan tools use published rates and clearly labelled assumptions to produce estimates, and every rate can be reviewed on the tool page.",
  },
  {
    q: "How often are the rates updated?",
    a: "Each tool shows a Last updated date. Tax and duty parameters are kept in a single configuration file so they can be refreshed quickly when rates change.",
  },
  {
    q: "Can I change the assumptions myself?",
    a: "Yes, where it matters. The construction cost, fuel price and import duty tools let you type in your own figures instead of relying on the defaults.",
  },
];

export const Route = createFileRoute("/kenya-tools")({
  head: () =>
    pageHead({
      title: "Kenya Tools & Calculators",
      description:
        "Kenya-focused calculators: PAYE and net salary, car import duty, construction cost, fuel cost, acre to hectare and the 2027 election countdown.",
      path: "/kenya-tools",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="kenya"
      title="Kenya Tools & Calculators"
      intro="Calculators built around Kenyan salaries, land, vehicles and fuel — with the rates and assumptions written out in the open."
      body={[
        "Most general calculators do not account for SHIF, NSSF, the affordable housing levy, land quoted in acres, or the layered duties charged on an imported vehicle. These tools do, and each one names the figures it used so you can check them.",
        "None of these tools are official. They are planning aids: use them to get an idea of the numbers, then confirm with the Kenya Revenue Authority, a licensed agent, or a qualified professional before committing money.",
      ]}
      faqs={FAQS}
    />
  ),
});
