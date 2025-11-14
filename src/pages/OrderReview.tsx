import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Package, Gift, Trash2, Plus, Minus, ChevronDown, ChevronUp, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAddressById as apiGetAddressById } from "@/lib/api/addresses";
import { useCart } from "@/contexts/CartContext";
import { createOrder, OrderItemInput } from "@/lib/api/order";
import { useRazorpay } from "@/hooks/useRazorpay.production";
import { getUserCookie } from "@/utils/cookie";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getActiveCoupons, applyCoupon, type Coupon } from "@/lib/api/coupons";
import { getActiveGiftDesigns, submitCustomGiftRequest, type GiftDesign } from "@/lib/api/gifts";


// Order review uses the actual items from CartContext

const OrderReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressId = location.state?.addressId || (() => {
    try { return sessionStorage.getItem('selected_address_id') || undefined; } catch { return undefined; }
  })();
  const deliveryOptions =
    location.state?.deliveryOptions ||
    JSON.parse(sessionStorage.getItem("delivery_options") || "{}");

  const customGiftRequest = location.state?.customGiftRequest || null;
  
  const { cartItems, updateQuantity, removeFromCart, refreshCart } = useCart();
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { initiatePayment, isProcessing } = useRazorpay();

  // Coupon state
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Get gift selection from delivery options
  const selectedGiftId = deliveryOptions.selectedGiftId || null;
  const giftMessage = deliveryOptions.giftMessage || "";
  const giftName = deliveryOptions.giftName || "";
  const giftPrice = Number(deliveryOptions.giftPrice || 0);
  const [giftDesigns, setGiftDesigns] = useState<GiftDesign[]>([]);

  // Debug log
  console.log('Gift Details:', { selectedGiftId, giftName, giftPrice, giftMessage });

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

  // Fetch and filter active coupons for checkout visibility
  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveCoupons();
        if (res?.success) {
          const now = Date.now();
          const filtered = (res.data || []).filter(c => {
            if (!c.is_active) return false;
            if (c.usage_limit && c.usage_limit > 0 && (c.usage_count || 0) >= c.usage_limit) return false;
            if (c.start_date && new Date(c.start_date).getTime() > now) return false;
            if (c.end_date && new Date(c.end_date).getTime() < now) return false;
            return true;
          });
          setAvailableCoupons(filtered);
        }
      } catch (_) {
        // silent
      }
    })();
  }, []);

  // Optionally fetch active gift designs (not required for price; kept for future needs)
  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveGiftDesigns();
        if (res?.success) setGiftDesigns(res.data || []);
      } catch {
        // silent
      }
    })();
  }, []);

  // Re-apply coupon when cart changes, to keep discount consistent
  useEffect(() => {
    (async () => {
      if (!appliedCoupon) return;
      try {
        const res = await applyCoupon(appliedCoupon.code, cartForCoupon);
        if (res?.success) {
          setCouponDiscount(res.data?.discount_amount || 0);
        }
      } catch {
        // If coupon no longer valid, remove it silently
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

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
  
  const baseDeliveryCharges = deliveryOptions.deliverySpeed === "express" ? 50 : 
                              deliveryOptions.deliverySpeed === "overnight" ? 150 : 0;

  const hasFreeShippingCoupon = appliedCoupon?.type === "free_shipping";
  const deliveryCharges = hasFreeShippingCoupon ? 0 : baseDeliveryCharges;
  
  const taxRate = 0.05; // 5% tax
  const taxAmount = Math.round(subtotal * taxRate);
  
  // Use giftPrice directly from deliveryOptions
  const giftDesignPrice = giftPrice;

  const preDiscountTotal = subtotal + deliveryCharges + taxAmount + giftDesignPrice;
  const total = Math.max(0, preDiscountTotal - couponDiscount);

  const cartForCoupon = cartItems.map(ci => ({
    product_id: ci.product?.id || ci.product_id,
    quantity: ci.quantity,
    price: ci.product?.price || 0,
  }));

  const onApplyCoupon = async (code?: string) => {
    const theCode = (code || couponCode || '').trim().toUpperCase();
    if (!theCode) { toast.error('Enter a coupon code'); return; }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }
    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(theCode, cartForCoupon);
      if (res?.success && res.data?.coupon) {
        setAppliedCoupon(res.data.coupon);
        setCouponDiscount(res.data.discount_amount || 0);
        setCouponCode(theCode);
        toast.success(`Applied ${theCode}`);
      } else {
        toast.error('Invalid coupon');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    // keep code input for convenience
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!addressId && !selectedAddress?.id) {
      toast.error("Please select a delivery address");
      return;
    }

    // Get user details from cookie
    const user = getUserCookie();

    setIsPlacingOrder(true);

    try {
      
      // Step 1: Create order on backend
      const items: OrderItemInput[] = cartItems.map(ci => ({
        product_id: ci.product?.id || ci.product_id,
        quantity: ci.quantity,
        price: ci.product?.price || 0,
      }));

      const orderRes = await createOrder({
        total_amount: total,
        shipping_address_id: (selectedAddress?.id || addressId) as string,
        items,
        coupon_code: appliedCoupon?.code,
        discount_amount: couponDiscount || undefined,
        gift_design_id: selectedGiftId || undefined,
        gift_price: giftDesignPrice || undefined,
        gift_card_message: giftMessage || undefined,
        gift_wrapping_type: undefined,
        delivery_charges: deliveryCharges || undefined,
        delivery_type: deliveryOptions.deliverySpeed || 'standard',
        tax_amount: taxAmount || undefined,
      });

      if (!orderRes?.success || !orderRes?.data?.id) {
        throw new Error("Failed to create order");
      }

      const orderId = orderRes.data.id;
      toast.success("Order created! Proceeding to payment...");

      // Step 2: Initiate Razorpay payment with user details from cookie and selected address.
      // NOTE: The Razorpay hook itself handles all redirects:
      //  - /order-confirmation on success
      //  - /payment-failed on failure
      //  - /payment-pending on timeout/cancellation
      // So we do not navigate here based on the return value.
      await initiatePayment(orderId, {
        name: user?.name || selectedAddress?.full_name || "",
        email: user?.email || "",
        contact: selectedAddress?.phone || user?.phone || "",
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
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
                      {giftDesignPrice > 0 && (
                        <div className="flex items-start gap-2 text-sm bg-accent/5 p-3 rounded-lg">
                          <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold mb-1">{giftName || 'Selected Gift'} (+₹{giftDesignPrice})</p>
                            {giftMessage && (
                              <p className="text-muted-foreground italic">"{giftMessage}"</p>
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
                              src={item.product?.images?.[0] || "/placeholder.svg"} 
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
                            
                            <div className="flex justify-between text-sm pl-3">
                              <span className="text-muted-foreground">Tax (5%)</span>
                              <span className="font-semibold">₹{taxAmount}</span>
                            </div>
                            {giftDesignPrice > 0 && (
                              <div className="flex justify-between text-sm pl-3">
                                <span className="text-muted-foreground">Gift Design ({giftName || 'Selected Gift'})</span>
                                <span className="font-semibold">₹{giftDesignPrice}</span>
                              </div>
                            )}
                          </div>

                          {couponDiscount > 0 && (
                            <>
                              <Separator />
                              <div className="flex justify-between text-sm text-green-700">
                                <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                                <span className="font-semibold">-₹{couponDiscount}</span>
                              </div>
                            </>
                          )}
                          
                          <Separator />
                          
                          <div className="flex justify-between font-bold">
                            <span>Total Amount</span>
                            <span className="text-primary">₹{total}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Coupon Application */}
                    <div className="mt-6 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Apply Coupon</h3>
                        <div className="flex gap-2">
                          <Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                          {appliedCoupon ? (
                            <Button variant="outline" onClick={onRemoveCoupon}>Remove</Button>
                          ) : (
                            <Button onClick={() => onApplyCoupon()} disabled={isApplyingCoupon || cartItems.length === 0}>
                              {isApplyingCoupon ? 'Applying...' : 'Apply'}
                            </Button>
                          )}
                        </div>
                        {appliedCoupon && (
                          <div className="mt-2 text-xs text-green-700 flex items-center gap-2">
                            <Badge variant="secondary">{appliedCoupon.code}</Badge>
                            <span>applied.</span>
                          </div>
                        )}
                      </div>

                      {availableCoupons.length > 0 && !appliedCoupon && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Available coupons for you</p>
                          <div className="flex flex-wrap gap-2">
                            {availableCoupons.map(c => (
                              <Button key={c.id} variant="outline" size="sm" onClick={() => onApplyCoupon(c.code)}>
                                {c.code}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || isProcessing || cartItems.length === 0}
                      >
                        {isPlacingOrder || isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isPlacingOrder ? "Creating Order..." : "Processing Payment..."}
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Place Order & Pay ₹{total}
                          </>
                        )}
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
