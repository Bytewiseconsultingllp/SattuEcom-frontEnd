import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Candy, Cookie, Heart, Check } from "lucide-react";
import { toast } from "sonner";
import { getProducts } from "@/lib/api/products";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  in_stock: boolean;
  rating: number;
  reviews_count: number;
}

export default function SnacksLadoo() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSnacksLadooProducts();
  }, []);

  const fetchSnacksLadooProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch Snacks & Ladoo category products
      const response = await getProducts(1, 50, { category: "Snacks & Ladoo" });
      
      console.log("Snacks & Ladoo Response:", response);
      
      if (response.success && response.data) {
        console.log("Snacks & Ladoo products found:", response.data.length);
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Products Section - Display First */}
        <section className="py-16 bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Healthy Indulgence
              </div>
              <h2 className="text-3xl font-bold text-emerald-900">
                Snacks & Ladoo Collection
              </h2>
              <p className="mt-3 text-emerald-700/70">Traditional sweets & nutritious snacks</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Browse All Products Button */}
              <div className="mt-12 text-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/products")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-8"
                >
                  Browse All Products
                </Button>
              </div>
              </>
            )}
          </div>
        </section>

        {/* Hero Section - Emerald & Lime Theme */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-800/60" />
          <div
            className="absolute -left-24 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-700/20 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -right-24 top-1/3 h-[400px] w-[400px] rounded-full bg-lime-400/20 blur-3xl"
            aria-hidden
          />

          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Candy className="h-4 w-4 text-lime-300" />
                Traditional Meets Modern
              </div>
              
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                Sattu <span className="text-lime-300">Snacks & Ladoo</span>
              </h1>
              
              <p className="mb-8 text-lg leading-relaxed text-emerald-100/80 md:text-xl">
                Satisfy your sweet tooth the healthy way! Our range of sattu-based sweets and snacks 
                combines traditional recipes with modern flavors. From classic ladoos to innovative 
                treats, every bite is packed with nutrition and nostalgia.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-8">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Candy className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">Natural Sweetness</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">Jaggery Based</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Cookie className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">High Protein</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">Energy Boost</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Heart className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">No Additives</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">100% Natural</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Sattu Sweets Section */}
        <section className="bg-gradient-to-r from-emerald-50 via-white to-lime-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-center text-3xl font-bold text-emerald-900">The Art of Sattu Sweets</h2>
              <div className="space-y-4 text-base leading-relaxed text-emerald-800/90 md:text-lg">
                <p>
                  Sattu ladoos and sweets have been a cherished part of Indian cuisine for generations. 
                  These protein-rich treats are traditionally made during festivals, offered as prasad in 
                  temples, and enjoyed as nutritious snacks by people of all ages.
                </p>
                <p>
                  Our sattu sweets are made using time-tested recipes with premium ingredients - pure desi ghee, 
                  organic jaggery, and high-quality dry fruits. Unlike regular sweets loaded with refined sugar, 
                  our sattu-based treats provide sustained energy and nutrition.
                </p>
                <p>
                  Perfect for gifting during festivals, serving to guests, or simply enjoying as a guilt-free 
                  indulgence, our sattu sweets bring together taste, tradition, and health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gradient-to-r from-lime-50 via-white to-emerald-50">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-emerald-900">
              Why Choose Our Sattu Sweets?
            </h2>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Natural Sweetness",
                  description: "Sweetened with organic jaggery instead of refined sugar, providing natural minerals and a healthier alternative.",
                },
                {
                  title: "High Protein Content",
                  description: "Each piece is protein-rich, making it an excellent post-workout snack or energy booster for active lifestyles.",
                },
                {
                  title: "Pure Desi Ghee",
                  description: "Made with authentic desi ghee for that rich, traditional taste and added nutritional benefits.",
                },
                {
                  title: "No Artificial Additives",
                  description: "Zero artificial colors, flavors, or preservatives. Only natural ingredients that you can trust.",
                },
                {
                  title: "Perfect for All Ages",
                  description: "From kids to elders, everyone can enjoy these nutritious treats without compromising on health.",
                },
                {
                  title: "Long Shelf Life",
                  description: "Stays fresh for weeks when stored properly, making it perfect for gifting and festivals.",
                },
              ].map(({ title, description }) => (
                <Card key={title} className="border-emerald-100 bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-bold text-emerald-900">{title}</h3>
                    <p className="text-sm text-emerald-700/80">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Storage Tips Section */}
        <section className="py-16 bg-gradient-to-r from-emerald-50 via-white to-lime-50">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-emerald-900">
              Storage & Freshness Tips
            </h2>

            <div className="mx-auto max-w-3xl">
              <Card className="border-emerald-100 bg-white shadow-md">
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Store in an airtight container to maintain freshness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Keep in a cool, dry place away from direct sunlight</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Best consumed within 3-4 weeks of purchase</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Can be refrigerated to extend shelf life during hot weather</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Perfect for gifting - beautifully packaged in food-grade boxes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
