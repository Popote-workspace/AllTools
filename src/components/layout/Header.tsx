import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Wrench, X } from "lucide-react";
import { SITE_NAME } from "@/config/site";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "All Tools" },
  { to: "/calculators", label: "Calculators" },
  { to: "/converters", label: "Converters" },
  { to: "/kenya-tools", label: "Kenya Tools" },
  { to: "/productivity", label: "Productivity" },
] as const;

export function Logo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${SITE_NAME} home`}
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Wrench className="size-4.5" aria-hidden />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        All<span className="text-primary">Tools</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-accent text-accent-foreground" }}
                  className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border md:hidden">
          <ul className="mx-auto w-full max-w-6xl px-4 py-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center border-b border-border text-base font-medium text-foreground last:border-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
