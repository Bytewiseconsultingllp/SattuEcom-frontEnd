import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  ChevronLeft,
  ChevronRight,
  Star,
  EyeOff,
  MessageSquare,
  Tag,
  Percent,
  Gift,
  Grid3x3,
  Image as ImageIcon,
  FileBarChart,
  Receipt,
  ShoppingBag,
  Share2,
  Building2,
  Mail,
} from "lucide-react";
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
import AdminReviewsPage from "@/components/admin/AdminReviewsPage";
import AdminCouponsPage from "@/components/admin/AdminCouponsPage";
import AdminGiftDesignPage from "@/components/admin/AdminGiftDesignPage";
import AdminCustomGiftRequestsPage from "@/components/admin/AdminCustomGiftRequestsPage";
import { AdminInvoicesPage } from "@/components/admin/AdminInvoicesPage";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { ProductCataloguePage } from "@/components/admin/ProductCataloguePage";
import { BannersManagementPage } from "@/components/admin/BannersManagementPage";
import { ReportsPage } from "@/components/admin/ReportsPage";
import { ExpenseManagementPage } from "@/components/admin/ExpenseManagementPage";
import { OfflineSalesPage } from "@/components/admin/OfflineSalesPage";
import { SocialMediaPage } from "@/components/admin/SocialMediaPage";
import { CompanySettingsPage } from "@/components/admin/CompanySettingsPage";
import { ContactManagementPage } from "@/components/admin/ContactManagementPage";
import { DashboardHome } from "@/components/admin/DashboardHome-Refactored";
import { ModernAdminSidebar } from "@/components/admin/ModernAdminSidebar";
import { ModernAdminHeader } from "@/components/admin/ModernAdminHeader";
import { ModernProductsPage } from "@/components/admin/ModernProductsPage";
import { ModernOrdersPage } from "@/components/admin/ModernOrdersPage";
import { ModernCustomersPage } from "@/components/admin/ModernCustomersPage";
import { ModernAnalyticsPage } from "@/components/admin/ModernAnalyticsPage";

interface AdminDashboardProps {
  forceSection?: string;
}

