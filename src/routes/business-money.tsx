import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";
import { pageHead, faqJsonLd } from "@/lib/seo";

const FAQS = [
  {
    q: "Do these tools send business details anywhere?",
    a: "No. Documents and calculations run in your browser. The roster and expense tracker are saved only in browser storage on this device.",
  },
  {
    q: "Can these tools replace accounting or payroll software?",
    a: "No. They provide focused estimates, templates and simple records. Confirm tax, payroll, bookkeeping and legal requirements for your location with a qualified professional.",
  },
  {
    q: "Are the estimates financial advice?",
    a: "No. Results use the values and assumptions you enter and are for planning only; actual fees, taxes, contracts and market conditions may differ.",
  },
];

export const Route = createFileRoute("/business-money")({
  head: () =>
    pageHead({
      title: "Free Business & Money Tools",
      description:
        "Create invoices, quotations and receipts, plan business pricing, calculate meeting and stock costs, and organize team expenses with free browser-based tools.",
      path: "/business-money",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="business-money"
      title="Business & Money Tools"
      intro="Practical templates and calculators for pricing, payments, stock, schedules and everyday business decisions."
      body={[
        "Build a customer-facing invoice, quotation, receipt or delivery note from reusable details, then print it or download a PDF created on your device. Document values are not sent to a third-party service.",
        "Use the calculators to compare margin and markup, plan break-even targets, estimate a freelance rate, review commissions, set stock reorder points, prorate a salary or understand the cost of recurring meetings. Every result shows the assumptions behind it.",
        "The shift scheduler and expense tracker keep their records in this browser only. Clearing browser data can remove those records, so export a CSV backup when you need one. These tools are not substitutes for accounting, payroll, legal or financial advice.",
      ]}
      faqs={FAQS}
    />
  ),
});