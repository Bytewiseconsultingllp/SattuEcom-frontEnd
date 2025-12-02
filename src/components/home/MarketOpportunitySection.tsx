import type { MarketHighlight } from "@/data/homeContent";

export type MarketOpportunitySectionProps = {
  id?: string;
  highlights: MarketHighlight[];
};

export const MarketOpportunitySection = ({ id, highlights }: MarketOpportunitySectionProps) => (
  <section id={id} className="bg-gradient-to-r from-lime-50 via-white to-emerald-50 py-20">
    <div className="container mx-auto space-y-12 px-4">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-emerald-900 md:text-4xl">
            Market Opportunity & Government Alignment
          </h2>
          <p className="leading-relaxed text-lg text-muted-foreground">
            India’s health and wellness food market represents a transformational opportunity. With a market size exceeding ₹50,000 crores and projected growth of 15–20% annually through 2030, Grain Fusion enters a market hungry for authentic, trustworthy solutions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {highlights.map(({ label, value, description, icon: Icon }) => (
            <div key={label} className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow">
              <div className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{label}</p>
                  <p className="text-2xl font-bold text-emerald-900">{value}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
