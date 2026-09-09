import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About AllTools",
      description:
        "AllTools is a free, independent collection of online calculators and converters focused on Kenya and East Africa, built to run entirely in your browser.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <StaticPage
      title="About AllTools"
      intro="Useful tools. Simple answers. Free."
      lastUpdated="January 2025"
    >
      <section>
        <h2>What AllTools is</h2>
        <p>
          AllTools is an independent website offering free online calculators and converters. It started
          with a simple observation: most everyday calculations — a payslip, a plot of land, a car import,
          a road trip — are quick to work out, but the existing tools are either cluttered with adverts,
          locked behind sign-ups, or built for a different country entirely.
        </p>
        <p>
          The initial focus is Kenya and East Africa, with general-purpose tools that work anywhere.
        </p>
      </section>

      <section>
        <h2>How it works</h2>
        <p>
          Every tool runs inside your browser. There is no account, no server-side processing of your
          inputs, and no database storing what you type. Once a page has loaded, the calculation happens on
          your own device.
        </p>
      </section>

      <section>
        <h2>Accuracy and honesty</h2>
        <p>
          Arithmetic is exact. Anything that depends on tax rates, construction prices or fuel costs is an
          estimate, and those pages say so, show the assumptions they used, and carry a Last updated date.
          AllTools is not affiliated with the Kenya Revenue Authority or any government body.
        </p>
      </section>

      <section>
        <h2>What is next</h2>
        <p>
          More tools, better coverage of East African use cases, and improvements to the ones already here.
          If a feature cannot be built to work reliably, it is labelled Coming soon rather than shipped
          half-working.
        </p>
        <p>
          Have a suggestion? <Link to="/contact" className="text-primary underline underline-offset-2">Get in touch</Link>.
        </p>
      </section>
    </StaticPage>
  );
}
