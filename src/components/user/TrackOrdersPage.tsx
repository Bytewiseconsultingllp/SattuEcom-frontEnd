import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Search,
  RefreshCw,
  AlertCircle,
  Navigation,
  Phone,
  Mail,
} from "lucide-react";
import { getOrders as apiGetOrders } from "@/lib/api/order";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function TrackOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiGetOrders();
      if (response?.success) {
        setOrders(response.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getOrderProgress = (status: string) => {
    const statusLower = (status || "pending").toLowerCase();
    const steps = [
      { key: "pending", label: "Order Placed", icon: Package },
      { key: "processing", label: "Processing", icon: Clock },
      { key: "shipped", label: "Shipped", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle2 },
    ];

    const statusIndex = steps.findIndex((s) => s.key === statusLower);
    const currentIndex = statusIndex >= 0 ? statusIndex : 0;

    return { steps, currentIndex };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const statusLower = (order.status || "").toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        ["pending", "processing", "shipped"].includes(statusLower)) ||
      (statusFilter === "delivered" && statusLower === "delivered") ||
      (statusFilter === "cancelled" && statusLower === "cancelled");

    return matchesSearch && matchesStatus;
  });

  const activeOrdersCount = orders.filter((o) =>
    ["pending", "processing", "shipped"].includes((o.status || "").toLowerCase())
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Track Your Orders</h1>
            <p className="text-purple-100">
              Real-time tracking for all your shipments
            </p>
          </div>
          <Navigation className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Shipments</p>
                <p className="text-2xl font-bold text-purple-600">{activeOrdersCount}</p>
              </div>
              <Truck className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="active">Active Shipments</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders to track</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start shopping to see your orders here"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const { steps, currentIndex } = getOrderProgress(order.status);
            const statusLower = (order.status || "").toLowerCase();
            const isCancelled = statusLower === "cancelled";

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <Badge
                          variant={
                            isCancelled
                              ? "destructive"
                              : statusLower === "delivered"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.status || "Pending"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.order_items?.length || 0} items
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/order/${order.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {!isCancelled ? (
                    <>
                      {/* Progress Timeline */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between relative">
                          {/* Progress Line */}
                          <div className="absolute top-6 left-0 right-0 h-1 bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{
                                width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                              }}
                            />
                          </div>

                          {/* Steps */}
                          {steps.map((step, index) => {
                            const isCompleted = index <= currentIndex;
                            const isCurrent = index === currentIndex;
                            const StepIcon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className="flex flex-col items-center relative z-10 flex-1"
                              >
                                <div
                                  className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                                    isCompleted
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                                >
                                  <StepIcon className="h-6 w-6" />
                                </div>
                                <p
                                  className={`text-xs font-medium text-center ${
                                    isCompleted ? "text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  {step.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.tracking && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
                            <Truck className="h-4 w-4" />
                            Tracking Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-blue-600 font-medium mb-1">Courier Partner</p>
                              <p className="text-blue-900">{order.tracking.agency}</p>
                            </div>
                            <div>
                              <p className="text-blue-600 font-medium mb-1">Tracking Number</p>
                              <p className="font-mono text-blue-900">
                                {order.tracking.trackingNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-blue-600 font-medium mb-1">
                                Estimated Delivery
                              </p>
                              <p className="text-blue-900">{order.tracking.estimatedDelivery}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery Address */}
                      {order.shipping_address && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Address
                          </h4>
                          <div className="text-sm space-y-1">
                            <p className="font-medium">{order.shipping_address.full_name}</p>
                            <p className="text-muted-foreground">
                              {order.shipping_address.address_line1}
                              {order.shipping_address.address_line2 &&
                                `, ${order.shipping_address.address_line2}`}
                            </p>
                            <p className="text-muted-foreground">
                              {order.shipping_address.city}, {order.shipping_address.state} -{" "}
                              {order.shipping_address.postal_code}
                            </p>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {order.shipping_address.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-3" />
                      <h4 className="font-semibold text-red-900 mb-2">Order Cancelled</h4>
                      {order.cancellation_reason && (
                        <p className="text-sm text-red-700">
                          Reason: {order.cancellation_reason}
                        </p>
                      )}
                      {order.cancelled_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Cancelled on: {formatDate(order.cancelled_at)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
