import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import gsap from "gsap";

type ReviewSource = "google" | "website";

type Review = {
  id: string;
  authorName: string;
  location?: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  relativeTimeDescription?: string;
  source: ReviewSource;
};

const FALLBACK_REVIEWS: Review[] = [
  {
    id: "fallback-1",
    authorName: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Best sattu powder I've ever had! The taste is authentic and it's helped me maintain my energy levels throughout the day.",
    relativeTimeDescription: "3 weeks ago",
    source: "website",
    profilePhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    id: "fallback-2",
    authorName: "Rajesh Kumar",
    location: "Patna",
    rating: 5,
    text: "Reminds me of my childhood in Bihar. The ready-to-drink sattu fits perfectly into my schedule.",
    relativeTimeDescription: "1 month ago",
    source: "website",
    profilePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    id: "fallback-3",
    authorName: "Anita Desai",
    location: "Delhi",
    rating: 5,
    text: "The sattu ladoos are absolutely delicious! My kids love them and I feel good knowing they're eating something wholesome.",
    relativeTimeDescription: "2 months ago",
    source: "website",
    profilePhotoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
];

type TestimonialsProps = {
  id?: string;
};

export const Testimonials = ({ id }: TestimonialsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.testimonial-gsap-card');
    const tl = gsap.timeline();
    tl.from(sectionRef.current.querySelector('h2'), {
      y: gsap.utils.random(-30, 30),
      opacity: 0,
      duration: 0.6,
      ease: "expo.out"
    })
    .from(cards, {
      y: gsap.utils.random(50, 100),
      rotation: () => gsap.utils.random(-7, 7),
      opacity: 0,
      stagger: 0.18,
      duration: 0.7,
      ease: "power2.out"
    }, "<+0.1");
    return () => tl.kill();
  }, []);

  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        const response = await fetch("/api/public/google-reviews");
        if (!response.ok) {
          throw new Error("Failed to fetch Google reviews");
        }

        const payload = (await response.json()) as { reviews?: Review[] };
        if (Array.isArray(payload.reviews) && payload.reviews.length > 0) {
          setReviews(payload.reviews);
        }
      } catch (error) {
        console.warn("Using fallback testimonials due to review fetch error", error);
        setReviews(FALLBACK_REVIEWS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  const highlightedReview = useMemo(() => reviews[0], [reviews]);
  const secondaryReviews = useMemo(() => reviews.slice(1), [reviews]);

  return (
    <section id={id} className="relative py-20 bg-gradient-to-b from-emerald-50 via-white to-emerald-50" ref={sectionRef}>
      <div className="absolute inset-0 bg-grid-black/5 opacity-50" aria-hidden />
      <div className="relative container mx-auto px-4 space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
            <Quote className="h-4 w-4" /> Voices of Trust
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-950">What Our Customers Say</h2>
          <p className="text-lg text-emerald-800/80">
            Authentic experiences from families, wellness advocates, and nutrition partners embracing Grain Fusion.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Card className="border-l-4 border-primary shadow-xl bg-white/80 backdrop-blur testimonial-gsap-card">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={highlightedReview?.profilePhotoUrl ?? "https://placehold.co/96x96"}
                  alt={highlightedReview?.authorName}
                  className="h-16 w-16 rounded-full object-cover border border-emerald-100"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-xl font-semibold text-emerald-950">{highlightedReview?.authorName}</h3>
                  <p className="text-sm text-emerald-700/80">
                    {highlightedReview?.location ?? "Verified Grain Fusion buyer"}
                  </p>
                  <p className="text-xs text-emerald-600/80 uppercase tracking-[0.3em]">
                    {highlightedReview?.source === "google" ? "Google Review" : "Community Highlight"}
                    {highlightedReview?.relativeTimeDescription ? ` • ${highlightedReview.relativeTimeDescription}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: highlightedReview?.rating ?? 0 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              <blockquote className="text-lg text-emerald-900 leading-relaxed italic">
                “{highlightedReview?.text}”
              </blockquote>

              <div className="flex flex-wrap gap-3 text-sm text-emerald-700/80">
                <span className="rounded-full bg-emerald-100 px-3 py-1">Wholesome nutrition</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1">Trusted quality</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1">Family favourite</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {isLoading && <p className="text-sm text-emerald-700/70">Loading real-world experiences…</p>}
            {secondaryReviews.map((review) => (
              <Card key={review.id} className="border border-emerald-100/70 bg-white/70 shadow-sm backdrop-blur-sm testimonial-gsap-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.profilePhotoUrl ?? "https://placehold.co/80x80"}
                      alt={review.authorName}
                      className="h-12 w-12 rounded-full object-cover border border-emerald-100"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-emerald-900">{review.authorName}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/80">
                        {review.source === "google" ? "Google Review" : "Community Highlight"}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5 text-primary">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-emerald-800/90 leading-relaxed">“{review.text}”</p>
                  {review.relativeTimeDescription ? (
                    <p className="text-xs text-emerald-600/70">{review.relativeTimeDescription}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}

            <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-900 to-emerald-700 text-emerald-50">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-semibold">Share your Grain Fusion journey</h3>
                <p className="text-sm text-emerald-50/80">
                  Loved the taste or partnered with us? Leave a Google review and help more people discover wholesome nutrition.
                </p>
                <a
                  href="https://maps.app.goo.gl/q2RPHtcwYcBEDZ4e9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-50 underline decoration-emerald-200/80 hover:text-emerald-200"
                >
                  Write a Google review
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
