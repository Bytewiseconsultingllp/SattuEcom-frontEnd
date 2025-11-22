export const HOME_SECTION_IDS = {
  hero: "hero",
  brandIntro: "brand-intro",
  companyOverview: "company-overview",
  missionValues: "mission-values",
  nutritionChallenge: "nutrition-challenge",
  solution: "grain-fusion-solution",
  marketOpportunity: "market-opportunity",
  strategy: "strategy",
  product: "product",
  contactInfo: "contact-info",
  partnershipCta: "partnership-cta",
  benefits: "benefits",
  about: "about",
  testimonials: "testimonials",
  contactSection: "contact-section",
  finalCta: "final-cta",
} as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[keyof typeof HOME_SECTION_IDS];
