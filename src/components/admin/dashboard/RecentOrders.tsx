import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getRecentOrders } from "@/lib/api/dashboardStats";

export function RecentOrders() {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getRecentOrders(1);
      if (response?.success) {
        setRecentOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Loading...</p>
          </div>
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
  );
}
