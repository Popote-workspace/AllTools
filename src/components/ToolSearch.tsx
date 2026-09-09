import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, searchTools, type CategoryId } from "@/data/tools";
import { ToolGrid } from "@/components/ToolCard";
import { cn } from "@/lib/utils";

export function ToolSearch({ initialCategory }: { initialCategory?: CategoryId }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">(initialCategory ?? "all");

  const results = useMemo(() => {
    const found = searchTools(query);
    return category === "all"
      ? found
      : found.filter((t) => (t.categories as readonly string[]).includes(category));
  }, [query, category]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <label htmlFor="tool-search" className="sr-only">
          Search tools
        </label>
        <input
          id="tool-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full min-h-12 rounded-lg border border-input bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {[{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id as CategoryId | "all")}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              category === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground" role="status">
        {results.length} {results.length === 1 ? "tool" : "tools"} found
      </p>

      <div className="mt-4">
        {results.length > 0 ? (
          <ToolGrid tools={results} />
        ) : (
          <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No tools match “{query}”. Try a shorter word such as “salary” or “acre”.
          </p>
        )}
      </div>
    </div>
  );
}
