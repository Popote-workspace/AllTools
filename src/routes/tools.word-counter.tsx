import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, CopyButton, TextArea } from "@/components/kit";
import { formatNumber } from "@/lib/format";

const tool = getTool("word-counter");

const FAQS = [
  {
    q: "How is reading time estimated?",
    a: "It assumes 200 words per minute, a common average for adult silent reading. Technical material reads slower.",
  },
  {
    q: "How are sentences counted?",
    a: "By counting full stops, question marks and exclamation marks. Abbreviations such as 'e.g.' can slightly inflate the count.",
  },
  {
    q: "Is my text uploaded?",
    a: "No. Counting happens in your browser as you type. Nothing is sent anywhere and nothing is saved.",
  },
  {
    q: "Does it count words the same way as Microsoft Word?",
    a: "Very closely. Both split on whitespace, so hyphenated terms count as one word and numbers count as words.",
  },
];

export const Route = createFileRoute("/tools/word-counter")({
  head: () =>
    pageHead({
      title: "Word Counter",
      description:
        "Count words, characters, sentences, paragraphs and reading time live as you type. Private, instant and free — nothing is uploaded.",
      path: "/tools/word-counter",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/word-counter"),
    }),
  component: WordCounterPage,
});

function WordCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const withoutSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed === "" ? 0 : (trimmed.match(/[.!?]+(\s|$)/g) ?? []).length || 1;
    const paragraphs = trimmed === "" ? 0 : trimmed.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
    const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
    return { words, characters, withoutSpaces, sentences, paragraphs, minutes };
  }, [text]);

  const items = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.withoutSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
  ];

  return (
    <ToolPage
      tool={tool}
      intro="Paste or type your text and see the word count, character count, sentences, paragraphs and reading time update live."
      howItWorks={
        <>
          <p>
            Words are counted by splitting the text on whitespace, so hyphenated terms count as one word.
            Characters are counted twice: once including spaces and line breaks, and once without, since
            different forms ask for different measures.
          </p>
          <p>
            Sentences are detected from full stops, question marks and exclamation marks. Paragraphs are
            blocks separated by a blank line. Reading time assumes 200 words per minute and is rounded up to
            at least one minute.
          </p>
        </>
      }
      example={
        <p>
          A 500-word cover letter typically comes out around 3,000 characters and reads in roughly{" "}
          <strong>3 minutes</strong> — useful when a job advert sets a one-page or word limit.
        </p>
      }
      tips={[
        "University essays and grant applications usually count everything except references — paste only the body text to get the number that matters.",
        "Meta descriptions should stay under about 160 characters; use the characters-with-spaces figure.",
        "If your paragraph count looks low, check that paragraphs are separated by a blank line rather than a single line break.",
        "Nothing here is saved, so copy your text out before closing the tab.",
      ]}
      faqs={FAQS}
      related={["cv-ats-checker", "pdf-tools", "date-difference-calculator"]}
    >
      <Card className="space-y-4">
        <label htmlFor="text" className="block text-sm font-medium text-foreground">
          Your text
        </label>
        <TextArea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
        />

        <div className="flex flex-wrap gap-2">
          <CopyButton value={text} label="Copy text" />
          <Button variant="ghost" onClick={() => setText("")}>
            <RotateCcw className="size-4" aria-hidden />
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-live="polite">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg bg-muted p-3">
              <p className="text-xl font-bold tabular-nums text-primary">{formatNumber(item.value)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xl font-bold tabular-nums text-primary">
              {stats.minutes} min
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Estimated reading time</p>
          </div>
        </div>
      </Card>
    </ToolPage>
  );
}
