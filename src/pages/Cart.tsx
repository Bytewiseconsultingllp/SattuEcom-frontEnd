import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart";
import { Skeleton } from "@/components/ui/skeleton";

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, loadingState, isLoading } = useCart();

  // Calculate shipping based on cart total
  const shipping = cartTotal > 500 ? 0 : 50;
  const total = cartTotal + shipping;

  const { updateQuantity, isItemLoading } = useCart();

  const handleQuantityChange = async (itemId: string, change: number, currentQty: number) => {
    const newQuantity = Math.max(1, currentQty + change);
    if (newQuantity === currentQty) return;
    await updateQuantity(itemId, newQuantity);
  };

  const removeItem = async (id: string) => {
    try {
      await removeFromCart(id);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
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
        {/* Global clearing overlay */}
        {loadingState?.type === 'clear' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 bg-background/90 p-6 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-lg font-semibold">Clearing cart...</div>
            </div>
          </div>
        )}
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">
              Shopping Cart
            </h1>
            <p className="text-lg text-primary-foreground/90">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
              your cart
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading && cartItems.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-2/3 mb-2" />
                          <Skeleton className="h-4 w-1/3 mb-4" />
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.product.images?.[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.product.category}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-primary">
                              ₹{item.product.price}
                            </span>

                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isItemLoading(item.id)}
                                onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-4 text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isItemLoading(item.id)}
                                onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={isItemLoading(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  {isLoading && cartItems.length === 0 ? (
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                      <Separator />
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-semibold">
                            {shipping === 0 ? "FREE" : `₹${shipping}`}
                          </span>
                        </div>
                        {cartTotal < 500 && (
                          <p className="text-xs text-muted-foreground">
                            Add ₹{500 - cartTotal} more for free shipping
                          </p>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-primary">₹{total}</span>
                        </div>
                      </div>

                      <Link to="/checkout">
                        <Button size="lg" className="w-full mb-3">
                          Proceed to Checkout
                        </Button>
                      </Link>
                      <div className="space-y-2">
                        <Link to="/products">
                          <Button variant="outline" size="lg" className="w-full">
                            Continue Shopping
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
