import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Tool, CategoryId } from "@/data/tools";
import { categoryLabel } from "@/data/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{tool.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tool.categories.map((c) => categoryLabel(c as CategoryId)).join(" · ")}
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
      <Link
        to={tool.to}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Open Tool
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

export function ToolGrid({ tools }: { tools: readonly Tool[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