const AdminDashboard = ({ forceSection }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState(forceSection || "dashboard");
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
  
  // Customer filters and pagination
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerRoleFilter, setCustomerRoleFilter] = useState("all");
  const [customerPage, setCustomerPage] = useState(1);
  const [customersPerPage, setCustomersPerPage] = useState(10);
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
    if (forceSection) {
      setActiveSection(forceSection);
      return;
    }
    const tab = localStorage.getItem('admin_dashboard_tab');
    if (tab) setActiveSection(tab);
  }, [forceSection]);
  useEffect(() => {
    if (forceSection) return;
    try { localStorage.setItem('admin_dashboard_tab', activeSection); } catch { }
  }, [activeSection, forceSection]);

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
        {/* Modern Sidebar with Categories */}
        <ModernAdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <div className="flex-1 flex flex-col">
          {/* Modern Header with Logo & User Info */}
          <ModernAdminHeader />

          <main className="flex-1 overflow-auto p-6">
            {/* Modern Dashboard Home */}
            {activeSection === "dashboard" && <DashboardHome />}

            {/* Modern Products Page */}
            {activeSection === "products" && <ModernProductsPage />}

            {/* Modern Orders Page */}
            {activeSection === "orders" && <ModernOrdersPage />}

            {/* Old Orders Section - Removed, using ModernOrdersPage now */}
            {activeSection === "orders-old" && (
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
                  <CardContent className="p-0">
                    {ordersLoading ? (
                      <p className="text-sm text-muted-foreground p-6">Loading orders...</p>
                    ) : filteredOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-6">No orders found for the selected filters.</p>
                    ) : (
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
                                <TableCell>{new Date(order.created_at || order.date).toLocaleDateString()}</TableCell>
                                <TableCell>{order.customer || order.user?.email || 'N/A'}</TableCell>
                                <TableCell>{(order.order_items?.length) ?? order.items}</TableCell>
                                <TableCell>₹{order.total_amount ?? order.total}</TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {(['pending', 'processing', 'shipped'] as string[]).includes((order.status || '').toLowerCase()) && (
                                      <Button variant="destructive" size="sm" onClick={() => openCancelDialog(order.id)}>
                                        Cancel
                                      </Button>
                                    )}
                                    <Button asChild variant="outline" size="sm">
                                      <RouterLink to={`/order/${order.id}`}>Details</RouterLink>
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setSelectedOrder(order)}
                                        >
                                          Manage
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Order Details - {order.id}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label>Customer</Label>
                                            <p className="text-sm">
                                              {order.customer || order.user?.email || 'N/A'}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>Order Items</Label>
                                            <div className="mt-2 space-y-3">
                                              {(order.order_items || []).map((it: any) => (
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
                                              ₹{order.total_amount ?? order.total}
                                            </p>
                                          </div>
                                          {(order.gift_design_id || order.gift_price || order.gift_card_message) && (
                                            <div className="space-y-1">
                                              <Label>Gift Details</Label>
                                              <div className="text-sm text-muted-foreground">
                                                {order.gift_wrapping_type && (
                                                  <p>Type: <span className="capitalize">{String(order.gift_wrapping_type).replace('_',' ')}</span></p>
                                                )}
                                                {order.gift_design_id && (
                                                  <p>Design ID: <span className="font-mono">{order.gift_design_id}</span></p>
                                                )}
                                                {order.gift_price != null && (
                                                  <p>Gift Price: ₹{order.gift_price}</p>
                                                )}
                                                {order.gift_card_message && (
                                                  <p>Card Message: <span className="italic">"{order.gift_card_message}"</span></p>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          <div>
                                            <Label>Order Status</Label>
                                            <Select
                                              value={order.status}
                                              onValueChange={(value) =>
                                                handleStatusChange(
                                                  order.id,
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

                                          {(order.status || '').toLowerCase() === 'cancelled' && (
                                            <div>
                                              <Label>Cancellation</Label>
                                              <p className="text-sm text-muted-foreground">
                                                {order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : 'No reason provided'}
                                                {order.cancelled_at ? ` • At: ${new Date(order.cancelled_at).toLocaleString()}` : ''}
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
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
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

            {/* Modern Customers Page */}
            {activeSection === "customers" && <ModernCustomersPage />}

            {/* Gift Management */}
            {activeSection === "gift-designs" && <AdminGiftDesignPage />}
            {activeSection === "custom-gifts" && <AdminCustomGiftRequestsPage />}

            {/* Old Customers Section - Removed, using ModernCustomersPage now */}
            {activeSection === "customers-old" && (() => {
              // Filter customers
              const filteredCustomers = users.filter((user: any) => {
                const matchesSearch = (user.name || user.full_name || user.email || '').toLowerCase().includes(customerSearch.toLowerCase());
                const matchesRole = customerRoleFilter === "all" || user.role === customerRoleFilter;
                return matchesSearch && matchesRole;
              });

              // Paginate
              const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage);
              const startIdx = (customerPage - 1) * customersPerPage;
              const paginatedCustomers = filteredCustomers.slice(startIdx, startIdx + customersPerPage);

              return (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Customer Management</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search customers by name or email..."
                              value={customerSearch}
                              onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setCustomerPage(1);
                              }}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Select value={customerRoleFilter} onValueChange={(val) => {
                          setCustomerRoleFilter(val);
                          setCustomerPage(1);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer List</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {usersLoading ? (
                            <p className="text-sm text-muted-foreground">Loading users...</p>
                          ) : paginatedCustomers.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                              {users.length === 0 ? "No users found" : "No customers match your filters"}
                            </p>
                          ) : (
                            paginatedCustomers.map((user: any) => (
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

                        {/* Pagination */}
                        {totalCustomerPages > 1 && (
                          <div className="flex items-center justify-between mt-6 pt-6 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Showing {startIdx + 1}-{Math.min(startIdx + customersPerPage, filteredCustomers.length)} of {filteredCustomers.length}
                              </span>
                              <Select
                                value={customersPerPage.toString()}
                                onValueChange={(value) => {
                                  setCustomersPerPage(Number(value));
                                  setCustomerPage(1);
                                }}
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5 / page</SelectItem>
                                  <SelectItem value="10">10 / page</SelectItem>
                                  <SelectItem value="20">20 / page</SelectItem>
                                  <SelectItem value="50">50 / page</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCustomerPage(customerPage - 1)}
                                disabled={customerPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              
                              <div className="flex items-center gap-1">
                                {Array.from({ length: totalCustomerPages }, (_, i) => i + 1)
                                  .filter(page => {
                                    return page === 1 || 
                                           page === totalCustomerPages || 
                                           (page >= customerPage - 1 && page <= customerPage + 1);
                                  })
                                  .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                      {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="px-2 text-muted-foreground">...</span>
                                      )}
                                      <Button
                                        variant={customerPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCustomerPage(page)}
                                        className="w-10"
                                      >
                                        {page}
                                      </Button>
                                    </div>
                                  ))}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCustomerPage(customerPage + 1)}
                                disabled={customerPage === totalCustomerPages}
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedCustomer && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Customer Info */}
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Name</Label>
                              <p className="font-medium">{selectedCustomer.name || selectedCustomer.full_name || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Email</Label>
                              <p className="font-medium">{selectedCustomer.email}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Role</Label>
                              <p className="font-medium">{selectedCustomer.role || 'customer'}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Joined</Label>
                              <p className="font-medium">
                                {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Status</Label>
                              <Badge variant={selectedCustomer.isVerified ? "default" : "secondary"}>
                                {selectedCustomer.isVerified ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4">Order History</h3>
                            <div className="space-y-3">
                              {customerOrders.length > 0 ? (
                                customerOrders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-semibold text-sm">{order.id}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(order.created_at || order.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Badge variant={
                                        (order.status || '').toLowerCase() === "delivered" ? "default" :
                                        (order.status || '').toLowerCase() === "shipped" ? "secondary" :
                                        (order.status || '').toLowerCase() === "processing" ? "outline" : "destructive"
                                      }>
                                        {order.status}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <p className="text-sm font-medium">₹{order.total_amount ?? order.total}</p>
                                      <Button asChild variant="ghost" size="sm">
                                        <RouterLink to={`/order/${order.id}`}>View</RouterLink>
                                      </Button>
                                    </div>
                                    {order.order_items && order.order_items.length > 0 && (
                                      <div className="mt-2 pt-2 border-t">
                                        <p className="text-xs text-muted-foreground mb-2">Items:</p>
                                        <div className="space-y-1">
                                          {order.order_items.slice(0, 3).map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-2">
                                              <img 
                                                src={item.product?.images?.[0] || '/placeholder.svg'} 
                                                alt={item.product?.name} 
                                                className="w-8 h-8 rounded object-cover"
                                              />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs truncate">{item.product?.name || 'Product'}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                              </div>
                                            </div>
                                          ))}
                                          {order.order_items.length > 3 && (
                                            <p className="text-xs text-muted-foreground">+{order.order_items.length - 3} more</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted-foreground text-center py-4 text-sm">
                                  No orders found
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeSection === "reviews" && (
              <AdminReviewsPage />
            )}

            {activeSection === "coupons" && (
              <AdminCouponsPage />
            )}

            {activeSection === "payments" && (
              <div className="animate-fade-in">
                <PaymentManagement />
              </div>
            )}

            {activeSection === "invoices" && (
              <AdminInvoicesPage />
            )}

            {/* Modern Analytics Page */}
            {activeSection === "analytics" && <ModernAnalyticsPage />}

            {activeSection === "catalogue" && (
              <ProductCataloguePage />
            )}

            {activeSection === "banners" && (
              <BannersManagementPage />
            )}

            {activeSection === "reports" && (
              <ReportsPage />
            )}

            {activeSection === "expenses" && (
              <ExpenseManagementPage />
            )}

            {activeSection === "offline-sales" && (
              <OfflineSalesPage />
            )}

            {activeSection === "social-media" && (
              <SocialMediaPage />
            )}

            {activeSection === "settings" && (
              <CompanySettingsPage />
            )}

            {activeSection === "contact" && (
              <ContactManagementPage />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
