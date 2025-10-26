import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getUserCookie } from "@/utils/cookie";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const uc = getUserCookie();
    if (!uc || !(uc.token || uc?.data?.token)) {
      navigate("/login");
    }
  }, [navigate]);

  const removeItem = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
    toast.success("Item removed from wishlist");
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-6">Save items you love for later</p>
            <Link to="/products">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">My Wishlist</h1>
            <p className="text-lg text-primary-foreground/90">{wishlistItems.length} items saved</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <Card key={item.id} className="hover-scale transition-all">
                <CardContent className="p-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary">₹{item.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
