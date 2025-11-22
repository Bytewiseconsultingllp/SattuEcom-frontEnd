import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const shippingSections = [
  {
    title: "1. Overview",
    content:
      "Shipping charges are borne by the customer and are collected at the checkout payment page. Charges are shown transparently before you confirm payment.",
  },
  {
    title: "2. How Shipping Fee Is Calculated",
    list: [
      "Based on destination (PIN code/region)",
      "Order weight/volumetric weight and number of items",
      "Selected delivery speed (Standard / Express)",
      "Any applicable carrier surcharges (e.g., remote area, COD)",
    ],
    footer:
      "Your exact shipping fee is computed in real time during checkout after you provide your address and choose a delivery speed.",
  },
  {
    title: "3. Collection of Shipping Fee",
    content:
      "The shipping fee is added to your order total and collected along with the product amount at the checkout payment page. For Cash on Delivery (if available), carrier COD charges may apply.",
  },
  {
    title: "4. Dispatch & Delivery Timelines",
    list: [
      "Order processing: 1–2 business days",
      "Standard delivery: Typically 3–7 business days based on destination",
      "Express delivery: Typically 1–3 business days (where available)",
    ],
    footer:
      "Actual timelines may vary due to carrier capacity, local restrictions, weather, or festive loads. Tracking details are shared once the order is dispatched.",
  },
  {
    title: "5. Service Coverage",
    content:
      "We ship to most serviceable PIN codes within India through trusted courier partners. If your address is not serviceable, you will be notified during checkout and will not be charged.",
  },
  {
    title: "6. Order Tracking",
    content:
      "Once shipped, you will receive a tracking link via email/SMS. Please allow up to 24 hours for tracking data to reflect on the carrier's system.",
  },
  {
    title: "7. Failed/Returned Delivery",
    content:
      "If a delivery attempt fails due to incorrect address, unavailability, or refusal to accept, the shipment may be returned. In such cases, re-shipping may incur additional charges borne by the customer.",
  },
  {
    title: "8. Address Changes",
    content:
      "Address changes after order confirmation are not guaranteed. If the order hasn't been dispatched, we will try our best to update. If already shipped, carrier rerouting may not be possible or may incur extra charges.",
  },
  {
    title: "9. International Shipping",
    content:
      "International shipping is currently not available. We are working to enable it in the future.",
  },
  {
    title: "10. Support",
    content:
      "For any shipping-related queries, please contact support@grainfusion.in or WhatsApp +91 98705 43210 with your order ID.",
  },
];

const ShippingPolicy = () => {
  const sections = useMemo(() => shippingSections, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Shipping Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: November 22, 2025</p>
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

export default ShippingPolicy;
