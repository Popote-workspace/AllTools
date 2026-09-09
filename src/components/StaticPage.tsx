import type { ReactNode } from "react";

export function StaticPage({
  title,
  intro,
  children,
  lastUpdated,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  lastUpdated?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
      {intro ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{intro}</p> : null}
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:space-y-1">
        {children}
      </div>
      {lastUpdated ? <p className="mt-8 text-xs text-muted-foreground">Last updated: {lastUpdated}</p> : null}
    </div>
  );
}
