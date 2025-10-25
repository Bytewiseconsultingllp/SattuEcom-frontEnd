import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface Ingredient {
  id: string;
  name: string;
  description: string;
  category: string;
}

const ingredients: Ingredient[] = [
  {
    id: "roasted-chickpeas",
    name: "Roasted Chickpeas (Chana)",
    description: "The primary base of sattu, roasted chickpeas provide high protein content, fiber, and essential minerals. Rich in folate and manganese.",
    category: "Base Grains"
  },
  {
    id: "barley",
    name: "Barley (Jau)",
    description: "A nutritious whole grain that adds fiber, vitamins, and minerals. Known for its cholesterol-lowering properties and digestive benefits.",
    category: "Base Grains"
  },
  {
    id: "wheat",
    name: "Wheat (Gehun)",
    description: "Provides complex carbohydrates, B vitamins, and essential minerals. Adds body and nutrition to the sattu blend.",
    category: "Base Grains"
  },
  {
    id: "black-gram",
    name: "Black Gram (Urad Dal)",
    description: "High in protein and iron, black gram enhances the nutritional profile and adds a rich, earthy flavor to sattu.",
    category: "Pulses"
  },
  {
    id: "green-gram",
    name: "Green Gram (Moong Dal)",
    description: "Light and easily digestible, green gram adds protein and essential amino acids. Known for its cooling properties.",
    category: "Pulses"
  },
  {
    id: "peanuts",
    name: "Peanuts (Moongfali)",
    description: "Rich in healthy fats, protein, and vitamin E. Adds a nutty flavor and creamy texture to the sattu blend.",
    category: "Nuts & Seeds"
  },
  {
    id: "almonds",
    name: "Almonds (Badam)",
    description: "Packed with vitamin E, magnesium, and healthy fats. Enhances brain health and adds a premium quality to sattu.",
    category: "Nuts & Seeds"
  },
  {
    id: "cashews",
    name: "Cashews (Kaju)",
    description: "Provide healthy fats, copper, and magnesium. Add a mild sweetness and creamy texture to the sattu powder.",
    category: "Nuts & Seeds"
  },
  {
    id: "sesame-seeds",
    name: "Sesame Seeds (Til)",
    description: "Excellent source of calcium, iron, and healthy fats. Known for strengthening bones and improving skin health.",
    category: "Nuts & Seeds"
  },
  {
    id: "flax-seeds",
    name: "Flax Seeds (Alsi)",
    description: "Rich in omega-3 fatty acids and fiber. Supports heart health and digestive wellness.",
    category: "Nuts & Seeds"
  },
  {
    id: "cardamom",
    name: "Cardamom (Elaichi)",
    description: "Aromatic spice that aids digestion and adds a refreshing flavor. Known for its antioxidant properties.",
    category: "Spices"
  },
  {
    id: "cinnamon",
    name: "Cinnamon (Dalchini)",
    description: "Helps regulate blood sugar levels and adds warmth to the flavor. Rich in antioxidants.",
    category: "Spices"
  },
  {
    id: "dry-ginger",
    name: "Dry Ginger (Sonth)",
    description: "Powerful anti-inflammatory properties. Aids digestion and adds a warm, spicy note to sattu.",
    category: "Spices"
  },
  {
    id: "fennel-seeds",
    name: "Fennel Seeds (Saunf)",
    description: "Supports digestive health and adds a sweet, licorice-like flavor. Known for its cooling properties.",
    category: "Spices"
  },
  {
    id: "cumin-seeds",
    name: "Cumin Seeds (Jeera)",
    description: "Enhances digestion and adds an earthy, warm flavor. Rich in iron and antioxidants.",
    category: "Spices"
  },
  {
    id: "jaggery",
    name: "Jaggery (Gur)",
    description: "Natural sweetener rich in iron and minerals. Provides energy and helps cleanse the body.",
    category: "Sweeteners"
  },
  {
    id: "rock-salt",
    name: "Rock Salt (Sendha Namak)",
    description: "Mineral-rich natural salt that aids digestion and provides essential electrolytes.",
    category: "Seasonings"
  }
];

