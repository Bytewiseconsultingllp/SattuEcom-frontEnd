import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { getUserCookie } from "@/utils/cookie";
import { useNavigate } from "react-router-dom";
import { addToWishlist as apiAddToWishlist } from "@/lib/api/wishlist";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  category: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const { addToCart, loadingState } = useCart();
  const navigate = useNavigate();

  async function handleAddToCart(e: React.MouseEvent | null, productId: string, quantity: number) {
    // prevent Link navigation when clicking the button inside the card
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await addToCart(productId, quantity);
      // Cart context already shows toast on success; keep local toast for fallback
      // toast.success("Added to Cart!");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add to cart");
    }
  }
  

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const uc = getUserCookie();
    if (!uc || !(uc.token || uc?.data?.token)) {
      navigate("/login");
      return;
    }
    try {
      const res = await apiAddToWishlist(product.id);
      if (res?.success) {
        toast.success(res.message || "Added to wishlist!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add to wishlist");
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl animate-fade-in">
        <div className="relative overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="h-64 w-full object-contain transition-all duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground animate-scale-in">
              {discount}% OFF
            </Badge>
          )}
          {!product.in_stock && (
            <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">
              Out of Stock
            </Badge>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
            onClick={handleAddToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <span className="text-sm text-primary">★</span>
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.reviews_count})</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full transition-all duration-300 hover:scale-105" 
            disabled={!product.in_stock}
            onClick={(e) => handleAddToCart(e, product.id, 1)}
          >
            {loadingState?.type === 'add' && loadingState.itemId === product.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
