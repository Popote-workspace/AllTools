import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Which finance tools are here?",
    a: "A currency converter with live rates, a mortgage calculator with an amortization schedule, a compound interest projector and a discount and sales tax calculator.",
  },
  {
    q: "Are the results financial advice?",
    a: "No. Every figure is an estimate based on what you enter. Actual lender terms, market returns and taxes differ — confirm with your bank, lender or a qualified adviser.",
  },
  {
    q: "Do you store what I type?",
    a: "No. All calculations run in your browser. Nothing you enter is sent to us or saved.",
  },
];

export const Route = createFileRoute("/finance")({
  head: () =>
    pageHead({
      title: "Free Finance Calculators",
      description:
        "Currency converter with live rates, mortgage and loan schedules, compound interest projections and discount/VAT maths — free, no sign-up.",
      path: "/finance",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="finance"
      title="Free Finance Calculators"
      intro="Money questions answered with clear breakdowns — exchange rates, loan schedules, investment growth and shopping maths."
      body={[
        "These tools cover the everyday money decisions that benefit from a quick, transparent calculation: what a mortgage repayment looks like over twenty years, how savings compound with regular contributions, what an exchange rate really converts to, and what a discount plus sales tax does to a price.",
        "Each calculator shows the assumptions behind its result and clearly labels estimates. They are educational tools, not financial advice — actual lender terms, market returns and taxes differ from any projection.",
      ]}
      faqs={FAQS}
    />
  ),
});
