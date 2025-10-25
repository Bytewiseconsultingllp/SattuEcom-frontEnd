import productPowder from "@/assets/product-powder.jpg";
import productDrink from "@/assets/product-drink.jpg";
import productLadoo from "@/assets/product-ladoo.jpg";

export const products = [
  {
    id: "1",
    name: "Premium Roasted Sattu Powder - 1kg",
    price: 299,
    originalPrice: 399,
    image: productPowder,
    category: "Sattu Powder",
    rating: 4.8,
    reviews: 245,
    inStock: true,
    description: "100% natural roasted gram flour from Bihar. Rich in protein, fiber, and essential nutrients. Perfect for making traditional sattu sharbat or adding to your daily diet.",
    benefits: [
      "High in protein (20g per 100g)",
      "Rich in dietary fiber",
      "Low glycemic index",
      "Natural cooling properties",
      "No added preservatives"
    ],
    ingredients: "100% Roasted Bengal Gram (Chana)",
    usage: "Mix 2-3 tablespoons with water, salt, and lemon for a refreshing drink. Can also be used in parathas and sweets.",
  },
  {
    id: "2",
    name: "Ready to Mix Sattu Drink - Sweet & Salty Combo",
    price: 449,
    originalPrice: 599,
    image: productDrink,
    category: "Ready to Drink",
    rating: 4.6,
    reviews: 189,
    inStock: true,
    description: "Convenient ready-to-mix sattu drink sachets. Just add water and enjoy instant nutrition. Comes in both sweet and salty flavors.",
    benefits: [
      "Instant energy boost",
      "Pre-portioned sachets",
      "No preparation needed",
      "Perfect for travel",
      "Natural ingredients"
    ],
    ingredients: "Roasted Sattu, Rock Salt, Black Salt, Cumin Powder, Sugar, Cardamom",
    usage: "Empty one sachet in 200ml water, mix well and enjoy. Best served chilled.",
  },
  {
    id: "3",
    name: "Sattu Energy Ladoo - Pack of 12",
    price: 350,
    originalPrice: 450,
    image: productLadoo,
    category: "Snacks & Ladoo",
    rating: 4.9,
    reviews: 312,
    inStock: true,
    description: "Delicious and nutritious sattu ladoos made with jaggery, nuts, and ghee. Perfect healthy snack for all ages.",
    benefits: [
      "Natural energy booster",
      "Made with pure desi ghee",
      "Rich in nuts and seeds",
      "No refined sugar",
      "Traditional recipe"
    ],
    ingredients: "Sattu, Jaggery, Almonds, Cashews, Desi Ghee, Cardamom",
    usage: "Consume 1-2 ladoos as a healthy snack. Best enjoyed with milk or tea.",
  },
  {
    id: "4",
    name: "Organic Sattu Powder - 500g",
    price: 199,
    originalPrice: 249,
    image: productPowder,
    category: "Sattu Powder",
    rating: 4.7,
    reviews: 156,
    inStock: true,
    description: "Certified organic sattu powder made from specially selected organic Bengal gram. Ideal for health-conscious consumers.",
    benefits: [
      "100% organic certified",
      "Pesticide-free",
      "High nutritional value",
      "Supports local farmers",
      "Eco-friendly packaging"
    ],
    ingredients: "100% Organic Roasted Bengal Gram",
    usage: "Use in smoothies, drinks, or traditional recipes. Mix with buttermilk for best results.",
  },
  {
    id: "5",
    name: "Sattu Protein Shake Mix - Chocolate",
    price: 549,
    originalPrice: 699,
    image: productDrink,
    category: "Ready to Drink",
    rating: 4.5,
    reviews: 98,
    inStock: true,
    description: "Innovative fusion of traditional sattu with chocolate flavor. Perfect post-workout drink packed with natural protein.",
    benefits: [
      "25g protein per serving",
      "Natural cocoa flavor",
      "No artificial sweeteners",
      "Muscle recovery",
      "Sustained energy"
    ],
    ingredients: "Roasted Sattu, Cocoa Powder, Dates, Almond Powder, Natural Sweetener",
    usage: "Mix 2 scoops with milk or water. Shake well and consume post-workout or as meal replacement.",
  },
  {
    id: "6",
    name: "Sattu Chikki Bar - Pack of 6",
    price: 180,
    originalPrice: 220,
    image: productLadoo,
    category: "Snacks & Ladoo",
    rating: 4.4,
    reviews: 145,
    inStock: false,
    description: "Crunchy sattu bars with jaggery and mixed seeds. A modern take on traditional Indian brittle.",
    benefits: [
      "On-the-go snacking",
      "Natural sweetness",
      "Rich in minerals",
      "Individually wrapped",
      "Long shelf life"
    ],
    ingredients: "Sattu, Jaggery, Sesame Seeds, Peanuts, Ghee",
    usage: "Enjoy as evening snack or quick breakfast on busy mornings.",
  },
];

export const categories = [
  "All Products",
  "Sattu Powder",
  "Ready to Drink",
  "Snacks & Ladoo",
];
