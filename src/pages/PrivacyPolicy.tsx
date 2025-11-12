import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const privacySections = [
  {
    title: "1. Introduction",
    content:
      "Grain Fusion (\"Brand\", \"we\", \"us\", or \"our\"), operated by Swatishree's Innovation Pvt. Ltd. (the \"Company\"), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you access or use our website, applications, products, and services (collectively, the \"Services\").",
  },
  {
    title: "2. Scope",
    content:
      "This policy applies to personal information collected through the Services. It does not cover third-party websites or services that may be linked from our platform.",
  },
  {
    title: "3. Information We Collect",
    subsections: [
      {
        subtitle: "3.1 Information You Provide Voluntarily",
        list: [
          "Account data such as name, email address, phone number, and shipping/billing information.",
          "Order details including products purchased and payment information handled by secure payment gateways.",
          "Communications sent via contact forms, support tickets, reviews, or surveys.",
          "Marketing preferences captured via opt-in or opt-out choices.",
        ],
      },
      {
        subtitle: "3.2 Information Collected Automatically",
        list: [
          "Device and usage data such as IP address, browser type, operating system, and referring URLs.",
          "Analytics data related to page views, clicks, purchase behaviour, and session duration.",
          "Log files containing diagnostics, error reports, and performance information.",
        ],
      },
      {
        subtitle: "3.3 Information from Third Parties",
        list: [
          "Payment processors providing confirmation of successful or failed payments.",
          "Delivery partners sharing fulfilment and tracking updates.",
          "Social or marketing platforms when you link or authenticate via external services.",
        ],
      },
    ],
    footer:
      "We do not knowingly collect personal information from individuals under 18 years of age. If we become aware of such collection, we will remove the information promptly.",
  },
  {
    title: "4. How We Use Your Information",
    list: [
      "Process and fulfil orders, manage payments, and coordinate delivery.",
      "Maintain user accounts, authenticate logins, and deliver customer support.",
      "Send service-related notifications, respond to inquiries, and communicate updates.",
      "Provide marketing communications and personalised recommendations (subject to your preferences).",
      "Analyse usage patterns to improve Services, develop new features, and enhance user experience.",
      "Detect, prevent, and respond to fraud, abuse, or security incidents.",
      "Comply with legal and regulatory obligations.",
    ],
  },
  {
    title: "5. Legal Bases for Processing",
    content:
      "Where applicable, we rely on contractual necessity, legitimate interests, consent, and compliance with legal obligations as lawful bases for processing personal data.",
  },
  {
    title: "6. How We Share Information",
    list: [
      "Service providers supporting operations such as payments, logistics, cloud storage, analytics, and marketing.",
      "Business partners collaborating on co-branded offerings (with consent when required).",
      "Law enforcement or regulators when required to comply with legal obligations or protect rights.",
      "Entities involved in corporate transactions, such as mergers or acquisitions, subject to appropriate safeguards.",
    ],
    footer: "We do not sell personal information for monetary consideration and only share aggregated, anonymised data when appropriate.",
  },
  {
    title: "7. Data Retention",
    content:
      "Personal information is retained only as long as necessary to fulfil the purposes outlined in this policy, meet legal obligations, resolve disputes, and enforce agreements. Data is securely deleted or anonymised when no longer required.",
  },
  {
    title: "8. Data Security",
    content:
      "We implement industry-standard safeguards such as encryption, secure servers, access controls, and monitoring to protect personal information. No system is entirely secure, so please use strong passwords and notify us of any suspected unauthorised access.",
  },
  {
    title: "9. International Transfers",
    content:
      "Your information may be transferred to and processed in locations outside your jurisdiction. We take steps to ensure such transfers comply with applicable data protection laws and that adequate protections are in place.",
  },
  {
    title: "10. Your Rights",
    list: [
      "Access, correct, or update personal information we hold about you.",
      "Request deletion or restriction of processing, subject to legal requirements.",
      "Object to processing based on legitimate interests or direct marketing.",
      "Receive personal data in a portable format where legally mandated.",
      "Withdraw consent where processing relies on consent.",
    ],
    footer: "To exercise these rights, contact us at privacy@sattuecom.com. We may request identity verification before processing your request.",
  },
  {
    title: "11. Cookies and Tracking Technologies",
    content:
      "Cookies and similar tools help us deliver and improve the Services. For detailed information and preference management, please refer to our Cookie Policy.",
  },
  {
    title: "12. Marketing Communications",
    content:
      "You may opt out of marketing emails at any time via the unsubscribe link or by contacting us. Transactional messages related to your orders will continue to be sent as necessary.",
  },
  {
    title: "13. Third-Party Services and Links",
    content:
      "We may provide links to third-party websites or integrations. Their privacy practices are independent of ours, and we encourage you to review their policies.",
  },
  {
    title: "14. Children’s Privacy",
    content:
      "Our Services are not directed at children under 18. If you believe we have collected information from a minor, please contact us so we can delete it.",
  },
  {
    title: "15. Updates to This Policy",
    content:
      "We may update this Privacy Policy periodically. The latest version will always be available on our website with the \"Last updated\" date. Continued use of the Services after updates constitutes acceptance.",
  },
  {
    title: "16. Contact Us",
    content:
      "For questions or requests regarding this policy, contact privacy@sattuecom.com or write to Swatishree's Innovation Pvt. Ltd., Bengaluru, Karnataka, India.",
  },
];

const PrivacyPolicy = () => {
  const sections = useMemo(() => privacySections, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: November 12, 2025</p>
          </header>

          <div className="space-y-8 text-left">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
                {section.content && <p className="leading-relaxed text-muted-foreground">{section.content}</p>}
                {section.list && (
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.subsections && (
                  <div className="space-y-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.subtitle} className="space-y-2">
                        <h3 className="text-lg font-semibold text-secondary-foreground">{sub.subtitle}</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                          {sub.list.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {section.footer && <p className="leading-relaxed text-muted-foreground">{section.footer}</p>}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
