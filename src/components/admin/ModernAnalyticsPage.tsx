import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from "lucide-react";
import { getAllOrders } from "@/lib/api/order";
import { getProducts } from "@/lib/api/products";
import { getAllUsers } from "@/lib/api/user";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export function ModernAnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        getAllOrders(),
        getProducts(),
        getAllUsers(),
      ]);

      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || []);
      setProducts(
        Array.isArray(productsRes)
          ? productsRes
          : productsRes?.data || []
      );
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_amount || order.total || 0),
    0
  );
  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by month
  const revenueByMonth = orders.reduce((acc: any, order) => {
    const date = new Date(order.created_at || order.date);
    const monthYear = `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;

    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, revenue: 0, orders: 0 };
    }

    acc[monthYear].revenue += order.total_amount || order.total || 0;
    acc[monthYear].orders += 1;

    return acc;
  }, {});

  const revenueData = Object.values(revenueByMonth).slice(-6);

  // Orders by status
  const ordersByStatus = [
    {
      name: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
    },
    {
      name: "Processing",
      value: orders.filter((o) => o.status === "processing").length,
    },
    {
      name: "Shipped",
      value: orders.filter((o) => o.status === "shipped").length,
    },
    {
      name: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
    },
  ];

  // Top products by revenue
  const productRevenue = orders.reduce((acc: any, order) => {
    (order.order_items || []).forEach((item: any) => {
      const productName = item.product?.name || "Unknown";
      if (!acc[productName]) {
        acc[productName] = { name: productName, revenue: 0, quantity: 0 };
      }
      acc[productName].revenue += (item.price || 0) * (item.quantity || 0);
      acc[productName].quantity += item.quantity || 0;
    });
    return acc;
  }, {});

  const topProducts = Object.values(productRevenue)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  // Customer growth
  const customerGrowth = users.reduce((acc: any, user) => {
    const date = new Date(user.created_at);
    const monthYear = `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;

    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, customers: 0 };
    }

    acc[monthYear].customers += 1;

    return acc;
  }, {});

  const customerData = Object.values(customerGrowth).slice(-6);

  // Category distribution
  const categoryData = products.reduce((acc: any, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += 1;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-indigo-100">
              Comprehensive business insights and metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">12.5%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              ₹{totalRevenue.toLocaleString()}
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
              <div className="flex items-center gap-1 text-blue-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">8.2%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{totalOrders}</h3>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">15.3%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{totalCustomers}</h3>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-orange-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">5.7%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              ₹{Math.round(avgOrderValue)}
            </h3>
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
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
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
