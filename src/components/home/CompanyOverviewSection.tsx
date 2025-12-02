import type { LucideIcon } from "lucide-react";

export type CompanyOverviewHighlight = {
  title: string;
  icon: LucideIcon;
  points: string[];
};

export type CompanyOverviewSectionProps = {
  id?: string;
  highlights: CompanyOverviewHighlight[];
};

export const CompanyOverviewSection = ({ id, highlights }: CompanyOverviewSectionProps) => (
  <section id={id} className="py-20">
    <div className="container mx-auto space-y-12 px-4">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-3xl font-bold text-emerald-900 md:text-4xl">Company Overview</h2>
        <p className="text-lg text-muted-foreground">
          At Grain Fusion, we fuse India’s traditional food heritage with modern wellness needs. Our mission is to transform age-old
          grains and recipes into nutritious, delicious, and ready-to-enjoy foods that fit seamlessly into contemporary life.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {highlights.map(({ title, icon: Icon, points }) => (
          <div key={title} className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold text-emerald-900">{title}</h3>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);
