import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    pageHead({
      title: "Disclaimer",
      description:
        "AllTools results are estimates, not official assessments or professional advice. Read what each calculator can and cannot tell you.",
      path: "/disclaimer",
    }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <StaticPage
      title="Disclaimer"
      intro="Every result on AllTools is an estimate. Here is exactly what that means."
      lastUpdated="January 2025"
    >
      <section>
        <h2>General</h2>
        <p>
          AllTools is an independent website. It is not affiliated with, endorsed by, or acting on behalf of
          the Kenya Revenue Authority, the Independent Electoral and Boundaries Commission, any government
          agency, bank, insurer or employer.
        </p>
      </section>

      <section>
        <h2>Tax and payroll tools</h2>
        <p>
          The PAYE and salary calculators apply published rates and reliefs to the figures you enter. Real
          payslips vary with employer-specific benefits, non-cash benefit valuation, backdated changes and
          individual reliefs. Always verify current rates with the Kenya Revenue Authority and treat the
          output as an estimate.
        </p>
      </section>

      <section>
        <h2>Car import duty</h2>
        <p>
          The import duty calculator uses clearly labelled assumptions and a simplified depreciation model.
          It is not an official customs assessment. Actual liability is determined by KRA using the Current
          Retail Selling Price schedule and the state of the specific vehicle.
        </p>
      </section>

      <section>
        <h2>Construction and fuel costs</h2>
        <p>
          Construction cost per square metre varies enormously by location, materials, labour rates,
          foundation requirements and design. Fuel prices change monthly and by region. Both tools let you
          enter your own figures, which will always be more accurate than the defaults.
        </p>
      </section>

      <section>
        <h2>CV ATS Checker</h2>
        <p>
          The CV checker applies common applicant tracking system conventions. It is an ATS-style estimate,
          not an actual employer ATS, and a score here does not predict whether an application will
          succeed.
        </p>
      </section>

      <section>
        <h2>Election countdown</h2>
        <p>
          The countdown targets the date set in the site configuration for the 2027 Kenya General Election.
          Official election dates are set by the Independent Electoral and Boundaries Commission and can
          change. AllTools takes no political position.
        </p>
      </section>

      <section>
        <h2>Your responsibility</h2>
        <p>
          Do not make a financial, legal or contractual decision based only on a result from this site.
          Consult a qualified professional. See also our{" "}
          <Link to="/terms" className="text-primary underline underline-offset-2">
            Terms of Use
          </Link>
          .
        </p>
      </section>
    </StaticPage>
  );
}
