import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-primary-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Last updated: January 2025
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-4xl mx-auto animate-fade-in">
            <CardContent className="p-8 prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At SattuStore, we are committed to protecting your privacy and ensuring the security 
                  of your personal information. This Privacy Policy explains how we collect, use, and 
                  safeguard your data when you use our website and services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Name, email address, phone number, and shipping address</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Order history and preferences</li>
                  <li>Communication preferences</li>
                  <li>Feedback and reviews</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your orders and our services</li>
                  <li>Send you promotional materials (with your consent)</li>
                  <li>Improve our website and customer service</li>
                  <li>Prevent fraud and enhance security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your personal information 
                  from unauthorized access, disclosure, alteration, or destruction. However, no method 
                  of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your browsing experience, 
                  analyze site traffic, and personalize content. You can control cookie preferences 
                  through your browser settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to processing of your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us at support@sattustore.com or +91 98765 43210.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
