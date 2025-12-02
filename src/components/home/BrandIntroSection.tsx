import { ShieldCheck } from "lucide-react";

export type BrandIntroSectionProps = {
  id?: string;
};

export const BrandIntroSection = ({ id }: BrandIntroSectionProps) => {
  return (
    <section id={id} className="bg-gradient-to-r from-emerald-50 via-white to-lime-50 py-20">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Swatishree's Innovation Pvt. Ltd.
          </span>
          <h2 className="text-4xl font-bold leading-tight text-emerald-900 md:text-5xl">Grain Fusion</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-emerald-800/90 md:text-xl">
            Traditional goodness meets modern convenience — nutrition-packed foods you can trust, taste, and enjoy every day.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-emerald-900">Nutrition for Modern Lifestyles</h3>
              <p className="text-muted-foreground">
                We revive heritage ingredients with contemporary formats, making wholesome nutrition effortless for busy families.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-emerald-900">Made in India, Trusted Everywhere</h3>
              <p className="text-muted-foreground">
                Proudly crafted in India with uncompromising quality standards and transparent sourcing.
              </p>
            </div>
          </div>

          <a
            href="https://www.grainfusion.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            www.grainfusion.in
          </a>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-100 blur-3xl opacity-60" aria-hidden />
          <div className="relative space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm uppercase tracking-wide text-emerald-700">Made in India</p>
                <p className="text-lg font-semibold text-emerald-900">Certified Quality</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Every Grain Fusion product is developed by Swatishree's Innovation Pvt. Ltd. to blend heritage with the pace of modern life.
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-2xl font-bold text-emerald-900">100%</p>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Natural</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-2xl font-bold text-emerald-900">0%</p>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Additives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
