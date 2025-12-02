import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-sattu.jpg";

export type HeroSectionProps = {
  id?: string;
};

const HERO_STATS = [
  {
    label: "Gluten Free",
    value: "100%",
    description: "Millet-rich blends without additives",
  },
  {
    label: "Farm Partnerships",
    value: "2,000+",
    description: "Fair-trade sourcing across India",
  },
  {
    label: "Customer Trust",
    value: "500+",
    description: "Families loving Grain Fusion daily",
  },
];

export const HeroSection = ({ id }: HeroSectionProps) => {
  return (
    <section id={id} className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Grain Fusion Hero" className="h-full w-full object-cover" />
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

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-28 lg:py-36">
          <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-8 text-primary-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-lime-300" />
                Made in India • Swatishree's Innovation Pvt. Ltd.
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Reviving traditional grains <span className="text-lime-300">for modern nutrition</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-emerald-100/80 md:text-xl">
                Grain Fusion transforms age-old recipes into convenient, nutrient-dense foods. Discover gluten-free millets,
                protein-rich mixes, and wholesome superfoods crafted for every generation.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="px-8 text-lg shadow-lg shadow-emerald-900/30">
                    Explore Products
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-200 px-8 text-lg text-emerald-50 hover:bg-emerald-200/10"
                >
                  View Nutrition Story
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
                {HERO_STATS.map(({ label, value, description }) => (
                  <div key={label} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/80">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-lime-200">{value}</p>
                    <p className="mt-2 text-sm text-emerald-100/70">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-emerald-700/30 blur-2xl" aria-hidden />
              <div className="relative space-y-6 rounded-3xl border border-emerald-100/50 bg-white/95 p-8 shadow-2xl">
                <h3 className="text-xl font-semibold text-emerald-900">Why Grain Fusion?</h3>
                <ul className="space-y-3 text-sm text-emerald-700">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    20 authentic ingredients with 2X millet content for unmatched nutrition.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    Complete natural processing—no artificial flavours, colours, or preservatives.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    Crafted by Swatishree’s Innovation Pvt. Ltd., blending ancestral recipes with modern convenience.
                  </li>
                </ul>

                <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Featured</p>
                  <p className="text-lg font-semibold text-emerald-900">Trusted by wellness enthusiasts nationwide</p>
                  <p className="text-sm text-emerald-700/80">
                    Join a growing community embracing pure, ready-to-enjoy nutrition rooted in India’s heritage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
