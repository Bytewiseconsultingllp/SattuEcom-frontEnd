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
import { resendOTP, resetPassword } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // If no email, redirect back to forgot-password
  if (!email) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const passwordResetData = {
      email,
      otp,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await resetPassword(passwordResetData);

      if (response.error) {
        toast.error(response.error.message || "Failed to reset password");
        return;
      }

      if (response.success) {
        toast.success("Password reset successfully!");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while resetting password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await resendOTP(email, "password_reset");
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
                <div className="font-medium text-foreground mt-1">{email}</div>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Enter New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={loading || otp.length !== 6}
                >
                  {loading
                    ? "Resetting your password..."
                    : "Verify & Reset Password"}
                </Button>
              </form>

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
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
