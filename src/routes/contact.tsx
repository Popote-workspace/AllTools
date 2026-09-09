import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { StaticPage } from "@/components/StaticPage";
import { CONTACT_EMAIL } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact AllTools",
      description:
        "Get in touch with AllTools to report a problem with a calculator, suggest a new tool, or ask about the assumptions behind a result.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      intro="Questions, corrections and tool suggestions are all welcome."
      lastUpdated="January 2025"
    >
      <section>
        <h2>Email</h2>
        <p>
          The best way to reach AllTools is by email:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          There is no contact form on this site. A form would need a server to receive submissions, and
          AllTools deliberately runs without one for now.
        </p>
      </section>

      <section>
        <h2>Reporting a wrong result</h2>
        <p>
          If a calculator gives an answer that looks wrong, please include the tool name and the exact
          values you entered. That makes the problem reproducible and quick to fix.
        </p>
      </section>

      <section>
        <h2>Rate and cost corrections</h2>
        <p>
          Tax bands, levies and cost-per-square-metre assumptions change. If you have a current official
          source showing a figure on this site is out of date, send the link and it will be reviewed.
        </p>
      </section>

      <section>
        <h2>Response time</h2>
        <p>
          AllTools is a small project, so replies are not guaranteed to be immediate, but every message is
          read.
        </p>
      </section>
    </StaticPage>
  );
}
