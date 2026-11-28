import { getTool, type ToolSlug } from "@/data/tools";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";

export function businessToolHead(slug: ToolSlug) {
  const tool = getTool(slug);
  const description = `${tool.description} Free to use, no account required, and processed in your browser.`;
  return pageHead({
    title: `${tool.name} Online — Free Business Tool`,
    description,
    path: tool.to,
    jsonLd: softwareAppJsonLd(tool.name, description, tool.to),
  });
}