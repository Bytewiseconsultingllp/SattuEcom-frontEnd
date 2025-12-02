import type { MissionValue } from "@/data/homeContent";

export type MissionValuesSectionProps = {
  id?: string;
  values: MissionValue[];
};

export const MissionValuesSection = ({ id, values }: MissionValuesSectionProps) => (
  <section id={id} className="bg-emerald-950/95 py-20 text-emerald-50">
    <div className="container mx-auto space-y-12 px-4">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Our Mission and Values</h2>
        <p className="text-lg text-emerald-100/80">
          We reconnect people with the power of traditional Indian nutrition through clean, natural, and accessible food choices—promoting a balanced, healthy lifestyle for every generation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {values.map(({ title, icon: Icon, description }) => (
          <div key={title} className="space-y-4 rounded-2xl border border-emerald-800 bg-emerald-900/60 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800/80">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-emerald-100/80">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
