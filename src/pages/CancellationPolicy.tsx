import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const cancellationSections = [
  {
    title: "1. Overview",
    content:
      "This Cancellation Policy explains the terms governing order cancellations made through Grain Fusion (\"we\", \"us\", or \"our\"), a brand operated by Swatishree's Innovation Pvt. Ltd. By placing an order, you acknowledge and accept the conditions outlined here.",
  },
  {
    title: "2. Orders Cannot Be Cancelled",
    content:
      "All orders placed through our Services are final and cannot be cancelled once confirmed. We initiate processing immediately to maintain product freshness, secure inventory, and ensure timely delivery.",
  },
  {
    title: "3. Modifications",
    content:
      "We are unable to accommodate post-confirmation changes to product selections, quantities, shipping addresses, or delivery schedules.",
  },
  {
    title: "4. Exceptions",
    list: [
      "We are unable to verify payment information.",
      "We detect suspected fraudulent or unauthorised activity.",
      "The product becomes unavailable or discontinued.",
      "There is a material error in pricing or product description.",
      "Operational, legal, or compliance issues require cancellation.",
    ],
    footer:
      "If we cancel your order for any of the above reasons, we will notify you promptly and process a refund to the original payment method where applicable.",
  },
  {
    title: "5. Returns and Refunds",
    content:
      "For concerns relating to damaged, defective, or incorrect products, please refer to our returns and refunds guidelines or contact support within the stipulated timeframe.",
  },
  {
    title: "6. Contact Us",
    content:
      "For questions regarding this policy, email support@sattuecom.com or write to Swatishree's Innovation Pvt. Ltd., Bengaluru, Karnataka, India.",
  },
];

const CancellationPolicy = () => {
  const sections = useMemo(() => cancellationSections, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Cancellation Policy</h1>
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

export default CancellationPolicy;
