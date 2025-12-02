import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { submitContactQuery } from "@/lib/api/contactQueries";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await submitContactQuery(formData);
      toast.success("Your message has been sent successfully! We'll get back to you soon.");
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Header - Matching homepage emerald/lime theme */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-800/60" />
            <div
              className="absolute -left-24 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-emerald-700/20 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -right-24 top-1/3 h-[500px] w-[500px] rounded-full bg-lime-400/20 blur-3xl"
              aria-hidden
            />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 mb-6 border border-white/20">
                <MessageSquare className="h-4 w-4 text-lime-300" />
                <span className="text-sm font-semibold uppercase tracking-wider text-lime-100">Contact Us</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Get in <span className="text-lime-300">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-emerald-100/80 leading-relaxed">
                Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="bg-gradient-to-b from-emerald-50 via-white to-lime-50/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Phone className="h-5 w-5" />
                        Phone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium text-emerald-900">+91 98765 43210</p>
                      <p className="text-sm text-muted-foreground mt-1">Mon-Sat, 9AM-6PM</p>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Mail className="h-5 w-5" />
                        Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium text-emerald-900">info@grainfusion.in</p>
                      <p className="text-sm text-muted-foreground mt-1">We'll reply within 24 hours</p>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <MapPin className="h-5 w-5" />
                        Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium text-emerald-900">Swatishree's Innovation Pvt. Ltd.</p>
                      <p className="text-sm text-muted-foreground">123 Main Street</p>
                      <p className="text-sm text-muted-foreground">City, State - 123456</p>
                      <p className="text-sm text-muted-foreground">India</p>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50 to-lime-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Clock className="h-5 w-5" />
                        Response Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        We typically respond to all inquiries within 24 hours during business days.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card className="border-emerald-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl text-emerald-900">Send us a Message</CardTitle>
                      <p className="text-muted-foreground">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </p>
                    </CardHeader>
                    <CardContent>
                      {submitted ? (
                        <div className="text-center py-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-emerald-900 mb-2">Message Sent!</h3>
                          <p className="text-muted-foreground mb-6">
                            Thank you for contacting us. We'll get back to you soon.
                          </p>
                          <Button
                            onClick={() => setSubmitted(false)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Send Another Message
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name *</Label>
                              <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number *</Label>
                              <Input
                                id="phone"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="subject">Subject *</Label>
                              <Input
                                id="subject"
                                placeholder="How can we help?"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                              id="message"
                              rows={6}
                              placeholder="Tell us more about your inquiry..."
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-lg shadow-lg shadow-emerald-900/30"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-5 w-5 mr-2" />
                                Send Message
                              </>
                            )}
                          </Button>

                          <p className="text-sm text-center text-muted-foreground">
                            By submitting this form, you agree to our privacy policy and terms of service.
                          </p>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
