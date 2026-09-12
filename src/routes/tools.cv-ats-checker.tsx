import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { pageHead, softwareAppJsonLd } from "@/lib/seo";
import { getTool } from "@/data/tools";
import { ToolPage } from "@/components/ToolPage";
import { Button, Card, Field, Notice, TextArea, TextInput } from "@/components/kit";

const tool = getTool("cv-ats-checker");

const SECTION_CHECKS: { label: string; patterns: RegExp }[] = [
  { label: "Contact details", patterns: /(email|@|phone|mobile|tel\b|linkedin)/i },
  { label: "Professional summary", patterns: /(summary|profile|objective|about me)/i },
  { label: "Work experience", patterns: /(experience|employment|work history|career)/i },
  { label: "Education", patterns: /(education|degree|diploma|university|college|certificate)/i },
  { label: "Skills", patterns: /(skills|competenc|proficien|technical)/i },
];

const WEAK_VERBS = ["responsible for", "duties included", "worked on", "helped with", "tasked with"];

const STOP_WORDS = new Set(
  "a an and are as at be by for from has have in is it its of on or that the to with we you your our will must should can able role job work team strong good experience years".split(
    " ",
  ),
);

function keywordsFrom(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return Array.from(new Set(words));
}

const FAQS = [
  {
    q: "Is my CV uploaded anywhere?",
    a: "No. The analysis runs entirely in your browser. Nothing is sent to a server, stored or logged.",
  },
  {
    q: "What is an ATS?",
    a: "An Applicant Tracking System is the software employers use to store and filter applications. It parses your CV into text, so anything that only exists as an image or a complex table can be lost.",
  },
  {
    q: "Does a high score guarantee an interview?",
    a: "No. This is a formatting and keyword readiness check, not a judgement of your experience. A human still reads the shortlist.",
  },
  {
    q: "Why paste plain text rather than upload a file?",
    a: "Pasting the text shows you what an ATS actually sees. If key details are missing when you copy from your CV, the system will likely miss them too.",
  },
];

export const Route = createFileRoute("/tools/cv-ats-checker")({
  head: () =>
    pageHead({
      title: "CV ATS Checker",
      description:
        "Check whether your CV is readable by applicant tracking systems. Get a score, missing sections, keyword gaps and fixes — analysed privately in your browser.",
      path: "/tools/cv-ats-checker",
      jsonLd: softwareAppJsonLd(tool.name, tool.description, "/tools/cv-ats-checker"),
    }),
  component: CvAtsPage,
});

