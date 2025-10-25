import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Package, Gift, Trash2, Plus, Minus, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { toast } from "sonner";

const dummyAddresses = [
  {
    id: "1",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    address: "123, MG Road, Near City Mall",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
  },
  {
    id: "2",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    address: "456, Park Street, Opposite Metro Station",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
];

const dummyCartItems = [
  {
    id: "1",
    name: "Premium Sattu Powder",
    category: "Sattu Powder",
    price: 299,
    quantity: 2,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Organic Sattu Ladoo",
    category: "Snacks",
    price: 199,
    quantity: 1,
    image: "/placeholder.svg",
  },
];

const OrderReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressId = location.state?.addressId;
  const deliveryOptions = location.state?.deliveryOptions || {};
  
  const [cartItems, setCartItems] = useState(dummyCartItems);
  const [isBillOpen, setIsBillOpen] = useState(false);
  
  const selectedAddress = dummyAddresses.find(a => a.id === addressId) || dummyAddresses[0];

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast.success("Item removed from order");
  };

  // Calculate costs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const deliveryCharges = deliveryOptions.deliverySpeed === "express" ? 50 : 
                          deliveryOptions.deliverySpeed === "overnight" ? 150 : 0;
  
  const giftCharges = deliveryOptions.isGift ? 30 : 0;
  
  const taxRate = 0.05; // 5% tax
  const taxAmount = Math.round(subtotal * taxRate);
  
  const total = subtotal + deliveryCharges + giftCharges + taxAmount;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    toast.success("Order placed successfully!");
    // Navigate to order success page or user dashboard
    setTimeout(() => {
      navigate("/");
    }, 2000);
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
                      <p className="font-semibold mb-1">{selectedAddress.name}</p>
                      <p className="text-sm text-muted-foreground mb-1">{selectedAddress.address}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">Phone: {selectedAddress.phone}</p>
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
                      <Button variant="outline" size="sm" onClick={() => navigate("/delivery-options", { state: { addressId } })}>
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
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">₹{item.price} × {item.quantity}</span>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-lg">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, 1)}
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
                        onClick={() => navigate("/delivery-options", { state: { addressId } })}
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
