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
    totalRevenue: 245890,
    revenueChange: 12.5,
    onlineSales: 0,
    offlineSales: 0,
    expenses: 0,
    totalOrders: 1234,
    ordersChange: 8.2,
    totalCustomers: 856,
    customersChange: 15.3,
    totalProducts: 145,
    productsChange: 5.1,
  });

  const [revenueData, setRevenueData] = useState<any[]>([
    { month: "Jan", revenue: 45000, orders: 120 },
    { month: "Feb", revenue: 52000, orders: 145 },
    { month: "Mar", revenue: 48000, orders: 132 },
    { month: "Apr", revenue: 61000, orders: 168 },
    { month: "May", revenue: 55000, orders: 152 },
    { month: "Jun", revenue: 68000, orders: 189 },
  ]);

  const [categoryData, setCategoryData] = useState<any[]>([
    { name: "Sattu Powder", sales: 45000, orders: 234 },
    { name: "Sattu Drinks", sales: 38000, orders: 198 },
    { name: "Sattu Snacks", sales: 32000, orders: 167 },
    { name: "Gift Packs", sales: 28000, orders: 145 },
  ]);

  const [recentOrders, setRecentOrders] = useState<any[]>([
    {
      id: "ORD-001",
      customer: "John Doe",
      amount: 1250,
      status: "delivered",
      time: "2 hours ago",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      amount: 890,
      status: "processing",
      time: "4 hours ago",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      amount: 2100,
      status: "shipped",
      time: "6 hours ago",
    },
    {
      id: "ORD-004",
      customer: "Sarah Williams",
      amount: 750,
      status: "pending",
      time: "8 hours ago",
    },
  ]);

  const [topProducts, setTopProducts] = useState<any[]>([
    { name: "Premium Sattu Powder 1kg", sales: 234, revenue: 23400 },
    { name: "Sattu Energy Drink Mix", sales: 198, revenue: 19800 },
    { name: "Roasted Sattu Snacks", sales: 167, revenue: 16700 },
    { name: "Sattu Gift Hamper", sales: 145, revenue: 14500 },
  ]);

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

      // Process stats
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

      setStats(prev => ({
        ...prev,
        totalRevenue: calculatedRevenue || dashboardData.totalRevenue || prev.totalRevenue,
        revenueChange: dashboardData.revenueChange || prev.revenueChange,
        onlineSales: onlineSalesData || dashboardData.onlineSales || 0,
        offlineSales: offlineSalesData || dashboardData.offlineSales || 0,
        expenses: expensesData || dashboardData.expenses || 0,
        totalOrders: dashboardData.totalOrders || prev.totalOrders,
        ordersChange: dashboardData.ordersChange || prev.ordersChange,
        totalCustomers: dashboardData.totalCustomers || prev.totalCustomers,
        customersChange: dashboardData.customersChange || prev.customersChange,
        totalProducts: dashboardData.totalProducts || prev.totalProducts,
        productsChange: dashboardData.productsChange || prev.productsChange,
      }));

      // Process revenue overview
      if (revenueOverviewRes.status === "fulfilled" && revenueOverviewRes.value?.success) {
        setRevenueData(revenueOverviewRes.value.data);
      }

      // Process top categories
      if (topCategoriesRes.status === "fulfilled" && topCategoriesRes.value?.success) {
        setCategoryData(topCategoriesRes.value.data);
      }

      // Process recent orders
      if (recentOrdersRes.status === "fulfilled" && recentOrdersRes.value?.success) {
        setRecentOrders(recentOrdersRes.value.data);
      }

      // Process top products
      if (topProductsRes.status === "fulfilled" && topProductsRes.value?.success) {
        setTopProducts(topProductsRes.value.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
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
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.revenueChange}%
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
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8.2%
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
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.ordersChange}%
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
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.customersChange}%
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
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.productsChange}%
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
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12.5%
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/products">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
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
              <Link to="/admin/reports">
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
