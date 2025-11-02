import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  TrendingUp,
  Package,
  Eye,
} from "lucide-react";
import { getWishlistItems, removeFromWishlist } from "@/lib/api/wishlist";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, loadingState } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlistItems();
      setWishlistItems(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error("Failed to fetch wishlist:", error);
      toast.error(error.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateTotalValue = () => {
    if (!Array.isArray(wishlistItems)) return 0;
    return wishlistItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-pink-100">
              {Array.isArray(wishlistItems) ? wishlistItems.length : 0} {wishlistItems.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>
          <Heart className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{Array.isArray(wishlistItems) ? wishlistItems.length : 0}</p>
              </div>
              <Heart className="h-10 w-10 text-pink-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotalValue())}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(wishlistItems) ? wishlistItems.filter((item) => item.product?.stock > 0).length : 0}
                </p>
              </div>
              <Package className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Items */}
      {!Array.isArray(wishlistItems) || wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Start adding products you love to your wishlist
              </p>
              <Button asChild>
                <Link to="/products">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(wishlistItems) && wishlistItems.map((item) => {
            const product = item.product;
            const isOutOfStock = product?.stock <= 0;
            const isLoading = loadingState?.type === "add" && loadingState.itemId === product?.id;

            return (
              <Card
                key={item.id}
                className="group overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative">
                  {/* Product Image */}
                  <Link to={`/product/${product?.id}`}>
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product?.images?.[0] || product?.thumbnail || "/placeholder.svg"}
                        alt={product?.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-lg"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {isOutOfStock && (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                    {product?.discount > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        {product.discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Product Info */}
                  <Link to={`/product/${product?.id}`}>
                    <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
                      {product?.name}
                    </h3>
                  </Link>

                  {/* Category */}
                  {product?.category && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {product.category}
                    </p>
                  )}

                  {/* Rating */}
                  {product?.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews_count || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(product?.price || 0)}
                    </p>
                    {product?.original_price && product.original_price > product.price && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.original_price)}
                      </p>
                    )}
                  </div>

                  {/* Stock Info */}
                  {!isOutOfStock && product?.stock < 10 && (
                    <p className="text-xs text-orange-600 mb-3">
                      Only {product.stock} left in stock!
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(product?.id)}
                      disabled={isOutOfStock || isLoading}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isLoading ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link to={`/product/${product?.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bulk Actions */}
      {Array.isArray(wishlistItems) && wishlistItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {Array.isArray(wishlistItems) ? wishlistItems.length : 0} {wishlistItems.length === 1 ? "item" : "items"} in wishlist
                </p>
                <p className="text-sm text-muted-foreground">
                  Total value: {formatCurrency(calculateTotalValue())}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Wishlist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
