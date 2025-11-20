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
  // const product = products.find(p => p.id === id);
  const [product, setProduct] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
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

  if (!product) {
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

  // Determine images to display: use images array or fallback to placeholder
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.svg"];
  
  const hasMultipleImages = displayImages.length > 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{isLoading ? "Loading..." : product.name}</span>
          </nav>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <Skeleton className="w-full h-[500px] rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-2/3" />
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-20 w-full" />
                <Separator />
                <Skeleton className="h-12 w-48" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="space-y-4 animate-fade-in">
              <div className="relative overflow-hidden rounded-lg">
                {hasMultipleImages ? (
                  <Carousel className="w-full" opts={{ loop: true }}>
                    <CarouselContent>
                      {displayImages.map((imageUrl, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={imageUrl}
                            alt={`${product.name} - Image ${index + 1}`}
                            className="w-full h-[500px] object-contain"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                ) : (
                  <img
                    src={displayImages[0]}
                    alt={product.name}
                    className="w-full h-[500px] object-contain"
                  />
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-4 py-2 z-10">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 animate-fade-in">
              {" "}
              <div>
                <Badge className="mb-3">{product.category}</Badge>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                      <span className="text-primary text-xl">★</span>
                      <span className="font-semibold ml-1">{product.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({product.reviews_count} reviews)
                    </span>
                    {product.in_stock ? (
                      <Badge
                        variant="outline"
                        className="text-success border-success"
                      >
                        In Stock
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-destructive border-destructive"
                      >
                        Out of Stock
                      </Badge>
                    )}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
              <Separator />
              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                    <Badge className="bg-success text-success-foreground">
                      Save ₹{product.originalPrice - product.price}
                    </Badge>
                  </>
                )}
              </div>
              {/* Quantity & Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!product.in_stock}
                  onClick={() => handleAddToCart(id, quantity)}
                >
                  {loadingState?.type === 'add' && loadingState.itemId === id ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  Add to Cart
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="h-5 w-5" />
                </Button>

                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                disabled={!product.in_stock}
              >
                Buy Now
              </Button>
              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <Card>
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <Truck className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Free Delivery</span>
                    <span className="text-xs text-muted-foreground">
                      Above ₹500
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Secure Payment</span>
                    <span className="text-xs text-muted-foreground">
                      100% Safe
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <RefreshCw className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Easy Returns</span>
                    <span className="text-xs text-muted-foreground">
                      7 Days
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          )}

          {/* Product Details Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {product.benefits?.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Product Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Ingredients</h3>
                    <p className="text-muted-foreground">
                      {product.ingredients}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">How to Use</h3>
                    <p className="text-muted-foreground">{product.usage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8">
            {id && <ProductReviews productId={id as string} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
