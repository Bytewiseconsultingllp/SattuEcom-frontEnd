import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupabaseSetupBanner } from "@/components/SupabaseSetupBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { signIn } from "@/lib/api/auth";
import { setUserCookie, getUserCookie } from "@/utils/cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // useEffect(() => {
  //   // Redirect if already logged in
  //   if (getUserCookie) {
  //     // Check if admin (you can add admin role check here)
  //     navigate("/user/dashboard");
  //   }
  // }, [getUserCookie, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        email: email,
        password: password
      }
      const response = await signIn(formData);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to login");
        return;
      }

      if (response?.success) {
        toast.success("Logged in successfully!");
        
        // Check if admin email (simple check - you can enhance this)
        if (email === "agarwalasish567@gmail.com") {
          setUserCookie(response);
          navigate("/admin/dashboard");
        } else {
          navigate("/verify-login", { state: { formData } }); 
        } 
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* <SupabaseSetupBanner /> */}
          <Card className="animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" size="lg">
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Continue with Facebook
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
