import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Check } from "lucide-react";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { TOOLS, toolsByCategory, searchTools } from "@/data/tools";
import { ToolGrid } from "@/components/ToolCard";
import { FaqList } from "@/components/ToolPage";
import { TopAdSlot, BottomAdSlot } from "@/components/AdSlot";

const FAQS = [
  {
    q: "Is AllTools really free?",
    a: "Yes. Every tool on AllTools is free to use and there is no sign-up or account required.",
  },
  {
    q: "Do the tools work on a phone?",
    a: "Yes. AllTools is built mobile-first and works on low-end Android phones and small screens from 320px wide.",
  },
  {
    q: "Are my inputs stored anywhere?",
    a: "No. All calculations run inside your browser. Nothing you type is sent to a server or saved by us.",
  },
  {
    q: "Are the Kenyan tax and cost figures official?",
    a: "No. They are estimates based on published rates and editable assumptions. Always confirm with KRA or a qualified professional before making decisions.",
  },
];

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "AllTools — Free Online Tools & Calculators",
      description:
        "Free online calculators and converters for everyday life in Kenya and beyond. PAYE, loans, land size, fuel cost, CV checks and more. No sign-up.",
      path: "/",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: HomePage,
});

function Section({
  title,
  description,
  to,
  tools,
}: {
  title: string;
  description: string;
  to: "/calculators" | "/converters" | "/kenya-tools" | "/productivity" | "/tools";
  tools: readonly (typeof TOOLS)[number][];
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link to={to} className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4">
        <ToolGrid tools={tools} />
      </div>
    </section>
  );
}

function HomePage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? searchTools(query).slice(0, 6) : []), [query]);

  const popular = TOOLS.filter((t) => "popular" in t && t.popular);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Free Online Tools &amp; Calculators
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Simple, fast and useful tools for everyday life in Kenya and beyond.
        </p>

        <div className="relative mt-5 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="home-search" className="sr-only">
            Search tools
          </label>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full min-h-12 rounded-lg border border-input bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query.trim() ? (
            <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
              {results.length > 0 ? (
                <ul>
                  {results.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        to={tool.to}
                        className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm font-medium text-foreground last:border-0 hover:bg-accent"
                      >
                        {tool.name}
                        <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-3 text-sm text-muted-foreground">No tools match that search.</p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <TopAdSlot />

      <Section
        title="Popular tools"
        description="The tools people reach for most."
        to="/tools"
        tools={popular}
      />
      <Section
        title="Kenya tools"
        description="Built around Kenyan salaries, land, vehicles and fuel."
        to="/kenya-tools"
        tools={toolsByCategory("kenya")}
      />
      <Section
        title="Calculators"
        description="Everyday maths, money and date calculations."
        to="/calculators"
        tools={toolsByCategory("calculators")}
      />
      <Section
        title="Converters"
        description="Switch between units and land measurements."
        to="/converters"
        tools={toolsByCategory("converters")}
      />
      <Section
        title="Productivity"
        description="Writing, documents and job application helpers."
        to="/productivity"
        tools={toolsByCategory("productivity")}
      />

      <section className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Why AllTools?</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Free to use", "No registration required", "Mobile friendly", "Fast and simple"].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-3 text-sm font-medium text-foreground"
            >
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <FaqList items={FAQS} />

      <section className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="text-xl font-bold text-foreground">Ready to get an answer?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse every calculator and converter on AllTools.
        </p>
        <Link
          to="/tools"
          className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Explore All Tools
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      <BottomAdSlot />
    </div>
  );
}
