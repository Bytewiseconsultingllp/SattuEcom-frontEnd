import {
  ShieldCheck,
  Compass,
  Globe2,
  Gem,
  FlaskConical,
  Accessibility,
  Recycle,
  Activity,
  Leaf,
  Sparkles,
  Search,
  TrendingUp,
  Users,
  ShoppingBag,
  Handshake,
  Target,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OverviewHighlight = {
  title: string;
  icon: LucideIcon;
  points: string[];
};

export const overviewHighlights: OverviewHighlight[] = [
  {
    title: "Our Promise",
    icon: ShieldCheck,
    points: [
      "Pure, wholesome food",
      "Rooted in tradition",
      "Engineered for modern nutritional needs",
    ],
  },
  {
    title: "Our Approach",
    icon: Compass,
    points: [
      "Authentic recipes",
      "Rigorous quality standards",
      "Transparent sourcing practices",
    ],
  },
  {
    title: "Our Impact",
    icon: Globe2,
    points: [
      "Accessible",
      "Premium nutrition",
      "Reconnects ancestral food wisdom",
    ],
  },
];

export type MissionValue = {
  title: string;
  icon: LucideIcon;
  description: string;
};

export const missionValues: MissionValue[] = [
  {
    title: "Authenticity",
    icon: Gem,
    description:
      "Each Grain Fusion product begins with the wisdom of traditional recipes and the purity of time-honored Indian ingredients—delivering a perfect blend of heritage and health.",
  },
  {
    title: "Quality",
    icon: FlaskConical,
    description:
      "Impeccable manufacturing standards and NABL certified lab testing ensure safety, nutrition, and unmatched integrity.",
  },
  {
    title: "Accessibility",
    icon: Accessibility,
    description:
      "Affordable premium nutrition crafted for all income groups across India, making wellness a daily habit.",
  },
  {
    title: "Sustainability",
    icon: Recycle,
    description:
      "Ethical sourcing and fair-trade practices support farmers and protect our environment for future generations.",
  },
];

export type ChallengeStat = {
  value: string;
  label: string;
  description: string;
};

export const challengeStats: ChallengeStat[] = [
  {
    value: "55%",
    label: "Increase in Lifestyle Diseases",
    description:
      "Diabetes, obesity, and hypertension in urban India have surged over the last decade.",
  },
  {
    value: "70%",
    label: "Food with Additives",
    description:
      "Artificial flavours, preservatives, and chemicals dominate today’s food supply.",
  },
];

export type SolutionPillar = {
  title: string;
  icon: LucideIcon;
  description: string;
};

export const solutionPillars: SolutionPillar[] = [
  {
    title: "Naturally Sourced",
    icon: Leaf,
    description: "Minimally processed, nutrition-packed ingredients.",
  },
  {
    title: "Trusted Origins",
    icon: ShieldCheck,
    description: "Authentic Indian grains and time-tested recipes.",
  },
  {
    title: "Clean Standards",
    icon: Sparkles,
    description: "Zero added preservatives, artificial colours, or harmful additives.",
  },
  {
    title: "Transparent Sourcing",
    icon: Search,
    description: "Full traceability with nutritional information disclosed.",
  },
];

export type MarketHighlight = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export const marketHighlights: MarketHighlight[] = [
  {
    label: "CAGR",
    value: "15-20%",
    description: "Projected growth across the wellness food sector through 2030.",
    icon: TrendingUp,
  },
  {
    label: "Target Consumers",
    value: "500M+",
    description: "Health-conscious Indians seeking authentic traditional foods.",
    icon: Users,
  },
];

export const competitiveStrengths: string[] = [
  "Unwavering focus on health and ingredient purity",
  "Deep inspiration from authentic Indian food traditions",
  "Transparent, fully traceable ingredient sourcing",
  "Zero compromise on quality standards or certifications",
  "Strong community engagement and brand trust",
];

export const strategicAdvantages: string[] = [
  "Innovative product range designed for modern convenience",
  "Proven potential for government and institutional partnerships",
  "Scalable across retail, ecommerce, and bulk channels",
  "Certified compliance with all food safety regulations",
  "Growing consumer loyalty and market differentiation",
];

export type PowerIngredient = {
  title: string;
  subtitle: string;
};

export const powerIngredients: PowerIngredient[] = [
  {
    title: "Flax Seeds",
    subtitle: "for Omega-3",
  },
  {
    title: "Soyabean",
    subtitle: "for plant-based protein",
  },
];

export const productBenefits: string[] = [
  "No artificial preservatives, colours, or flavours",
  "Exclusive benefit for vegetarians",
  "Rich in dietary fibre",
  "Fully dehydrated to preserve natural texture and nutrition",
];

export type ContactDetail = {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
};

export const contactDetails: ContactDetail[] = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 9876543210",
    description: "Mon – Sat, 9:00 AM – 6:00 PM",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@grainfusion.in",
    description: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    label: "Visit",
    value: "Patia, Bhubaneswar, Odisha, India",
    description: "Manufacturing & Experience Centre",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Monday – Saturday",
    description: "9:00 AM – 6:00 PM IST",
  },
];
