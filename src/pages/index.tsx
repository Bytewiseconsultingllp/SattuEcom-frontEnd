import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HOME_SECTION_IDS } from "@/constants/homeSections";

import {
  Leaf,
  Zap,
  ShieldCheck,
  Compass,
  Globe2,
  Gem,
  FlaskConical,
  Accessibility,
  Recycle,
  Activity,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Handshake,
  Rocket,
  Calendar,
  Quote,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Loader2,
  ShoppingBag,
  Search,
  Heart, 
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import heroImage from "@/assets/hero-sattu.jpg";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { getBanners, type Banner } from "@/lib/api/banners";
import { getProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/ProductCard";
import { competitiveStrengths, contactDetails, marketHighlights, powerIngredients, productBenefits, strategicAdvantages } from "@/data/homeContent";
import { Testimonials } from "@/components/Testimonials";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "@/contexts/CartContext";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/api/wishlist";
import { toast } from "sonner";
import { Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [loadingCart, setLoadingCart] = useState<Set<string>>(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState<Set<string>>(new Set());
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Check if user is logged in
  const isUserLoggedIn = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    return !!token;
  };

  // Handler for adding to cart
  const handleAddToCart = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isUserLoggedIn()) {
      toast.error('Please login to add items to cart', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }
    
    setLoadingCart(prev => new Set(prev).add(productId));
    try {
      await addToCart(productId, 1);
      toast.success(`${productName} added to cart!`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add to cart');
    } finally {
      setLoadingCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handler for toggling wishlist
  const handleToggleWishlist = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isUserLoggedIn()) {
      toast.error('Please login to manage wishlist', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    setLoadingWishlist(prev => new Set(prev).add(productId));
    try {
      const isInWish = wishlistItems.has(productId);
      if (isInWish) {
        await removeFromWishlist(productId);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success(`${productName} removed from wishlist`);
      } else {
        await addToWishlist(productId);
        setWishlistItems(prev => new Set(prev).add(productId));
        toast.success(`${productName} added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update wishlist');
    } finally {
      setLoadingWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

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

        console.log('Loaded banners:', filtered.length, filtered);
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
    let mounted = true;

    const loadAllProducts = async () => {
      try {
        const res: any = await getProducts(1, 100); // Load more products for marquee
        if (!mounted) return;

        if (res?.success) {
          setAllProducts(res.data || []);
          setFeaturedProducts((res.data || []).slice(0, 3));
        } else if (Array.isArray(res)) {
          setAllProducts(res);
          setFeaturedProducts(res.slice(0, 3));
        } else if (res?.data && Array.isArray(res.data)) {
          setAllProducts(res.data);
          setFeaturedProducts(res.data.slice(0, 3));
        }
      } catch {
        if (mounted) {
          setAllProducts([]);
          setFeaturedProducts([]);
        }
      }
    };

    loadAllProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    const updateSlideCount = () => {
      const count = carouselApi.scrollSnapList().length || 0;
      setSlideCount(count);
      console.log('Carousel initialized with', count, 'slides from', banners.length, 'banners');
      
      // If mismatch, carousel might need more time to render all slides
      if (count !== banners.length && banners.length > 0) {
        console.warn('Slide count mismatch! Carousel:', count, 'Banners:', banners.length);
      }
    };

    // Wait for carousel to be ready and re-check when banners change
    setTimeout(updateSlideCount, 150);
    onSelect();

    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", updateSlideCount);
    
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", updateSlideCount);
    };
  }, [carouselApi, banners.length]);

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

  useEffect(() => {
    let mounted = true;

    const loadFeaturedProducts = async () => {
      try {
        const res: any = await getProducts(1, 3);
        if (!mounted) return;

        if (res?.success) {
          setFeaturedProducts(res.data || []);
        } else if (Array.isArray(res)) {
          setFeaturedProducts(res.slice(0, 3));
        } else if (res?.data && Array.isArray(res.data)) {
          setFeaturedProducts(res.data.slice(0, 3));
        }
      } catch {
        if (mounted) {
          setFeaturedProducts([]);
        }
      }
    };

    loadFeaturedProducts();

    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    const revertFns: Array<() => void> = [];

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-animate]", { clearProps: "all", opacity: 1, y: 0, scale: 1, rotate: 0 });
      gsap.utils.toArray<HTMLElement>("[data-gsap-stagger]").forEach((container) => {
        const items = Array.from(container.children) as HTMLElement[];
        gsap.set(items, { clearProps: "all", opacity: 1, y: 0, scale: 1, rotate: 0 });
      });
      gsap.set("[data-parallax-speed]", { y: 0 });
      return () => {};
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: Array<() => void> = [];

      // Animate basic elements with data-animate
      gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((el) => {
        const strong = el.hasAttribute("data-animate-strong");
        gsap.set(el, strong ? { opacity: 0, y: 50, scale: 0.95, rotate: -2 } : { opacity: 0, y: 30 });
        const anim = gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: strong ? 1.2 : 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        cleanups.push(() => {
          anim.scrollTrigger && anim.scrollTrigger.kill();
          anim.kill();
        });
      });

      // Animate stagger containers
      gsap.utils.toArray<HTMLElement>("[data-gsap-stagger]").forEach((container) => {
        const items = Array.from(container.children) as HTMLElement[];
        const from = (container.dataset.stagger as any) || "start";
        gsap.set(items, { opacity: 0, y: 20, scale: 0.96 });
        const anim = gsap.to(items, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: { each: 0.1, from },
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        cleanups.push(() => {
          anim.scrollTrigger && anim.scrollTrigger.kill();
          anim.kill();
        });
      });

      // Hero section timeline animation
      const hero = document.querySelector<HTMLElement>("[data-gsap-hero]");
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        const badge = hero.querySelector("[data-gsap-badge]");
        const title = hero.querySelector("h1");
        const paragraph = hero.querySelector("p");
        const buttons = hero.querySelector(".flex.flex-wrap");
        const stats = hero.querySelector("[data-gsap-stats]");
        
        gsap.set([badge, title, paragraph, buttons], { opacity: 0, y: 20 });
        if (stats) gsap.set(Array.from((stats as HTMLElement).children), { opacity: 0, y: 15, scale: 0.9 });

        tl.to(badge, { opacity: 1, y: 0, duration: 0.5 }, 0.2)
          .to(title, { opacity: 1, y: 0, duration: 0.7 }, 0.4)
          .to(paragraph, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
          .to(buttons, { opacity: 1, y: 0, duration: 0.5 }, 0.8)
          .to(stats ? Array.from((stats as HTMLElement).children) : [], { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.6, 
            stagger: { each: 0.1, from: "center" } 
          }, 1);
        cleanups.push(() => tl.kill());
      }

      // Parallax effects
      gsap.utils.toArray<HTMLElement>("[data-parallax-speed]").forEach((el) => {
        const d = parseFloat(el.dataset.parallaxSpeed || "20");
        const anim = gsap.to(el, {
          y: () => d,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        cleanups.push(() => {
          anim.scrollTrigger && anim.scrollTrigger.kill();
          anim.kill();
        });
      });

      // Hover animations for cards
      gsap.utils.toArray<HTMLElement>(".featured-product, .rounded-2xl, .rounded-3xl").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      revertFns.push(() => {
        cleanups.forEach((fn) => fn());
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });

      return () => {
        cleanups.forEach((fn) => fn());
      };
    });

    return () => {
      revertFns.forEach((fn) => fn());
      mm.revert();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Banner Section */}
        {banners.length > 0 && (
          <section className="relative w-full overflow-hidden" data-animate="true">
            <Carousel
              className="relative w-full overflow-hidden"
              setApi={setCarouselApi}
              opts={{ align: "start", loop: true }}
            >
                <CarouselContent className="w-full ml-0">
                    {banners.map((banner, index) => {
                      const isExternal = banner.linkUrl && banner.linkUrl.startsWith("http");

                      const content = (
                        <div className="relative overflow-hidden group cursor-pointer">
                          {/* Image with zoom effect on hover */}
                          <div className="relative overflow-hidden">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full h-[300px] md:h-[450px] lg:h-[550px] object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Gradient overlays for better text visibility */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </div>
                          
                          {/* Content overlay */}
                          <div className="absolute inset-0 flex items-center">
                            <div className="container mx-auto px-8 md:px-12 lg:px-16">
                              <div className="max-w-2xl space-y-4 md:space-y-6">
                                {/* Badge/Tag */}
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 border border-white/30">
                                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                    Featured Offer
                                  </span>
                                </div>

                                {/* Title with animation */}
                                <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight transform transition-all duration-500 group-hover:translate-x-2">
                                  {banner.title}
                                </h3>

                                {/* Description */}
                                {banner.description && (
                                  <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl transform transition-all duration-500 group-hover:translate-x-2">
                                    {banner.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Slide number indicator */}
                          <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                            <span className="text-white font-semibold text-sm">
                              {index + 1} / {banners.length}
                            </span>
                          </div>
                        </div>
                      );

                      return (
                        <CarouselItem key={banner.id || banner.imageUrl} className="pl-0">
                          {banner.linkUrl ? (
                            isExternal ? (
                              <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="block">
                                {content}
                              </a>
                            ) : (
                              <Link to={banner.linkUrl} className="block">
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

                {/* Navigation Buttons */}
                {slideCount > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() => carouselApi?.scrollPrev()}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-emerald-900 p-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 group"
                      aria-label="Previous slide"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={() => carouselApi?.scrollNext()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-emerald-900 p-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 group"
                      aria-label="Next slide"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`transition-all duration-300 rounded-full ${
                            currentSlide === index 
                              ? "bg-white w-12 h-3" 
                              : "bg-white/50 hover:bg-white/70 w-3 h-3"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Progress Bar */}
                {slideCount > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${((currentSlide + 1) / slideCount) * 100}%` }}
                    />
                  </div>
                )}
            </Carousel>
          </section>
        )}

        {/* Products Section */}
        {allProducts.length > 0 && (
          <section className="py-12 bg-gradient-to-r from-emerald-50 via-white to-lime-50 overflow-hidden">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Our Products</h2>
              <p className="text-lg text-muted-foreground">Explore our range of traditional nutrition</p>
            </div>
            
            {/* Marquee Animation with Pause on Hover */}
            <div className="relative group">
              <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
                {/* First set of products */}
                {allProducts.map((product: any, index: number) => (
                  <div key={`first-${product._id || product.id || index}`} className="inline-block mx-4 flex-shrink-0" style={{ width: '300px' }}>
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                      <Link to={`/product/${product._id || product.id}`}>
                        <div className="relative overflow-hidden group/img" style={{ height: '260px' }}>
                          <img
                            src={product.images?.[0] || product.imageUrl || product.image || '/placeholder.svg'}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          {product.discount && product.discount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4 flex flex-col flex-grow">
                        <Link to={`/product/${product._id || product.id}`}>
                          <h3 className="font-semibold text-base text-emerald-900 mb-2 line-clamp-2 min-h-[44px] hover:text-emerald-700 transition-colors">
                            {product.name || 'Product Name'}
                          </h3>
                        </Link>
                        
                        {/* Ratings */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating || product.averageRating || 4)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            ({product.reviews_count || product.reviewCount || 0})
                          </span>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl font-bold text-emerald-600">
                              ₹{product.price || product.sellingPrice || 0}
                            </span>
                            {(product.originalPrice || product.mrp) && (product.originalPrice || product.mrp) > (product.price || product.sellingPrice) && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{product.originalPrice || product.mrp}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleAddToCart(e, product._id || product.id, product.name)}
                              disabled={loadingCart.has(product._id || product.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              {loadingCart.has(product._id || product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ShoppingBag className="h-4 w-4" />
                              )}
                              <span className="text-xs">Cart</span>
                            </button>
                            <button
                              onClick={(e) => handleToggleWishlist(e, product._id || product.id, product.name)}
                              disabled={loadingWishlist.has(product._id || product.id)}
                              className={`p-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                wishlistItems.has(product._id || product.id)
                                  ? 'bg-red-50 border-red-500 text-red-500'
                                  : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                              }`}
                            >
                              {loadingWishlist.has(product._id || product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Heart 
                                  className="h-4 w-4" 
                                  fill={wishlistItems.has(product._id || product.id) ? 'currentColor' : 'none'}
                                />
                              )}
                            </button>
                            <Link to={`/product/${product._id || product.id}`}>
                              <button className="p-2 rounded-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all">
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {allProducts.map((product: any, index: number) => (
                  <div key={`second-${product._id || product.id || index}`} className="inline-block mx-4 flex-shrink-0" style={{ width: '300px' }}>
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                      <Link to={`/product/${product._id || product.id}`}>
                        <div className="relative overflow-hidden group/img" style={{ height: '260px' }}>
                          <img
                            src={product.images?.[0] || product.imageUrl || product.image || '/placeholder.svg'}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          {product.discount && product.discount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4 flex flex-col flex-grow">
                        <Link to={`/product/${product._id || product.id}`}>
                          <h3 className="font-semibold text-base text-emerald-900 mb-2 line-clamp-2 min-h-[44px] hover:text-emerald-700 transition-colors">
                            {product.name || 'Product Name'}
                          </h3>
                        </Link>
                        
                        {/* Ratings */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating || product.averageRating || 4)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            ({product.reviews_count || product.reviewCount || 0})
                          </span>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl font-bold text-emerald-600">
                              ₹{product.price || product.sellingPrice || 0}
                            </span>
                            {(product.originalPrice || product.mrp) && (product.originalPrice || product.mrp) > (product.price || product.sellingPrice) && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{product.originalPrice || product.mrp}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleAddToCart(e, product._id || product.id, product.name)}
                              disabled={loadingCart.has(product._id || product.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              {loadingCart.has(product._id || product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ShoppingBag className="h-4 w-4" />
                              )}
                              <span className="text-xs">Cart</span>
                            </button>
                            <button
                              onClick={(e) => handleToggleWishlist(e, product._id || product.id, product.name)}
                              disabled={loadingWishlist.has(product._id || product.id)}
                              className={`p-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                wishlistItems.has(product._id || product.id)
                                  ? 'bg-red-50 border-red-500 text-red-500'
                                  : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                              }`}
                            >
                              {loadingWishlist.has(product._id || product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Heart 
                                  className="h-4 w-4" 
                                  fill={wishlistItems.has(product._id || product.id) ? 'currentColor' : 'none'}
                                />
                              )}
                            </button>
                            <Link to={`/product/${product._id || product.id}`}>
                              <button className="p-2 rounded-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all">
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section id={HOME_SECTION_IDS.hero} className="relative overflow-hidden min-h-[600px]">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Grain Fusion Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-800/60" data-parallax-speed="8" />
            <div className="absolute -left-24 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-emerald-700/20 blur-3xl" aria-hidden data-parallax-speed="60" />
            <div className="absolute -right-24 top-1/3 h-[500px] w-[500px] rounded-full bg-lime-400/20 blur-3xl" aria-hidden data-parallax-speed="40" />
          </div>

          <div className="relative z-10">
            <div className="container mx-auto px-4 py-28 lg:py-36">
              <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] items-center">
                <div className="space-y-8 text-primary-foreground" data-gsap-hero>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur" data-gsap-badge>
                    <span className="h-2 w-2 rounded-full bg-lime-300 animate-pulse" />
                    Made in India • Swatishree's Innovation Pvt. Ltd.
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Reviving traditional grains <span className="text-lime-300">for modern nutrition</span>
                  </h1>
                  <p className="text-lg md:text-xl text-emerald-100/80 leading-relaxed max-w-2xl">
                    Grain Fusion transforms age-old recipes into convenient, nutrient-dense foods. Discover gluten-free millets, protein-rich mixes, and wholesome superfoods crafted for every generation.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link to="/products">
                      <Button size="lg" className="text-lg px-8 shadow-lg shadow-emerald-900/30 hover:shadow-xl transition-all">
                        Explore Products
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="text-lg px-8 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm transition-all">
                      View Nutrition Story
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6" data-gsap-stats>
                    {[{
                      label: "Gluten Free",
                      value: "100%",
                      description: "Millet-rich blends without additives",
                    }, {
                      label: "Farm Partnerships",
                      value: "2,000+",
                      description: "Fair-trade sourcing across India",
                    }, {
                      label: "Customer Trust",
                      value: "500+",
                      description: "Families loving Grain Fusion daily",
                    }].map(({ label, value, description }) => (
                      <div key={label} className="rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/80">{label}</p>
                        <p className="text-3xl font-semibold text-lime-200 mt-2">{value}</p>
                        <p className="text-sm text-emerald-100/70 mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative hidden lg:block" data-animate="true">
                  <div className="absolute inset-0 rounded-3xl bg-emerald-700/30 blur-2xl" aria-hidden />
                  <div className="relative rounded-3xl border border-emerald-100/50 bg-white/95 p-8 shadow-2xl space-y-6">
                    <h3 className="text-xl font-semibold text-emerald-900">Why Grain Fusion?</h3>
                    <ul className="space-y-3 text-sm text-emerald-700">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        20 authentic ingredients with 2X millet content for unmatched nutrition.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        Complete natural processing—no artificial flavours, colours, or preservatives.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        Crafted by Swatishree's Innovation Pvt. Ltd., blending ancestral recipes with modern convenience.
                      </li>
                    </ul>

                    <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-100 space-y-3">
                      <p className="text-sm font-semibold text-emerald-700 uppercase tracking-[0.3em]">Featured</p>
                      <p className="text-lg font-semibold text-emerald-900">Trusted by wellness enthusiasts nationwide</p>
                      <p className="text-sm text-emerald-700/80">
                        Join a growing community embracing pure, ready-to-enjoy nutrition rooted in India's heritage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
              <div className="space-y-6" data-animate="true">
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  Swatishree's Innovation Pvt. Ltd.
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 leading-tight">
                  Grain Fusion
                </h2>
                <p className="text-lg md:text-xl text-emerald-800/90 max-w-2xl leading-relaxed">
                  Traditional goodness meets modern convenience — nutrition-packed foods you can trust, taste, and enjoy every day.
                </p>
                <div className="grid sm:grid-cols-2 gap-6" data-gsap-stagger data-stagger="start">
                  <div className="rounded-2xl bg-white/90 shadow-lg p-6 border border-emerald-100">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">Nutrition for Modern Lifestyles</h3>
                    <p className="text-muted-foreground">
                      We revive heritage ingredients with contemporary formats, making wholesome nutrition effortless for busy families.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/90 shadow-lg p-6 border border-emerald-100">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">Made in India, Trusted Everywhere</h3>
                    <p className="text-muted-foreground">
                      Proudly crafted in India with uncompromising quality standards and transparent sourcing.
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.grainfusion.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline transition-colors"
                >
                  www.grainfusion.in
                </a>
              </div>

              <div className="relative" data-animate="true" data-animate-strong>
                <div className="absolute inset-0 rounded-full bg-emerald-100 blur-3xl opacity-60" aria-hidden />
                <div className="relative rounded-3xl bg-white shadow-xl border border-emerald-100 p-8 space-y-6">
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
                  <div className="grid grid-cols-2 gap-4 text-center" data-gsap-stagger data-stagger="center">
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
          </div>
        </section>

        {/* Company Overview */}
        <section id={HOME_SECTION_IDS.companyOverview} className="py-20">
          <div className="container mx-auto px-4 space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-4" data-animate="true">
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-900">Company Overview</h2>
              <p className="text-lg text-muted-foreground">
                At Grain Fusion, we fuse India's traditional food heritage with modern wellness needs. Our mission is to transform age-old grains and recipes into nutritious, delicious, and ready-to-enjoy foods that fit seamlessly into contemporary life.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white p-10 text-center shadow-xl" data-animate="true" data-animate-strong>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">Wholesome nutrition for every lifestyle</h3>
              <p className="text-lg max-w-3xl mx-auto">
                Explore ready-to-cook convenience mixes, ready-to-eat superfoods, and nutrition-focused ranges with targeted health benefits—all maintaining our commitment to purity.
              </p>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section id={HOME_SECTION_IDS.marketOpportunity} className="py-20 bg-gradient-to-r from-lime-50 via-white to-emerald-50">
          <div className="container mx-auto px-4 space-y-12">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div className="space-y-6" data-animate="true">
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-900">
                  Market Opportunity & Government Alignment
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  India's health and wellness food market represents a transformational opportunity. With a market size exceeding ₹50,000 crores and projected growth of 15–20% annually through 2030, Grain Fusion enters a market hungry for authentic, trustworthy solutions.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-gsap-stagger data-stagger="start">
                {marketHighlights.map(({ label, value, description, icon: Icon }) => (
                  <div key={label} className="rounded-2xl bg-white shadow border border-emerald-100 p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{label}</p>
                        <p className="text-2xl font-bold text-emerald-900">{value}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Strategy */}
        <section id={HOME_SECTION_IDS.strategy} className="py-20">
          <div className="container mx-auto px-4 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-4" data-animate="true">
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">Why Grain Fusion</span>
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-900">The Strategy</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6" data-gsap-stagger data-stagger="center">
              <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm p-8 space-y-4">
                <h3 className="text-2xl font-semibold text-emerald-900">Competitive Strengths</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {competitiveStrengths.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm p-8 space-y-4">
                <h3 className="text-2xl font-semibold text-emerald-900">Strategic Advantages</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {strategicAdvantages.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Product */}
        <section id={HOME_SECTION_IDS.product} className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-4" data-animate="true">
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">Why Grain Fusion</span>
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-900">The Product</h2>
              <p className="text-lg text-muted-foreground">
                Truly gluten free, crafted with 50–70% millets—far exceeding the market average of 20–30%. Grain Fusion health drinks preserve the natural texture of real millets and cereals, delivering authenticity and nutrition.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start" data-gsap-stagger data-stagger="start">
              <div className="rounded-2xl bg-white shadow border border-emerald-100 p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Truly Gluten Free</p>
                    <p className="text-3xl font-bold text-emerald-900">50–70% Millets</p>
                    <p className="text-sm text-muted-foreground">Market average: 20–30%</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Unlike typical market products that dissolve instantly due to synthetic additives, Grain Fusion preserves the natural richness and authentic textures of millets and cereals.
                </p>
                <div className="grid sm:grid-cols-2 gap-4" data-gsap-stagger data-stagger="center">
                  {powerIngredients.map(({ title, subtitle }) => (
                    <div key={title} className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                      <p className="text-lg font-semibold text-emerald-900">{title}</p>
                      <p className="text-sm text-emerald-700">{subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow border border-emerald-100 p-8 space-y-4">
                <h3 className="text-2xl font-semibold text-emerald-900">No Artificial Preservatives, Colours, or Flavours</h3>
                <p className="text-muted-foreground">
                  We rely on complete dehydration to maintain quality—delivering a wholesome experience that vegetarians and health-conscious families can trust.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  {productBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <div data-animate="true">
          <AboutSection id={HOME_SECTION_IDS.about} />
        </div>

        {/* Testimonials Section */}
        <div data-animate="true">
          <Testimonials id={HOME_SECTION_IDS.testimonials} />
        </div>

        {/* Contact Section */}
        <section
          id={HOME_SECTION_IDS.contactSection}
          className="relative overflow-hidden py-20 bg-gradient-to-br from-emerald-50 via-white to-lime-50"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden />
            <div className="absolute bottom-0 right-12 h-80 w-80 rounded-full bg-lime-200/30 blur-3xl" aria-hidden />
            <div className="absolute inset-0 bg-grid-black/[0.05]" aria-hidden />
          </div>
          <div className="relative container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-start">
              <div className="space-y-6 text-emerald-900" data-animate="true">
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  Contact
                </span>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight text-emerald-950">
                  Let's build nourishing partnerships together
                </h2>
                <p className="text-lg text-emerald-800/80 max-w-xl leading-relaxed">
                  Share your requirements for retail, corporate wellness programmes, or collaborative opportunities.
                  Our team will reach out with tailored solutions crafted around Grain Fusion's authentic nutrition.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4" data-gsap-stagger data-stagger="start">
                  {contactDetails.map(({ icon: Icon, label, value, description }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-emerald-200/60 bg-white/90 shadow-sm p-5 flex gap-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm uppercase tracking-[0.3em] text-emerald-600/80">{label}</p>
                        <p className="text-lg font-semibold text-emerald-950">{value}</p>
                        <p className="text-sm text-emerald-700/80">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-100/70 p-5 flex items-center gap-4" data-animate="true">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-700/80">Prefer quick chat?</p>
                    <p className="text-lg font-semibold text-emerald-950">
                      WhatsApp us at <a href="https://wa.me/919870543210" target="_blank" rel="noopener noreferrer" className="underline decoration-emerald-500 hover:text-emerald-600 transition-colors">+91 98705 43210</a>
                    </p>
                    <p className="text-sm text-emerald-700/70">We typically respond within a couple of hours during business days.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-emerald-100/70 p-8 space-y-6" data-animate="true" data-animate-strong>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Write to us</p>
                  <h3 className="text-2xl font-semibold text-emerald-900">Tell us how we can support you</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the details and our customer success team will schedule a call to understand your goals.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-sm font-medium text-emerald-800">
                        Full Name
                      </label>
                      <Input
                        id="contact-name"
                        placeholder="Enter your name"
                        className="w-full bg-white/90 border-emerald-200 focus-visible:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm font-medium text-emerald-800">
                        Business Email
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@company.com"
                        className="w-full bg-white/90 border-emerald-200 focus-visible:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="contact-phone" className="text-sm font-medium text-emerald-800">
                        Phone Number
                      </label>
                      <Input
                        id="contact-phone"
                        placeholder="Include country code"
                        className="w-full bg-white/90 border-emerald-200 focus-visible:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-purpose" className="text-sm font-medium text-emerald-800">
                        Purpose
                      </label>
                      <Input
                        id="contact-purpose"
                        placeholder="Retail, corporate wellness, bulk order..."
                        className="w-full bg-white/90 border-emerald-200 focus-visible:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-sm font-medium text-emerald-800">
                      Message
                    </label>
                    <Textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Share more about your brand, audience, or requirements..."
                      className="bg-white/90 border-emerald-200 focus-visible:ring-primary transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      By submitting this form, you agree to our privacy policy and terms of collaboration.
                    </p>
                    <Button type="submit" className="w-full px-6 sm:w-auto transition-all hover:shadow-lg">
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id={HOME_SECTION_IDS.finalCta}
          className="relative overflow-hidden py-24 text-white"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-teal-500" />
          <div className="pointer-events-none absolute -top-32 -right-16 h-72 w-72 rounded-full bg-teal-300/40 blur-3xl" data-parallax-speed="30" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-emerald-400/35 blur-3xl" data-parallax-speed="20" />
          <div className="relative container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
              <div className="space-y-8 text-left" data-animate="true">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm uppercase tracking-wider text-teal-100">
                  <span className="inline-flex h-2 w-2 rounded-full bg-teal-200 animate-pulse" />
                  Wellness Invitation
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                    Start Your Health Journey Today
                  </h2>
                  <p className="max-w-xl text-base text-teal-100/85 sm:text-lg">
                    Nourish your body with handcrafted sattu blends designed for energy, satiety, and everyday balance. Join a community that puts mindful nutrition first.
                  </p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2" data-gsap-stagger data-stagger="start">
                  <li className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-teal-200 flex-shrink-0">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Holistic Nutrition</p>
                      <p className="text-sm text-teal-100/80">
                        Naturally balanced proteins, fibres, and micronutrients in every serving.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-teal-200 flex-shrink-0">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Sustained Energy</p>
                      <p className="text-sm text-teal-100/80">
                        Balanced nourishment that keeps you active without blood sugar spikes.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-teal-200 flex-shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Trusted Quality</p>
                      <p className="text-sm text-teal-100/80">
                        Certified ingredients sourced from responsible farmers across Bihar.
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to="/products">
                    <Button
                      size="lg"
                      className="text-lg bg-teal-100 text-emerald-900 shadow-lg shadow-emerald-900/20 hover:bg-teal-200 hover:text-emerald-950 transition-all hover:shadow-xl"
                    >
                      Explore the Wellness Range
                    </Button>
                  </Link>
                  <p className="text-sm text-teal-100/75">
                    Free delivery across India • Pay on delivery available
                  </p>
                </div>
              </div>

              <div className="space-y-6" data-animate="true" data-animate-strong>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-emerald-900/30 backdrop-blur">
                  <p className="text-sm uppercase tracking-widest text-teal-100/80">
                    Why customers choose Grain Fusion
                  </p>
                  <div className="mt-6 grid gap-6" data-gsap-stagger data-stagger="start">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                      <p className="text-4xl font-semibold">4.8/5</p>
                      <p className="text-sm text-teal-100/80">
                        Average customer rating across online platforms.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                      <p className="text-4xl font-semibold">10K+</p>
                      <p className="text-sm text-teal-100/80">
                        Health journeys empowered with clean, traditional nutrition.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                      <p className="text-4xl font-semibold">100%</p>
                      <p className="text-sm text-teal-100/80">
                        Stone-ground ingredients with zero preservatives or additives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
