import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import productPowderImage from "@/assets/product-powder.jpg";

const sattuPowderTypes = [
  {
    id: "sattu-plain-500g",
    name: "Plain Sattu Powder",
    weight: "500g",
    price: 120,
    originalPrice: 150,
    description: "Traditional roasted chana sattu powder, perfect for making refreshing sattu drinks and parathas.",
    features: ["100% Natural", "No Additives", "Rich in Protein", "Energy Booster"],
    image: productPowderImage,
    inStock: true
  },
  {
    id: "sattu-plain-1kg",
    name: "Plain Sattu Powder",
    weight: "1kg",
    price: 220,
    originalPrice: 280,
    description: "Value pack of traditional roasted chana sattu powder, ideal for regular consumption.",
    features: ["100% Natural", "No Additives", "Rich in Protein", "Energy Booster"],
    image: productPowderImage,
    inStock: true
  },
  {
    id: "sattu-masala-500g",
    name: "Masala Sattu Powder",
    weight: "500g",
    price: 150,
    originalPrice: 190,
    description: "Pre-mixed with spices and salt, ready to make instant sattu drink. Just add water!",
    features: ["Pre-Mixed Spices", "Instant Drink", "Authentic Taste", "Time Saver"],
    image: productPowderImage,
    inStock: true
  },
  {
    id: "sattu-masala-1kg",
    name: "Masala Sattu Powder",
    weight: "1kg",
    price: 280,
    originalPrice: 350,
    description: "Large pack of pre-mixed masala sattu, perfect for families and regular use.",
    features: ["Pre-Mixed Spices", "Instant Drink", "Authentic Taste", "Time Saver"],
    image: productPowderImage,
    inStock: true
  },
  {
    id: "sattu-sweet-500g",
    name: "Sweet Sattu Powder",
    weight: "500g",
    price: 140,
    originalPrice: 170,
    description: "Naturally sweetened sattu powder with jaggery, perfect for kids and sweet lovers.",
    features: ["Natural Sweetness", "With Jaggery", "Kid Friendly", "Nutritious Snack"],
    image: productPowderImage,
    inStock: true
  },
  {
    id: "sattu-organic-500g",
    name: "Organic Sattu Powder",
    weight: "500g",
    price: 180,
    originalPrice: 220,
    description: "100% organic certified sattu made from organic chana, pesticide-free and pure.",
    features: ["Organic Certified", "Pesticide Free", "Premium Quality", "Farm Fresh"],
    image: productPowderImage,
    inStock: true
  }
];

export default function SattuPowder() {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    sattuPowderTypes.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: typeof sattuPowderTypes[0]) => {
    const quantity = quantities[product.id];
    toast.success(`Added ${quantity}x ${product.name} (${product.weight}) to cart!`, {
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
              <Badge className="mb-4">Premium Quality</Badge>
              <h1 className="text-5xl font-bold mb-6">Sattu Powder Collection</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover our range of authentic sattu powder varieties - from traditional plain to pre-mixed masala, 
                sweet jaggery blend to organic certified options. Choose your favorite and experience the power of 
                this ancient superfood.
              </p>
            </div>
          </div>
        </section>

        {/* What is Sattu Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">What is Sattu?</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="mb-4">
                  Sattu is a traditional superfood from Bihar and other parts of India, made by dry roasting 
                  chana (Bengal gram) and grinding it into a fine powder. This protein-rich flour has been a 
                  staple in Indian households for centuries, known for its cooling properties and nutritional benefits.
                </p>
                <p className="mb-4">
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

        {/* Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Sattu Powder Varieties</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sattuPowderTypes.map((product) => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                const quantity = quantities[product.id] || 1;

                return (
                  <Card key={product.id} className="powder-product-card overflow-hidden hover:shadow-xl transition-all duration-300">
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
            <h2 className="text-3xl font-bold mb-12 text-center">Health Benefits of Sattu</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">High in Protein</h3>
                  <p className="text-muted-foreground text-sm">
                    Contains about 20g protein per 100g, making it excellent for muscle building and recovery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Natural Coolant</h3>
                  <p className="text-muted-foreground text-sm">
                    Known for its cooling properties, perfect for hot summer days to keep your body temperature balanced.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Aids Digestion</h3>
                  <p className="text-muted-foreground text-sm">
                    Rich in fiber, it promotes healthy digestion and helps prevent constipation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Low Glycemic Index</h3>
                  <p className="text-muted-foreground text-sm">
                    Great for diabetics as it helps regulate blood sugar levels naturally.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Energy Booster</h3>
                  <p className="text-muted-foreground text-sm">
                    Provides sustained energy throughout the day without sugar crashes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Rich in Minerals</h3>
                  <p className="text-muted-foreground text-sm">
                    Contains iron, calcium, magnesium, and other essential minerals for overall health.
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
