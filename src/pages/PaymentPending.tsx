import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, RefreshCw, Package, Home, AlertCircle } from "lucide-react";

const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [timeElapsed, setTimeElapsed] = useState(0);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCheckStatus = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate("/dashboard", { state: { tab: "orders" } });
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Pending Icon */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mb-6">
                <Clock className="h-16 w-16 text-yellow-600 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold text-yellow-600 mb-2">Payment Pending</h1>
              <p className="text-xl text-muted-foreground">
                Your payment is being processed. This may take a few moments.
              </p>
            </div>

            {/* Status Card */}
            <Card className="mb-6 animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Transaction Status</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(timeElapsed)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {orderId && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono font-semibold">{orderId}</span>
                    </div>
                  )}

                  {paymentId && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="font-mono text-sm">{paymentId}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                      <Clock className="h-4 w-4 mr-1 animate-pulse" />
                      Processing
                    </span>
                  </div>
                </div>

                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Your payment is being verified. This usually takes 2-5 minutes. 
                    Please do not refresh or close this page.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Processing Steps */}
            <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What's Happening?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Payment Initiated</h3>
                      <p className="text-sm text-muted-foreground">
                        Your payment request has been sent to the payment gateway.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-600 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Verification in Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        We're verifying your payment with your bank or payment provider.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-muted-foreground">Order Confirmation</h3>
                      <p className="text-sm text-muted-foreground">
                        Once verified, you'll receive a confirmation email.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What to Do Card */}
            <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What Should You Do?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1 text-blue-900">Wait for Confirmation</h3>
                      <p className="text-sm text-blue-800">
                        Most payments are confirmed within 2-5 minutes. You'll receive an email once processed.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1 text-amber-900">Don't Retry Payment</h3>
                      <p className="text-sm text-amber-800">
                        Please wait for the current transaction to complete before attempting another payment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Package className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1 text-green-900">Check Order Status</h3>
                      <p className="text-sm text-green-800">
                        You can check your order status anytime from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" onClick={handleCheckStatus} className="w-full">
                <RefreshCw className="mr-2 h-5 w-5" />
                Check Order Status
              </Button>

              <Button size="lg" variant="outline" onClick={handleGoHome} className="w-full">
                <Home className="mr-2 h-5 w-5" />
                Go to Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <p className="text-sm text-muted-foreground mb-2">
                Payment taking too long?
              </p>
              <p className="text-sm">
                <a href="/contact" className="text-primary hover:underline font-semibold">
                  Contact Support
                </a>
                {" "}or check your{" "}
                <button
                  onClick={handleCheckStatus}
                  className="text-primary hover:underline font-semibold"
                >
                  order status
                </button>
              </p>
            </div>

            {/* Auto-refresh Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <p className="text-xs text-muted-foreground">
                💡 This page will automatically update once your payment is confirmed.
                <br />
                You can safely close this page and check your email for updates.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPending;
