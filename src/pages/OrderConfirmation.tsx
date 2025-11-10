import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, MapPin, CreditCard, Gift, Truck, Download, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { getOrderById } from "@/lib/api/order";
import { getPaymentById } from "@/lib/api/payments";
import { toast } from "sonner";
import { getUserCookie } from "@/utils/cookie";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  console.log(orderId, paymentId);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userCookie = getUserCookie();
    setUser(userCookie);

    if (!orderId) {
      toast.error("Order ID not found");
      navigate("/");
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order details
      const orderRes = await getOrderById(orderId!);
      if (orderRes?.success) {
        setOrder(orderRes.data);
      }
      console.log(order);

      // Fetch payment details if payment ID is provided
      if (paymentId) {
        try {
          const paymentRes = await getPaymentById(paymentId);
          if (paymentRes?.success) {
            setPayment(paymentRes.data);
          }
        } catch (err) {
          console.error("Failed to fetch payment details:", err);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    toast.info("Invoice download feature coming soon!");
    // TODO: Implement invoice download
  };

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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </div>
        </main>
      </div>
    );
  }

  const subtotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  const deliveryCharges = order.delivery_charges || 0;
  const taxAmount = order.tax_amount || 0;
  const giftPrice = order.gift_price || 0;
  const discountAmount = order.discount_amount || 0;
  const total = order.total_amount || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <main className="flex-1">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-12 mb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <CheckCircle className="h-20 w-20 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Order Placed Successfully!</h1>
              <p className="text-xl mb-4">Thank you for your purchase, {user?.name || "Valued Customer"}!</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
                <p className="text-sm mb-1">Order ID</p>
                <p className="text-2xl font-mono font-bold">{order.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              <Button onClick={() => navigate("/user/dashboard")} variant="outline" size="lg">
                <Package className="mr-2 h-5 w-5" />
                View All Orders
              </Button>
              <Button onClick={downloadInvoice} variant="outline" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download Invoice
              </Button>
              <Button onClick={() => navigate("/")} size="lg">
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Order Status */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Order Status</h2>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-sm">
                        {order.payment_status === 'paid' ? 'Payment Confirmed' : order.payment_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-5 w-5 text-primary" />
                          <span className="font-semibold capitalize">{order.status || 'Processing'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.status === 'pending' && 'Your order is being prepared'}
                          {order.status === 'processing' && 'Your order is being processed'}
                          {order.status === 'shipped' && 'Your order has been shipped'}
                          {order.status === 'delivered' && 'Your order has been delivered'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Order Items</h2>
                    <div className="space-y-4">
                      {order.order_items?.map((item: any, index: number) => {
                       
                        return(

                            <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-accent flex-shrink-0">
                            {item.product?.images ? (
                                <img
                                src={item.product.images[0]}
                                alt={item.product?.name || 'Product'}
                                className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{item.product?.name || 'Product'}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Quantity: {item.quantity}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                ₹{item.price} × {item.quantity}
                              </span>
                              <span className="font-semibold">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        
                        </div>
                      )})}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-bold">Shipping Address</h2>
                    </div>
                    {order.shipping_address ? (
                      <div className="bg-accent/5 p-4 rounded-lg">
                        <p className="font-semibold mb-1">{order.shipping_address.full_name}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {order.shipping_address.address_line1}
                          {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {order.shipping_address.phone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Address information not available</p>
                    )}
                  </CardContent>
                </Card>

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

                {/* Payment Details */}
                {payment && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-bold">Payment Details</h2>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment ID</span>
                          <span className="font-mono">{payment.razorpay_payment_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Method</span>
                          <span className="capitalize">{payment.payment_method || 'Online'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="default">{payment.status}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount Paid</span>
                          <span className="font-semibold">₹{payment.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Date</span>
                          <span>{new Date(payment.created_at).toLocaleString()}</span>
                        </div>
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
                        <span className="font-semibold">₹{order.order_items?.reduce((total, item) => total + item.price * item.quantity, 0)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Charges</span>
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
                          <span className="text-muted-foreground">Gift Wrapping</span>
                          <span className="font-semibold">₹{giftPrice}</span>
                        </div>
                      )}
                      
                      {discountAmount > 0 && (
                        <>
                          <Separator />
                          <div className="flex justify-between text-sm text-green-700">
                            <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                            <span className="font-semibold">-₹{discountAmount}</span>
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span className="text-primary">₹{total}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Order confirmation sent to {user?.email || order.user?.email}</p>
                      <p>• Estimated delivery: 5-7 business days</p>
                      <p>• Track your order from your dashboard</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
