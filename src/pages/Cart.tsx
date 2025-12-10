import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, Loader2, ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, loadingState, isLoading, updateQuantity, isItemLoading } = useCart();

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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100/50 rounded-full blur-3xl" />
              <div className="relative bg-white rounded-full p-8 shadow-lg inline-block">
                <ShoppingBag className="h-24 w-24 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Your cart is empty</h1>
              <p className="text-lg text-emerald-700/80">
                Discover our range of wholesome, traditional nutrition products
              </p>
            </div>
            <Link to="/products">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg hover:shadow-xl transition-all">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <Header />

      <main className="flex-1">
        {/* Global clearing overlay */}
        {loadingState?.type === 'clear' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <div className="text-lg font-semibold text-emerald-900">Clearing cart...</div>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 py-8 mb-6">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-700/30 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-48 w-48 rounded-full bg-lime-400/20 blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-6 w-6 text-lime-300" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Shopping Cart</h1>
            </div>
            <p className="text-sm md:text-base text-emerald-100">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {isLoading && cartItems.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={idx} className="border-emerald-200 shadow-md bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <Skeleton className="w-full sm:w-32 md:w-40 h-40 sm:h-full" />
                        <div className="flex-1 p-4 sm:p-5 space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-24 rounded-full" />
                          </div>
                          <Skeleton className="h-8 w-32" />
                          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-32 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                cartItems.map((item) => (
                  <Card key={item.id} className="border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Product Image */}
                        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                          <div className="relative w-full sm:w-32 md:w-40 h-40 sm:h-full bg-gradient-to-br from-emerald-50 to-lime-50">
                            <img
                              src={item.product.images?.[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                          {/* Top Section: Title and Remove Button */}
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <div className="flex-1">
                              <Link to={`/product/${item.product.id}`}>
                                <h3 className="font-bold text-lg md:text-xl text-emerald-900 hover:text-emerald-700 transition-colors line-clamp-2">
                                  {item.product.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  {item.product.category}
                                </span>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-full flex-shrink-0"
                              onClick={() => removeItem(item.id)}
                              disabled={isItemLoading(item.id)}
                              title="Remove from cart"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          {/* Middle Section: Price and Description */}
                          <div className="mb-4 space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-emerald-600">
                                ₹{item.product.price}
                              </span>
                              <span className="text-sm text-emerald-600/60">per unit</span>
                            </div>
                            {item.product.description && (
                              <p className="text-sm text-emerald-700/70 line-clamp-2 leading-relaxed">
                                {item.product.description}
                              </p>
                            )}
                          </div>

                          {/* Bottom Section: Quantity and Subtotal */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-emerald-100">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-emerald-700">Quantity:</span>
                              <div className="flex items-center border-2 border-emerald-300 rounded-lg bg-white shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 hover:bg-emerald-50 text-emerald-700 rounded-l-lg"
                                  disabled={isItemLoading(item.id) || item.quantity <= 1}
                                  onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-4 min-w-[3rem] text-center text-base font-bold text-emerald-900">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 hover:bg-emerald-50 text-emerald-700 rounded-r-lg"
                                  disabled={isItemLoading(item.id)}
                                  onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Subtotal */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
                              <span className="text-sm font-medium text-emerald-700">Subtotal:</span>
                              <span className="text-xl font-bold text-emerald-900">
                                ₹{item.product.price * item.quantity}
                              </span>
                            </div>
                          </div>

                          {/* Loading Overlay */}
                          {isItemLoading(item.id) && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-emerald-200 shadow-lg bg-white/90 backdrop-blur">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-emerald-700" />
                    </div>
                    <h2 className="text-lg font-bold text-emerald-900">Order Summary</h2>
                  </div>

                  {isLoading && cartItems.length === 0 ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Separator />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                          <span className="text-emerald-700 text-sm font-medium">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                          <span className="font-bold text-lg text-emerald-900">₹{cartTotal}</span>
                        </div>
                        
                        <div className="p-3 bg-lime-50 rounded-lg border border-lime-200">
                          <p className="text-xs text-lime-800 font-medium flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                            Shipping & taxes to be calculated at checkout
                          </p>
                        </div>

                        <Separator className="bg-emerald-200" />
                        
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white">
                          <span className="font-bold text-base">Total</span>
                          <span className="font-bold text-xl">₹{cartTotal}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <Link to="/checkout">
                          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all h-11">
                            Proceed to Checkout
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        </div>
                        <div className="space-y-6">
                        <Link to="/products">
                          <Button variant="outline" className="w-full border border-emerald-600 text-emerald-700 hover:bg-emerald-700 transition-all">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Continue Shopping
                          </Button>
                        </Link>
                      </div>

                      <div className="pt-3 border-t border-emerald-100">
                        <p className="text-xs text-center text-emerald-600">
                          🔒 Secure checkout
                        </p>
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
