import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Testimonials } from "@/components/Testimonials";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Zap, Heart, Award } from "lucide-react";
import heroImage from "@/assets/hero-sattu.jpg";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { getBanners, type Banner } from "@/lib/api/banners";

const Index = () => {
  const featuredProducts = products.slice(0, 3);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadBanners = async () => {
      try {
        const data = await getBanners({ isActive: true });
        if (!mounted) return;

        const now = new Date();
        const filtered = (data || [])
          .filter((banner: Banner) => {
            const isActive = banner.isActive ?? true;
            const hasStart = !!banner.startDate;
            const hasEnd = !!banner.endDate;
            const startDate = hasStart ? new Date(banner.startDate) : null;
            const endDate = hasEnd ? new Date(banner.endDate) : null;

            const startOk = !startDate || isNaN(startDate.getTime()) || startDate <= now;
            const endOk = !endDate || isNaN(endDate.getTime()) || endDate >= now;

            return isActive && startOk && endOk;
          })
          .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

        setBanners(filtered);
      } catch {
        if (mounted) {
          setBanners([]);
        }
      }
    };

    loadBanners();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    setSlideCount(carouselApi.scrollSnapList().length || 0);
    onSelect();

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || slideCount <= 1) return;

    const interval = setInterval(() => {
      const api = carouselApi;
      if (!api) return;
      const current = api.selectedScrollSnap();
      const nextIndex = current + 1 >= slideCount ? 0 : current + 1;
      api.scrollTo(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselApi, slideCount]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Sattu Products"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Pure, Natural, <span className="text-primary">Powerful</span> Sattu
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Experience the traditional superfood from Bihar. 100% natural, protein-rich, and delicious. Your path to better health starts here.
              </p>
              <div className="flex gap-4">
                <Link to="/products">
                  <Button size="lg" className="text-lg px-8">
                    Shop Now
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {banners.length > 0 && (
          <section className="py-8 bg-background w-full overflow-hidden">
            <Carousel
              className="relative w-full overflow-hidden"
              setApi={setCarouselApi}
              opts={{ align: "start" }}
            >
              <CarouselContent className="w-full ml-0">
                  {banners.map((banner) => {
                    const isExternal = banner.linkUrl && banner.linkUrl.startsWith("http");

                    const content = (
                      <div className="relative overflow-hidden">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-[260px] md:h-[360px] lg:h-[420px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/10" />
                        <div className="absolute inset-0 flex items-center">
                          <div className="px-6 md:px-10 max-w-xl text-white space-y-3">
                            <h3 className="text-2xl md:text-3xl font-bold">{banner.title}</h3>
                            {banner.description && (
                              <p className="text-sm md:text-base text-white/90">
                                {banner.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );

                    return (
                      <CarouselItem key={banner.id || banner.imageUrl} className="pl-0">
                        {banner.linkUrl ? (
                          isExternal ? (
                            <a href={banner.linkUrl} target="_blank" rel="noreferrer">
                              {content}
                            </a>
                          ) : (
                            <Link to={banner.linkUrl}>
                              {content}
                            </Link>
                          )
                        ) : (
                          content
                        )}
                      </CarouselItem>
                    );
                  })}
              </CarouselContent>

              {slideCount > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`h-[3px] w-8 rounded-full border border-white/60 bg-white/20 transition-all ${
                        currentSlide === index ? "bg-white border-white w-10" : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </Carousel>
          </section>
        )}

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Sattu?</h2>
              <p className="text-lg text-muted-foreground">Pure nutrition backed by tradition</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="benefit-card text-center hover-scale transition-all">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">100% Natural</h3>
                  <p className="text-muted-foreground">No chemicals, no preservatives. Just pure goodness.</p>
                </CardContent>
              </Card>

              <Card className="benefit-card text-center hover-scale transition-all">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">High Protein</h3>
                  <p className="text-muted-foreground">20g protein per 100g. Perfect for fitness enthusiasts.</p>
                </CardContent>
              </Card>

              <Card className="benefit-card text-center hover-scale transition-all">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Heart Healthy</h3>
                  <p className="text-muted-foreground">Low glycemic index. Great for diabetics.</p>
                </CardContent>
              </Card>

              <Card className="benefit-card text-center hover-scale transition-all">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Traditional</h3>
                  <p className="text-muted-foreground">Authentic recipes passed down generations.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-lg text-muted-foreground">Discover our bestsellers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredProducts.map(product => (
                <div key={product.id} className="featured-product">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/products">
                <Button size="lg" variant="outline">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Contact Section */}
        <ContactSection />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have made sattu a part of their daily routine.
            </p>
            <Link to="/products">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
