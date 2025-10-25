import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);

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
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="space-y-4 animate-fade-in">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-[500px] object-cover"
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-4 py-2">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 animate-fade-in">{" "}
              <div>
                <Badge className="mb-3">{product.category}</Badge>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-primary text-xl">★</span>
                    <span className="font-semibold ml-1">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                  {product.inStock ? (
                    <Badge variant="outline" className="text-success border-success">In Stock</Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive border-destructive">Out of Stock</Badge>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              <Separator />

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                    <Badge className="bg-success text-success-foreground">Save ₹{product.originalPrice - product.price}</Badge>
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
                  disabled={!product.inStock}
                  onClick={() => toast.success("Added to cart!")}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => toast.success("Added to wishlist!")}
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
                disabled={!product.inStock}
              >
                Buy Now
              </Button>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <Card>
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <Truck className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Free Delivery</span>
                    <span className="text-xs text-muted-foreground">Above ₹500</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Secure Payment</span>
                    <span className="text-xs text-muted-foreground">100% Safe</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <RefreshCw className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Easy Returns</span>
                    <span className="text-xs text-muted-foreground">7 Days</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

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
                    <p className="text-muted-foreground">{product.ingredients}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">How to Use</h3>
                    <p className="text-muted-foreground">{product.usage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
