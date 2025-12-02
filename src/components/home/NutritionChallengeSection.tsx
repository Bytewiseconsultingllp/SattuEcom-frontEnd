import type { ChallengeStat } from "@/data/homeContent";
import { Activity, AlertTriangle } from "lucide-react";

export type NutritionChallengeSectionProps = {
  id?: string;
  stats: ChallengeStat[];
};

export const NutritionChallengeSection = ({ id, stats }: NutritionChallengeSectionProps) => (
  <section id={id} className="bg-muted/40 py-20">
    <div className="container mx-auto space-y-10 px-4">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-700">
            The Challenge
          </span>
          <h2 className="text-3xl font-bold text-emerald-900 md:text-4xl">India’s Nutrition Crisis</h2>
          <p className="leading-relaxed text-muted-foreground">
            Modern India faces a paradox—rising prosperity alongside declining nutritional health. Contemporary diets,
            increasingly processed and nutrient-deficient, are fueling a concerning surge in lifestyle-related diseases.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map(({ value, label, description }) => (
              <div key={value} className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">{value}</span>
                  <Activity className="h-6 w-6 text-primary/70" />
                </div>
                <p className="font-semibold text-emerald-900">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold text-emerald-900">The broader impact</h3>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            The growing nutrition crisis has placed a heavy burden on public healthcare systems, reduced workforce
            productivity, and escalated medical expenses for citizens. India’s nutrition challenge calls for urgent,
            scalable solutions grounded in time-tested traditional wisdom.
          </p>
        </div>
      </div>
    </div>
  </section>
);
