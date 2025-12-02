import type { SolutionPillar } from "@/data/homeContent";

export type SolutionSectionProps = {
  id?: string;
  pillars: SolutionPillar[];
};

export const SolutionSection = ({ id, pillars }: SolutionSectionProps) => (
  <section id={id} className="py-20">
    <div className="container mx-auto space-y-12 px-4">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-3xl font-bold text-emerald-900 md:text-4xl">The Grain Fusion Solution</h2>
        <p className="text-lg text-muted-foreground">
          We tackle India’s nutrition challenge by reviving the wisdom of traditional eating in formats suited to modern life. Every
          product combines ancestral recipes with contemporary convenience and uncompromising quality standards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ title, icon: Icon, description }) => (
          <div key={title} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-900">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-lime-500 p-10 text-center text-white shadow-xl">
        <h3 className="mb-4 text-2xl font-semibold md:text-3xl">Wholesome nutrition for every lifestyle</h3>
        <p className="mx-auto max-w-3xl text-lg">
          Explore ready-to-cook convenience mixes, ready-to-eat superfoods, and nutrition-focused ranges with targeted health
          benefits—all maintaining our commitment to purity.
        </p>
      </div>
    </div>
  </section>
);
