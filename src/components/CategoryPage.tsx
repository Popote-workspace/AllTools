import { Link } from "@tanstack/react-router";
import { CATEGORIES, toolsByCategory, type CategoryId } from "@/data/tools";
import { ToolGrid } from "@/components/ToolCard";
import { FaqList, type Faq } from "@/components/ToolPage";
import { TopAdSlot, BottomAdSlot } from "@/components/AdSlot";

export function CategoryPage({
  category,
  title,
  intro,
  body,
  faqs,
}: {
  category: CategoryId;
  title: string;
  intro: string;
  body: string[];
  faqs: Faq[];
}) {
  const tools = toolsByCategory(category);
  const others = CATEGORIES.filter((c) => c.id !== category);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>

      <TopAdSlot />

      <div className="mt-6">
        <ToolGrid tools={tools} />
      </div>

      <section className="mt-10 max-w-2xl space-y-3 text-sm leading-relaxed text-muted-foreground">
        {body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <FaqList items={faqs} />

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">Other categories</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c.id}>
              <Link
                to={c.to}
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/tools"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              All Tools
            </Link>
          </li>
        </ul>
      </section>

      <BottomAdSlot />
    </div>
  );
}
