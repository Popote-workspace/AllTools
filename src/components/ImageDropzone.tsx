import { useId, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageDropzone({
  onFiles,
  accept = "image/jpeg,image/png,image/webp",
  multiple = false,
  hint = "JPG, PNG or WebP · up to 10 MB",
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const id = useId();
  const [over, setOver] = useState(false);
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={cn(
        "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center transition-colors hover:border-primary/60 focus-within:ring-2 focus-within:ring-ring",
        over && "border-primary bg-accent",
      )}
    >
      <Upload className="size-6 text-primary" aria-hidden />
      <span className="text-sm font-semibold text-foreground">
        {multiple ? "Choose images or drop them here" : "Choose an image or drop it here"}
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