const weightOptions = [
  { value: 500, label: "500g", price: 150 },
  { value: 1000, label: "1kg", price: 280 },
  { value: 2000, label: "2kg", price: 540 },
  { value: 5000, label: "5kg", price: 1300 }
];

export default function CustomSattu() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showRecipe, setShowRecipe] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [customWeight, setCustomWeight] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const handleIngredientToggle = (ingredientId: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const getSelectedIngredientDetails = () => {
    return ingredients.filter(ing => selectedIngredients.includes(ing.id));
  };

  const groupByCategory = (ings: Ingredient[]) => {
    return ings.reduce((acc, ing) => {
      if (!acc[ing.category]) {
        acc[ing.category] = [];
      }
      acc[ing.category].push(ing);
      return acc;
    }, {} as Record<string, Ingredient[]>);
  };

  const calculatePrice = () => {
    const weight = customWeight ? parseInt(customWeight) : selectedWeight;
    const basePrice = weightOptions.find(w => w.value === selectedWeight)?.price || 150;
    const pricePerGram = basePrice / selectedWeight;
    const ingredientMultiplier = 1 + (selectedIngredients.length * 0.1); // 10% increase per ingredient
    return Math.round(pricePerGram * weight * ingredientMultiplier * quantity);
  };

  const handleAddToCart = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select at least one ingredient for your custom sattu.",
        variant: "destructive"
      });
      return;
    }

    const weight = customWeight ? `${customWeight}g` : weightOptions.find(w => w.value === selectedWeight)?.label;
    toast({
      title: "Added to cart!",
      description: `${quantity}x Custom Sattu (${weight}) with ${selectedIngredients.length} ingredients`,
    });
  };

  const groupedIngredients = groupByCategory(ingredients);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Create Your Custom Sattu
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build your perfect sattu blend by selecting ingredients that match your taste and nutritional needs
            </p>
          </div>

          {!showRecipe ? (
            <div className="space-y-8">
              {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => (
                <Card key={category} className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-2xl">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {categoryIngredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <Checkbox
                            id={ingredient.id}
                            checked={selectedIngredients.includes(ingredient.id)}
                            onCheckedChange={() => handleIngredientToggle(ingredient.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={ingredient.id}
                              className="font-medium text-foreground cursor-pointer block mb-1"
                            >
                              {ingredient.name}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {ingredient.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => setShowRecipe(true)}
                  disabled={selectedIngredients.length === 0}
                  className="text-lg px-8"
                >
                  Have a Look at Your Recipe
                  <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-sm">
                    {selectedIngredients.length}
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Your Custom Sattu Recipe</CardTitle>
                  <CardDescription>
                    You've selected {selectedIngredients.length} ingredients for your custom blend
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(groupByCategory(getSelectedIngredientDetails())).map(([category, categoryIngredients]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">{category}</h3>
                      <ul className="space-y-2 mb-4">
                        {categoryIngredients.map((ing) => (
                          <li key={ing.id} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <div>
                              <span className="font-medium text-foreground">{ing.name}</span>
                              <p className="text-sm text-muted-foreground">{ing.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Select Weight & Quantity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Choose Weight
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {weightOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedWeight(option.value);
                            setCustomWeight("");
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedWeight === option.value && !customWeight
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-semibold text-foreground">{option.label}</div>
                          <div className="text-sm text-muted-foreground">₹{option.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="custom-weight" className="text-sm font-medium text-foreground mb-2 block">
                      Or Enter Custom Weight (in grams)
                    </label>
                    <Input
                      id="custom-weight"
                      type="number"
                      placeholder="e.g., 750"
                      value={customWeight}
                      onChange={(e) => setCustomWeight(e.target.value)}
                      min="100"
                      className="max-w-xs"
                    />
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-semibold text-foreground w-12 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Price</div>
                      <div className="text-3xl font-bold text-foreground">₹{calculatePrice()}</div>
                    </div>
                    <Button size="lg" onClick={handleAddToCart} className="gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowRecipe(false)}
                  className="gap-2"
                >
                  ← Back to Ingredients
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
