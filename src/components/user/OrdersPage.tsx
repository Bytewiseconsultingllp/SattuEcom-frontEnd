import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  XCircle,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  Eye,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { getOrders as apiGetOrders } from "@/lib/api/order";
import { downloadInvoicePDF } from "@/lib/api/invoice";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

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

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      await downloadInvoicePDF(invoiceId, invoiceNumber);
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to download invoice");
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      label: string; 
      icon: any; 
      color: string;
      bgColor: string;
      description: string;
    }> = {
      pending: {
        label: "Order Placed",
        icon: Package,
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        description: "Your order has been received and is being prepared"
      },
      processing: {
        label: "Processing",
        icon: Clock,
        color: "text-orange-700",
        bgColor: "bg-orange-50 border-orange-200",
        description: "We're preparing your order for shipment"
      },
      shipped: {
        label: "Shipped",
        icon: Truck,
        color: "text-purple-700",
        bgColor: "bg-purple-50 border-purple-200",
        description: "Your order is on the way to you"
      },
      delivered: {
        label: "Delivered",
        icon: CheckCircle2,
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
        description: "Order has been delivered successfully"
      },
      cancelled: {
        label: "Cancelled",
        icon: XCircle,
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200",
        description: "This order was cancelled"
      },
    };

    return configs[status.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
    processing: orders.filter((o) => o.status?.toLowerCase() === "processing").length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
    cancelled: orders.filter((o) => o.status?.toLowerCase() === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-blue-100">
                Track and manage all your orders in one place
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <ShoppingBag className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Total Orders</p>
                <p className="text-3xl font-bold">{orderStats.total}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-blue-600">{orderStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-xl font-bold text-orange-600">{orderStats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shipped</p>
                <p className="text-xl font-bold text-purple-600">{orderStats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-xl font-bold text-green-600">{orderStats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cancelled</p>
                <p className="text-xl font-bold text-red-600">{orderStats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders ({orderStats.total})</SelectItem>
                <SelectItem value="pending">Pending ({orderStats.pending})</SelectItem>
                <SelectItem value="processing">Processing ({orderStats.processing})</SelectItem>
                <SelectItem value="shipped">Shipped ({orderStats.shipped})</SelectItem>
                <SelectItem value="delivered">Delivered ({orderStats.delivered})</SelectItem>
                <SelectItem value="cancelled">Cancelled ({orderStats.cancelled})</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Orders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === "all" ? "No orders yet" : `No ${statusFilter} orders`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter === "all"
                  ? "Start shopping to see your orders here"
                  : `You don't have any ${statusFilter} orders at the moment`}
              </p>
              <Button onClick={() => navigate("/products")} size="lg">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status || "pending");
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-all duration-200 border-l-4"
                style={{ borderLeftColor: statusConfig.color.replace('text-', '#') }}
              >
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className={`p-4 border-b ${statusConfig.bgColor}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white`}>
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <Badge className={`${statusConfig.color} ${statusConfig.bgColor} border`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {statusConfig.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-4 space-y-4">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Ordered On</p>
                          <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="text-sm font-medium">
                            {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Payment</p>
                          <p className="text-sm font-medium capitalize">{order.payment_method || "Online"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Images Preview */}
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="flex gap-2">
                        {order.order_items.slice(0, 5).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-16 h-16 rounded-lg overflow-hidden border"
                          >
                            <img
                              src={item.product?.images?.[0] || "/placeholder.svg"}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.order_items.length > 5 && (
                          <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center text-xs font-medium">
                            +{order.order_items.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-muted-foreground">
                        {order.shipping_address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>
                              {order.shipping_address.city}, {order.shipping_address.state}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.invoice && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order.invoice.id, order.invoice.invoice_number)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
