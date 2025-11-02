import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  LayoutDashboard,
  FileText,
  DollarSign,
  TrendingDown,
  LogOut,
} from "lucide-react";
import { products } from "@/data/products";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductDetailsModal } from "@/components/admin/ProductDetailsModal";
import { getUserCookie, removeUserCookie } from "@/utils/cookie";
import { getAllUsers as apiGetAllUsers } from "@/lib/api/user";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { getAllOrders as apiGetAllOrders, updateOrderStatus as apiUpdateOrderStatus, cancelOrder as apiCancelOrder } from "@/lib/api/order";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AdminProductsPage from "@/components/admin/AdminProductsPage";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    agency: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReasonKey, setCancelReasonKey] = useState<string>("");
  const [cancelReasonText, setCancelReasonText] = useState<string>("");
  const cancelReasons = [
    { key: 'customer_request', label: 'Customer requested cancellation' },
    { key: 'out_of_stock', label: 'Product out of stock' },
    { key: 'payment_issue', label: 'Payment/verification issue' },
    { key: 'logistics_issue', label: 'Logistics/Shipment issue' },
    { key: 'other', label: 'Other (specify)' },
  ];
  const navigate = useNavigate();

  // Persist/restore active tab
  useEffect(() => {
    const tab = localStorage.getItem('admin_dashboard_tab');
    if (tab) setActiveSection(tab);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('admin_dashboard_tab', activeSection); } catch { }
  }, [activeSection]);

  useEffect(() => {
    console.log(getUserCookie());
  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: "₹2.4L",
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      title: "Products",
      value: "156",
      change: "+3",
      icon: Package,
      color: "text-accent",
    },
    {
      title: "Customers",
      value: "892",
      change: "+15.3%",
      icon: Users,
      color: "text-primary",
    },
  ];

  useEffect(() => {
    if (activeSection !== "orders") return;
    (async () => {
      try {
        setOrdersLoading(true);
        const res = await apiGetAllOrders();
        if (res?.success) setOrders(res.data || []);
      } catch (e) {
        // non-fatal
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [activeSection]);

  // Fetch users for Customers section
  useEffect(() => {
    if (activeSection !== "customers") return;
    (async () => {
      try {
        setUsersLoading(true);
        const res = await apiGetAllUsers();
        if (res?.success) setUsers(res.data || []);
      } catch (e) {
        // non-fatal
      } finally {
        setUsersLoading(false);
      }
    })();
  }, [activeSection]);

  const customers = users;

  const salesData = [
    { month: "Jan", sales: 4000, orders: 240 },
    { month: "Feb", sales: 3000, orders: 139 },
    { month: "Mar", sales: 2000, orders: 980 },
    { month: "Apr", sales: 2780, orders: 390 },
    { month: "May", sales: 1890, orders: 480 },
    { month: "Jun", sales: 2390, orders: 380 },
  ];

  const categoryData = [
    { name: "Sattu Powder", value: 400 },
    { name: "Ready to Drink", value: 300 },
    { name: "Sattu Ladoo", value: 200 },
    { name: "Custom Sattu", value: 100 },
  ];

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--secondary))",
  ];

  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((o) => (o.status || '').toLowerCase() === orderStatusFilter.toLowerCase());

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await apiUpdateOrderStatus(orderId, newStatus as any);
      if (res?.success) {
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (newStatus === "shipped") setShowDeliveryForm(true);
        toast.success(`Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const handleDeliverySubmit = () => {
    toast.success("Delivery details saved successfully");
    setShowDeliveryForm(false);
  };

  function openCancelDialog(orderId: string) {
    setCancelOrderId(orderId);
    setCancelReasonKey('');
    setCancelReasonText('');
    setCancelDialogOpen(true);
  }

  async function handleConfirmCancel() {
    if (!cancelOrderId) return;
    const selected = cancelReasons.find(r => r.key === cancelReasonKey);
    const reason = cancelReasonKey === 'other' ? cancelReasonText.trim() : selected?.label;
    if (!reason) { toast.error('Please select or enter a reason'); return; }
    try {
      const res = await apiCancelOrder(cancelOrderId, reason);
      if (res?.success) {
        toast.success('Order cancelled');
        const r2 = await apiGetAllOrders();
        if (r2?.success) setOrders(r2.data || []);
        setCancelDialogOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel order');
    }
  }

  const customerOrders = selectedCustomer
    ? orders.filter((o) => (o.user_id || o.userId) === selectedCustomer.id)
    : [];

  function handleLogout() {
    removeUserCookie();
    navigate("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r border-sidebar-border">
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-foreground">
              Admin Panel
            </h2>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("dashboard")}
                      isActive={activeSection === "dashboard"}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("products")}
                      isActive={activeSection === "products"}
                    >
                      <Package className="h-4 w-4" />
                      <span>Products</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("orders")}
                      isActive={activeSection === "orders"}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("customers")}
                      isActive={activeSection === "customers"}
                    >
                      <Users className="h-4 w-4" />
                      <span>Customers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("analytics")}
                      isActive={activeSection === "analytics"}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === "dashboard" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <Card
                      key={index}
                      className="hover-scale cursor-pointer transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ${stat.color}`}
                          >
                            <stat.icon className="h-6 w-6" />
                          </div>
                          <Badge
                            variant="outline"
                            className="text-success border-success"
                          >
                            {stat.change}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                          {stat.value}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer} • ₹{order.total}
                            </p>
                          </div>
                          <Badge>{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "products" && (
              <AdminProductsPage />
            )}

            {activeSection === "orders" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Order Management</h2>
                  <div className="flex gap-4">
                    <Select
                      value={orderStatusFilter}
                      onValueChange={setOrderStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {ordersLoading ? (
                      <p className="text-sm text-muted-foreground">Loading orders...</p>
                    ) : filteredOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No orders found for the selected filters.</p>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className="border rounded-lg p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold">{order.id}</h3>
                                  <Badge
                                    variant={
                                      (order.status || '').toLowerCase() === "delivered"
                                        ? "default"
                                        : (order.status || '').toLowerCase() === "shipped"
                                          ? "secondary"
                                          : (order.status || '').toLowerCase() === "processing"
                                            ? "outline"
                                            : "destructive"
                                    }
                                  >
                                    {order.status || 'pending'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at || order.date).toLocaleDateString()} • {(order.order_items?.length) ?? order.items} items • ₹{order.total_amount ?? order.total}
                                </p>
                                {((order.status || '').toLowerCase() === 'cancelled') && order.cancellation_reason && (
                                  <p className="text-xs text-muted-foreground">Reason: {order.cancellation_reason}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {(['pending', 'processing', 'shipped'] as string[]).includes((order.status || '').toLowerCase()) && (
                                  <Button variant="destructive" size="sm" onClick={() => openCancelDialog(order.id)}>Cancel</Button>
                                )}
                                <Button asChild variant="outline" size="sm">
                                  <RouterLink to={`/order/${order.id}`}>Details</RouterLink>
                                </Button>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    Manage
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Order Details - {selectedOrder?.id}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Customer</Label>
                                      <p className="text-sm">
                                        {selectedOrder?.customer}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Order Items</Label>
                                      <div className="mt-2 space-y-3">
                                        {(selectedOrder?.order_items || []).map((it: any) => (
                                          <div key={it.id || it.product_id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <img src={it.product?.images?.[0] || '/placeholder.svg'} alt={it.product?.name || it.product_id} className="h-10 w-10 rounded object-cover" />
                                              <div>
                                                <p className="text-sm font-medium">{it.product?.name || it.product_id}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {it.quantity} • ₹{it.price}</p>
                                              </div>
                                            </div>
                                            <p className="text-sm font-semibold">₹{(it.price || 0) * (it.quantity || 0)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Total Amount</Label>
                                      <p className="text-sm">
                                        ₹{selectedOrder?.total_amount ?? selectedOrder?.total}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Order Status</Label>
                                      <Select
                                        value={selectedOrder?.status}
                                        onValueChange={(value) =>
                                          handleStatusChange(
                                            selectedOrder?.id,
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="processing">
                                            Processing
                                          </SelectItem>
                                          <SelectItem value="shipped">
                                            Shipped
                                          </SelectItem>
                                          <SelectItem value="delivered">
                                            Delivered
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {(selectedOrder?.status || '').toLowerCase() === 'cancelled' && (
                                      <div>
                                        <Label>Cancellation</Label>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedOrder?.cancellation_reason ? `Reason: ${selectedOrder.cancellation_reason}` : 'No reason provided'}
                                          {selectedOrder?.cancelled_at ? ` • At: ${new Date(selectedOrder.cancelled_at).toLocaleString()}` : ''}
                                        </p>
                                      </div>
                                    )}

                                    {showDeliveryForm && (
                                      <div className="space-y-4 border-t pt-4">
                                        <h3 className="font-semibold">
                                          Delivery Details
                                        </h3>
                                        <div>
                                          <Label>Delivery Agency</Label>
                                          <Input
                                            value={deliveryDetails.agency}
                                            onChange={(e) =>
                                              setDeliveryDetails({
                                                ...deliveryDetails,
                                                agency: e.target.value,
                                              })
                                            }
                                            placeholder="e.g., Blue Dart, DTDC"
                                          />
                                        </div>
                                        <div>
                                          <Label>Tracking Number</Label>
                                          <Input
                                            value={deliveryDetails.trackingNumber}
                                            onChange={(e) =>
                                              setDeliveryDetails({
                                                ...deliveryDetails,
                                                trackingNumber: e.target.value,
                                              })
                                            }
                                            placeholder="Enter tracking number"
                                          />
                                        </div>
                                        <div>
                                          <Label>Estimated Delivery</Label>
                                          <Input
                                            type="date"
                                            value={
                                              deliveryDetails.estimatedDelivery
                                            }
                                            onChange={(e) =>
                                              setDeliveryDetails({
                                                ...deliveryDetails,
                                                estimatedDelivery: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <Button onClick={handleDeliverySubmit}>
                                          Save Delivery Details
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Select a reason for cancellation:</p>
                      <div className="grid gap-2">
                        {cancelReasons.map(r => (
                          <label key={r.key} className={`border rounded p-2 cursor-pointer ${cancelReasonKey === r.key ? 'border-primary' : 'border-border'}`}>
                            <input type="radio" name="cancel_reason_admin" className="mr-2" checked={cancelReasonKey === r.key} onChange={() => setCancelReasonKey(r.key)} />
                            {r.label}
                          </label>
                        ))}
                      </div>
                      {cancelReasonKey === 'other' && (
                        <div className="space-y-1">
                          <label className="text-sm">Please specify</label>
                          <Textarea value={cancelReasonText} onChange={(e) => setCancelReasonText(e.target.value)} placeholder="Enter cancellation reason" />
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Close</Button>
                        <Button variant="destructive" onClick={handleConfirmCancel}>Confirm Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeSection === "customers" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold">Customer Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer List</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {usersLoading ? (
                          <p className="text-sm text-muted-foreground">Loading users...</p>
                        ) : users.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No users found</p>
                        ) : (
                          users.map((user: any) => (
                            <div
                              key={user.id}
                              className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${selectedCustomer?.id === user.id ? "bg-muted/50 border-primary" : ""}`}
                              onClick={() => setSelectedCustomer(user)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{user.name || user.full_name || user.username || user.email}</h3>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                  {user.role && <p className="text-xs text-muted-foreground">Role: {user.role}{user.isVerified ? " • Verified" : ""}</p>}
                                </div>
                              </div>
                              <div className="text-right">
                                {user.createdAt && (
                                  <p className="text-xs text-muted-foreground">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedCustomer && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Orders by {selectedCustomer.name || selectedCustomer.email}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {customerOrders.length > 0 ? (
                            customerOrders.map((order) => (
                              <div
                                key={order.id}
                                className="p-4 border rounded-lg"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold">{order.id}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(order.created_at || order.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge>{order.status}</Badge>
                                </div>
                                <p className="text-sm">₹{order.total_amount ?? order.total}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-center py-8">
                              No orders found
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeSection === "analytics" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold">Analytics & Reports</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales & Orders Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Product Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={100}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-success" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Avg Order Value
                              </p>
                              <p className="text-xl font-bold">₹972</p>
                            </div>
                          </div>
                          <Badge className="bg-success">+5.2%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Conversion Rate
                              </p>
                              <p className="text-xl font-bold">3.2%</p>
                            </div>
                          </div>
                          <Badge className="bg-primary">+0.8%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <TrendingDown className="h-8 w-8 text-destructive" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Return Rate
                              </p>
                              <p className="text-xl font-bold">1.8%</p>
                            </div>
                          </div>
                          <Badge variant="destructive">-0.3%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
