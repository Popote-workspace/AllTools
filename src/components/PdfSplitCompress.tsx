import { useState } from "react";
import { Download, FileText, RotateCcw } from "lucide-react";
import { Button, Card, Field, Notice, Select, TextInput } from "@/components/kit";

type Output = { name: string; url: string; size: number };

function isPdf(f: File) {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function baseName(f: File) {
  return f.name.replace(/\.pdf$/i, "") || "document";
}

function makeUrl(bytes: Uint8Array) {
  return URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
}

/** Parse "1-3, 5, 8-10" into 0-based page index groups. Returns error string on failure. */
export function parseRanges(input: string, pageCount: number): number[][] | string {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return "Enter at least one page or range, e.g. 1-3, 5.";
  const groups: number[][] = [];
  for (const p of parts) {
    const m = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(p);
    if (!m) return `"${p}" is not a valid page or range.`;
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (a < 1 || b < 1 || a > pageCount || b > pageCount)
      return `"${p}" is outside this document (1–${pageCount}).`;
    if (a > b) return `"${p}": the first page must not be after the last.`;
    groups.push(Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i));
  }
  return groups;
}

function FilePicker({ id, onPick, file }: { id: string; onPick: (f: File | null) => void; file: File | null }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:bg-muted"
    >
      <FileText className="size-6" aria-hidden />
      {file ? `${file.name} (${formatBytes(file.size)})` : "Choose a PDF file"}
      <input
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function Downloads({ outputs }: { outputs: Output[] }) {
  if (!outputs.length) return null;
  return (
    <ul className="space-y-2">
      {outputs.map((o) => (
        <li key={o.url}>
          <a
            href={o.url}
            download={o.name}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
          >
            <Download className="size-4" aria-hidden />
            {o.name} ({formatBytes(o.size)})
          </a>
        </li>
      ))}
    </ul>
  );
}

const READ_ERROR = "This file could not be read. It may be damaged or password-protected.";

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [mode, setMode] = useState<"ranges" | "each">("ranges");
  const [ranges, setRanges] = useState("");
  const [combine, setCombine] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [outputs, setOutputs] = useState<Output[]>([]);

  function clearOut() {
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);
  }

  async function pick(f: File | null) {
    clearOut();
    setError(undefined);
    setPages(0);
    setFile(null);
    if (!f) return;
    if (!isPdf(f)) return setError("Please choose a PDF file.");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setFile(f);
      setPages(doc.getPageCount());
    } catch {
      setError(READ_ERROR);
    }
  }

  async function split() {
    if (!file) return setError("Choose a PDF first.");
    let groups: number[][];
    if (mode === "each") groups = Array.from({ length: pages }, (_, i) => [i]);
    else {
      const r = parseRanges(ranges, pages);
      if (typeof r === "string") return setError(r);
      groups = combine ? [r.flat()] : r;
    }
    setBusy(true);
    setError(undefined);
    clearOut();
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const res: Output[] = [];
      for (const g of groups) {
        const out = await PDFDocument.create();
        (await out.copyPages(src, g)).forEach((p) => out.addPage(p));
        const bytes = await out.save();
        const first = g[0]! + 1;
        const last = g[g.length - 1]! + 1;
        const label = combine && mode === "ranges" ? "selected" : first === last ? `p${first}` : `p${first}-${last}`;
        res.push({ name: `${baseName(file)}-${label}.pdf`, url: makeUrl(bytes), size: bytes.length });
      }
      setOutputs(res);
    } catch {
      setError(READ_ERROR);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    clearOut();
    setFile(null);
    setPages(0);
    setRanges("");
    setError(undefined);
  }

  return (
    <Card className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Split PDF</h2>
      <FilePicker id="split-input" file={file} onPick={pick} />
      {file && <p className="text-sm text-muted-foreground">{pages} page{pages === 1 ? "" : "s"} in this document.</p>}
      {file && (
        <>
          <Field label="How to split" htmlFor="split-mode">
            <Select id="split-mode" value={mode} onChange={(e) => setMode(e.target.value as "ranges" | "each")}>
              <option value="ranges">Pick pages or ranges</option>
              <option value="each">Every page as its own PDF</option>
            </Select>
          </Field>
          {mode === "ranges" && (
            <>
              <Field label="Pages" htmlFor="split-ranges" hint={`Example: 1-3, 5, 8-${Math.max(pages, 8)}`}>
                <TextInput
                  id="split-ranges"
                  value={ranges}
                  placeholder="1-3, 5"
                  onChange={(e) => setRanges(e.target.value)}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={combine} onChange={(e) => setCombine(e.target.checked)} />
                Put all selected pages into one PDF
              </label>
            </>
          )}
        </>
      )}
      {error && <Notice tone="warning">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={split} disabled={busy || !file}>
          {busy ? "Splitting…" : "Split PDF"}
        </Button>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>
      </div>
      <Downloads outputs={outputs} />
    </Card>
  );
}

