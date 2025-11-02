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
  ChevronLeft,
  ChevronRight,
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
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // ✅ Fetch orders with pagination
  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const response = await getAllOrders(page, limit);
      setOrders(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || null);
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
      
      await updateOrderStatus(orderId, newStatus);
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
      await updateOrderStatus(selectedOrder.id, "shipped", shipmentDetails);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
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
            
            {/* ✅ Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/50">
              <div className="text-sm text-muted-foreground">
                Showing {orders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, pagination?.total || 0)} of{" "}
                {pagination?.total || 0} orders
              </div>
              
              <div className="flex items-center gap-2">
                {/* Page Size Selector */}
                <Select value={pageSize.toString()} onValueChange={(val) => {
                  setPageSize(parseInt(val));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={!pagination?.hasPrevPage || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Info */}
                <div className="px-3 py-1 text-sm font-medium">
                  Page {currentPage} of {pagination?.totalPages || 1}
                </div>
                
                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination?.hasNextPage || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="text-sm">
                    {selectedOrder.customer ||
                      selectedOrder.user?.email ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p className="text-sm">
                    {new Date(
                      selectedOrder.created_at || selectedOrder.date
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label>Order Items</Label>
                <div className="mt-2 space-y-3">
                  {(selectedOrder.order_items || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.images?.[0] || "/placeholder.svg"}
                          alt={item.product?.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="font-semibold">Total Amount</p>
                <p className="text-2xl font-bold">
                  ₹{selectedOrder.total_amount || selectedOrder.total}
                </p>
              </div>

              {/* Shipment Details (if shipped) */}
              {selectedOrder.shipment && (
                <div className="border-t pt-4">
                  <Label className="text-lg font-semibold mb-3 block">Shipment Details</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Delivery Partner</Label>
                      <p className="text-sm font-medium">{selectedOrder.shipment.deliveryPartner}</p>
                    </div>
                    <div>
                      <Label>Tracking Number</Label>
                      <p className="text-sm font-medium">{selectedOrder.shipment.trackingNumber}</p>
                    </div>
                    {selectedOrder.shipment.estimatedDelivery && (
                      <div>
                        <Label>Estimated Delivery</Label>
                        <p className="text-sm font-medium">{selectedOrder.shipment.estimatedDelivery}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label>Update Status</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) =>
                    handleStatusChange(selectedOrder.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
