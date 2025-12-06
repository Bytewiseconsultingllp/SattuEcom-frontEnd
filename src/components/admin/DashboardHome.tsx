import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
import { Link } from "react-router-dom";
import { 
  getAdminDashboardStats, 
  getOnlineSalesTotal, 
  getOfflineSalesTotal, 
  getExpensesTotal,
  getRevenueOverview,
  getTopCategories,
  getRecentOrders,
  getTopProducts
} from "@/lib/api/dashboardStats";

export function DashboardHome() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    onlineSales: 0,
    offlineSales: 0,
    expenses: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalCustomers: 0,
    customersChange: 0,
    totalProducts: 0,
    productsChange: 0,
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [
        dashboardRes, 
        onlineSalesRes, 
        offlineSalesRes, 
        expensesRes,
        revenueOverviewRes,
        topCategoriesRes,
        recentOrdersRes,
        topProductsRes
      ] = await Promise.allSettled([
        getAdminDashboardStats(),
        getOnlineSalesTotal(),
        getOfflineSalesTotal(),
        getExpensesTotal(),
        getRevenueOverview(),
        getTopCategories(),
        getRecentOrders(4),
        getTopProducts(4),
      ]);

      // Process stats - use actual data or 0
      const dashboardData = dashboardRes.status === "fulfilled" && dashboardRes.value?.success
        ? dashboardRes.value.data
        : {};

      const onlineSalesData = onlineSalesRes.status === "fulfilled" && onlineSalesRes.value?.success
        ? onlineSalesRes.value.data?.total || 0
        : 0;

      const offlineSalesData = offlineSalesRes.status === "fulfilled" && offlineSalesRes.value?.success
        ? offlineSalesRes.value.data?.total || 0
        : 0;

      const expensesData = expensesRes.status === "fulfilled" && expensesRes.value?.success
        ? expensesRes.value.data?.total || 0
        : 0;

      const calculatedRevenue = onlineSalesData + offlineSalesData;

      setStats({
        totalRevenue: calculatedRevenue || dashboardData.totalRevenue || 0,
        revenueChange: dashboardData.revenueChange ?? 0,
        onlineSales: onlineSalesData || dashboardData.onlineSales || 0,
        offlineSales: offlineSalesData || dashboardData.offlineSales || 0,
        expenses: expensesData || dashboardData.expenses || 0,
        totalOrders: dashboardData.totalOrders || 0,
        ordersChange: dashboardData.ordersChange ?? 0,
        totalCustomers: dashboardData.totalCustomers || 0,
        customersChange: dashboardData.customersChange ?? 0,
        totalProducts: dashboardData.totalProducts || 0,
        productsChange: dashboardData.productsChange ?? 0,
      });

      // Process revenue overview - use actual data or empty array
      if (revenueOverviewRes.status === "fulfilled" && revenueOverviewRes.value?.success) {
        setRevenueData(revenueOverviewRes.value.data || []);
      } else {
        setRevenueData([]);
      }

      // Process top categories - use actual data or empty array
      if (topCategoriesRes.status === "fulfilled" && topCategoriesRes.value?.success) {
        setCategoryData(topCategoriesRes.value.data || []);
      } else {
        setCategoryData([]);
      }

      // Process recent orders - use actual data or empty array
      if (recentOrdersRes.status === "fulfilled" && recentOrdersRes.value?.success) {
        setRecentOrders(recentOrdersRes.value.data || []);
      } else {
        setRecentOrders([]);
      }

      // Process top products - use actual data or empty array
      if (topProductsRes.status === "fulfilled" && topProductsRes.value?.success) {
        setTopProducts(topProductsRes.value.data || []);
      } else {
        setTopProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "shipped":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {stats.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.revenueChange)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

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
                {stats.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.revenueChange)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              ₹{stats.onlineSales.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Online Sales</p>
          </CardContent>
        </Card>

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
              ₹{stats.offlineSales.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Offline Sales</p>
          </CardContent>
        </Card>

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
              ₹{stats.expenses.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {stats.ordersChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.ordersChange)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalOrders}</h3>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 hover:bg-purple-100"
              >
                {stats.customersChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.customersChange)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalCustomers}</h3>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 hover:bg-orange-100"
              >
                {stats.productsChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.productsChange)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalProducts}</h3>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
              >
                {stats.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stats.revenueChange)}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              ₹{(stats.totalRevenue - stats.expenses).toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Net Profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading revenue data...</p>
              </div>
            ) : revenueData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No revenue data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading category data...</p>
              </div>
            ) : categoryData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/dashboard?section=orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No recent orders found.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.amount}</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/dashboard?section=products">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No top products available.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to="/admin/products">
                <Package className="h-6 w-6" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to="/admin/orders">
                <ShoppingCart className="h-6 w-6" />
                <span>View Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to="/admin/customers">
                <Users className="h-6 w-6" />
                <span>Manage Customers</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to="/admin/dashboard?section=reports">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
