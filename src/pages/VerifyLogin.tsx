import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { resendOTP, verifySignIn } from "@/lib/api/auth";

const VerifyLogin = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email and password from navigation state
  const formData = location.state?.formData;

  useEffect(() => {
    if (!formData) {
      navigate("/login");
    }
  }, [formData, navigate]);

  // If no email, redirect back to login
  if (!formData) {
    return null;
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      // Combine OTP with email and password for API call
      const verificationData = {
        ...formData,
        otp, 
      };

      console.log("Login verification data:", verificationData);

      const response = await verifySignIn(verificationData);
      if (response.success) {
        toast.success("OTP verified successfully!");
        // Cookie is set inside verifySignIn
        // Redirect based on role from cookie
        try {
          const { getUserCookie } = await import('@/utils/cookie');
          const session = getUserCookie();
          const rawRole = (session?.user?.role || session?.role || session?.data?.role) as string | undefined;
          const role = rawRole ? String(rawRole).toLowerCase() : '';
          if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (role === 'user') {
            navigate('/user/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } catch {
          navigate('/', { replace: true });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }; 

   const handleResendOTP = async () => {
      try {
        const response = await resendOTP(formData.email, "login");
        if (response.success) {
          toast.success(response.message || "OTP has been resent to your email");
        } else {
          toast.error(response.message || "Failed to resend OTP");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to resend OTP");
      }
    };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="animate-fade-in">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Verify Your Email
              </CardTitle>
              <CardDescription>
                We've sent a 6-digit verification code to
                <div className="font-medium text-foreground mt-1">
                  {formData.email}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <label className="text-sm font-medium">Enter OTP</label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerify}
                  className="w-full"
                  size="lg"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    className="text-primary"
                  >
                    Resend OTP
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyLogin;
