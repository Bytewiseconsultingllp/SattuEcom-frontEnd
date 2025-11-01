import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Package, Gift, Trash2, Plus, Minus, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { getAddressById as apiGetAddressById } from "@/lib/api/addresses";
import { useCart } from "@/contexts/CartContext";
import { createOrder, OrderItemInput } from "@/lib/api/order";


// Order review uses the actual items from CartContext

const OrderReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressId = location.state?.addressId || (() => {
    try { return sessionStorage.getItem('selected_address_id') || undefined; } catch { return undefined; }
  })();
  const deliveryOptions = location.state?.deliveryOptions || {};
  
  const { cartItems, updateQuantity, removeFromCart, refreshCart } = useCart();
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!addressId) return;
      try {
        const res = await apiGetAddressById(addressId);
        if (res?.success) setSelectedAddress(res.data);
      } catch (e: any) {
        // Non-fatal; show minimal info
        setSelectedAddress(null);
      }
    })();
  }, [addressId]);

  const handleQtyChange = async (itemId: string, change: number, currentQty: number) => {
    const newQty = Math.max(1, currentQty + change);
    if (newQty === currentQty) return;
    await updateQuantity(itemId, newQty);
  };

  const removeItem = async (id: string) => {
    await removeFromCart(id);
    toast.success("Item removed from order");
  };

  // Calculate costs
  const subtotal = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  
  const deliveryCharges = deliveryOptions.deliverySpeed === "express" ? 50 : 
                          deliveryOptions.deliverySpeed === "overnight" ? 150 : 0;
  
  const giftCharges = deliveryOptions.isGift ? 30 : 0;
  
  const taxRate = 0.05; // 5% tax
  const taxAmount = Math.round(subtotal * taxRate);
  
  const total = subtotal + deliveryCharges + giftCharges + taxAmount;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!addressId && !selectedAddress?.id) {
      toast.error("Please select a delivery address");
      return;
    }
    try {
      const items: OrderItemInput[] = cartItems.map(ci => ({
        product_id: ci.product?.id || ci.product_id,
        quantity: ci.quantity,
        price: ci.product?.price || 0,
      }));
      const res = await createOrder({
        total_amount: total,
        shipping_address_id: (selectedAddress?.id || addressId) as string,
        items,
      });
      if (res?.success) {
        toast.success("Order placed successfully");
        await refreshCart();
        navigate("/dashboard", { replace: true, state: { tab: "orders" } });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Review Your Order</h1>
            <p className="text-lg text-primary-foreground/90">Verify all details before placing your order</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Delivery Address */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold">Delivery Address</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/checkout")}>
                        Change
                      </Button>
                    </div>
                    <div className="bg-accent/5 p-4 rounded-lg">
                      {!addressId ? (
                        <p className="text-sm text-destructive">No address selected. Go back to Checkout.</p>
                      ) : selectedAddress ? (
                        <div>
                          <p className="font-semibold mb-1">{selectedAddress.full_name}{selectedAddress.label ? ` • ${selectedAddress.label}` : ''}</p>
                          <p className="text-sm text-muted-foreground mb-1">{selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}</p>
                          <p className="text-sm text-muted-foreground mb-1">
                            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {selectedAddress.phone}</p>
                        </div>
                      ) : (
                        <p className="text-sm">Address ID: {addressId}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold">Delivery Options</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { try { if (addressId) sessionStorage.setItem('selected_address_id', addressId); } catch {}; navigate("/delivery-options", { state: { addressId } }); }}>
                        Change
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Speed:</span>
                        <span className="font-semibold capitalize">
                          {deliveryOptions.deliverySpeed || "Standard"} 
                          {deliveryCharges > 0 && ` (+₹${deliveryCharges})`}
                        </span>
                      </div>
                      {deliveryOptions.isGift && (
                        <div className="flex items-start gap-2 text-sm bg-accent/5 p-3 rounded-lg">
                          <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold mb-1">Gift Packaging (+₹30)</p>
                            {deliveryOptions.giftMessage && (
                              <p className="text-muted-foreground italic">"{deliveryOptions.giftMessage}"</p>
                            )}
                          </div>
                        </div>
                      )}
                      {deliveryOptions.specialInstructions && (
                        <div className="text-sm bg-accent/5 p-3 rounded-lg">
                          <p className="font-semibold mb-1">Special Instructions:</p>
                          <p className="text-muted-foreground">{deliveryOptions.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Order Items ({cartItems.length})</h2>
                    
                    <div className="space-y-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex gap-4 p-4 bg-accent/5 rounded-lg">
                          <Link to={`/product/${item.product?.id}`}>
                            <img 
                              src={item.product?.image_url || "/placeholder.svg"} 
                              alt={item.product?.name || "Product"}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </Link>
                          
                          <div className="flex-1">
                            <Link to={`/product/${item.product?.id}`} className="font-semibold mb-1 block hover:text-primary">{item.product?.name || 'Product'}</Link>
                            <p className="text-sm text-muted-foreground mb-2">{item.product?.category}</p>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">₹{item.product?.price || 0} × {item.quantity}</span>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-lg">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleQtyChange(item.id, -1, item.quantity)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleQtyChange(item.id, 1, item.quantity)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
                    
                    <Collapsible open={isBillOpen} onOpenChange={setIsBillOpen}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span className="font-bold">Amount Payable</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">₹{total}</span>
                            {isBillOpen ? (
                              <ChevronUp className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="space-y-3 mt-4 p-4 border rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                            <span className="font-semibold">₹{subtotal}</span>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Charges:</p>
                            
                            <div className="flex justify-between text-sm pl-3">
                              <span className="text-muted-foreground">
                                Delivery ({deliveryOptions.deliverySpeed || "standard"})
                              </span>
                              <span className={deliveryCharges === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                                {deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}
                              </span>
                            </div>
                            
                            {deliveryOptions.isGift && (
                              <div className="flex justify-between text-sm pl-3">
                                <span className="text-muted-foreground">Gift Packaging</span>
                                <span className="font-semibold">₹{giftCharges}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-sm pl-3">
                              <span className="text-muted-foreground">Tax (5%)</span>
                              <span className="font-semibold">₹{taxAmount}</span>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-between font-bold">
                            <span>Total Amount</span>
                            <span className="text-primary">₹{total}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="mt-6 space-y-3">
                      <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
                        Place Order
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full"
                        onClick={() => { try { if (addressId) sessionStorage.setItem('selected_address_id', addressId); } catch {}; navigate("/delivery-options", { state: { addressId } }); }}
                      >
                        Back to Delivery Options
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By placing your order, you agree to our terms and conditions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderReview;