type Level = "lossless" | "medium" | "strong";
const LEVELS: Record<Exclude<Level, "lossless">, { scale: number; quality: number }> = {
  medium: { scale: 1.5, quality: 0.7 },
  strong: { scale: 1.1, quality: 0.5 },
};

export function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("lossless");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Output | null>(null);

  function clearOut() {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
  }

  function pick(f: File | null) {
    clearOut();
    setError(undefined);
    setFile(null);
    if (!f) return;
    if (!isPdf(f)) return setError("Please choose a PDF file.");
    setFile(f);
  }

  async function lossless(buf: ArrayBuffer) {
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(buf);
    const out = await PDFDocument.create();
    (await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p));
    out.setProducer("AllTools");
    out.setCreator("AllTools");
    return out.save({ useObjectStreams: true });
  }

  async function rasterize(buf: ArrayBuffer, scale: number, quality: number) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const { PDFDocument } = await import("pdf-lib");
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
    const out = await PDFDocument.create();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    for (let i = 1; i <= doc.numPages; i++) {
      setProgress(`Page ${i} of ${doc.numPages}…`);
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale });
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
      if (!blob) throw new Error("encode failed");
      const img = await out.embedJpg(await blob.arrayBuffer());
      const p = out.addPage([base.width, base.height]);
      p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
      page.cleanup();
    }
    await doc.destroy();
    return out.save({ useObjectStreams: true });
  }

  async function compress() {
    if (!file) return setError("Choose a PDF first.");
    setBusy(true);
    setError(undefined);
    clearOut();
    try {
      const buf = await file.arrayBuffer();
      const bytes =
        level === "lossless"
          ? await lossless(buf)
          : await rasterize(buf, LEVELS[level].scale, LEVELS[level].quality);
      setResult({ name: `${baseName(file)}-compressed.pdf`, url: makeUrl(bytes), size: bytes.length });
    } catch (e) {
      console.error("PDF compress failed", e);
      setError(READ_ERROR);
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  function reset() {
    clearOut();
    setFile(null);
    setError(undefined);
  }

  const saved = file && result ? 1 - result.size / file.size : 0;

  return (
    <Card className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Compress PDF</h2>
      <FilePicker id="compress-input" file={file} onPick={pick} />
      <Field
        label="Compression level"
        htmlFor="compress-level"
        hint={
          level === "lossless"
            ? "Keeps text selectable and quality unchanged. Savings are usually small."
            : "Turns each page into an image. Much smaller for scanned PDFs, but text can no longer be selected or searched."
        }
      >
        <Select id="compress-level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          <option value="lossless">Light — no quality loss</option>
          <option value="medium">Medium — good quality images</option>
          <option value="strong">Strong — smallest file</option>
        </Select>
      </Field>
      {error && <Notice tone="warning">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={compress} disabled={busy || !file}>
          {busy ? progress || "Compressing…" : "Compress PDF"}
        </Button>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>
      </div>
      {result && file && (
        <div className="space-y-2" aria-live="polite">
          <p className="text-sm">
            {formatBytes(file.size)} → <strong>{formatBytes(result.size)}</strong>{" "}
            {saved > 0.005 ? `(${Math.round(saved * 100)}% smaller)` : ""}
          </p>
          {saved <= 0.005 && (
            <Notice tone="warning">
              This file is already well optimised — the result is not smaller. Try a stronger level, or keep your original.
            </Notice>
          )}
          <Downloads outputs={[result]} />
        </div>
      )}
    </Card>
  );
}
