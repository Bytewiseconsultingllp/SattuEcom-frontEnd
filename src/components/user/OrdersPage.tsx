import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { getOrders as apiGetOrders, cancelOrder as apiCancelOrder } from "@/lib/api/order";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonKey, setCancelReasonKey] = useState("");

  const cancelReasons = [
    { key: "ordered_by_mistake", label: "Ordered by mistake" },
    { key: "found_better_price", label: "Found a better price elsewhere" },
    { key: "delivery_too_slow", label: "Delivery time is too long" },
    { key: "change_of_mind", label: "Changed my mind" },
    { key: "other", label: "Other (specify)" },
  ];

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

  const handleCancelOrder = async () => {
    if (!selectedOrderId || !cancelReasonKey) {
      toast.error("Please select a cancellation reason");
      return;
    }

    if (cancelReasonKey === "other" && !cancelReason.trim()) {
      toast.error("Please specify the cancellation reason");
      return;
    }

    try {
      const reason = cancelReasonKey === "other" ? cancelReason : cancelReasonKey;
      await apiCancelOrder(selectedOrderId, reason);
      toast.success("Order cancelled successfully");
      setCancelDialogOpen(false);
      setCancelReason("");
      setCancelReasonKey("");
      setSelectedOrderId(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const openCancelDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const getStatusConfig = (status: string | undefined) => {
    const configs: Record<string, { label: string; variant: any; icon: any; color: string }> = {
      pending: {
        label: "Pending",
        variant: "outline",
        icon: <Clock className="h-3 w-3" />,
        color: "text-yellow-600",
      },
      processing: {
        label: "Processing",
        variant: "secondary",
        icon: <Package className="h-3 w-3" />,
        color: "text-blue-600",
      },
      shipped: {
        label: "Shipped",
        variant: "default",
        icon: <Truck className="h-3 w-3" />,
        color: "text-purple-600",
      },
      delivered: {
        label: "Delivered",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3" />,
        color: "text-green-600",
      },
      cancelled: {
        label: "Cancelled",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
        color: "text-red-600",
      },
    };

    return configs[(status || 'pending').toLowerCase()] || configs.pending;
  };

  const getPaymentStatusBadge = (status: string | undefined) => {
    const configs: Record<string, { label: string; variant: any }> = {
      paid: { label: "Paid", variant: "default" },
      pending: { label: "Pending", variant: "outline" },
      failed: { label: "Failed", variant: "destructive" },
      cod: { label: "Cash on Delivery", variant: "secondary" },
    };

    const config = configs[(status || 'pending').toLowerCase()] || configs.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === "all" || (order.status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    const dateMatch =
      dateFilter === "all" ||
      (dateFilter === "30days" &&
        new Date(order.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "90days" &&
        new Date(order.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    return statusMatch && dateMatch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => (o.status || 'pending').toLowerCase() === "pending").length,
    processing: orders.filter((o) => (o.status || '').toLowerCase() === "processing").length,
    shipped: orders.filter((o) => (o.status || '').toLowerCase() === "shipped").length,
    delivered: orders.filter((o) => (o.status || '').toLowerCase() === "delivered").length,
    cancelled: orders.filter((o) => (o.status || '').toLowerCase() === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage your orders
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || dateFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't placed any orders yet"}
              </p>
              {statusFilter === "all" && dateFilter === "all" && (
                <Button asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const isExpanded = expandedOrder === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() =>
                    setExpandedOrder(isExpanded ? null : order.id)
                  }
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.order_items?.length || 0} item(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {["pending", "processing"].includes((order.status || '').toLowerCase()) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openCancelDialog(order.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/order/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {order.order_items?.slice(0, 4).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border"
                        >
                          <img
                            src={item.product?.images?.[0] || "/placeholder.svg"}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.order_items?.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-md border bg-muted flex items-center justify-center text-sm font-medium">
                          +{order.order_items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <Separator />
                    <div className="p-6 bg-muted/30 space-y-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.order_items?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 p-3 bg-background rounded-lg"
                            >
                              <img
                                src={item.product?.images?.[0] || "/placeholder.svg"}
                                alt={item.product?.name}
                                className="w-16 h-16 rounded object-cover"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium">{item.product?.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × {formatCurrency(item.price)}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      {order.shipping_address && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Address
                          </h4>
                          <div className="p-4 bg-background rounded-lg">
                            <p className="font-medium">{order.shipping_address.full_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.shipping_address.address_line1}
                              {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phone: {order.shipping_address.phone}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Order Summary
                        </h4>
                        <div className="p-4 bg-background rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(order.subtotal || order.total_amount)}</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount</span>
                              <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                          )}
                          {order.shipping_cost > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shipping</span>
                              <span>{formatCurrency(order.shipping_cost)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Info */}
                      {(order.status || '').toLowerCase() === "cancelled" && order.cancellation_reason && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            Cancellation Details
                          </h4>
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Reason:</span> {order.cancellation_reason}
                            </p>
                            {order.cancelled_at && (
                              <p className="text-sm text-red-600 mt-1">
                                Cancelled on: {formatDate(order.cancelled_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please select a reason for cancelling this order:
            </p>
            <div className="space-y-2">
              {cancelReasons.map((reason) => (
                <label
                  key={reason.key}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    cancelReasonKey === reason.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    value={reason.key}
                    checked={cancelReasonKey === reason.key}
                    onChange={(e) => setCancelReasonKey(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{reason.label}</span>
                </label>
              ))}
            </div>
            {cancelReasonKey === "other" && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Please specify the reason
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter your reason for cancellation"
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason("");
                setCancelReasonKey("");
              }}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={!cancelReasonKey || (cancelReasonKey === "other" && !cancelReason.trim())}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
