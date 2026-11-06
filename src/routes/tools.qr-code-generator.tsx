import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import QRCode from "qrcode";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, Field, Notice, Select, TextArea, TextInput } from "@/components/kit";
import { downloadBlob } from "@/lib/image";
import { cn } from "@/lib/utils";

const tool = getTool("qr-code-generator");
const PATH = "/tools/qr-code-generator";

type Mode = "url" | "text" | "email" | "phone" | "wifi" | "contact";
const MODES: { id: Mode; label: string }[] = [
  { id: "url", label: "Website" },
  { id: "text", label: "Text" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "contact", label: "Contact" },
];

const EMPTY = {
  url: "",
  text: "",
  email: "",
  subject: "",
  phone: "",
  ssid: "",
  password: "",
  security: "WPA",
  hidden: false,
  name: "",
  org: "",
  cphone: "",
  cemail: "",
};

/** Escapes characters that are special in the Wi-Fi QR and vCard formats. */
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
const vcardEscape = (s: string) => s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");

export function buildPayload(mode: Mode, f: typeof EMPTY): { value?: string; error?: string } {
  switch (mode) {
    case "url": {
      const raw = f.url.trim();
      if (!raw) return {};
      const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
      try {
        const u = new URL(withScheme);
        if (!u.hostname.includes(".")) return { error: "Enter a full web address, e.g. example.com" };
        return { value: u.href };
      } catch {
        return { error: "That doesn't look like a valid web address." };
      }
    }
    case "text":
      return f.text.trim() ? { value: f.text } : {};
    case "email": {
      const e = f.email.trim();
      if (!e) return {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { error: "Enter a valid email address." };
      return { value: `mailto:${e}${f.subject.trim() ? `?subject=${encodeURIComponent(f.subject.trim())}` : ""}` };
    }
    case "phone": {
      const p = f.phone.replace(/[\s()-]/g, "");
      if (!p) return {};
      if (!/^\+?\d{6,15}$/.test(p)) return { error: "Enter a phone number with 6–15 digits, e.g. +254712345678." };
      return { value: `tel:${p}` };
    }
    case "wifi": {
      if (!f.ssid.trim()) return {};
      if (f.security !== "nopass" && f.password.length < 8 && f.security === "WPA")
        return { error: "WPA/WPA2 passwords are at least 8 characters." };
      const pass = f.security === "nopass" ? "" : `P:${wifiEscape(f.password)};`;
      return { value: `WIFI:T:${f.security};S:${wifiEscape(f.ssid)};${pass}${f.hidden ? "H:true;" : ""};` };
    }
    case "contact": {
      if (!f.name.trim()) return {};
      if (f.cemail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.cemail.trim()))
        return { error: "The contact email isn't valid." };
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${vcardEscape(f.name.trim())}`];
      if (f.org.trim()) lines.push(`ORG:${vcardEscape(f.org.trim())}`);
      if (f.cphone.trim()) lines.push(`TEL:${f.cphone.replace(/\s/g, "")}`);
      if (f.cemail.trim()) lines.push(`EMAIL:${f.cemail.trim()}`);
      lines.push("END:VCARD");
      return { value: lines.join("\n") };
    }
  }
}

const FAQS = [
  { q: "Do these QR codes expire?", a: "No. The code stores your content directly, so it keeps working as long as the link, network or number it points to does. There is no redirect service in between." },
  { q: "Is my Wi-Fi password sent anywhere?", a: "No. The QR code is drawn in your browser. Nothing you type is uploaded or saved." },
  { q: "PNG or SVG — which should I download?", a: "PNG is best for sharing and documents. SVG is a vector file that stays sharp at any size, ideal for posters, signage and printing." },
  { q: "Why won't my code scan?", a: "Keep strong contrast — a dark foreground on a light background — and leave the quiet border around the code. Light-on-dark or low-contrast colours often fail on older phones." },
];

export const Route = createFileRoute("/tools/qr-code-generator")({
  head: () =>
    pageHead({
      title: "Free QR Code Generator — URL, Wi-Fi, Contact",
      description: "Create QR codes for websites, text, email, phone numbers, Wi-Fi and contact cards. Custom colours, PNG and SVG download. Free, no sign-up, nothing uploaded.",
      path: PATH,
      jsonLd: softwareAppJsonLd(tool.name, tool.description, PATH),
    }),
  component: QrPage,
});

function contrast(hexA: string, hexB: string) {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
  };
  const [a, b] = [lum(hexA), lum(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function QrPage() {
  const [mode, setMode] = useState<Mode>("url");
  const [f, setF] = useState(EMPTY);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [dataUrl, setDataUrl] = useState("");
  const [genError, setGenError] = useState("");

  const payload = useMemo(() => buildPayload(mode, f), [mode, f]);
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const lowContrast = contrast(fg, bg) < 3;

  useEffect(() => {
    let cancelled = false;
    setGenError("");
    if (!payload.value) {
      setDataUrl("");
      return;
    }
    QRCode.toDataURL(payload.value, { width: size, margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: "M" })
      .then((url) => !cancelled && setDataUrl(url))
      .catch(() => !cancelled && (setDataUrl(""), setGenError("That content is too long for a QR code. Shorten it and try again.")));
    return () => {
      cancelled = true;
    };
  }, [payload.value, size, fg, bg]);

  async function downloadPng() {
    const blob = await (await fetch(dataUrl)).blob();
    downloadBlob(blob, "qr-code.png");
  }
  async function downloadSvg() {
    if (!payload.value) return;
    const svg = await QRCode.toString(payload.value, { type: "svg", margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: "M" });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
  }
  function reset() {
    setF(EMPTY);
    setFg("#000000");
    setBg("#ffffff");
    setSize(512);
  }

  return (
    <ToolPage
      tool={tool}
      intro="Turn a link, message, email address, phone number, Wi-Fi network or contact card into a QR code. Pick your colours and size, preview it, then download it as PNG or SVG."
      howItWorks={
        <>
          <p>Your content is turned into a standard QR code using the open-source <em>qrcode</em> library, drawn entirely in your browser. Website, email and phone codes use the standard <code>https:</code>, <code>mailto:</code> and <code>tel:</code> formats every phone camera understands.</p>
          <p>Wi-Fi codes use the common <code>WIFI:</code> format supported by Android and iPhone cameras, and contact codes use the vCard 3.0 format so scanning offers to save the contact. Medium error correction is used, so a code still scans if a small part is smudged.</p>
          <p>It's useful for shops showing an M-Pesa or website link, cafés sharing Wi-Fi, event posters and business cards.</p>
        </>
      }
      example={<p>A café enters its network name <strong>CafeGuest</strong>, password and WPA security, then prints the PNG on table cards. Customers point their camera at it and join without typing the password.</p>}
      tips={[
        "Test every code with your own phone before printing it.",
        "Keep a dark foreground on a light background for reliable scanning.",
        "Use SVG for anything printed larger than an A5 sheet.",
        "Shorter content makes a simpler, easier-to-scan code.",
      ]}
      faqs={FAQS}
      related={["password-generator", "image-resizer", "word-counter"]}
    >
      <Card className="space-y-5">
        <div role="tablist" aria-label="QR code type" className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "min-h-10 rounded-lg border px-3 text-sm font-medium",
                mode === m.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {mode === "url" && (
            <Field label="Website address" htmlFor="qr-url" error={payload.error}>
              <TextInput id="qr-url" inputMode="url" placeholder="example.com" value={f.url} onChange={set("url")} />
            </Field>
          )}
          {mode === "text" && (
            <Field label="Text" htmlFor="qr-text" hint={`${f.text.length} characters`}>
              <TextArea id="qr-text" className="min-h-24" value={f.text} onChange={set("text")} placeholder="Any message" />
            </Field>
          )}
          {mode === "email" && (
            <>
              <Field label="Email address" htmlFor="qr-email" error={payload.error}>
                <TextInput id="qr-email" type="email" value={f.email} onChange={set("email")} placeholder="name@example.com" />
              </Field>
              <Field label="Subject (optional)" htmlFor="qr-subject">
                <TextInput id="qr-subject" value={f.subject} onChange={set("subject")} />
              </Field>
            </>
          )}
          {mode === "phone" && (
            <Field label="Phone number" htmlFor="qr-phone" error={payload.error} hint="Include the country code, e.g. +254">
              <TextInput id="qr-phone" type="tel" value={f.phone} onChange={set("phone")} placeholder="+254712345678" />
            </Field>
          )}
          {mode === "wifi" && (
            <>
              <Field label="Network name (SSID)" htmlFor="qr-ssid">
                <TextInput id="qr-ssid" value={f.ssid} onChange={set("ssid")} />
              </Field>
              <Field label="Security" htmlFor="qr-sec">
                <Select id="qr-sec" value={f.security} onChange={set("security")}>
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (open network)</option>
                </Select>
              </Field>
              {f.security !== "nopass" && (
                <Field label="Password" htmlFor="qr-pass" error={payload.error}>
                  <TextInput id="qr-pass" value={f.password} onChange={set("password")} autoComplete="off" />
                </Field>
              )}
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="size-4" checked={f.hidden} onChange={(e) => setF((p) => ({ ...p, hidden: e.target.checked }))} />
                Hidden network
              </label>
            </>
          )}
          {mode === "contact" && (
            <>
              <Field label="Full name" htmlFor="qr-name">
                <TextInput id="qr-name" value={f.name} onChange={set("name")} />
              </Field>
              <Field label="Organisation (optional)" htmlFor="qr-org">
                <TextInput id="qr-org" value={f.org} onChange={set("org")} />
              </Field>
              <Field label="Phone (optional)" htmlFor="qr-cphone">
                <TextInput id="qr-cphone" type="tel" value={f.cphone} onChange={set("cphone")} />
              </Field>
              <Field label="Email (optional)" htmlFor="qr-cemail" error={payload.error}>
                <TextInput id="qr-cemail" type="email" value={f.cemail} onChange={set("cemail")} />
              </Field>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Foreground" htmlFor="qr-fg">
            <TextInput id="qr-fg" type="color" className="h-11 p-1" value={fg} onChange={(e) => setFg(e.target.value)} />
          </Field>
          <Field label="Background" htmlFor="qr-bg">
            <TextInput id="qr-bg" type="color" className="h-11 p-1" value={bg} onChange={(e) => setBg(e.target.value)} />
          </Field>
          <Field label="PNG size" htmlFor="qr-size">
            <Select id="qr-size" value={size} onChange={(e) => setSize(Number(e.target.value))}>
              {[256, 512, 1024, 2048].map((s) => (
                <option key={s} value={s}>{s} × {s} px</option>
              ))}
            </Select>
          </Field>
        </div>
        {lowContrast && <Notice tone="warning">These colours have low contrast, so many phones may not scan the code.</Notice>}
        {genError && <Notice tone="warning">{genError}</Notice>}

        <div className="flex flex-col items-center gap-4 rounded-xl bg-muted p-4" aria-live="polite">
          {dataUrl ? (
            <img src={dataUrl} alt="QR code preview" className="size-56 rounded-md" />
          ) : (
            <p className="py-16 text-sm text-muted-foreground">Fill in the details above to see your QR code.</p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={downloadPng} disabled={!dataUrl}>
              <Download className="size-4" aria-hidden /> PNG
            </Button>
            <Button variant="secondary" onClick={downloadSvg} disabled={!dataUrl}>
              <Download className="size-4" aria-hidden /> SVG
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden /> Reset
            </Button>
          </div>
        </div>
      </Card>
    </ToolPage>
  );
}
