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
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { forgotPassword, resendOTP } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleVerify() {
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.success) {
        toast.success("Please check your email for the OTP");
        navigate("/reset-password", { state: { email } });
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="animate-fade-in">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Forgot Your Password?
              </CardTitle>
              <CardDescription>
                No Issues, We will help you out
                <div className="font-medium text-foreground mt-1"></div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <label htmlFor="email" className="text-sm font-medium">
                    Enter your E-mail
                  </label>
                  <Input
                    type="text"
                    id="email"
                    placeholder="••••••••@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button onClick={handleVerify} className="w-full" size="lg">
                  {loading ? "Verifying..." : "Verify & Send OTP"}
                </Button>

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

export default ForgotPassword;
