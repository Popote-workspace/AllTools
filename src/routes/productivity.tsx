import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Is my text or CV uploaded anywhere?",
    a: "No. The Word Counter, CV ATS Checker and PDF tools all run entirely in your browser. Nothing is uploaded, stored or sent to any external service.",
  },
  {
    q: "Does the CV ATS Checker use a real employer ATS?",
    a: "No. It applies common applicant tracking system rules to give an indicative score. Treat it as a structure check, not a verdict.",
  },
  {
    q: "Why are some PDF features marked Coming soon?",
    a: "Only features that work reliably in the browser are enabled. Anything that cannot be done well client-side is labelled Coming soon instead of shipped broken.",
  },
];

export const Route = createFileRoute("/productivity")({
  head: () =>
    pageHead({
      title: "Productivity Tools",
      description:
        "Browser-based productivity tools: word counter, CV ATS checker, PDF merging and date calculations. Private, free and no sign-up.",
      path: "/productivity",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="productivity"
      title="Productivity Tools"
      intro="Writing, document and job-application helpers that run entirely inside your browser."
      body={[
        "Everything in this category is private by design. Your text never leaves the device, which matters when you are pasting a CV, a contract or unpublished writing into a website.",
        "The Word Counter is useful for essays, applications and articles with a length limit. The CV ATS Checker looks for the sections and formatting that automated recruitment systems expect. The PDF tools handle document work that a browser can genuinely do well.",
      ]}
      faqs={FAQS}
    />
  ),
});
