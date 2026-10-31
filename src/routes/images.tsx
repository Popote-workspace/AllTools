import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Are my images uploaded to a server?",
    a: "No. All image processing — compressing, resizing, cropping and converting — happens entirely in your browser using the canvas. Your files never leave your device.",
  },
  {
    q: "Which formats are supported?",
    a: "JPG, PNG and WebP throughout, with SVG supported as an input for the format converter. Each tool page lists exactly what it accepts.",
  },
  {
    q: "Is there a file size limit?",
    a: "Each tool states its limit (currently 10 MB per image) and works with multiple images where practical. Very large images are limited by your device's memory.",
  },
];

export const Route = createFileRoute("/images")({
  head: () =>
    pageHead({
      title: "Free Online Image Tools",
      description:
        "Compress, resize, crop and convert images right in your browser. JPG, PNG and WebP — private, fast and free with no uploads.",
      path: "/images",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="images"
      title="Free Online Image Tools"
      intro="Compress, resize, crop and convert photos without installing anything — and without your images ever leaving your device."
      body={[
        "Image work usually means trusting an unknown website with your photos. AllTools takes a different approach: every image tool on this page processes files locally in your browser, so nothing is uploaded, queued on a server or kept after you close the tab.",
        "The tools cover the three most common jobs — shrinking files so pages load faster, resizing and cropping to exact dimensions, and converting between JPG, PNG and WebP. Each one shows before-and-after previews and file sizes so you can judge the quality yourself before downloading.",
      ]}
      faqs={FAQS}
    />
  ),
});
