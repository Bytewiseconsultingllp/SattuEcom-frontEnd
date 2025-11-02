import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getTopProducts } from "@/lib/api/dashboardStats";

export function TopProducts() {
  const [topProducts, setTopProducts] = useState<any[]>([
    { name: "Premium Sattu Powder 1kg", sales: 234, revenue: 23400 },
    { name: "Sattu Energy Drink Mix", sales: 198, revenue: 19800 },
    { name: "Roasted Sattu Snacks", sales: 167, revenue: 16700 },
    { name: "Sattu Gift Hamper", sales: 145, revenue: 14500 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getTopProducts(4);
      if (response?.success) {
        setTopProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch top products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Products</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/products">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
