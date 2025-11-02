import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  Heart,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  Star,
  ArrowRight,
  Gift,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getOrders as apiGetOrders } from "@/lib/api/order";
import { getMyPayments } from "@/lib/api/payments.production";
import { getWishlistItems } from "@/lib/api/wishlist";
import { getProfile } from "@/lib/api/user";
import { getAdminDashboardStats, getOnlineSalesTotal, getOfflineSalesTotal, getExpensesTotal } from "@/lib/api/dashboardStats";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    recentOrders: [] as any[],
    recentPayments: [] as any[],
    onlineSales: 0,
    offlineSales: 0,
    expenses: 0,
    totalRevenue: 0,
    revenueChange: 0,
  });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [ordersRes, paymentsRes, wishlistRes, profileRes, dashboardStatsRes, onlineSalesRes, offlineSalesRes, expensesRes] = await Promise.allSettled([
        apiGetOrders(),
        getMyPayments({ page: 1, limit: 5 }),
        getWishlistItems(),
        getProfile(),
        getAdminDashboardStats(),
        getOnlineSalesTotal(),
        getOfflineSalesTotal(),
        getExpensesTotal(),
      ]);

      // Process orders
      const orders = ordersRes.status === "fulfilled" && ordersRes.value?.success 
        ? ordersRes.value.data 
        : [];
      
      const activeOrders = orders.filter((o: any) => 
        ["pending", "processing", "shipped"].includes((o.status || "").toLowerCase())
      );
      
      const completedOrders = orders.filter((o: any) => 
        (o.status || "").toLowerCase() === "delivered"
      );

      // Process payments
      const payments = paymentsRes.status === "fulfilled" && paymentsRes.value?.data 
        ? paymentsRes.value.data 
        : [];
      
      const totalSpent = payments
        .filter((p: any) => p.status === "captured")
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      // Process wishlist
      const wishlist = wishlistRes.status === "fulfilled" ? wishlistRes.value : [];

      // Process profile
      const userProfile = profileRes.status === "fulfilled" ? profileRes.value : null;

      // Process dashboard stats
      const dashboardStats = dashboardStatsRes.status === "fulfilled" && dashboardStatsRes.value?.success
        ? dashboardStatsRes.value.data
        : { onlineSales: 0, offlineSales: 0, expenses: 0, totalRevenue: 0, revenueChange: 0 };

      // Process sales and expenses
      const onlineSalesData = onlineSalesRes.status === "fulfilled" && onlineSalesRes.value?.success
        ? onlineSalesRes.value.data?.total || 0
        : 0;

      const offlineSalesData = offlineSalesRes.status === "fulfilled" && offlineSalesRes.value?.success
        ? offlineSalesRes.value.data?.total || 0
        : 0;

      const expensesData = expensesRes.status === "fulfilled" && expensesRes.value?.success
        ? expensesRes.value.data?.total || 0
        : 0;

      // Calculate total revenue: Online Sales + Offline Sales - Expenses
      const calculatedRevenue = onlineSalesData + offlineSalesData - expensesData;

      setStats({
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        totalSpent,
        wishlistCount: wishlist.length,
        recentOrders: orders.slice(0, 3),
        recentPayments: payments.slice(0, 3),
        onlineSales: onlineSalesData || dashboardStats.onlineSales,
        offlineSales: offlineSalesData || dashboardStats.offlineSales,
        expenses: expensesData || dashboardStats.expenses,
        totalRevenue: calculatedRevenue || dashboardStats.totalRevenue,
        revenueChange: dashboardStats.revenueChange || 12.5,
      });

      setProfile(userProfile);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; icon: any }> = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
      processing: { variant: "secondary", icon: <Package className="h-3 w-3" /> },
      shipped: { variant: "default", icon: <Truck className="h-3 w-3" /> },
      delivered: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
    };

    const config = configs[(status || "pending").toLowerCase()] || configs.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {status || "Pending"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section - Admin Dashboard Style */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name || "User"}! 👋</h1>
            <p className="text-blue-100">
              Here's what's happening with your store today
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="secondary" size="lg">
              View Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Revenue Stats Cards - Admin Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100"
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.revenueChange}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        {/* Online Sales */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-100"
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8.2%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {formatCurrency(stats.onlineSales)}
            </h3>
            <p className="text-sm text-muted-foreground">Online Sales</p>
          </CardContent>
        </Card>

        {/* Offline Sales */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 hover:bg-purple-100"
              >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                5.1%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {formatCurrency(stats.offlineSales)}
            </h3>
            <p className="text-sm text-muted-foreground">Offline Sales</p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 hover:bg-red-100"
              >
                <ArrowDownRight className="h-3 w-3 mr-1" />
                3.2%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {formatCurrency(stats.expenses)}
            </h3>
            <p className="text-sm text-muted-foreground">Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalOrders}</h3>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <Link to="/dashboard?section=orders">
              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              {stats.activeOrders > 0 && (
                <Badge variant="secondary">{stats.activeOrders} Active</Badge>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.activeOrders}</h3>
            <p className="text-sm text-muted-foreground">Active Orders</p>
            <Link to="/dashboard?section=orders">
              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                Track orders <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.completedOrders}</h3>
            <p className="text-sm text-muted-foreground">Completed Orders</p>
            <Link to="/dashboard?section=orders">
              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                View history <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{formatCurrency(stats.totalSpent)}</h3>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <Link to="/dashboard?section=payments">
              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                View payments <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
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
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <Link to="/dashboard?section=orders">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)} • {order.order_items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                      <Link to={`/order/${order.id}`}>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard?section=orders">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  My Orders
                </Button>
              </Link>
              <Link to="/dashboard?section=wishlist">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist ({stats.wishlistCount})
                </Button>
              </Link>
              <Link to="/dashboard?section=addresses">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Addresses
                </Button>
              </Link>
              <Link to="/dashboard?section=payments">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment History
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">
                  {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {profile?.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {profile?.isVerified ? (
                  <Badge variant="default" className="text-xs">Verified</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Unverified</Badge>
                )}
              </div>
              <Link to="/dashboard?section=profile">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Profile
                </Button>
              </Link>
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
              <Link to="/dashboard?section=payments">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {payment.razorpay_payment_id?.slice(0, 20) || payment.id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <Badge variant="default" className="text-xs">
                      {payment.status === "captured" ? "Paid" : payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
