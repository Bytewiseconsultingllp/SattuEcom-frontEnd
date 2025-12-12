import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Leaf, Heart, TrendingUp } from "lucide-react";
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
  benefits?: string[];
}

export default function SattuPowder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSattuPowderProducts();
  }, []);

  const fetchSattuPowderProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch products from multiple categories (Atta, Multi Grain Mix, Pre-mix)
      const [attaResponse, multiGrainResponse, premixResponse] = await Promise.all([
        getProducts(1, 50, { category: "Atta" }),
        getProducts(1, 50, { category: "Multi Grain Mix" }),
        getProducts(1, 50, { category: "Pre-mix" })
      ]);
      
      console.log("Atta Response:", attaResponse);
      console.log("Multi Grain Response:", multiGrainResponse);
      console.log("Pre-mix Response:", premixResponse);
      
      const allProducts = [];
      if (attaResponse.success && attaResponse.data) {
        console.log("Atta products found:", attaResponse.data.length);
        allProducts.push(...attaResponse.data);
      }
      if (multiGrainResponse.success && multiGrainResponse.data) {
        console.log("Multi Grain products found:", multiGrainResponse.data.length);
        allProducts.push(...multiGrainResponse.data);
      }
      if (premixResponse.success && premixResponse.data) {
        console.log("Pre-mix products found:", premixResponse.data.length);
        allProducts.push(...premixResponse.data);
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
                Grain Fusion Premium Collection
              </div>
              <h2 className="text-3xl font-bold text-emerald-900">
                Our Premium Products
              </h2>
              <p className="mt-3 text-emerald-700/70">Atta, Multi Grain Mix & Pre-mix</p>
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
                <Sparkles className="h-4 w-4 text-lime-300" />
                Premium Grain Fusion Collection
              </div>
              
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                Premium <span className="text-lime-300">Grain Fusion Products</span>
              </h1>
              
              <p className="mb-8 text-lg leading-relaxed text-emerald-100/80 md:text-xl">
                Discover the power of traditional Indian superfoods. Our premium collection 
                brings you nutritious atta, multi-grain mixes, and ready-to-use pre-mixes - all packed with protein, fiber, and natural energy.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-8">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Leaf className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">100% Natural</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">No Additives</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <TrendingUp className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">Rich in Protein</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">20g per 100g</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                  <Heart className="h-8 w-8 text-lime-300 mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-emerald-100/80">Customer Love</p>
                  <p className="mt-1 text-2xl font-semibold text-lime-200">5★ Rated</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is Sattu Section */}
        <section className="bg-gradient-to-r from-emerald-50 via-white to-lime-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-center text-3xl font-bold text-emerald-900">What is Sattu?</h2>
              <div className="space-y-4 text-base leading-relaxed text-emerald-800/90 md:text-lg">
                <p>
                  Sattu is a traditional superfood from Bihar and other parts of India, made by dry roasting 
                  chana (Bengal gram) and grinding it into a fine powder. This protein-rich flour has been a 
                  staple in Indian households for centuries, known for its cooling properties and nutritional benefits.
                </p>
                <p>
                  Rich in protein, fiber, calcium, and iron, sattu is perfect for athletes, fitness enthusiasts, 
                  and anyone looking for a natural energy boost. It helps in digestion, keeps you cool during summers, 
                  and provides sustained energy throughout the day.
                </p>
                <p>
                  Whether mixed with water to make a refreshing drink, used in parathas, or added to smoothies, 
                  sattu is incredibly versatile and can be enjoyed in countless ways.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Health Benefits Section */}
        <section className="bg-gradient-to-r from-lime-50 via-white to-emerald-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-emerald-900">
              Health Benefits of Sattu
            </h2>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "High in Protein",
                  description: "Contains about 20g protein per 100g, making it excellent for muscle building and recovery.",
                },
                {
                  title: "Natural Coolant",
                  description: "Known for its cooling properties, perfect for hot summer days to keep your body temperature balanced.",
                },
                {
                  title: "Aids Digestion",
                  description: "Rich in fiber, it promotes healthy digestion and helps prevent constipation.",
                },
                {
                  title: "Low Glycemic Index",
                  description: "Great for diabetics as it helps regulate blood sugar levels naturally.",
                },
                {
                  title: "Energy Booster",
                  description: "Provides sustained energy throughout the day without sugar crashes.",
                },
                {
                  title: "Rich in Minerals",
                  description: "Contains iron, calcium, magnesium, and other essential minerals for overall health.",
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
      </main>

      <Footer />
    </div>
  );
}
