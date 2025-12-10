import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Download,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus } from "@/lib/api/order";
import { Link as RouterLink } from "react-router-dom";

export function ModernOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState({
    deliveryPartner: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(Array.isArray(response) ? response : response?.data || []);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // If status is shipped, show shipment form
      if (newStatus === "shipped") {
        setShowShipmentForm(true);
        return;
      }
      
      await updateOrderStatus(orderId, newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled');
      toast.success("Order status updated");
      setShowOrderDialog(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleShipmentSubmit = async () => {
    if (!shipmentDetails.deliveryPartner || !shipmentDetails.trackingNumber) {
      toast.error("Please fill in all shipment details");
      return;
    }

    try {
      // Update order with shipment details
      const orderId = selectedOrder._id || selectedOrder.id;
      await updateOrderStatus(orderId, "shipped", shipmentDetails);
      toast.success("Order marked as shipped");
      setShowShipmentForm(false);
      setShowOrderDialog(false);
      setShipmentDetails({ deliveryPartner: "", trackingNumber: "", estimatedDelivery: "" });
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update shipment details");
    }
  };

  const exportToExcel = () => {
    try {
      // Create CSV content with shipment details
      let csvContent = "Order ID,Date,Customer,Items,Total,Status,Delivery Partner,Tracking Number,Estimated Delivery\n";
      
      orders.forEach((order) => {
        const date = new Date(order.created_at || order.date).toLocaleDateString();
        const customer = order.customer || order.user?.email || "N/A";
        const items = order.order_items?.length || order.items || 0;
        const total = order.total_amount || order.total;
        const status = order.status || "pending";
        const deliveryPartner = order.shipment?.deliveryPartner || "";
        const trackingNumber = order.shipment?.trackingNumber || "";
        const estimatedDelivery = order.shipment?.estimatedDelivery || "";
        
        csvContent += `${order.id},${date},"${customer}",${items},${total},${status},"${deliveryPartner}","${trackingNumber}","${estimatedDelivery}"\n`;
      });

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Orders exported successfully");
    } catch (error) {
      toast.error("Failed to export orders");
    }
  };

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const matchesSearch =
          searchQuery === "" ||
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          order.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
    : [];

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
    processing: orders.filter((o) => o.status?.toLowerCase() === "processing")
      .length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered")
      .length,
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle2 className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Store Management Blue Theme */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-blue-100">Track and manage customer orders</p>
          </div>
          <Button variant="secondary" size="lg" className="gap-2" onClick={exportToExcel}>
            <Download className="h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.processing}
                </p>
              </div>
              <Package className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.shipped}
                </p>
              </div>
              <Truck className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.delivered}
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
                placeholder="Search by order ID or customer..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.created_at || order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {order.customer || order.user?.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {order.order_items?.length || order.items || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.total_amount || order.total}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`gap-1 ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <RouterLink to={`/order/${order.id}`}>
                              Details
                            </RouterLink>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog - Redesigned */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Order #{selectedOrder?.id?.slice(-8).toUpperCase()}</DialogTitle>
              <Badge className={`gap-1 ${getStatusColor(selectedOrder?.status)}`}>
                {getStatusIcon(selectedOrder?.status)}
                {selectedOrder?.status}
              </Badge>
            </div>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Customer & Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="text-sm font-medium">
                    {selectedOrder.user?.full_name || selectedOrder.customer || selectedOrder.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Order Date</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedOrder.created_at || selectedOrder.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Amount</Label>
                  <p className="text-lg font-bold text-primary">
                    ₹{(selectedOrder.total_amount || selectedOrder.total).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Order Items</Label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {(selectedOrder.order_items || []).length > 0 ? (
                    selectedOrder.order_items.map((item: any, index: number) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={item.product?.images?.[0] || "/placeholder.svg"}
                            alt={item.product?.name || "Product"}
                            className="h-16 w-16 rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.product?.name || "Unknown Product"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.product?.category && <span className="mr-2">📦 {item.product.category}</span>}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @ ₹{item.price}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No items found</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{(selectedOrder.total_amount || selectedOrder.total).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">-₹{selectedOrder.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.delivery_charges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Delivery Charges</span>
                      <span className="font-medium">₹{selectedOrder.delivery_charges.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tax</span>
                      <span className="font-medium">₹{selectedOrder.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="text-base font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{(selectedOrder.total_amount || selectedOrder.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="border-t pt-4">
                <Label className="text-lg font-semibold mb-3 block flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </Label>
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  <div className="relative max-h-[200px] overflow-y-auto pr-2">
                    {/* Vertical line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-4">
                      {selectedOrder.statusHistory.map((historyItem: any, index: number) => {
                        const statusColors: any = {
                          pending: 'bg-gray-400',
                          processing: 'bg-yellow-400',
                          shipped: 'bg-blue-400',
                          delivered: 'bg-green-400',
                          cancelled: 'bg-red-400',
                        };
                        
                        return (
                          <div key={index} className="relative flex gap-3 items-start">
                            {/* Timeline dot */}
                            <div className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-white ${statusColors[historyItem.status] || 'bg-gray-400'}`}>
                              {historyItem.status === 'delivered' && <CheckCircle2 className="h-3 w-3 text-white" />}
                              {historyItem.status === 'shipped' && <Truck className="h-3 w-3 text-white" />}
                              {historyItem.status === 'processing' && <Package className="h-3 w-3 text-white" />}
                              {historyItem.status === 'cancelled' && <XCircle className="h-3 w-3 text-white" />}
                              {historyItem.status === 'pending' && <Clock className="h-3 w-3 text-white" />}
                            </div>
                            
                            {/* Timeline content */}
                            <div className="flex-1 min-w-0 pb-4">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-medium text-sm capitalize">{historyItem.status}</h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(historyItem.changedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {historyItem.comment && (
                                <p className="text-xs text-muted-foreground mt-1">{historyItem.comment}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No status history available
                  </div>
                )}
              </div>

              {/* Shipment Details (if shipped) */}
              {selectedOrder.status === "shipped" || selectedOrder.status === "delivered" ? (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <Label className="text-lg font-semibold">Shipment Details</Label>
                  </div>
                  {selectedOrder.shipment && (selectedOrder.shipment.deliveryPartner || selectedOrder.shipment.trackingNumber) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedOrder.shipment.deliveryPartner && (
                          <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">Delivery Partner</Label>
                            <p className="text-sm font-medium">{selectedOrder.shipment.deliveryPartner}</p>
                          </div>
                        )}
                        {selectedOrder.shipment.trackingNumber && (
                          <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">Tracking Number</Label>
                            <p className="text-sm font-medium">{selectedOrder.shipment.trackingNumber}</p>
                          </div>
                        )}
                        {selectedOrder.shipment.estimatedDelivery && (
                          <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">Estimated Delivery</Label>
                            <p className="text-sm font-medium">{selectedOrder.shipment.estimatedDelivery}</p>
                          </div>
                        )}
                        {selectedOrder.shipment.shippedAt && (
                          <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">Shipped At</Label>
                            <p className="text-sm font-medium">
                              {new Date(selectedOrder.shipment.shippedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Shipment details have not been added yet. Update the order status to add tracking information.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <Label>Update Status</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) =>
                    handleStatusChange(selectedOrder._id || selectedOrder.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show all statuses if order is pending or processing */}
                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    )}
                    {/* If shipped, only allow delivered */}
                    {selectedOrder.status === 'shipped' && (
                      <>
                        <SelectItem value="shipped" disabled>Shipped (Current)</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </>
                    )}
                    {/* If delivered, show as read-only */}
                    {selectedOrder.status === 'delivered' && (
                      <SelectItem value="delivered" disabled>Delivered (Current)</SelectItem>
                    )}
                    {/* If cancelled, show as read-only */}
                    {selectedOrder.status === 'cancelled' && (
                      <SelectItem value="cancelled" disabled>Cancelled (Current)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedOrder.status === 'shipped' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Once shipped, order can only be marked as delivered
                  </p>
                )}
                {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ℹ️ Status cannot be changed for {selectedOrder.status} orders
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No order data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipment Form Dialog */}
      <Dialog open={showShipmentForm} onOpenChange={setShowShipmentForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Shipment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Delivery Partner *</Label>
              <Input
                placeholder="e.g., Blue Dart, DTDC, FedEx"
                value={shipmentDetails.deliveryPartner}
                onChange={(e) =>
                  setShipmentDetails({
                    ...shipmentDetails,
                    deliveryPartner: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Tracking Number *</Label>
              <Input
                placeholder="Enter tracking number"
                value={shipmentDetails.trackingNumber}
                onChange={(e) =>
                  setShipmentDetails({
                    ...shipmentDetails,
                    trackingNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Estimated Delivery Date</Label>
              <Input
                type="date"
                value={shipmentDetails.estimatedDelivery}
                onChange={(e) =>
                  setShipmentDetails({
                    ...shipmentDetails,
                    estimatedDelivery: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowShipmentForm(false);
                  setShipmentDetails({ deliveryPartner: "", trackingNumber: "", estimatedDelivery: "" });
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleShipmentSubmit}>
                Submit & Mark as Shipped
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
