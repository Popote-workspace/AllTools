import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "Terms of Use",
      description:
        "The terms that apply when you use AllTools calculators and converters, including acceptable use and limitation of liability.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPage
      title="Terms of Use"
      intro="By using AllTools you agree to these terms."
      lastUpdated="January 2025"
    >
      <section>
        <h2>Use of the site</h2>
        <p>
          AllTools is provided free of charge for personal and business use. You may use the tools as often
          as you like. You may not attempt to disrupt the site, misrepresent it as your own service, or use
          it in a way that breaks applicable law.
        </p>
      </section>

      <section>
        <h2>No professional advice</h2>
        <p>
          The tools produce estimates for general information only. They are not tax, legal, financial,
          engineering or career advice, and no professional relationship is created by using them. See the{" "}
          <Link to="/disclaimer" className="text-primary underline underline-offset-2">
            Disclaimer
          </Link>{" "}
          for detail.
        </p>
      </section>

      <section>
        <h2>Accuracy</h2>
        <p>
          Reasonable care is taken with formulas and published rates, but AllTools does not guarantee that
          any result is accurate, complete or current. Rates and costs change, and assumptions used by a
          tool may be out of date. Always verify important figures with an authoritative source.
        </p>
      </section>

      <section>
        <h2>Availability</h2>
        <p>
          The site is provided &ldquo;as is&rdquo; and may be changed, interrupted or withdrawn at any time
          without notice. Tools may be added, altered or removed.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, AllTools is not liable for any loss or damage arising from
          reliance on results produced by this site, including financial loss, missed deadlines or
          decisions made on the basis of an estimate.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          The design, text and tool implementations on this site belong to AllTools. Results you generate
          from your own inputs are yours to use freely.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          These terms may be updated. Continued use of the site after a change means you accept the revised
          terms.
        </p>
      </section>
    </StaticPage>
  );
}