function CvAtsPage() {
  const [cv, setCv] = useState("");
  const [job, setJob] = useState("");

  const analysis = useMemo(() => {
    const text = cv.trim();
    if (text.length < 100) return null;

    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const strengths: string[] = [];
    const issues: string[] = [];
    const actions: string[] = [];
    let score = 0;

    // Sections (40 points)
    const missingSections: string[] = [];
    for (const section of SECTION_CHECKS) {
      if (section.patterns.test(lower)) {
        score += 8;
        strengths.push(`${section.label} section detected`);
      } else {
        missingSections.push(section.label);
        issues.push(`No clear ${section.label.toLowerCase()} heading found`);
      }
    }
    if (missingSections.length > 0) {
      actions.push(
        `Add plain headings for: ${missingSections.join(", ")}. ATS software matches on standard section names.`,
      );
    }

    // Length (15 points)
    if (wordCount >= 300 && wordCount <= 1000) {
      score += 15;
      strengths.push(`Length is in range at ${wordCount} words`);
    } else if (wordCount < 300) {
      issues.push(`Only ${wordCount} words — likely too thin for most roles`);
      actions.push("Expand each role with what you delivered, not just what you were assigned.");
      score += 5;
    } else {
      issues.push(`${wordCount} words — long enough that recruiters may skim past key points`);
      actions.push("Trim older roles to two lines each and keep the detail on the last five years.");
      score += 8;
    }

    // Contact specifics (10 points)
    const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
    const hasPhone = /(\+?\d[\d\s()-]{7,})/.test(text);
    if (hasEmail) {
      score += 5;
      strengths.push("Email address present");
    } else {
      issues.push("No email address detected");
      actions.push("Put your email in the body text, not in a header or footer — parsers often skip those.");
    }
    if (hasPhone) {
      score += 5;
      strengths.push("Phone number present");
    } else {
      issues.push("No phone number detected");
      actions.push("Add a phone number in plain digits, e.g. +254 7XX XXX XXX.");
    }

    // Quantified achievements (15 points)
    const numberMatches = text.match(/\b\d+([.,]\d+)?%?\b/g) ?? [];
    if (numberMatches.length >= 5) {
      score += 15;
      strengths.push("Achievements are quantified with figures");
    } else {
      score += Math.min(10, numberMatches.length * 2);
      issues.push("Few measurable results — most bullets have no numbers");
      actions.push("Quantify outcomes: percentages saved, revenue handled, people trained, time reduced.");
    }

    // Weak phrasing (10 points)
    const weakFound = WEAK_VERBS.filter((phrase) => lower.includes(phrase));
    if (weakFound.length === 0) {
      score += 10;
      strengths.push("No passive 'responsible for' style phrasing");
    } else {
      issues.push(`Passive phrasing found: ${weakFound.join(", ")}`);
      actions.push("Start bullets with action verbs — led, built, negotiated, reduced, launched.");
    }

    // Formatting risks (10 points)
    const hasTabsOrPipes = /[|\t]/.test(text);
    const hasManySymbols = (text.match(/[►▪◆●]/g) ?? []).length > 3;
    if (!hasTabsOrPipes && !hasManySymbols) {
      score += 10;
      strengths.push("No table or decorative-symbol formatting detected");
    } else {
      issues.push("Table columns or decorative bullet symbols detected");
      actions.push("Replace tables and fancy symbols with simple hyphen bullets in a single column.");
    }

    // Keyword match against job description
    let matched: string[] = [];
    let missing: string[] = [];
    if (job.trim().length > 40) {
      const jobWords = keywordsFrom(job).slice(0, 120);
      const cvWords = new Set(keywordsFrom(cv));
      matched = jobWords.filter((w) => cvWords.has(w));
      missing = jobWords.filter((w) => !cvWords.has(w)).slice(0, 20);
      if (missing.length > 0) {
        actions.push(
          "Work the missing keywords below into your experience naturally — never as a hidden keyword list.",
        );
      }
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      wordCount,
      strengths,
      issues,
      actions,
      matched,
      missing,
      hasJob: job.trim().length > 40,
    };
  }, [cv, job]);

  const scoreTone =
    analysis === null ? "" : analysis.score >= 80 ? "text-primary" : analysis.score >= 55 ? "text-warning" : "text-destructive";

  return (
    <ToolPage
      tool={tool}
      intro="Paste your CV as plain text and see how an applicant tracking system is likely to read it — sections, keywords, formatting risks and fixes."
      howItWorks={
        <>
          <p>
            The checker scores your CV out of 100 across five areas: whether standard sections are present
            (40 points), whether the length is realistic (15), whether contact details can be parsed (10),
            whether achievements are quantified (15), whether phrasing is active (10) and whether the
            formatting is parser-safe (10).
          </p>
          <p>
            If you also paste the job advert, the meaningful words in it are compared against your CV so you
            can see which requirements you have not evidenced. Everything runs in your browser — your CV
            never leaves your device.
          </p>
        </>
      }
      example={
        <p>
          A CV with clear headings, a phone number and email in the body, and bullets like &ldquo;Reduced
          reconciliation time by 40% across 12 branches&rdquo; typically scores above 85. The same CV in a
          two-column table with &ldquo;Responsible for reconciliations&rdquo; usually scores under 60.
        </p>
      }
      tips={[
        "Save and submit as a .docx or a text-based PDF — never a scanned image or a design file.",
        "Use one column. Two-column layouts are the single most common reason a CV parses into nonsense.",
        "Mirror the job advert's own wording for job titles and tools, as long as it is honest.",
        "Keep your name, email and phone in the body of the document rather than the page header.",
      ]}
      faqs={FAQS}
      related={["word-counter", "pdf-tools", "salary-calculator"]}
      disclaimer="This is a formatting and keyword readiness check. It does not assess your suitability for a role and does not guarantee any outcome."
    >
      <Card className="space-y-4">
        <Notice tone="info">
          Your CV is analysed locally in your browser. Nothing is uploaded, stored or shared.
        </Notice>

        <Field label="Your CV text" htmlFor="cv" hint="Copy everything from your CV and paste it here.">
          <TextArea
            id="cv"
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            placeholder="Paste your full CV text..."
          />
        </Field>

        <Field
          label="Job description (optional)"
          htmlFor="job"
          hint="Paste the advert to see which of its keywords are missing from your CV."
        >
          <TextArea
            id="job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Paste the job advert..."
          />
        </Field>

        <Button
          variant="ghost"
          onClick={() => {
            setCv("");
            setJob("");
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Clear
        </Button>

        <div className="rounded-lg bg-muted p-4" aria-live="polite">
          {analysis ? (
            <div className="space-y-5">
              <div>
                <p className={`text-4xl font-bold tabular-nums ${scoreTone}`}>{analysis.score}/100</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ATS readiness score based on {analysis.wordCount} words.
                </p>
              </div>

              {analysis.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">What is working</h3>
                  <ul className="mt-2 space-y-1.5">
                    {analysis.strengths.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.issues.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">What needs work</h3>
                  <ul className="mt-2 space-y-1.5">
                    {analysis.issues.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.actions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recommended fixes</h3>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                    {analysis.actions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}

              {analysis.hasJob && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Keywords matched ({analysis.matched.length})
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {analysis.matched.slice(0, 30).join(", ") || "None yet."}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Keywords missing ({analysis.missing.length})
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {analysis.missing.join(", ") || "Nothing significant missing."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Paste at least a paragraph of your CV to see the analysis.
            </p>
          )}
        </div>
      </Card>
    </ToolPage>
  );
}
