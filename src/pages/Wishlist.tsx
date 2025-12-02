import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getUserCookie } from "@/utils/cookie";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { getWishlistItems as apiGetWishlistItems, removeFromWishlist as apiRemoveFromWishlist } from "@/lib/api/wishlist";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToCart, loadingState } = useCart();

  useEffect(() => {
    const uc = getUserCookie();
    if (!uc || !(uc.token || uc?.data?.token)) {
      navigate("/login");
    }
    (async () => {
      try {
        const res = await apiGetWishlistItems();
        if (res?.success) {
          setWishlistItems(res.data || []);
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to fetch wishlist");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  const removeItem = async (id: string) => {
    try {
      await apiRemoveFromWishlist(id);
      setWishlistItems(items => items.filter(item => item.id !== id));
      try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
      toast.success("Item removed from wishlist");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove wishlist item");
    }
  };

  const handleAddToCart = async (productId?: string) => {
    if (!productId) return;
    await addToCart(productId, 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-lime-50/30">
        <Header />
        <main className="flex-1">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 py-16">
            <div className="container mx-auto px-4">
              <Skeleton className="h-12 w-80 mb-4 bg-white/20" />
              <Skeleton className="h-6 w-48 bg-white/20" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden">
                  <Skeleton className="w-full h-56 bg-emerald-100" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-full mb-3 bg-emerald-100" />
                    <Skeleton className="h-8 w-32 mb-4 bg-emerald-100" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1 bg-emerald-100" />
                      <Skeleton className="h-10 w-10 bg-emerald-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-lime-50/30">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4" data-animate="true">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-emerald-200/50 rounded-full blur-3xl"></div>
              <Heart className="h-32 w-32 text-emerald-300 mx-auto relative" />
            </div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-emerald-600 text-lg mb-8">Save items you love and they'll appear here for later</p>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Sparkles className="mr-2 h-5 w-5" />
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-lime-50/30">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 py-16">
          <div className="container mx-auto px-4" data-animate="true">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">My Wishlist</h1>
            </div>
            <p className="text-xl text-white/90">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-gsap-stagger data-stagger="start">
            {wishlistItems.map(item => {
              const product = item.product;
              const inStock = product?.in_stock !== false;
              const isAdding = loadingState?.type === 'add' && loadingState.itemId === product?.id;
              return (
                <div key={item.id} className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
                  <Link to={`/product/${product?.id}`} className="block">
                    <div className="relative">
                      <img
                        src={product?.images?.[0] || product?.thumbnail || '/placeholder.svg'}
                        alt={product?.name}
                        className="w-full h-56 object-cover"
                      />
                      {!inStock && (
                        <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 px-3 py-1.5">Out of Stock</Badge>
                      )}
                      {product?.category && (
                        <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-emerald-700 border-0 px-3 py-1.5">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link to={`/product/${product?.id}`}>
                      <h3 className="font-bold text-lg text-emerald-900 mb-3 line-clamp-2 hover:text-emerald-600 transition-colors">{product?.name}</h3>
                    </Link>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold text-emerald-900">₹{product?.price}</span>
                      {product?.originalPrice && (
                        <span className="text-base text-emerald-600 line-through">₹{product?.originalPrice}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white"
                        disabled={!inStock}
                        onClick={() => handleAddToCart(product?.id)}
                      >
                        {isAdding ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="mr-2 h-4 w-4" />
                        )}
                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove from wishlist"
                        className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
