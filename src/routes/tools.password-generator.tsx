import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, Field, Notice, Select } from "@/components/kit";
import { activeSets, entropyBits, generatePassword, strengthLabel, type PasswordOptions } from "@/lib/password";
import { cn } from "@/lib/utils";

const tool = getTool("password-generator");
const PATH = "/tools/password-generator";

const DEFAULTS: PasswordOptions = { length: 16, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false };

const FAQS = [
  { q: "Is this password generator safe?", a: "Passwords are created in your browser with crypto.getRandomValues, the browser's cryptographically secure random number generator. They are never sent to a server, saved in storage or logged." },
  { q: "How long should my password be?", a: "At least 12 characters for everyday accounts and 16 or more for email, banking and password-manager master passwords. Length adds more strength than complexity." },
  { q: "Can a generated password be cracked?", a: "No password is guaranteed unbreakable. A long random password makes guessing attacks impractical, but reuse, phishing and data breaches can still expose it — use a unique password per account and turn on two-factor authentication." },
  { q: "What does 'exclude ambiguous characters' do?", a: "It removes characters that are easy to confuse, such as O and 0 or l, I and 1. Useful when a password must be read aloud or typed by hand." },
];

export const Route = createFileRoute("/tools/password-generator")({
  head: () =>
    pageHead({
      title: "Strong Password Generator — Secure & Private",
      description: "Generate strong random passwords from 8 to 64 characters with a strength meter. Created in your browser with secure randomness — never sent or saved.",
      path: PATH,
      jsonLd: softwareAppJsonLd(tool.name, tool.description, PATH),
    }),
  component: PasswordPage,
});

const LEVEL_CLASS = ["bg-destructive", "bg-warning-border", "bg-primary/70", "bg-primary"];

function PasswordPage() {
  const [o, setO] = useState<PasswordOptions>(DEFAULTS);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const sets = activeSets(o);
  const error = sets.length === 0 ? "Choose at least one character type." : "";

  const regenerate = useCallback(() => {
    if (activeSets(o).length === 0) return setPasswords([]);
    setPasswords(Array.from({ length: count }, () => generatePassword(o)));
  }, [o, count]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const bits = entropyBits(o.length, sets.join("").length);
  const strength = strengthLabel(bits);
  const toggle = (k: keyof Omit<PasswordOptions, "length">) => setO((p) => ({ ...p, [k]: !p[k] }));

  return (
    <ToolPage
      tool={tool}
      intro="Create strong, random passwords in one click. Choose the length and character types, check the strength meter, then copy the result into your password manager."
      howItWorks={
        <>
          <p>Each character is picked with your browser's cryptographically secure random number generator (<code>crypto.getRandomValues</code>), using rejection sampling so every character is equally likely. At least one character from each type you select is included, then the result is shuffled.</p>
          <p>Strength is estimated as entropy: length × log₂(number of possible characters). Roughly, under 40 bits is weak, 60+ is strong and 80+ is very strong against offline guessing.</p>
          <p>Passwords exist only on this page. They are not transmitted, saved to browser storage, or sent to analytics, and disappear when you close or refresh the tab.</p>
        </>
      }
      example={<p>A 16-character password using all four character types draws from about 87 characters, giving roughly <strong>103 bits</strong> of entropy — far beyond what guessing attacks can reach.</p>}
      tips={[
        "Store generated passwords in a reputable password manager rather than a notes app or paper.",
        "Use a different password for every account.",
        "Turn on two-factor authentication for email, banking and M-Pesa-linked accounts.",
        "If a site rejects symbols, untick Symbols and increase the length instead.",
      ]}
      faqs={FAQS}
      related={["qr-code-generator", "word-counter", "cv-ats-checker"]}
    >
      <Card className="space-y-5">
        <div className="space-y-2" aria-live="polite">
          {passwords.map((pw, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-base text-foreground">{pw}</code>
              <CopyButton value={pw} />
            </div>
          ))}
          {error && <Notice tone="warning">{error}</Notice>}
        </div>

        {!error && (
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">Strength: {strength.label}</span>
              <span className="text-muted-foreground">≈ {Math.round(bits)} bits of entropy</span>
            </div>
            <div className="mt-1.5 grid grid-cols-4 gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("h-2 rounded-full", i <= strength.level ? LEVEL_CLASS[strength.level] : "bg-border")} />
              ))}
            </div>
          </div>
        )}

        <Field label={`Length: ${o.length} characters`} htmlFor="pw-len">
          <input id="pw-len" type="range" min={8} max={64} value={o.length} onChange={(e) => setO((p) => ({ ...p, length: Number(e.target.value) }))} className="w-full accent-primary" />
        </Field>

        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-medium text-foreground">Include</legend>
          {([
            ["upper", "Uppercase (A–Z)"],
            ["lower", "Lowercase (a–z)"],
            ["numbers", "Numbers (0–9)"],
            ["symbols", "Symbols (!@#…)"],
            ["excludeAmbiguous", "Exclude ambiguous (O, 0, l, 1…)"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground">
              <input type="checkbox" className="size-4 accent-primary" checked={o[k]} onChange={() => toggle(k)} />
              {label}
            </label>
          ))}
        </fieldset>

        <Field label="How many passwords" htmlFor="pw-count">
          <Select id="pw-count" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[1, 3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button onClick={regenerate} disabled={!!error}>
            <RefreshCw className="size-4" aria-hidden /> Generate new
          </Button>
          <Button variant="ghost" onClick={() => { setO(DEFAULTS); setCount(1); }}>
            <RotateCcw className="size-4" aria-hidden /> Reset
          </Button>
        </div>
        <Notice>Generated passwords are never saved. Store them securely in a password manager before leaving this page.</Notice>
      </Card>
    </ToolPage>
  );
}
