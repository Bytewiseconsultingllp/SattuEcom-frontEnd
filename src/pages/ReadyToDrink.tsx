import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Droplets, Zap, ThermometerSnowflake, Check } from "lucide-react";
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

export default function ReadyToDrink() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBeverageProducts();
  }, []);

  const fetchBeverageProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch Beverages and Ready to Drink category products
      const [beveragesResponse, readyToDrinkResponse] = await Promise.all([
        getProducts(1, 50, { category: "Beverages" }),
        getProducts(1, 50, { category: "Ready to Drink" })
      ]);
      
      console.log("Beverages Response:", beveragesResponse);
      console.log("Ready to Drink Response:", readyToDrinkResponse);
      
      const allProducts = [];
      if (beveragesResponse.success && beveragesResponse.data) {
        console.log("Beverages products found:", beveragesResponse.data.length);
        allProducts.push(...beveragesResponse.data);
      }
      if (readyToDrinkResponse.success && readyToDrinkResponse.data) {
        console.log("Ready to Drink products found:", readyToDrinkResponse.data.length);
        allProducts.push(...readyToDrinkResponse.data);
      }
      
      console.log("Total products:", allProducts.length);
      setProducts(allProducts);
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
                Ready to Drink Collection
              </div>
              <h2 className="text-3xl font-bold text-emerald-900">
                Our Beverage Products
              </h2>
              <p className="mt-3 text-emerald-700/70">Refreshing beverages & ready-to-drink options</p>
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
                <Droplets className="h-4 w-4 text-lime-300" />
                Convenience Meets Nutrition
              </div>
              
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                Ready to Drink <span className="text-lime-300">Beverages</span>
              </h1>
              
              <p className="mb-8 text-lg leading-relaxed text-emerald-100/80 md:text-xl">
                Experience the convenience of ready-to-drink beverages. Perfectly mixed, chilled, 
                and ready to refresh you instantly. No mixing, no mess - just pure nutrition on the go!
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-8">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <ThermometerSnowflake className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">Fresh & Chilled</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">Ready to Serve</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Zap className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">Instant Energy</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">No Preparation</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Droplets className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">Hydrating</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">Nutritious</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Ready to Drink Section */}
        <section className="bg-gradient-to-r from-emerald-50 via-white to-lime-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-center text-3xl font-bold text-emerald-900">Why Choose Ready to Drink?</h2>
              <div className="space-y-4 text-base leading-relaxed text-emerald-800/90 md:text-lg">
                <p>
                  Our ready-to-drink beverages are perfect for modern lifestyles. Pre-mixed with the 
                  right proportions, these drinks are ready to consume straight from the bottle.
                </p>
                <p>
                  Ideal for busy mornings, post-workout refreshment, office breaks, or travel. Each bottle 
                  is prepared fresh, refrigerated, and delivered to maintain optimal taste and nutrition.
                </p>
                <p>
                  Whether you prefer traditional flavors or innovative fusion blends, there's a 
                  ready-to-drink beverage for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Storage Instructions Section */}
        <section className="py-16 bg-gradient-to-r from-lime-50 via-white to-emerald-50">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-emerald-900">
              Storage & Consumption Tips
            </h2>

            <div className="mx-auto max-w-3xl">
              <Card className="border-emerald-100 bg-white shadow-md">
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Keep refrigerated at 2-8°C for best taste and freshness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Consume within 24 hours of opening for optimal nutrition</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Shake well before drinking to ensure even consistency</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">Best enjoyed chilled for maximum refreshment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-emerald-800">No artificial preservatives - natural ingredients only</span>
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
