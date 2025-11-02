import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, Download, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  // Optional: Add confetti animation if you install canvas-confetti package
  // npm install canvas-confetti @types/canvas-confetti

  useEffect(() => {
    // Simulate loading order details
    const timer = setTimeout(() => {
      setIsLoading(false);
      // You can fetch actual order details here if needed
      setOrderDetails({
        orderId: orderId || "N/A",
        paymentId: paymentId || "N/A",
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, paymentId]);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate("/dashboard", { state: { tab: "orders" } });
    }
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Processing your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-green-600 mb-2">Payment Successful!</h1>
              <p className="text-xl text-muted-foreground">
                Thank you for your order. Your payment has been processed successfully.
              </p>
            </div>

            {/* Order Details Card */}
            <Card className="mb-6 animate-slide-up">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Details
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-semibold">{orderDetails?.orderId}</span>
                  </div>

                  {orderDetails?.paymentId && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="font-mono text-sm">{orderDetails?.paymentId}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Paid
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>📧 Confirmation Email Sent!</strong>
                    <br />
                    We've sent an order confirmation to your email address with all the details.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What's Next Card */}
            <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What's Next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Order Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Your order is being prepared and will be dispatched soon.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Shipping Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        You'll receive tracking information via email once shipped.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Your order will be delivered to your specified address.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" onClick={handleViewOrder} className="w-full">
                <Package className="mr-2 h-5 w-5" />
                View Order Details
              </Button>

              <Button size="lg" variant="outline" onClick={handleContinueShopping} className="w-full">
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <p>
                Need help with your order?{" "}
                <a href="/contact" className="text-primary hover:underline font-semibold">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
