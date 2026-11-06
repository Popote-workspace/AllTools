import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, Field, Notice, Select } from "@/components/kit";
import { ImageDropzone } from "@/components/ImageDropzone";
import { canvasToBlob, downloadBlob, drawToCanvas, formatBytes, loadImage, renameFile, validateImage, type OutputType } from "@/lib/image";

const tool = getTool("image-compressor");
const PATH = "/tools/image-compressor";
const MAX_FILES = 10;

type Item = { id: string; file: File; src: string; out?: { blob: Blob; url: string; type: OutputType }; error?: string };

const FAQS = [
  { q: "Are my images uploaded?", a: "No. Compression happens in your browser using the HTML canvas. Your photos never leave your device." },
  { q: "Why did my PNG barely shrink?", a: "PNG is lossless, so the browser can't throw detail away. Choose 'Convert to WebP' or 'Convert to JPG' for large savings on photos; keep PNG for screenshots and graphics with transparency." },
  { q: "What quality should I choose?", a: "70–80% is usually indistinguishable from the original on a phone or website. Go lower only for thumbnails." },
  { q: "Is image metadata removed?", a: "Yes. Re-encoding through the canvas drops EXIF metadata such as camera details and GPS location, which is also good for privacy." },
];

export const Route = createFileRoute("/tools/image-compressor")({
  head: () =>
    pageHead({
      title: "Free Image Compressor — JPG, PNG, WebP",
      description: "Compress JPG, PNG and WebP images in your browser. Adjust quality, compare before and after, and see how much you saved. No uploads, up to 10 images.",
      path: PATH,
      jsonLd: softwareAppJsonLd(tool.name, tool.description, PATH),
    }),
  component: CompressorPage,
});

function CompressorPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<"same" | OutputType>("same");
  const [errors, setErrors] = useState<string[]>([]);

  function add(files: File[]) {
    const errs: string[] = [];
    const next: Item[] = [];
    for (const file of files) {
      const err = validateImage(file);
      if (err) errs.push(err);
      else next.push({ id: crypto.randomUUID(), file, src: URL.createObjectURL(file) });
    }
    setItems((prev) => {
      const room = MAX_FILES - prev.length;
      if (next.length > room) errs.push(`Only ${MAX_FILES} images at a time — extra files were skipped.`);
      return [...prev, ...next.slice(0, Math.max(0, room))];
    });
    setErrors(errs);
  }

  const key = items.map((i) => i.id).join(",");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const item of items) {
        try {
          const img = await loadImage(item.src);
          const type: OutputType = format === "same" ? (item.file.type as OutputType) : format;
          const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight, type);
          const blob = await canvasToBlob(canvas, type, type === "image/png" ? undefined : quality / 100);
          if (cancelled) return;
          setItems((prev) => prev.map((p) => {
            if (p.id !== item.id) return p;
            if (p.out) URL.revokeObjectURL(p.out.url);
            return { ...p, out: { blob, url: URL.createObjectURL(blob), type }, error: undefined };
          }));
        } catch (e) {
          if (!cancelled) setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, error: (e as Error).message } : p)));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, quality, format]);

  function remove(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  const totalIn = items.reduce((s, i) => s + i.file.size, 0);
  const totalOut = items.reduce((s, i) => s + (i.out?.blob.size ?? 0), 0);

  return (
    <ToolPage
      tool={tool}
      intro="Make photos and graphics smaller for websites, WhatsApp, email and job applications. Choose a quality level, compare before and after, then download — all without uploading anything."
      howItWorks={
        <>
          <p>Each image is decoded by your browser, redrawn on a canvas at its original dimensions and re-encoded at the quality you choose. Lower quality discards fine detail the eye rarely notices, which is where the savings come from.</p>
          <p>JPG and WebP respond to the quality slider. PNG is lossless, so for big savings convert it to WebP or JPG. When converting to JPG, transparent areas are filled with white because JPG has no transparency.</p>
          <p>Limits: up to {MAX_FILES} images at a time, 10 MB each. Very large photos depend on your device's memory.</p>
        </>
      }
      example={<p>A 4.2 MB phone photo saved at 75% quality typically comes out around <strong>0.8–1.2 MB</strong> — a 70–80% saving — with no visible difference on a phone screen.</p>}
      tips={[
        "Use 70–80% quality for websites and social media.",
        "Convert PNG photos to WebP for the smallest files that still look sharp.",
        "If the result isn't smaller, the original was already well optimised — keep it.",
        "Need smaller dimensions too? Use the Image Resizer first.",
      ]}
      faqs={FAQS}
      related={["image-resizer", "image-converter", "pdf-tools"]}
    >
      <Card className="space-y-5">
        <ImageDropzone multiple onFiles={add} hint={`JPG, PNG or WebP · up to 10 MB each · max ${MAX_FILES} images`} />
        {errors.map((e) => <Notice key={e} tone="warning">{e}</Notice>)}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Quality: ${quality}%`} htmlFor="ic-q" hint="Applies to JPG and WebP output">
            <input id="ic-q" type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </Field>
          <Field label="Output format" htmlFor="ic-f">
            <Select id="ic-f" value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
              <option value="same">Keep original format</option>
              <option value="image/webp">Convert to WebP</option>
              <option value="image/jpeg">Convert to JPG</option>
            </Select>
          </Field>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No images yet. Add one above to start.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((item) => {
                const saved = item.out ? (1 - item.out.blob.size / item.file.size) * 100 : 0;
                return (
                  <li key={item.id} className="rounded-xl border border-border p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <figure>
                        <img src={item.src} alt={`Original ${item.file.name}`} className="h-32 w-full rounded-md bg-muted object-contain" />
                        <figcaption className="mt-1 text-xs text-muted-foreground">Original · {formatBytes(item.file.size)}</figcaption>
                      </figure>
                      <figure>
                        {item.out ? <img src={item.out.url} alt={`Compressed ${item.file.name}`} className="h-32 w-full rounded-md bg-muted object-contain" /> : <div className="h-32 rounded-md bg-muted" />}
                        <figcaption className="mt-1 text-xs text-muted-foreground">
                          Compressed · {item.out ? formatBytes(item.out.blob.size) : "working…"}
                        </figcaption>
                      </figure>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-foreground">{item.file.name}</p>
                    {item.error && <Notice tone="warning">{item.error}</Notice>}
                    {item.out && (
                      <p className={saved > 0 ? "text-sm font-semibold text-primary" : "text-sm text-warning-foreground"}>
                        {saved > 0 ? `Saved ${saved.toFixed(0)}%` : "Not smaller — keep your original or try another format."}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button disabled={!item.out} onClick={() => item.out && downloadBlob(item.out.blob, renameFile(item.file.name, item.out.type, "-compressed"))}>
                        <Download className="size-4" aria-hidden /> Download
                      </Button>
                      <Button variant="ghost" onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name}`}>
                        <Trash2 className="size-4" aria-hidden /> Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-3 text-sm">
              <span className="text-foreground">
                Total: {formatBytes(totalIn)} → <strong>{formatBytes(totalOut)}</strong>
              </span>
              <Button variant="ghost" onClick={() => setItems([])}>
                <RotateCcw className="size-4" aria-hidden /> Clear all
              </Button>
            </div>
          </>
        )}
      </Card>
    </ToolPage>
  );
}
