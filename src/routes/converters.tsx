import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "How many hectares are in an acre?",
    a: "One acre is exactly 0.40468564224 hectares, and one hectare is about 2.4710538 acres.",
  },
  {
    q: "Which units does the Unit Converter support?",
    a: "Length, weight, temperature, area, volume and speed, including both metric and imperial units.",
  },
  {
    q: "Are conversions rounded?",
    a: "Conversions use full-precision factors and only the displayed value is rounded, so you can copy a result without losing accuracy.",
  },
];

export const Route = createFileRoute("/converters")({
  head: () =>
    pageHead({
      title: "Free Unit & Measurement Converters",
      description:
        "Convert acres to hectares, plus length, weight, temperature, area, volume and speed units. Accurate factors, instant results, no sign-up.",
      path: "/converters",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="converters"
      title="Free Unit & Measurement Converters"
      intro="Switch between metric and imperial measurements instantly, using exact conversion factors."
      body={[
        "Land in Kenya is quoted in acres by agents and in hectares on official documents, which makes converting between the two a routine task for anyone buying, selling or subdividing a plot. The Acre ↔ Hectare Converter handles that one job cleanly, in both directions.",
        "For everything else — distances, weights, cooking volumes, temperatures and speeds — the general Unit Converter covers six measurement families in a single page.",
      ]}
      faqs={FAQS}
    />
  ),
});
