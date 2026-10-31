import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { CategoryPage } from "@/components/CategoryPage";

const FAQS = [
  {
    q: "Are generated passwords safe to use?",
    a: "They are generated in your browser using the browser's cryptographically secure random number generator and are never transmitted or stored anywhere — not by us, and not in your browser's storage either. Copy them straight into your password manager.",
  },
  {
    q: "Do the QR codes expire?",
    a: "No. The QR code simply encodes the text you provide, so it works for as long as the destination — a link, Wi-Fi network or phone number — keeps working.",
  },
  {
    q: "Do I need an account?",
    a: "No. Every tool in this category runs entirely in your browser with no sign-up, no server and no tracking of what you type.",
  },
];

export const Route = createFileRoute("/utilities")({
  head: () =>
    pageHead({
      title: "Security & Utility Tools",
      description:
        "Generate QR codes and strong random passwords in your browser. Private by design — nothing is transmitted, stored or logged.",
      path: "/utilities",
      jsonLd: faqJsonLd(FAQS),
    }),
  component: () => (
    <CategoryPage
      category="utilities"
      title="Security & Utility Tools"
      intro="Everyday utilities that respect your privacy: QR codes and strong passwords, generated and processed entirely on your device."
      body={[
        "This category holds tools where privacy matters most. Passwords are generated with your browser's cryptographic random number generator and never leave the page — they are not sent to any server, saved in storage or written to logs. QR codes are drawn locally too, so the links, Wi-Fi credentials or contact details you encode stay on your device.",
        "Both tools validate what you enter and explain what they produce, so you can trust what you copy or download. There is nothing to install and no account to create.",
      ]}
      faqs={FAQS}
    />
  ),
});
