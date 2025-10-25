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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { signup } from "@/lib/api/auth";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate("/user/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      console.log(formData);
      const response = await signup(formData);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to create account");
        return;
      }

      if (response.success) {
        toast.success("Account created successfully! Please check your email to verify.");
        navigate("/verify-registration", { state: { formData } });
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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Start your journey to better health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  placeholder=""
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms & Conditions
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
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
                Sign up with Google
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Sign up with Facebook
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
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

export default Signup;
