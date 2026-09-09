import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Tool, ToolSlug } from "@/data/tools";
import { getTool } from "@/data/tools";
import { InContentAdSlot, BottomAdSlot, TopAdSlot } from "@/components/AdSlot";

export type Faq = { q: string; a: string };

export function FaqList({ items, heading = "Frequently asked questions" }: { items: Faq[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-heading" className="mt-10">
      <h2 id="faq-heading" className="text-xl font-bold text-foreground">
        {heading}
      </h2>
      <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {items.map((item) => (
          <div key={item.q} className="p-4">
            <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function RelatedTools({ slugs, title = "Related tools" }: { slugs: ToolSlug[]; title?: string }) {
  const tools: Tool[] = slugs.map(getTool);
  return (
    <section aria-labelledby="related-heading" className="mt-10">
      <h2 id="related-heading" className="text-xl font-bold text-foreground">
        {title}
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <li key={tool.slug}>
              <Link
                to={tool.to}
                className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                <span>{tool.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type ToolPageProps = {
  tool: Tool;
  intro: string;
  children: ReactNode;
  howItWorks: ReactNode;
  example: ReactNode;
  tips: string[];
  faqs: Faq[];
  related: ToolSlug[];
  disclaimer?: ReactNode;
  lastUpdated?: string;
  sources?: { label: string; url: string }[];
};

export function ToolPage({
  tool,
  intro,
  children,
  howItWorks,
  example,
  tips,
  faqs,
  related,
  disclaimer,
  lastUpdated,
  sources,
}: ToolPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden />
          <li>
            <Link to="/tools" className="hover:text-primary">
              All Tools
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden />
          <li aria-current="page" className="text-foreground">
            {tool.short}
          </li>
        </ol>
      </nav>

      <TopAdSlot />

      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{tool.name}</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{intro}</p>
      </header>

      <div className="mt-6">{children}</div>

      {disclaimer ? (
        <p className="mt-4 rounded-lg border border-warning-border bg-warning-soft px-3 py-2 text-xs leading-relaxed text-warning-foreground">
          {disclaimer}
        </p>
      ) : null}

      <InContentAdSlot />

      <section className="prose-tool mt-10">
        <h2 className="text-xl font-bold text-foreground">How this tool works</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{howItWorks}</div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-foreground">Example</h2>
        <div className="mt-3 rounded-xl border border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
          {example}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-foreground">Tips</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <FaqList items={faqs} />

      {sources && sources.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-foreground">Sources</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelatedTools slugs={related} />

      {lastUpdated ? (
        <p className="mt-8 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
      ) : null}

      <BottomAdSlot />
    </div>
  );
}
