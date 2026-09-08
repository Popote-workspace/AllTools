import { Link } from "@tanstack/react-router";
import { SITE_TAGLINE } from "@/config/site";
import { Logo } from "./Header";

const BROWSE = [
  { to: "/tools", label: "All Tools" },
  { to: "/calculators", label: "Calculators" },
  { to: "/converters", label: "Converters" },
  { to: "/kenya-tools", label: "Kenya Tools" },
  { to: "/productivity", label: "Productivity" },
] as const;

const SITE = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const LEGAL = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Use" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

function LinkList({ title, items }: { title: string; items: readonly { to: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="text-sm text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{SITE_TAGLINE}</p>
        </div>
        <LinkList title="Browse" items={BROWSE} />
        <LinkList title="Site" items={SITE} />
        <LinkList title="Legal" items={LEGAL} />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AllTools. Results from these tools are estimates and do not
          constitute professional advice.
        </p>
      </div>
    </footer>
  );
}
