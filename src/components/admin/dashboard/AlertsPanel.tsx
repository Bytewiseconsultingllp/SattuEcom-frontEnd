import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Package, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllOrders } from "@/lib/api/order";

export function AlertsPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      const data = Array.isArray(response) ? response : response?.data || [];
      setOrders(data);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const pendingCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "pending"
  ).length;

  const processingCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "processing"
  ).length;

  const cancelledCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "cancelled"
  ).length;

  const delayedCount = orders.filter((o) => {
    const status = (o.status || "").toLowerCase();
    if (status === "delivered" || status === "cancelled") return false;
    const created = new Date(o.created_at || o.date);
    if (Number.isNaN(created.getTime())) return false;
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 3;
  }).length;

  const alerts: {
    key: string;
    label: string;
    description: string;
    count: number;
    icon: JSX.Element;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
  }[] = [];

  if (pendingCount > 0) {
    alerts.push({
      key: "pending",
      label: "Pending orders",
      description: "Orders waiting to be processed",
      count: pendingCount,
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      badgeVariant: "secondary",
    });
  }

  if (processingCount > 0) {
    alerts.push({
      key: "processing",
      label: "Processing orders",
      description: "Orders currently being prepared",
      count: processingCount,
      icon: <Package className="h-4 w-4 text-purple-600" />,
      badgeVariant: "secondary",
    });
  }

  if (delayedCount > 0) {
    alerts.push({
      key: "delayed",
      label: "Potentially delayed orders",
      description: "Orders older than 3 days not yet delivered or cancelled",
      count: delayedCount,
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
      badgeVariant: "destructive",
    });
  }

  if (cancelledCount > 0) {
    alerts.push({
      key: "cancelled",
      label: "Cancelled orders",
      description: "Orders that were cancelled",
      count: cancelledCount,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      badgeVariant: "outline",
    });
  }

  const hasAlerts = alerts.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alerts & Warnings</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/dashboard?section=orders">View Orders</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Checking for alerts...</p>
        ) : !hasAlerts ? (
          <p className="text-muted-foreground">
            No critical order alerts. You're all caught up.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.key}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/40"
              >
                <div className="flex items-start gap-3">
                  {alert.icon}
                  <div>
                    <p className="font-semibold text-sm">{alert.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <Badge variant={alert.badgeVariant}>
                  {alert.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
