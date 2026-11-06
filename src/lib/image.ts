/** Browser-only image helpers. All processing stays on the visitor's device. */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const RASTER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type OutputType = "image/jpeg" | "image/png" | "image/webp";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateImage(file: File, allowed: readonly string[] = RASTER_TYPES): string | null {
  if (!allowed.includes(file.type)) {
    return `${file.name}: unsupported format. Use ${allowed.map((t) => t.split("/")[1]!.replace("svg+xml", "svg").toUpperCase()).join(", ")}.`;
  }
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: larger than the 10 MB limit.`;
  return null;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This image could not be read. It may be damaged."));
    img.src = src;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: OutputType, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Your browser could not create this image."))),
      type,
      quality,
    );
  });
}

export function extensionFor(type: OutputType): string {
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
}

export function renameFile(name: string, type: OutputType, suffix = ""): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}${suffix}.${extensionFor(type)}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Draws an image onto a canvas; fills white first when the output can't hold transparency. */
export function drawToCanvas(
  img: CanvasImageSource,
  width: number,
  height: number,
  type: OutputType,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}
