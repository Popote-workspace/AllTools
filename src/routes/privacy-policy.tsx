import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { StaticPage } from "@/components/StaticPage";
import { CONTACT_EMAIL } from "@/config/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    pageHead({
      title: "Privacy Policy",
      description:
        "How AllTools handles data: calculations run in your browser, no accounts, no stored inputs, and no advertising cookies while ads are disabled.",
      path: "/privacy-policy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      intro="This policy explains what AllTools does and does not collect."
      lastUpdated="January 2025"
    >
      <section>
        <h2>Summary</h2>
        <p>
          AllTools does not require an account, does not ask for personal details, and does not store the
          values you type into any calculator. Calculations run locally in your browser.
        </p>
      </section>

      <section>
        <h2>Information you enter into tools</h2>
        <p>
          Salary figures, dates, CV text, PDF files and every other input stay on your device. They are not
          transmitted to AllTools or to any third party, and nothing is saved after you close or reload the
          page.
        </p>
      </section>

      <section>
        <h2>Analytics</h2>
        <p>
          Analytics is currently disabled on this site. If a privacy-respecting analytics provider is added
          in future, it will be used only for aggregate page-view counts, this policy will be updated
          before it is switched on, and calculator inputs will never be included.
        </p>
      </section>

      <section>
        <h2>Advertising</h2>
        <p>
          AllTools does not currently display advertising and no advertising cookies are set. The site is
          built so that Google AdSense could be added later. If that happens, this policy will be updated
          to describe the cookies and data involved, and advertising will never be placed where it covers
          content, buttons or navigation.
        </p>
      </section>

      <section>
        <h2>Cookies and local storage</h2>
        <p>
          AllTools does not set tracking cookies. Your browser may cache page files so the site loads
          faster on your next visit; that is standard browser behaviour and is not used to identify you.
        </p>
      </section>

      <section>
        <h2>External links</h2>
        <p>
          Some pages link to external sources such as the Kenya Revenue Authority. Those sites have their
          own privacy policies, which AllTools does not control.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          AllTools is a general-purpose utility site and does not knowingly collect information from
          anyone, including children.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          Any change to this policy will be reflected in the Last updated date below. Questions can be sent
          to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          . See also our{" "}
          <Link to="/terms" className="text-primary underline underline-offset-2">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link to="/disclaimer" className="text-primary underline underline-offset-2">
            Disclaimer
          </Link>
          .
        </p>
      </section>
    </StaticPage>
  );
}
