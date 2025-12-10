import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Package, Gift, Trash2, Plus, Minus, ChevronDown, ChevronUp, CreditCard, Loader2, ShoppingBag, Truck } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 py-8 mb-6">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-700/30 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-48 w-48 rounded-full bg-lime-400/20 blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-6 w-6 text-lime-300" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Review Your Order</h1>
            </div>
            <p className="text-sm md:text-base text-emerald-100">Verify all details before placing your order</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Delivery Address */}
                <Card className="border border-emerald-100 shadow-sm bg-white/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-emerald-700" />
                        </div>
                        <h2 className="text-base font-bold text-emerald-900">Delivery Address</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/checkout")} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs h-7 px-2">
                        Change
                      </Button>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      {!addressId ? (
                        <p className="text-xs text-red-600 font-medium">No address selected. Go back to Checkout.</p>
                      ) : selectedAddress ? (
                        <div>
                          <p className="font-bold text-sm text-emerald-900 mb-0.5">{selectedAddress.full_name}{selectedAddress.label ? ` • ${selectedAddress.label}` : ''}</p>
                          <p className="text-xs text-emerald-700 mb-0.5">{selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}</p>
                          <p className="text-xs text-emerald-700 mb-0.5">
                            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                          </p>
                          <p className="text-xs text-emerald-600">Phone: {selectedAddress.phone}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-700">Address ID: {addressId}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card className="border border-emerald-100 shadow-sm bg-white/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-emerald-700" />
                        </div>
                        <h2 className="text-base font-bold text-emerald-900">Delivery Options</h2>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { try { if (addressId) sessionStorage.setItem('selected_address_id', addressId); } catch {}; navigate("/delivery-options", { state: { addressId } }); }} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs h-7 px-2">
                        Change
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {/* Delivery Speed */}
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">Delivery Speed</span>
                          </div>
                          {deliveryCharges > 0 && (
                            <span className="text-xs font-bold text-emerald-700">+₹{deliveryCharges}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-emerald-900 capitalize ml-6">
                          {deliveryOptions.deliverySpeed === "express" ? "Express Delivery" : "Standard Delivery"}
                        </p>
                        <p className="text-xs text-emerald-600 ml-6">
                          {deliveryOptions.deliverySpeed === "express" ? "2-3 business days" : "5-7 business days"}
                          {deliveryCharges === 0 && " • Free"}
                        </p>
                      </div>

                      {/* Gift Selection */}
                      {giftDesignPrice > 0 ? (
                        <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                          <div className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                              <Gift className="h-3 w-3 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-pink-900">Gift Wrapping Selected</p>
                                <span className="text-xs font-bold text-pink-700">+₹{giftDesignPrice}</span>
                              </div>
                              <p className="text-sm font-semibold text-pink-900 mb-1">{giftName || 'Selected Gift Design'}</p>
                              {giftMessage && (
                                <div className="mt-2 p-2 bg-white/60 rounded border border-pink-200">
                                  <p className="text-xs font-semibold text-pink-900 mb-1">Gift Message:</p>
                                  <p className="text-xs text-pink-800 italic leading-relaxed">"{giftMessage}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-600">No gift wrapping selected</span>
                          </div>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {deliveryOptions.specialInstructions ? (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-blue-900 mb-1">Special Instructions</p>
                              <p className="text-sm text-blue-800 leading-relaxed">{deliveryOptions.specialInstructions}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-600">No special instructions</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="border border-emerald-100 shadow-sm bg-white/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
                      <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-emerald-700" />
                      </div>
                      <h2 className="text-base font-bold text-emerald-900">Order Items ({cartItems.length})</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                          <Link to={`/product/${item.product?.id}`}>
                            <img 
                              src={item.product?.images?.[0] || "/placeholder.svg"} 
                              alt={item.product?.name || "Product"}
                              className="w-16 h-16 object-cover rounded-lg border border-emerald-200"
                            />
                          </Link>
                          
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.product?.id}`} className="font-bold text-sm text-emerald-900 block hover:text-emerald-700 line-clamp-1">{item.product?.name || 'Product'}</Link>
                            <p className="text-xs text-emerald-600 mb-2">{item.product?.category}</p>
                            
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm text-emerald-700">₹{item.product?.price || 0} × {item.quantity}</span>
                              
                              <div className="flex items-center gap-1">
                                <div className="flex items-center border border-emerald-200 rounded-lg bg-white">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-50 text-emerald-700"
                                    onClick={() => handleQtyChange(item.id, -1, item.quantity)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-2 text-xs font-bold text-emerald-900">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-50 text-emerald-700"
                                    onClick={() => handleQtyChange(item.id, 1, item.quantity)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7 hover:bg-red-50 text-red-600"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
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
                <Card className="sticky top-24 border border-emerald-200 shadow-md bg-white/90 backdrop-blur">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-emerald-700" />
                      </div>
                      <h2 className="text-lg font-bold text-emerald-900">Payment Summary</h2>
                    </div>
                    
                    <Collapsible open={isBillOpen} onOpenChange={setIsBillOpen}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-sm text-white">Amount Payable</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white">₹{total}</span>
                            {isBillOpen ? (
                              <ChevronUp className="h-4 w-4 text-white" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="space-y-2 mt-3 p-3 border border-emerald-100 rounded-lg bg-emerald-50/30">
                          <div className="flex justify-between text-xs p-2 bg-white rounded">
                            <span className="text-emerald-700">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                            <span className="font-bold text-emerald-900">₹{subtotal}</span>
                          </div>
                          
                          <Separator className="bg-emerald-200" />
                          
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-900">Charges:</p>
                            
                            <div className="flex justify-between text-xs pl-2 py-1">
                              <span className="text-emerald-700">
                                Delivery ({deliveryOptions.deliverySpeed || "standard"})
                              </span>
                              <span className={deliveryCharges === 0 ? "text-green-600 font-bold" : "font-bold text-emerald-900"}>
                                {deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-xs pl-2 py-1">
                              <span className="text-emerald-700">Tax (5%)</span>
                              <span className="font-bold text-emerald-900">₹{taxAmount}</span>
                            </div>
                            {giftDesignPrice > 0 && (
                              <div className="flex justify-between text-xs pl-2 py-1">
                                <span className="text-emerald-700">Gift ({giftName || 'Selected Gift'})</span>
                                <span className="font-bold text-emerald-900">₹{giftDesignPrice}</span>
                              </div>
                            )}
                          </div>

                          {couponDiscount > 0 && (
                            <>
                              <Separator className="bg-emerald-200" />
                              <div className="flex justify-between text-xs p-2 bg-green-50 rounded">
                                <span className="text-green-700">Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                                <span className="font-bold text-green-700">-₹{couponDiscount}</span>
                              </div>
                            </>
                          )}
                          
                          <Separator className="bg-emerald-200" />
                          
                          <div className="flex justify-between font-bold p-2 bg-white rounded">
                            <span className="text-emerald-900 text-sm">Total Amount</span>
                            <span className="text-emerald-600 text-lg">₹{total}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Coupon Application */}
                    <div className="space-y-2 p-3 bg-lime-50 rounded-lg border border-lime-200">
                      <div>
                        <h3 className="text-xs font-bold text-emerald-900 mb-2">Apply Coupon</h3>
                        <div className="flex gap-2">
                          <Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="border-emerald-200 focus:border-emerald-600 h-9 text-sm" />
                          {appliedCoupon ? (
                            <Button variant="outline" size="sm" onClick={onRemoveCoupon} className="border-red-600 text-red-700 hover:bg-red-50 h-9 px-3 text-xs">Remove</Button>
                          ) : (
                            <Button size="sm" onClick={() => onApplyCoupon()} disabled={isApplyingCoupon || cartItems.length === 0} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3 text-xs">
                              {isApplyingCoupon ? 'Applying...' : 'Apply'}
                            </Button>
                          )}
                        </div>
                        {appliedCoupon && (
                          <div className="mt-2 p-1.5 bg-green-100 rounded flex items-center gap-1.5">
                            <Badge className="bg-green-600 text-xs py-0">{appliedCoupon.code}</Badge>
                            <span className="text-xs text-green-700">applied!</span>
                          </div>
                        )}
                      </div>

                      {availableCoupons.length > 0 && !appliedCoupon && (
                        <div>
                          <p className="text-xs text-emerald-700 mb-1.5">Available coupons</p>
                          <div className="flex flex-wrap gap-1.5">
                            {availableCoupons.map(c => (
                              <Button key={c.id} variant="outline" size="sm" onClick={() => onApplyCoupon(c.code)} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-7 px-2 text-xs">
                                {c.code}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all h-11" 
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || isProcessing || cartItems.length === 0}
                      >
                        {isPlacingOrder || isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isPlacingOrder ? "Creating..." : "Processing..."}
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
                        className="w-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => { try { if (addressId) sessionStorage.setItem('selected_address_id', addressId); } catch {}; navigate("/delivery-options", { state: { addressId } }); }}
                      >
                        Back to Delivery Options
                      </Button>
                    </div>

                    <div className="pt-3 border-t border-emerald-100">
                      <p className="text-xs text-center text-emerald-600">
                        🔒 Secure checkout
                      </p>
                    </div>
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
