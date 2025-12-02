import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOME_SECTION_IDS } from "@/constants/homeSections";
import CompanyLogo from "@/assets/companyLogo.jpeg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import gsap from "gsap";

const exploreLinks = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Testimonials", href: `/#${HOME_SECTION_IDS.testimonials}` },
  { label: "Contact", href: "/contact-us" },
];

const policyLinks = [
  { label: "Orders & Shipping", href: "/shipping" },
  { label: "Returns & Refunds", href: "/cancellation-policy" },
  { label: "Cookie Policy", href: "/cookie-policy"},
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const resourceLinks = [
  { label: "Wholesale & B2B", href: "/b2b" },
  { label: "Corporate Wellness", href: "/corporate-wellness" },
  { label: "Investor Deck", href: "/investor" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
];

const contactDetails = [
  {
    icon: MapPin,
    label: "Experience Centre",
    value: "PLOT NO 224,LANE-9 ROAD NO-1,JAGANNATH VIHAR , BHUBANESWAR, Orissa, India - 751003",
  },
  {
    icon: Phone,
    label: "Customer Success",
    value: "+91 8917291456",
  },
  {
    icon: Mail,
    label: "Email",
    value: "siplhealthymix@gmail.com",
  },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/grainfusion" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/grainfusion" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/grainfusion" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@grainfusion" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const cols = mainRef.current.querySelectorAll('.footer-gsap-col');
    const tl = gsap.timeline();
    tl.from(mainRef.current.querySelector('img'), {
      scale: gsap.utils.random(0.85, 1.05),
      opacity: 0,
      y: gsap.utils.random(30, 60),
      duration: 0.7,
      ease: "power2.out"
    }).from(cols, {
      opacity: 0,
      y: gsap.utils.random(40,80),
      scale: gsap.utils.random(0.85,1.1),
      stagger: 0.1,
      duration: 0.7,
      ease: "back.out(2)"
    }, "<");
    return () => tl.kill();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-20 overflow-hidden bg-emerald-950 text-emerald-50">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" aria-hidden />
        <div className="absolute inset-0 bg-grid-white/[0.04]" aria-hidden />
      </div>
      <div className="relative container mx-auto px-4 py-10" ref={mainRef}>
        {/* Main footer grid */}
        <div className="grid gap-8 lg:grid-cols-5 items-start">
          <div className="lg:col-span-2 space-y-4 footer-gsap-col">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <img
                src={CompanyLogo}
                alt="Grain Fusion Logo"
                className="h-14 w-14 rounded-lg border border-white/10 object-cover"
              />
              <span className="text-2xl font-semibold">Grain Fusion</span>
            </Link>
            <p className="text-sm md:text-base text-emerald-100/80 leading-relaxed">
              Crafted by Swatishree's Innovation Pvt. Ltd., Grain Fusion is dedicated to reviving ancestral Indian nutrition with modern convenience, delivering truly gluten-free, millet-rich foods you can trust.
            </p>
            <ul className="mt-2 space-y-2 text-sm text-emerald-100/80">
              {contactDetails.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-lime-200" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 pt-2 pb-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/0 text-white transition-all hover:-translate-y-0.5 hover:border-lime-200 hover:bg-lime-200 hover:text-emerald-900"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-gsap-col">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100/80">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-emerald-100/80">
              {exploreLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="transition-colors hover:text-lime-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-gsap-col">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100/80">Policies</h3>
            <ul className="mt-4 space-y-3 text-sm text-emerald-100/80">
              {policyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="transition-colors hover:text-lime-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-4 backdrop-blur footer-gsap-col">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-100">PARTNER WITH US</h3>
            <p className="mt-3 text-sm text-emerald-100/80">
              From institutional nutrition programmes to white-label offerings, our team crafts solutions tailored for your audience.
            </p>
            <Link
              to="/contact"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-lime-200 hover:text-lime-200"
            >
              Schedule a discovery call
            </Link>
          </div>


          {/* <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-4 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-100">Partner with us</h3>
            <p className="mt-3 text-sm text-emerald-100/80">
              From institutional nutrition programmes to white-label offerings, our team crafts solutions tailored for your audience.
            </p>
            <Link
              to="/contact"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-lime-200 hover:text-lime-200"
            >
              Schedule a discovery call
            </Link>
          </div> */}
        </div>

        <div className="border-t border-white/10 pt-6 text-sm text-emerald-100/60">
          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} Grain Fusion • Swatishree's Innovation Pvt. Ltd. All rights reserved.</p>
            <p>Developed By <a
              href="https://www.bytewiseconsulting.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lime-200 underline"
            >
              Bytewise Consulting LLP
            </a></p>
          </div>
        </div>
      </div>
      <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
        <TooltipProvider>
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsNewsletterOpen(true)}
                  aria-label="Open newsletter signup"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-300 text-emerald-950 shadow-xl shadow-emerald-900/30 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
                >
                  <Mail className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-emerald-900 text-emerald-50 border-emerald-800">
                Newsletter signup
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleScrollToTop}
                  aria-label="Scroll to top"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900 text-white shadow-lg shadow-emerald-900/30 transition-transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-emerald-900 text-emerald-50 border-emerald-800">
                Back to top
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <DialogContent className="max-w-lg border border-emerald-200 bg-gradient-to-br from-emerald-900 via-emerald-950 to-black text-emerald-50">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-300/20 text-lime-300">
                <Mail className="h-6 w-6" />
              </span>
              Join the Grain Fusion Newsletter
            </DialogTitle>
            <DialogDescription className="text-emerald-100/80 text-sm">
              Wellness recipes, product launches, and community events delivered straight to your inbox.
            </DialogDescription>
          </DialogHeader>

          <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
            <Input
              type="text"
              placeholder="Full Name"
              className="border-emerald-400/40 bg-white/90 text-emerald-900 placeholder:text-emerald-600"
              required
            />
            <Input
              type="email"
              placeholder="Business email"
              className="border-emerald-400/40 bg-white/90 text-emerald-900 placeholder:text-emerald-600"
              required
            />
            <Input
              type="text"
              placeholder="City / Region"
              className="border-emerald-400/40 bg-white/90 text-emerald-900 placeholder:text-emerald-600"
            />
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-emerald-100/80">
              <p>By subscribing you agree to receive communications about Grain Fusion products and events. You can unsubscribe anytime.</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Button type="button" variant="ghost" className="text-emerald-100 hover:text-white" onClick={() => setIsNewsletterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="px-6">
                Subscribe
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </footer>
  );
};
