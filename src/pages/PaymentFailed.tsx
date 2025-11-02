import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, RefreshCw, Home, HelpCircle, CreditCard } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  const handleRetryPayment = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`, { state: { retryPayment: true } });
    } else {
      navigate("/cart");
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" onClick={handleRetryPayment} className="w-full">
                <RefreshCw className="mr-2 h-5 w-5" />
                Retry Payment
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

      <Footer />
    </div>
  );
};

export default PaymentFailed;
