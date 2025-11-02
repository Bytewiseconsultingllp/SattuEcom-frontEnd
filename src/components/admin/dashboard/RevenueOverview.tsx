import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getRevenueOverview } from "@/lib/api/dashboardStats";

export function RevenueOverview() {
  const [revenueData, setRevenueData] = useState<any[]>([
    { month: "Jan", revenue: 45000, orders: 120 },
    { month: "Feb", revenue: 52000, orders: 145 },
    { month: "Mar", revenue: 48000, orders: 132 },
    { month: "Apr", revenue: 61000, orders: 168 },
    { month: "May", revenue: 55000, orders: 152 },
    { month: "Jun", revenue: 68000, orders: 189 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRevenueData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await getRevenueOverview();
      if (response?.success) {
        setRevenueData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue overview:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
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
  );
}
