import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Which calculator should I use for my payslip?",
    a: "Use the Kenya PAYE Calculator for a statutory breakdown including SHIF, NSSF and the housing levy. Use the Salary Calculator when you already know your total deductions.",
  },
  {
    q: "Are the results accurate?",
    a: "The arithmetic is exact, but any calculator that relies on rates or cost assumptions gives an estimate. Each tool shows what assumptions it used.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Every calculator runs in your browser with no download and no account.",
  },
];

export const Route = createFileRoute("/calculators")({
  head: () =>
    pageHead({
      title: "Free Online Calculators",
      description:
        "Free calculators for salary, PAYE, loans, percentages, dates, fuel cost and construction cost. Fast, mobile friendly and no sign-up.",
      path: "/calculators",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="calculators"
      title="Free Online Calculators"
      intro="Money, dates and everyday maths worked out in a few taps — with clear breakdowns instead of a single unexplained number."
      body={[
        "These calculators cover the questions that come up most often: how much of a salary actually reaches your bank account, what a loan really costs over its full term, how a percentage change works out, and how many days sit between two dates.",
        "Each tool validates what you type, so an empty box or an impossible value produces a plain-English message rather than a broken result. Where a calculation depends on published rates or cost assumptions, those figures are listed on the page and can be changed.",
      ]}
      faqs={FAQS}
    />
  ),
});
