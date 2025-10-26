import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Heart,
  MapPin,
  User,
  CreditCard,
  LogOut,
  History,
  FileText,
  Truck,
  Calendar,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { removeUserCookie } from "@/utils/cookie";
import { useNavigate, Link } from "react-router-dom";
import { getAddresses as apiGetAddresses, createAddress as apiCreateAddress, setDefaultAddress as apiSetDefaultAddress, deleteAddress as apiDeleteAddress, updateAddress as apiUpdateAddress } from "@/lib/api/addresses";
import { toast } from "sonner";
import { getWishlistItems } from "@/lib/api/wishlist";

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addrLoading, setAddrLoading] = useState<boolean>(false);
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
  });
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);

  const orders = [
    {
      id: "ORD001",
      date: "2025-01-15",
      total: 899,
      status: "delivered",
      items: 3,
      tracking: {
        agency: "Blue Dart",
        trackingNumber: "BD123456789",
        estimatedDelivery: "2025-01-18",
      },
    },
    {
      id: "ORD002",
      date: "2025-01-10",
      total: 449,
      status: "shipped",
      items: 1,
      tracking: {
        agency: "DTDC",
        trackingNumber: "DTDC987654321",
        estimatedDelivery: "2025-01-16",
      },
    },
    {
      id: "ORD003",
      date: "2025-01-05",
      total: 1299,
      status: "processing",
      items: 5,
      tracking: null,
    },
    {
      id: "ORD004",
      date: "2024-12-28",
      total: 699,
      status: "delivered",
      items: 2,
      tracking: {
        agency: "Blue Dart",
        trackingNumber: "BD555666777",
        estimatedDelivery: "2025-01-02",
      },
    },
  ];

  const payments = [
    {
      id: "PAY001",
      orderId: "ORD001",
      date: "2025-01-15",
      amount: 899,
      method: "UPI",
      status: "completed",
    },
    {
      id: "PAY002",
      orderId: "ORD002",
      date: "2025-01-10",
      amount: 449,
      method: "Card",
      status: "completed",
    },
    {
      id: "PAY003",
      orderId: "ORD003",
      date: "2025-01-05",
      amount: 1299,
      method: "COD",
      status: "pending",
    },
    {
      id: "PAY004",
      orderId: "ORD004",
      date: "2024-12-28",
      amount: 699,
      method: "UPI",
      status: "completed",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      orderStatusFilter === "all" || order.status === orderStatusFilter;
    const dateMatch =
      dateFilter === "all" ||
      (dateFilter === "30days" &&
        new Date(order.date) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "90days" &&
        new Date(order.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    return statusMatch && dateMatch;
  });

  const filteredPayments = payments.filter((payment) => {
    const dateMatch =
      dateFilter === "all" ||
      (dateFilter === "30days" &&
        new Date(payment.date) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "90days" &&
        new Date(payment.date) >
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    return dateMatch;
  });

  function handleLogout() {
    removeUserCookie();
    navigate("/login");
  }

  useEffect(() => {
    (async () => {
      try {
        setAddrLoading(true);
        const res = await apiGetAddresses();
        if (res?.success) setAddresses(res.data || []);
      } catch (e: any) {
        toast.error(e.message || "Failed to load addresses");
      } finally {
        setAddrLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeSection !== 'wishlist') return;
    (async () => {
      try {
        setWishlistLoading(true);
        const res = await getWishlistItems();
        if (res?.success) setWishlistItems(res.data || []);
      } catch (e: any) {
        toast.error(e.message || "Failed to load wishlist");
      } finally {
        setWishlistLoading(false);
      }
    })();
  }, [activeSection]);

  async function handleAddAddress() {
    const phoneOk = /^\+?\d{10,15}$/.test(newAddress.phone);
    const pinOk = /^\d{5,6}$/.test(newAddress.postal_code);
    if (!newAddress.label || !newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      toast.error("Please fill all fields");
      return;
    }
    if (!phoneOk) { toast.error("Enter a valid phone number"); return; }
    if (!pinOk) { toast.error("Enter a valid pincode"); return; }
    try {
      if (editAddressId) {
        const res = await apiUpdateAddress(editAddressId, { ...newAddress, country: 'India' });
        if (res?.success) {
          setAddresses(prev => prev.map(a => a.id === editAddressId ? res.data : a));
          setAddrDialogOpen(false);
          setEditAddressId(null);
          resetForm();
          toast.success("Address updated");
        }
      } else {
        const res = await apiCreateAddress({ ...newAddress, country: 'India' });
        if (res?.success) {
          setAddresses(prev => [res.data, ...prev]);
          resetForm();
          setAddrDialogOpen(false);
          toast.success("Address added");
        }
      }
    } catch (e: any) {
      toast.error(e.message || (editAddressId ? "Failed to update address" : "Failed to add address"));
    }
  }

  function resetForm() {
    setNewAddress({ label: "Home", full_name: "", phone: "", address_line1: "", city: "", state: "", postal_code: "", is_default: false });
  }

  function openEditAddress(address: any) {
    setEditAddressId(address.id);
    setNewAddress({
      label: address.label || "Home",
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      is_default: !!address.is_default,
    });
    setAddrDialogOpen(true);
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await apiSetDefaultAddress(id);
      if (res?.success) {
        setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
        toast.success("Default address updated");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to set default");
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      const res = await apiDeleteAddress(id);
      if (res?.success) {
        setAddresses(prev => prev.filter(a => a.id !== id));
        toast.success("Address removed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete address");
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r border-sidebar-border">
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-foreground">
              My Account
            </h2>
            <p className="text-sm text-muted-foreground">John Doe</p>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("overview")}
                      isActive={activeSection === "overview"}
                    >
                      <Package className="h-4 w-4" />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("orders")}
                      isActive={activeSection === "orders"}
                    >
                      <History className="h-4 w-4" />
                      <span>Order History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("payments")}
                      isActive={activeSection === "payments"}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Payment History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("tracking")}
                      isActive={activeSection === "tracking"}
                    >
                      <Truck className="h-4 w-4" />
                      <span>Track Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("profile")}
                      isActive={activeSection === "profile"}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("addresses")}
                      isActive={activeSection === "addresses"}
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Addresses</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("wishlist")}
                      isActive={activeSection === "wishlist"}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Wishlist</span>
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
            <h1 className="text-xl font-bold">User Dashboard</h1>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === "overview" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="hover-scale cursor-pointer transition-all">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">
                          Total Orders
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-scale cursor-pointer transition-all">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mr-4">
                        <Heart className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-sm text-muted-foreground">
                          Wishlist Items
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-scale cursor-pointer transition-all">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mr-4">
                        <MapPin className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-sm text-muted-foreground">
                          Saved Addresses
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-scale cursor-pointer transition-all">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">₹5.2K</p>
                        <p className="text-sm text-muted-foreground">
                          Total Spent
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{order.id}</h3>
                              <Badge
                                variant={
                                  order.status === "delivered"
                                    ? "default"
                                    : order.status === "shipped"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.date} • {order.items} items • ₹
                              {order.total}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setActiveSection("orders")}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "orders" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Order History</h2>
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
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <Collapsible key={order.id}>
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold">{order.id}</h3>
                                  <Badge
                                    variant={
                                      order.status === "delivered"
                                        ? "default"
                                        : order.status === "shipped"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {order.date} • {order.items} items • ₹
                                  {order.total}
                                </p>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="mt-4 space-y-2 border-t pt-4">
                              <p className="text-sm font-semibold">
                                Order Details:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Items: Sattu Powder x2, Ready to Drink x1
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Shipping Address: 123 Main St, Patna
                              </p>
                              {order.tracking && (
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-semibold mb-1">
                                    Tracking Info:
                                  </p>
                                  <p className="text-sm">
                                    Agency: {order.tracking.agency}
                                  </p>
                                  <p className="text-sm">
                                    Tracking #: {order.tracking.trackingNumber}
                                  </p>
                                  <p className="text-sm">
                                    Est. Delivery:{" "}
                                    {order.tracking.estimatedDelivery}
                                  </p>
                                </div>
                              )}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "payments" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Payment History</h2>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {filteredPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{payment.id}</h3>
                              <Badge
                                variant={
                                  payment.status === "completed"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Order: {payment.orderId} • {payment.date} •{" "}
                              {payment.method}
                            </p>
                          </div>
                          <p className="font-bold text-lg">₹{payment.amount}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "tracking" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold">Track Your Orders</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {orders
                        .filter((o) => o.tracking)
                        .map((order) => (
                          <div key={order.id} className="border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {order.id}
                                </h3>
                                <Badge
                                  variant={
                                    order.status === "delivered"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  Order Date
                                </p>
                                <p className="font-semibold">{order.date}</p>
                              </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Delivery Partner
                                  </p>
                                  <p className="font-semibold">
                                    {order.tracking?.agency}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Tracking Number
                                  </p>
                                  <p className="font-semibold font-mono">
                                    {order.tracking?.trackingNumber}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Estimated Delivery
                                  </p>
                                  <p className="font-semibold">
                                    {order.tracking?.estimatedDelivery}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "profile" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold">Personal Information</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">John Doe</h3>
                        <p className="text-muted-foreground">
                          john.doe@example.com
                        </p>
                        <p className="text-sm text-muted-foreground">
                          +91 98765 43210
                        </p>
                      </div>
                    </div>
                    <Button>Edit Profile</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "addresses" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Saved Addresses</h2>
                  <Dialog open={addrDialogOpen} onOpenChange={(o) => { setAddrDialogOpen(o); if (!o) setEditAddressId(null); }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditAddressId(null); resetForm(); }}>
                        + Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editAddressId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="label">Label</Label>
                          <Select value={newAddress.label} onValueChange={(v) => setNewAddress({ ...newAddress, label: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Work">Work</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input id="full_name" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_line1">Address</Label>
                          <Textarea id="address_line1" rows={3} value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Pincode</Label>
                          <Input id="postal_code" value={newAddress.postal_code} onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="is_default" type="checkbox" checked={newAddress.is_default} onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })} />
                          <Label htmlFor="is_default">Set as default</Label>
                        </div>
                        <Button className="w-full" onClick={handleAddAddress}>{editAddressId ? 'Update Address' : 'Save Address'}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {addrLoading ? (
                      <p className="text-sm text-muted-foreground">Loading addresses...</p>
                    ) : addresses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No addresses yet</p>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address: any) => (
                          <div key={address.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">{address.full_name}</h3>
                                {address.label && <Badge variant="outline">{address.label}</Badge>}
                                {address.is_default && <Badge>Default</Badge>}
                              </div>
                              <div className="flex gap-2">
                                {!address.is_default && (
                                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>Set Default</Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => openEditAddress(address)}>Edit</Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address.id)}>Delete</Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}
                              <br />
                              {address.city}, {address.state} - {address.postal_code}
                              <br />
                              {address.country || 'India'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "wishlist" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold">My Wishlist</h2>
                <Card>
                  <CardContent className="p-6">
                    {wishlistLoading ? (
                      <p className="text-muted-foreground text-center py-8">Loading wishlist...</p>
                    ) : wishlistItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Your wishlist is empty</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((item: any) => {
                          const product = item.product;
                          return (
                            <div key={item.id} className="border rounded-lg p-4 hover:bg-accent/5 transition">
                              <Link to={`/product/${product?.id}`} className="block">
                                <img src={product?.image_url} alt={product?.name} className="w-full h-40 object-cover rounded-md mb-3" />
                                <h3 className="font-semibold mb-1 line-clamp-2">{product?.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{product?.category}</p>
                                <p className="font-bold text-primary">₹{product?.price}</p>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;
