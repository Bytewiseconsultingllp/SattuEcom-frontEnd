import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import productDrinkImage from "@/assets/product-drink.jpg";

const readyToDrinkProducts = [
  {
    id: "rtd-plain-200ml",
    name: "Plain Sattu Drink",
    size: "200ml",
    price: 30,
    originalPrice: 40,
    description: "Chilled plain sattu drink, perfect for instant refreshment. No added sugar or preservatives.",
    features: ["Ready to Drink", "No Preservatives", "Refrigerated", "Natural Taste"],
    image: productDrinkImage,
    inStock: true
  },
  {
    id: "rtd-plain-500ml",
    name: "Plain Sattu Drink",
    size: "500ml",
    price: 60,
    originalPrice: 80,
    description: "Large bottle of chilled plain sattu drink for maximum refreshment throughout the day.",
    features: ["Ready to Drink", "No Preservatives", "Refrigerated", "Natural Taste"],
    image: productDrinkImage,
    inStock: true
  },
  {
    id: "rtd-masala-200ml",
    name: "Masala Sattu Drink",
    size: "200ml",
    price: 35,
    originalPrice: 45,
    description: "Traditional namkeen sattu drink with authentic spices, salt, and a hint of lemon.",
    features: ["Spiced Blend", "Authentic Recipe", "Instant Energy", "Cooling Effect"],
    image: productDrinkImage,
    inStock: true
  },
  {
    id: "rtd-masala-500ml",
    name: "Masala Sattu Drink",
    size: "500ml",
    price: 70,
    originalPrice: 90,
    description: "Large serving of traditional masala sattu, perfect for post-workout or summer refreshment.",
    features: ["Spiced Blend", "Authentic Recipe", "Instant Energy", "Cooling Effect"],
    image: productDrinkImage,
    inStock: true
  },
  {
    id: "rtd-sweet-200ml",
    name: "Sweet Sattu Drink",
    size: "200ml",
    price: 35,
    originalPrice: 45,
    description: "Naturally sweetened with jaggery and cardamom for a delicious healthy treat.",
    features: ["Natural Sweetness", "With Jaggery", "Cardamom Flavor", "Kid Friendly"],
    image: productDrinkImage,
    inStock: true
  },
  {
    id: "rtd-mango-200ml",
    name: "Mango Sattu Fusion",
    size: "200ml",
    price: 40,
    originalPrice: 50,
    description: "Innovative blend of sattu with real mango pulp for a tropical twist on tradition.",
    features: ["Real Mango", "Fusion Flavor", "Vitamin Rich", "Refreshing"],
    image: productDrinkImage,
    inStock: true
  }
];

export default function ReadyToDrink() {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    readyToDrinkProducts.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: typeof readyToDrinkProducts[0]) => {
    const quantity = quantities[product.id];
    toast.success(`Added ${quantity}x ${product.name} (${product.size}) to cart!`, {
      icon: <Check className="h-5 w-5" />
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <Badge className="mb-4">Convenience Meets Nutrition</Badge>
              <h1 className="text-5xl font-bold mb-6">Ready to Drink Sattu</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Experience the convenience of ready-to-drink sattu beverages. Perfectly mixed, chilled, 
                and ready to refresh you instantly. No mixing, no mess - just pure nutrition on the go!
              </p>
            </div>
          </div>
        </section>

        {/* Why Ready to Drink Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Ready to Drink?</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="mb-4">
                  Our ready-to-drink sattu beverages are perfect for modern lifestyles. Pre-mixed with the 
                  right proportions of sattu, spices (or sweeteners), and water, these drinks are ready to 
                  consume straight from the bottle.
                </p>
                <p className="mb-4">
                  Ideal for busy mornings, post-workout refreshment, office breaks, or travel. Each bottle 
                  is prepared fresh, refrigerated, and delivered to maintain optimal taste and nutrition.
                </p>
                <p>
                  Whether you prefer the traditional namkeen style, the naturally sweet version, or our 
                  innovative fusion flavors, there's a ready-to-drink sattu for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Ready to Drink Range</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {readyToDrinkProducts.map((product) => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                const quantity = quantities[product.id] || 1;

                return (
                  <Card key={product.id} className="drink-product-card overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      {discount > 0 && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                          {discount}% OFF
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-primary">
                        {product.size}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">{product.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(product.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart - ₹{product.price * quantity}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Storage Instructions */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Storage & Consumption</h2>
              <Card>
                <CardContent className="p-8">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>Keep refrigerated at 2-8°C for best taste and freshness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>Consume within 24 hours of opening for optimal nutrition</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>Shake well before drinking to ensure even consistency</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>Best enjoyed chilled for maximum refreshment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>No artificial preservatives - natural ingredients only</span>
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
