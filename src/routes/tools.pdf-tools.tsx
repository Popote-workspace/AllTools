import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, RotateCcw, Trash2 } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, Notice } from "@/components/kit";

const tool = getTool("pdf-tools");

const COMING_SOON = ["Split PDF", "Compress PDF", "PDF to images", "Images to PDF"];

const FAQS = [
  {
    q: "Are my PDFs uploaded?",
    a: "No. Merging happens entirely in your browser. Your files never leave your device.",
  },
  {
    q: "Is there a file size limit?",
    a: "Only your device's memory. Very large files (hundreds of MB) may be slow on phones.",
  },
  {
    q: "Why do some tools say Coming soon?",
    a: "We only switch on a tool when it works reliably in the browser. The others are being built.",
  },
  {
    q: "Can I merge password-protected PDFs?",
    a: "Not yet. Remove the password in your PDF reader first, then merge.",
  },
];

export const Route = createFileRoute("/tools/pdf-tools")({
  head: () =>
    pageHead({
      title: "Merge PDF Files Free — PDF Tools",
      description:
        "Merge several PDF files into one, privately in your browser. No uploads, no sign-up. More PDF tools coming soon.",
      path: "/tools/pdf-tools",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/pdf-tools"),
    }),
  component: PdfToolsPage,
});

function PdfToolsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [url, setUrl] = useState<string | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const pdfs = Array.from(list).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (pdfs.length < list.length) setError("Only PDF files can be added.");
    else setError(undefined);
    setFiles((prev) => [...prev, ...pdfs]);
    setUrl(null);
  }

  function move(i: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
    setUrl(null);
  }

  async function merge() {
    if (files.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const f of files) {
        const doc = await PDFDocument.load(await f.arrayBuffer());
        const pages = await out.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(blob));
    } catch {
      setError("One of the files could not be read. It may be damaged or password-protected.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (url) URL.revokeObjectURL(url);
    setFiles([]);
    setUrl(null);
    setError(undefined);
  }

  return (
    <ToolPage
      tool={tool}
      intro="Combine several PDF files into one document, in the order you choose — privately, in your browser."
      howItWorks={
        <p>
          Your files are read on your device, their pages are copied in order into a new PDF, and you
          download the result. Nothing is sent to a server.
        </p>
      }
      example={<p>Merge a CV, a cover letter and certificates into one PDF for a job application.</p>}
      tips={[
        "Use the arrows to set the page order before merging.",
        "Remove passwords from protected PDFs first.",
        "Name the merged file clearly before sending it, e.g. Jane-Wanjiku-Application.pdf.",
      ]}
      faqs={FAQS}
      related={["cv-ats-checker", "word-counter", "date-difference-calculator"]}
    >
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Merge PDF</h2>
        <label
          htmlFor="pdf-input"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:bg-muted"
        >
          <FileText className="size-6" aria-hidden />
          Choose PDF files
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {error && <Notice tone="warning">{error}</Notice>}

        {files.length > 0 && (
          <ol className="space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                <span className="flex-1 truncate">
                  {i + 1}. {f.name}
                </span>
                <Button variant="ghost" onClick={() => move(i, -1)} aria-label={`Move ${f.name} up`}>
                  ↑
                </Button>
                <Button variant="ghost" onClick={() => move(i, 1)} aria-label={`Move ${f.name} down`}>
                  ↓
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFiles((p) => p.filter((_, k) => k !== i));
                    setUrl(null);
                  }}
                  aria-label={`Remove ${f.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={merge} disabled={busy || files.length < 2}>
            {busy ? "Merging…" : "Merge PDFs"}
          </Button>
          {url && (
            <a
              href={url}
              download="merged.pdf"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
            >
              <Download className="size-4" aria-hidden />
              Download merged PDF
            </a>
          )}
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-semibold">More PDF tools</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {COMING_SOON.map((name) => (
            <li key={name} className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
              {name}
              <span className="rounded bg-background px-2 py-0.5 text-xs text-muted-foreground">Coming soon</span>
            </li>
          ))}
        </ul>
      </Card>
    </ToolPage>
  );
}
