import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { XCircle, RefreshCw, Home, HelpCircle, CreditCard, Package, MapPin, Gift, Loader2 } from "lucide-react";
import { getOrderById } from "@/lib/api/order";
import { useRazorpay } from "@/hooks/useRazorpay.production";
import { getUserCookie } from "@/utils/cookie";
import { toast } from "sonner";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { initiatePayment, isProcessing } = useRazorpay();

  const orderId = searchParams.get("order_id");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const userCookie = getUserCookie();
    setUser(userCookie);

    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderRes = await getOrderById(orderId!);
      if (orderRes?.success) {
        setOrder(orderRes.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId || !order) {
      toast.error("Order information not available");
      navigate("/cart");
      return;
    }

    try {
      setRetrying(true);
      toast.info("Initiating payment...");

      // Initiate payment with Razorpay
      await initiatePayment(orderId, {
        name: user?.name || order.shipping_address?.full_name || "",
        email: user?.email || "",
        contact: order.shipping_address?.phone || user?.phone || "",
      });

      // Payment flow will redirect automatically on success/failure
    } catch (error: any) {
      console.error("Payment retry failed:", error);
      toast.error(error.message || "Failed to retry payment");
      setRetrying(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleContactSupport = () => {
    navigate("/contact");
  };

  // Common payment failure reasons and solutions
  const troubleshootingTips = [
    {
      title: "Insufficient Funds",
      description: "Ensure your account has sufficient balance to complete the transaction.",
    },
    {
      title: "Card Declined",
      description: "Contact your bank to verify if there are any restrictions on your card.",
    },
    {
      title: "Network Issues",
      description: "Check your internet connection and try again.",
    },
    {
      title: "Incorrect Details",
      description: "Verify that all payment details entered are correct.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  const subtotal = order?.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  const deliveryCharges = order?.delivery_charges || 0;
  const taxAmount = order?.tax_amount || 0;
  const giftPrice = order?.gift_price || 0;
  const discountAmount = order?.discount_amount || 0;
  const total = order?.total_amount || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 to-white">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Error Icon */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-red-600 mb-2">Payment Failed</h1>
              <p className="text-xl text-muted-foreground">
                We couldn't process your payment. Please try again.
              </p>
            </div>

            {/* Error Details Card */}
            {(orderId || errorCode || errorDescription) && (
              <Card className="mb-6 animate-slide-up">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Transaction Details</h2>

                  <div className="space-y-3">
                    {orderId && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-mono font-semibold">{orderId}</span>
                      </div>
                    )}

                    {errorCode && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Error Code</span>
                        <span className="font-mono text-sm text-red-600">{errorCode}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                        <XCircle className="h-4 w-4 mr-1" />
                        Failed
                      </span>
                    </div>
                  </div>

                  {errorDescription && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        <strong>Error:</strong> {errorDescription}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Troubleshooting Card */}
            <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Common Issues & Solutions
                </h2>

                <div className="space-y-4">
                  {troubleshootingTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What You Can Do Card */}
            <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What You Can Do</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Try a Different Payment Method</h3>
                      <p className="text-sm text-muted-foreground">
                        Use another card, UPI, or net banking to complete your purchase.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Retry Payment</h3>
                      <p className="text-sm text-muted-foreground">
                        Sometimes a simple retry can resolve temporary issues.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Contact Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team is here to help if you continue facing issues.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details Section */}
            {order && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">Order Items</h2>
                      <div className="space-y-4">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent flex-shrink-0">
                              {item.product?.image_url ? (
                                <img src={item.product.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{item.product?.name || 'Product'}</h3>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                              <p className="font-semibold mt-1">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <MapPin className="h-6 w-6 text-primary" />
                          <h2 className="text-xl font-bold">Shipping Address</h2>
                        </div>
                        <div className="bg-accent/5 p-4 rounded-lg">
                          <p className="font-semibold mb-1">{order.shipping_address.full_name}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.shipping_address.address_line1}
                            {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {order.shipping_address.phone}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gift Details */}
                  {order.gift_design_id && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Gift className="h-6 w-6 text-primary" />
                          <h2 className="text-xl font-bold">Gift Details</h2>
                        </div>
                        <div className="bg-accent/5 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Gift Wrapping</span>
                            <span className="text-primary font-semibold">₹{giftPrice}</span>
                          </div>
                          {order.gift_card_message && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-semibold mb-1">Gift Message:</p>
                              <p className="text-sm text-muted-foreground italic">"{order.gift_card_message}"</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delivery</span>
                          <span className={deliveryCharges === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                            {deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-semibold">₹{taxAmount}</span>
                        </div>
                        {giftPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gift</span>
                            <span className="font-semibold">₹{giftPrice}</span>
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <>
                            <Separator />
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Discount</span>
                              <span className="font-semibold">-₹{discountAmount}</span>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary">₹{total}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up mb-6" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg" 
                onClick={handleRetryPayment} 
                className="w-full"
                disabled={retrying || isProcessing || !orderId}
              >
                {retrying || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Retry Payment
                  </>
                )}
              </Button>

              <Button size="lg" variant="outline" onClick={handleContactSupport} className="w-full">
                <HelpCircle className="mr-2 h-5 w-5" />
                Contact Support
              </Button>

              <Button size="lg" variant="outline" onClick={handleGoHome} className="w-full">
                <Home className="mr-2 h-5 w-5" />
                Go to Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <p className="text-sm text-blue-800 text-center">
                <strong>💡 Note:</strong> Your order has been created but payment is pending. 
                You can retry payment from your orders page or contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default PaymentFailed;
