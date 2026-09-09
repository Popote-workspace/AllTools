import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { ToolSearch } from "@/components/ToolSearch";
import { TopAdSlot, BottomAdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/tools/")({
  head: () =>
    pageHead({
      title: "All Free Online Tools",
      description:
        "Browse every free AllTools calculator and converter — PAYE, loans, salary, land area, fuel cost, dates, CV checks and more.",
      path: "/tools",
    }),
  component: AllToolsPage,
});

function AllToolsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">All Free Online Tools</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Every tool runs in your browser, works offline once loaded, and needs no account. Search by name
        or filter by category.
      </p>
      <TopAdSlot />
      <div className="mt-6">
        <ToolSearch />
      </div>
      <BottomAdSlot />
    </div>
  );
}
