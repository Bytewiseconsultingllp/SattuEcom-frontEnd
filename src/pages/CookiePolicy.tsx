import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const cookieSections = [
  {
    title: "1. Introduction",
    content:
      "Grain Fusion (\"we\", \"us\", or \"our\"), operated by Swatishree's Innovation Pvt. Ltd., uses cookies and similar tracking technologies to provide, enhance, and secure our Services. This Cookie Policy explains how we use cookies, the types we deploy, and the choices available to you.",
  },
  {
    title: "2. What Are Cookies?",
    content:
      "Cookies are small text files stored on your device when you visit a website. They enable the website to recognise your device and remember certain information over time.",
  },
  {
    title: "3. Types of Cookies We Use",
    subsections: [
      {
        subtitle: "3.1 Strictly Necessary Cookies",
        content:
          "Essential cookies that enable core features such as browsing, secure login, and checkout. The Services cannot function properly without them.",
      },
      {
        subtitle: "3.2 Performance and Analytics Cookies",
        content:
          "Cookies that collect aggregated information about how users interact with the Services. We use this data to optimise performance and improve user experience.",
      },
      {
        subtitle: "3.3 Functional Cookies",
        content:
          "Cookies that remember your preferences (such as language or region) and provide personalised features.",
      },
      {
        subtitle: "3.4 Advertising and Marketing Cookies",
        content:
          "Cookies used to deliver relevant advertisements and measure campaign effectiveness. These may be set by us or trusted advertising partners.",
      },
      {
        subtitle: "3.5 Third-Party Cookies",
        content:
          "Cookies placed by third parties, including analytics providers and social platforms. Their use is governed by the respective third-party policies.",
      },
    ],
  },
  {
    title: "4. Similar Technologies",
    content:
      "Web beacons, pixels, scripts, and tags may also be used to collect information about your interactions with the Services.",
  },
  {
    title: "5. How We Use Cookies",
    list: [
      "Authenticate users and maintain sessions.",
      "Remember cart contents and user preferences.",
      "Analyse usage statistics and trends.",
      "Provide targeted advertisements and measure campaign performance.",
      "Enhance security and detect fraudulent activities.",
    ],
  },
  {
    title: "6. Managing Cookie Preferences",
    content:
      "You can manage cookies through your browser settings or the cookie consent tool on our website. Blocking certain cookies may affect functionality.",
  },
  {
    title: "7. Do Not Track",
    content:
      "We currently do not respond to browser Do Not Track signals as no uniform standard has been adopted.",
  },
  {
    title: "8. Third-Party Links",
    content:
      "Our Services may include links to third-party websites. We are not responsible for their cookie practices. Please review their policies separately.",
  },
  {
    title: "9. Updates to This Policy",
    content:
      "We may update this Cookie Policy from time to time. The latest version will always be available on our website with the \"Last updated\" date.",
  },
  {
    title: "10. Contact Us",
    content:
      "If you have questions or concerns regarding this Cookie Policy, contact privacy@sattuecom.com or write to Swatishree's Innovation Pvt. Ltd., Bengaluru, Karnataka, India.",
  },
];

const CookiePolicy = () => {
  const sections = useMemo(() => cookieSections, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
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
                        <p className="leading-relaxed text-muted-foreground">{sub.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
