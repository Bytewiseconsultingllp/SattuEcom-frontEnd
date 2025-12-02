import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Loader2,
  Star,
  Check,
  Leaf,
  Award,
  Package,
  Zap,
  ChevronLeft,
  Info,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getProductById } from "@/lib/api/products";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { addToWishlist as apiAddToWishlist } from "@/lib/api/wishlist";
import { getUserCookie } from "@/utils/cookie";
import { useNavigate } from "react-router-dom";
import ProductReviews from "@/components/ProductReviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, loadingState } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getAllProducts();
    }
  }, [id]);

  async function getAllProducts() {
    try {
      setIsLoading(true);
      const response = await getProductById(id);
      if (response.success) {
        setProduct(response.data);
      }
    } catch (error: any) {
      toast.error("Error fetching product details");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddToWishlist() {
    const uc = getUserCookie();
    if (!uc || !(uc.token || uc?.data?.token)) {
      navigate("/login");
      return;
    }
    try {
      const res = await apiAddToWishlist(id as string);
      if (res?.success) {
        toast.success(res.message || "Added to wishlist!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to add to wishlist");
    }
  }

  async function handleAddToCart(productId: string, quantity: number) {
    try {
      await addToCart(productId, quantity);
      toast.success("Added to Cart!");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add to cart");
    }
  }

  if (!product && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.svg"];
  
  const hasMultipleImages = displayImages.length > 1;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-lime-50/30">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 py-6">
          <div className="container mx-auto px-4">
            <nav className="flex items-center text-sm text-white/90 mb-2" data-animate="true">
              <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link to="/products" className="hover:text-white transition-colors">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white font-semibold">{isLoading ? "Loading..." : product.name}</span>
            </nav>
            
            {!isLoading && (
              <div className="flex items-center gap-3">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {product.category}
                </Badge>
                {product.in_stock && (
                  <Badge className="bg-lime-300 text-emerald-900 border-0">
                    <Check className="h-3 w-3 mr-1" />
                    In Stock
                  </Badge>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <Skeleton className="w-full h-[600px] rounded-3xl bg-emerald-100" />
                <div className="flex gap-2">
                  {[1,2,3,4].map(i => (
                    <Skeleton key={i} className="w-20 h-20 rounded-2xl bg-emerald-100" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4 bg-emerald-100" />
                <Skeleton className="h-24 w-full bg-emerald-100" />
                <Skeleton className="h-16 w-1/2 bg-emerald-100" />
                <Skeleton className="h-12 w-full bg-emerald-100" />
              </div>
            </div>
          ) : (
            <>
              {/* Main Product Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16" data-gsap-stagger data-stagger="start">
                {/* Image Gallery */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-emerald-100">
                    <div className="aspect-square">
                      <img
                        src={displayImages[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-contain p-8"
                      />
                    </div>
                    {discount > 0 && (
                      <div className="absolute top-6 left-6 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-2xl shadow-lg">
                          <span className="text-2xl font-bold">{discount}%</span>
                          <span className="text-sm ml-1">OFF</span>
                        </div>
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-3xl px-8 py-4 shadow-2xl">
                          <p className="text-2xl font-bold text-red-600">Out of Stock</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {hasMultipleImages && (
                    <div className="grid grid-cols-4 gap-3">
                      {displayImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                            selectedImage === idx 
                              ? 'border-emerald-500 ring-4 ring-emerald-100' 
                              : 'border-emerald-200 hover:border-emerald-400'
                          }`}
                        >
                          <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain p-2" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 text-center">
                      <Leaf className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-900">100% Natural</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 text-center">
                      <Award className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-900">Certified</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 text-center">
                      <Package className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-900">Fresh Stock</p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {/* Title & Rating */}
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4 leading-tight">
                      {product.name}
                    </h1>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star 
                              key={star} 
                              className={`h-5 w-5 ${star <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-emerald-900">{product.rating}</span>
                      </div>
                      <span className="text-emerald-600">
                        ({product.reviews_count} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-emerald-700 leading-relaxed">
                    {product.description}
                  </p>

                  <Separator className="bg-emerald-200" />

                  {/* Price Section */}
                  <div className="bg-gradient-to-br from-emerald-50 to-lime-50 rounded-3xl p-6 border-2 border-emerald-200">
                    <div className="flex items-baseline gap-4 mb-3">
                      <span className="text-5xl font-bold text-emerald-900">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <>
                          <span className="text-2xl text-emerald-600 line-through">
                            ₹{product.originalPrice}
                          </span>
                          <Badge className="bg-gradient-to-r from-emerald-600 to-lime-600 text-white text-base px-3 py-1">
                            Save ₹{product.originalPrice - product.price}
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-emerald-600">Inclusive of all taxes • Free shipping above ₹500</p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-emerald-900">Quantity:</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white border-2 border-emerald-200 rounded-2xl shadow-lg">
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                        >
                          <span className="text-2xl font-bold">−</span>
                        </Button>
                        <span className="px-8 font-bold text-2xl text-emerald-900">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => setQuantity(quantity + 1)}
                          className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                        >
                          <span className="text-2xl font-bold">+</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full h-16 text-lg bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 shadow-lg hover:shadow-xl transition-all"
                      disabled={!product.in_stock}
                      onClick={() => handleAddToCart(id, quantity)}
                    >
                      {loadingState?.type === 'add' && loadingState.itemId === id ? (
                        <>
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                          Adding to Cart...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-6 w-6" />
                          Add to Cart
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        onClick={handleAddToWishlist}
                      >
                        <Heart className="mr-2 h-5 w-5" />
                        Wishlist
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Share2 className="mr-2 h-5 w-5" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm hover:shadow-lg transition-shadow">
                      <Truck className="h-8 w-8 text-emerald-600 mb-2" />
                      <p className="text-sm font-semibold text-emerald-900">Free Delivery</p>
                      <p className="text-xs text-emerald-600">Above ₹500</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm hover:shadow-lg transition-shadow">
                      <Shield className="h-8 w-8 text-emerald-600 mb-2" />
                      <p className="text-sm font-semibold text-emerald-900">Secure Payment</p>
                      <p className="text-xs text-emerald-600">100% Safe</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm hover:shadow-lg transition-shadow">
                      <RefreshCw className="h-8 w-8 text-emerald-600 mb-2" />
                      <p className="text-sm font-semibold text-emerald-900">Easy Returns</p>
                      <p className="text-xs text-emerald-600">7 Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16" data-gsap-stagger data-stagger="start">
                {/* Benefits */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-emerald-900">Benefits</h2>
                  </div>
                  <ul className="space-y-3">
                    {product.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-emerald-700 text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Product Information */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-emerald-900">Product Information</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-emerald-900 mb-3 text-xl">Ingredients</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients?.split(',').map((ingredient: string, index: number) => (
                          <Badge 
                            key={index}
                            className="bg-gradient-to-r from-emerald-100 to-lime-100 text-emerald-800 border-2 border-emerald-300 px-3 py-1.5 text-sm font-semibold hover:from-emerald-200 hover:to-lime-200 transition-colors"
                          >
                            {ingredient.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator className="bg-emerald-200" />
                    <div>
                      <h3 className="font-bold text-emerald-900 mb-3 text-xl">How to Use</h3>
                      <p className="text-emerald-700 leading-relaxed">{product.usage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mb-16" data-animate="true">
                {id && <ProductReviews productId={id as string} />}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
