import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAdminDashboardStats,
  getOnlineSalesTotal,
  getOfflineSalesTotal,
  getExpensesTotal,
} from "@/lib/api/dashboardStats";

export function DashboardMetrics() {
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

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [dashboardRes, onlineSalesRes, offlineSalesRes, expensesRes] =
        await Promise.allSettled([
          getAdminDashboardStats(),
          getOnlineSalesTotal(),
          getOfflineSalesTotal(),
          getExpensesTotal(),
        ]);

      const dashboardData =
        dashboardRes.status === "fulfilled" && dashboardRes.value?.success
          ? dashboardRes.value.data
          : {};

      const onlineSalesData =
        onlineSalesRes.status === "fulfilled" &&
        onlineSalesRes.value?.success
          ? onlineSalesRes.value.data?.total || 0
          : 0;

      const offlineSalesData =
        offlineSalesRes.status === "fulfilled" &&
        offlineSalesRes.value?.success
          ? offlineSalesRes.value.data?.total || 0
          : 0;

      const expensesData =
        expensesRes.status === "fulfilled" && expensesRes.value?.success
          ? expensesRes.value.data?.total || 0
          : 0;

      const calculatedRevenue = onlineSalesData + offlineSalesData;

      setStats({
        totalRevenue:
          calculatedRevenue ||
          dashboardData.totalRevenue ||
          0,
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
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    change,
    bgColor,
    iconColor,
  }: {
    icon: any;
    label: string;
    value: number | string;
    change: number;
    bgColor: string;
    iconColor: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`h-12 w-12 rounded-full ${bgColor} flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <Badge
            variant="secondary"
            className={`${bgColor} ${iconColor} hover:${bgColor}`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}%
          </Badge>
        </div>
        <h3 className="text-2xl font-bold mb-1">
          {typeof value === "number" ? `₹${value.toLocaleString()}` : value}
        </h3>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );

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
            <Button variant="secondary" size="lg" asChild>
              <Link to="/admin/dashboard?section=reports">View Reports</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={DollarSign}
          label="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={ShoppingCart}
          label="Online Sales"
          value={stats.onlineSales}
          change={stats.revenueChange}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={Package}
          label="Offline Sales"
          value={stats.offlineSales}
          change={stats.revenueChange}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <MetricCard
          icon={ArrowDownRight}
          label="Expenses"
          value={stats.expenses}
          change={-stats.revenueChange}
          bgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats.totalOrders}
          change={stats.ordersChange}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={Users}
          label="Total Customers"
          value={stats.totalCustomers}
          change={stats.customersChange}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <MetricCard
          icon={Package}
          label="Total Products"
          value={stats.totalProducts}
          change={stats.productsChange}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="Net Profit"
          value={stats.totalRevenue - stats.expenses}
          change={stats.revenueChange}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
      </div>
    </div>
  );
}
