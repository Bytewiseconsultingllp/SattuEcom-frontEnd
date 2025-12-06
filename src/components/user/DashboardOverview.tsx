import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  ShoppingBag,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  Star,
  ArrowRight,
  Gift,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getOrders as apiGetOrders } from "@/lib/api/order";
import { getMyPayments } from "@/lib/api/payments.production";
import { getWishlistItems } from "@/lib/api/wishlist";
import { getProfile } from "@/lib/api/user";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

export function DashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    recentOrders: [] as any[],
    recentPayments: [] as any[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, paymentsRes, wishlistRes, profileRes] = await Promise.allSettled([
        apiGetOrders(),
        getMyPayments(),
        getWishlistItems(),
        getProfile(),
      ]);

      // Process orders
      const orders = ordersRes.status === "fulfilled" && ordersRes.value?.success
        ? ordersRes.value.data
        : [];

      const activeStatuses = ["pending", "processing", "shipped"];
      const activeOrders = orders.filter((o: any) => 
        activeStatuses.includes(o.status?.toLowerCase())
      ).length;

      const completedOrders = orders.filter((o: any) => 
        o.status?.toLowerCase() === "delivered"
      ).length;

      const cancelledOrders = orders.filter((o: any) => 
        o.status?.toLowerCase() === "cancelled"
      ).length;

      const recentOrders = orders.slice(0, 5);

      // Process payments
      const payments = paymentsRes.status === "fulfilled" && paymentsRes.value?.success
        ? paymentsRes.value.data
        : [];

      const totalSpent = payments
        .filter((p: any) => p.status === "captured")
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const recentPayments = payments.slice(0, 3);

      // Process wishlist
      const wishlist = wishlistRes.status === "fulfilled" && wishlistRes.value?.success
        ? wishlistRes.value.data
        : [];

      // Process profile
      const profileData = profileRes.status === "fulfilled" && profileRes.value?.success
        ? profileRes.value.data
        : null;

      setProfile(profileData);
      setStats({
        totalOrders: orders.length,
        activeOrders,
        completedOrders,
        cancelledOrders,
        totalSpent,
        wishlistCount: wishlist.length,
        recentOrders,
        recentPayments,
      });
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
      pending: {
        label: "Order Placed",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: Package,
      },
      processing: {
        label: "Processing",
        color: "text-orange-700",
        bgColor: "bg-orange-100",
        icon: Clock,
      },
      shipped: {
        label: "Shipped",
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: Truck,
      },
      delivered: {
        label: "Delivered",
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: CheckCircle2,
      },
      cancelled: {
        label: "Cancelled",
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: Package,
      },
    };

    return configs[status?.toLowerCase()] || configs.pending;
  };

  const getLoyaltyTier = () => {
    if (stats.totalSpent >= 50000) return { name: "Platinum", color: "text-purple-600", progress: 100 };
    if (stats.totalSpent >= 25000) return { name: "Gold", color: "text-yellow-600", progress: 75 };
    if (stats.totalSpent >= 10000) return { name: "Silver", color: "text-gray-600", progress: 50 };
    return { name: "Bronze", color: "text-orange-600", progress: 25 };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const loyaltyTier = getLoyaltyTier();

  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10" />
        <CardContent className="relative pt-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome back, {profile?.name || "User"}! 👋
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Here's everything happening with your account
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Loyalty Tier</p>
                <div className="flex items-center gap-2">
                  <Award className={`h-5 w-5 ${loyaltyTier.color}`} />
                  <span className={`text-lg font-bold ${loyaltyTier.color}`}>
                    {loyaltyTier.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => navigate("/user-dashboard?section=orders")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => navigate("/user-dashboard?section=track-orders")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              {stats.activeOrders > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  {stats.activeOrders}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{stats.activeOrders}</p>
              <p className="text-sm text-muted-foreground">Active Orders</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => navigate("/user-dashboard?section=payments")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => navigate("/user-dashboard?section=wishlist")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-pink-100 group-hover:bg-pink-200 transition-colors">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-pink-600 transition-colors" />
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">{stats.wishlistCount}</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/user-dashboard?section=orders")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/products")}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <Badge className={`text-xs ${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)} • {order.order_items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile & Quick Actions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{profile?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  {profile?.isVerified ? (
                    <Badge variant="default" className="text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Unverified</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed Orders</span>
                  <span className="font-medium">{stats.completedOrders}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/user-dashboard?section=profile")}
              >
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate("/user-dashboard?section=track-orders")}
              >
                <Truck className="h-4 w-4 mr-3" />
                Track Orders
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate("/user-dashboard?section=wishlist")}
              >
                <Heart className="h-4 w-4 mr-3" />
                My Wishlist
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate("/user-dashboard?section=addresses")}
              >
                <MapPin className="h-4 w-4 mr-3" />
                Manage Addresses
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate("/user-dashboard?section=reviews")}
              >
                <Star className="h-4 w-4 mr-3" />
                My Reviews
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Loyalty Progress */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-5 w-5 ${loyaltyTier.color}`} />
                  <span className={`font-bold ${loyaltyTier.color}`}>{loyaltyTier.name} Member</span>
                </div>
                <Award className={`h-6 w-6 ${loyaltyTier.color}`} />
              </div>
              <Progress value={loyaltyTier.progress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {loyaltyTier.name === "Platinum" 
                  ? "You've reached the highest tier!" 
                  : `Spend ${formatCurrency(loyaltyTier.name === "Bronze" ? 10000 - stats.totalSpent : loyaltyTier.name === "Silver" ? 25000 - stats.totalSpent : 50000 - stats.totalSpent)} more to reach the next tier`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Payments */}
      {stats.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Payments
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/user-dashboard?section=payments")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <Badge variant="default" className="text-xs">Paid</Badge>
                  </div>
                  <p className="font-bold text-xl mb-1">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
