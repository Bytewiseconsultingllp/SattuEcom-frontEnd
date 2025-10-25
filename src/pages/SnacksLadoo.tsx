import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import productLadooImage from "@/assets/product-ladoo.jpg";

const snacksLadooProducts = [
  {
    id: "ladoo-plain-250g",
    name: "Traditional Sattu Ladoo",
    weight: "250g (10 pieces)",
    price: 150,
    originalPrice: 180,
    description: "Classic sattu ladoo made with jaggery and ghee. Perfect traditional sweet snack.",
    features: ["Jaggery Sweetened", "Pure Ghee", "No Sugar", "Authentic Recipe"],
    image: productLadooImage,
    inStock: true
  },
  {
    id: "ladoo-plain-500g",
    name: "Traditional Sattu Ladoo",
    weight: "500g (20 pieces)",
    price: 280,
    originalPrice: 340,
    description: "Family pack of classic sattu ladoos, ideal for festivals and family gatherings.",
    features: ["Jaggery Sweetened", "Pure Ghee", "No Sugar", "Authentic Recipe"],
    image: productLadooImage,
    inStock: true
  },
  {
    id: "ladoo-dryfruits-250g",
    name: "Dry Fruits Sattu Ladoo",
    weight: "250g (10 pieces)",
    price: 200,
    originalPrice: 250,
    description: "Premium ladoos loaded with almonds, cashews, and raisins for extra nutrition.",
    features: ["Mixed Dry Fruits", "Rich in Nuts", "Premium Quality", "Energy Packed"],
    image: productLadooImage,
    inStock: true
  },
  {
    id: "ladoo-chocolate-250g",
    name: "Chocolate Sattu Ladoo",
    weight: "250g (10 pieces)",
    price: 180,
    originalPrice: 220,
    description: "Modern twist on tradition - sattu ladoos with rich cocoa for chocolate lovers.",
    features: ["Cocoa Flavored", "Kid Favorite", "Healthy Treat", "Unique Taste"],
    image: productLadooImage,
    inStock: true
  },
  {
    id: "barfi-plain-250g",
    name: "Sattu Barfi",
    weight: "250g",
    price: 160,
    originalPrice: 200,
    description: "Soft and delicious sattu barfi, perfect for festivals and special occasions.",
    features: ["Melt in Mouth", "Festival Special", "Pure Ingredients", "Traditional Sweet"],
    image: productLadooImage,
    inStock: true
  },
  {
    id: "chikki-200g",
    name: "Sattu Chikki",
    weight: "200g",
    price: 120,
    originalPrice: 150,
    description: "Crunchy sattu chikki with jaggery and sesame seeds. Perfect tea-time snack.",
    features: ["Crunchy Texture", "Sesame Seeds", "Tea Time Snack", "Natural Sweetness"],
    image: productLadooImage,
    inStock: true
  }
];

export default function SnacksLadoo() {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    snacksLadooProducts.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: typeof snacksLadooProducts[0]) => {
    const quantity = quantities[product.id];
    toast.success(`Added ${quantity}x ${product.name} to cart!`, {
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
              <Badge className="mb-4">Healthy Indulgence</Badge>
              <h1 className="text-5xl font-bold mb-6">Sattu Snacks & Ladoo</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Satisfy your sweet tooth the healthy way! Our range of sattu-based sweets and snacks 
                combines traditional recipes with modern flavors. From classic ladoos to innovative 
                chocolate varieties, every bite is packed with nutrition and nostalgia.
              </p>
            </div>
          </div>
        </section>

        {/* About Sattu Sweets Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">The Art of Sattu Sweets</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="mb-4">
                  Sattu ladoos and sweets have been a cherished part of Indian cuisine for generations. 
                  These protein-rich treats are traditionally made during festivals, offered as prasad in 
                  temples, and enjoyed as nutritious snacks by people of all ages.
                </p>
                <p className="mb-4">
                  Our sattu sweets are made using time-tested recipes with premium ingredients - pure desi ghee, 
                  organic jaggery, and high-quality dry fruits. Unlike regular sweets loaded with refined sugar, 
                  our sattu-based treats provide sustained energy and nutrition.
                </p>
                <p>
                  Perfect for gifting during festivals, serving to guests, or simply enjoying as a guilt-free 
                  indulgence, our sattu sweets bring together taste, tradition, and health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Sweets & Snacks Collection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {snacksLadooProducts.map((product) => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                const quantity = quantities[product.id] || 1;

                return (
                  <Card key={product.id} className="snack-product-card overflow-hidden hover:shadow-xl transition-all duration-300">
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
                        {product.weight}
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

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Our Sattu Sweets?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Natural Sweetness</h3>
                  <p className="text-muted-foreground text-sm">
                    Sweetened with organic jaggery instead of refined sugar, providing natural minerals and a healthier alternative.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">High Protein Content</h3>
                  <p className="text-muted-foreground text-sm">
                    Each piece is protein-rich, making it an excellent post-workout snack or energy booster for active lifestyles.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Pure Desi Ghee</h3>
                  <p className="text-muted-foreground text-sm">
                    Made with authentic desi ghee for that rich, traditional taste and added nutritional benefits.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">No Artificial Additives</h3>
                  <p className="text-muted-foreground text-sm">
                    Zero artificial colors, flavors, or preservatives. Only natural ingredients that you can trust.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Perfect for All Ages</h3>
                  <p className="text-muted-foreground text-sm">
                    From kids to elders, everyone can enjoy these nutritious treats without compromising on health.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Long Shelf Life</h3>
                  <p className="text-muted-foreground text-sm">
                    Stays fresh for weeks when stored properly, making it perfect for gifting and festivals.
                  </p>
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
