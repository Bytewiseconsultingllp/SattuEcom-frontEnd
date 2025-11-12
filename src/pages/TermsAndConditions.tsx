import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const termsSections = [
  {
    title: "1. Introduction",
    content:
      "Welcome to Grain Fusion (\"Brand\", \"we\", \"us\", or \"our\"), operated by Swatishree's Innovation Pvt. Ltd. (the \"Company\"). These Terms and Conditions (the \"Terms\") govern your access to and use of our website, mobile applications, products, and services (collectively, the \"Services\"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please discontinue use immediately.",
  },
  {
    title: "2. Definitions",
    list: [
      "Customer, you, or your refers to any individual or entity that accesses or uses our Services.",
      "Products refers to the goods and merchandise offered by Grain Fusion through the Services.",
      "Order refers to a purchase request placed through the Services for one or more Products.",
    ],
  },
  {
    title: "3. Eligibility",
    content:
      "You must be at least 18 years of age or the age of majority in your jurisdiction to place an Order. By using our Services, you represent and warrant that you meet this requirement and that the information you provide is accurate and complete.",
  },
  {
    title: "4. Account Registration and Security",
    list: [
      "Maintaining the confidentiality of your login credentials.",
      "Restricting access to your device or account.",
      "All activities that occur under your account.",
    ],
    footer:
      "Notify us immediately at support@sattuecom.com if you suspect unauthorized use of your account. Swatishree's Innovation Pvt. Ltd. reserves the right to suspend or terminate accounts at our discretion.",
  },
  {
    title: "5. Product Information",
    content:
      "We make every effort to provide accurate product descriptions, images, pricing, and availability information. However, we do not warrant that the product details are error-free, complete, or current. If an error is discovered, we reserve the right to correct it and, if necessary, cancel or refuse any affected Orders.",
  },
  {
    title: "6. Pricing and Payments",
    content:
      "All prices are listed in Indian Rupees (INR) unless otherwise specified. Prices, promotions, and discounts are subject to change without notice. You agree to pay the total price displayed at checkout, including applicable taxes, shipping charges, and fees. Payment must be made using the payment methods offered at checkout. We may require verification of payment information before accepting your Order.",
  },
  {
    title: "7. Order Acceptance and Fulfilment",
    content:
      "Your Order constitutes an offer to purchase Products from us. We reserve the right to accept or reject any Order at our discretion. Upon acceptance, you will receive an Order confirmation via email or SMS. We will use reasonable efforts to fulfil accepted Orders within the estimated delivery timelines; however, delays may occur due to circumstances beyond our control.",
  },
  {
    title: "8. Shipping and Delivery",
    content:
      "Shipping timelines are estimates and commence from the date of dispatch. Delivery delays may occur due to factors such as logistics provider delays, public holidays, or unforeseen events. Title and risk of loss transfer to you upon delivery of the Products to the shipping carrier. You are responsible for providing accurate delivery information; additional fees may apply for failed or redirected deliveries.",
  },
  {
    title: "9. Returns, Replacements, and Refunds",
    content:
      "Our Returns and Refunds process is governed by the policy published on our website. Please review the applicable policy prior to making a purchase. Eligibility for return or replacement may be subject to timelines, product condition, and other requirements.",
  },
  {
    title: "10. Order Cancellations",
    content:
      "Order cancellations are governed exclusively by our Cancellation Policy. By placing an Order, you acknowledge that once an Order is confirmed it cannot be cancelled. Please review the Cancellation Policy carefully before purchasing.",
  },
  {
    title: "11. Intellectual Property",
    content:
      "All content on the Services—including text, graphics, logos, images, product descriptions, and software—is owned by or licensed to Swatishree's Innovation Pvt. Ltd. and is protected by applicable intellectual property laws. You may not copy, reproduce, modify, distribute, or create derivative works from our content without our prior written consent.",
  },
  {
    title: "12. Acceptable Use",
    list: [
      "Use the Services for any unlawful purpose.",
      "Engage in fraudulent or deceptive practices.",
      "Interfere with or disrupt the operation of the Services.",
      "Upload or transmit malicious code or harmful content.",
      "Harvest or collect personal data of other users without consent.",
      "Infringe the intellectual property rights of Swatishree's Innovation Pvt. Ltd., Grain Fusion, or third parties.",
    ],
    footer: "You agree not to perform any of the above activities while using the Services.",
  },
  {
    title: "13. Third-Party Links and Services",
    content:
      "Our Services may contain links to third-party websites or services. We do not endorse or assume responsibility for any third-party content, products, or services. Access to third-party sites is at your own risk, and you should review the applicable terms and privacy policies of those sites.",
  },
  {
    title: "14. Disclaimer of Warranties",
    content:
      "The Services and Products are provided on an \"as is\" and \"as available\" basis without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, non-infringement, or accuracy. We do not guarantee uninterrupted, error-free, or secure access to the Services.",
  },
  {
    title: "15. Limitation of Liability",
    content:
      "To the fullest extent permitted by applicable law, Swatishree's Innovation Pvt. Ltd., Grain Fusion, their directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or other intangible losses arising out of or related to your use of the Services or Products, even if advised of the possibility of such damages.",
  },
  {
    title: "16. Indemnification",
    content:
      "You agree to indemnify, defend, and hold harmless Swatishree's Innovation Pvt. Ltd., Grain Fusion, and their affiliates from any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to your breach of these Terms, violation of applicable laws, or misuse of the Services.",
  },
  {
    title: "17. Governing Law and Dispute Resolution",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles. Any disputes arising from these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India, where Swatishree's Innovation Pvt. Ltd. is registered.",
  },
  {
    title: "18. Amendments",
    content:
      "We may update these Terms from time to time to reflect changes in our practices or legal requirements. Continued use of the Services after an update constitutes acceptance of the revised Terms. The latest version will always be available on our website with the \"Last updated\" date.",
  },
  {
    title: "19. Contact Us",
    content:
      "If you have any questions or concerns regarding these Terms, please contact us at support@sattuecom.com or write to Swatishree's Innovation Pvt. Ltd., Bengaluru, Karnataka, India.",
  },
];

const TermsAndConditions = () => {
  const sections = useMemo(() => termsSections, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Terms and Conditions</h1>
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

export default TermsAndConditions;
