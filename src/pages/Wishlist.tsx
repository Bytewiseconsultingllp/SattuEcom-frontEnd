import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="bg-gradient-hero py-12 mb-8">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <div className="container mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <Skeleton className="w-full h-48 rounded-lg mb-4" />
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                  </CardContent>
                </Card>
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-6">Save items you love for later</p>
            <Link to="/products">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">My Wishlist</h1>
            <p className="text-lg text-primary-foreground/90">{wishlistItems.length} items saved</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => {
              const product = item.product;
              const inStock = product?.in_stock !== false;
              const isAdding = loadingState?.type === 'add' && loadingState.itemId === product?.id;
              return (
                <Card key={item.id} className="hover-scale transition-all animate-fade-in">
                  <CardContent className="p-4">
                    <Link to={`/product/${product?.id}`} className="block">
                      <div className="relative mb-4">
                        <img
                          src={product?.image_url}
                          alt={product?.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {!inStock && (
                          <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">Out of Stock</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1 line-clamp-2">{product?.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">₹{product?.price}</span>
                        {product?.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">₹{product?.originalPrice}</span>
                        )}
                      </div>
                      {product?.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
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
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
