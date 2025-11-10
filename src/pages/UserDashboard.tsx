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
  Gift,
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
import { ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link as RouterLink } from "react-router-dom";
import { removeUserCookie } from "@/utils/cookie";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getAddresses as apiGetAddresses, createAddress as apiCreateAddress, setDefaultAddress as apiSetDefaultAddress, deleteAddress as apiDeleteAddress, updateAddress as apiUpdateAddress } from "@/lib/api/addresses";
import { toast } from "sonner";
import { getWishlistItems, removeFromWishlist } from "@/lib/api/wishlist";
import { useCart } from "@/contexts/CartContext";
import { getProfile } from "@/lib/api/user";
import { getOrders as apiGetOrders, cancelOrder as apiCancelOrder } from "@/lib/api/order";
import UserReviewsList from "@/components/UserReviewsList";
import { PaymentHistory } from "@/components/user/PaymentHistory";
import { OrdersPage } from "@/components/user/OrdersPage";
import { DashboardOverview } from "@/components/user/DashboardOverview";
import { TrackOrdersPage } from "@/components/user/TrackOrdersPage";
import { AddressesPage } from "@/components/user/AddressesPage";
import { ProfilePage } from "@/components/user/ProfilePage";
import { WishlistPage } from "@/components/user/WishlistPage";
import { MyReviewsPage } from "@/components/user/MyReviewsPage";
import { getUserCustomGiftRequests, type CustomGiftRequest } from "@/lib/api/gifts";

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();
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
  const { addToCart, loadingState } = useCart();
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReasonKey, setCancelReasonKey] = useState<string>("");
  const [cancelReasonText, setCancelReasonText] = useState<string>("");
  const [customGiftRequests, setCustomGiftRequests] = useState<CustomGiftRequest[]>([]);
  const [customGiftLoading, setCustomGiftLoading] = useState<boolean>(false);
  const cancelReasons = [
    { key: 'ordered_by_mistake', label: 'Ordered by mistake' },
    { key: 'found_better_price', label: 'Found a better price elsewhere' },
    { key: 'delivery_too_slow', label: 'Delivery time is too long' },
    { key: 'change_of_mind', label: 'Changed my mind' },
    { key: 'other', label: 'Other (specify)' },
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

  const filteredOrders = (orders || []).filter((order: any) => {
    const statusMatch =
      orderStatusFilter === "all" || order.status === orderStatusFilter;
    const dateMatch =
      dateFilter === "all" ||
      (dateFilter === "30days" &&
        new Date(order.created_at || order.date) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "90days" &&
        new Date(order.created_at || order.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
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
    // Initialize active tab from navigation state or persisted storage
    const initialTab = (location.state as any)?.tab || localStorage.getItem('user_dashboard_tab');
    if (initialTab && typeof initialTab === 'string') {
      setActiveSection(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Persist active tab
    try { localStorage.setItem('user_dashboard_tab', activeSection); } catch { }
  }, [activeSection]);

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

  useEffect(() => {
    (async () => {
      try {
        setProfileLoading(true);
        const res = await getProfile();
        if (res?.success) setProfile(res.data);
      } catch (e: any) {
        // non-fatal
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeSection !== 'orders') return;
    (async () => {
      try {
        setOrdersLoading(true);
        const res = await apiGetOrders();
        if (res?.success) setOrders(res.data || []);
      } catch (e: any) {
        // non-fatal
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [activeSection]);

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
    if (!reason) return toast.error('Please select or enter a reason');
    try {
      const res = await apiCancelOrder(cancelOrderId, reason);
      if (res?.success) {
        toast.success('Order cancelled');
        // refresh list
        const r2 = await apiGetOrders();
        if (r2?.success) setOrders(r2.data || []);
        setCancelDialogOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel order');
    }
  }

  async function handleRemoveWishlist(itemId: string) {
    try {
      const res = await removeFromWishlist(itemId);
      if (res?.success) {
        setWishlistItems(prev => prev.filter(i => i.id !== itemId));
        try { window.dispatchEvent(new Event('wishlist:changed')); } catch { }
        toast.success("Removed from wishlist");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to remove from wishlist");
    }
  }

  async function handleAddToCartFromWishlist(productId?: string) {
    if (!productId) return;
    await addToCart(productId, 1);
    toast.success("Added to cart");
  }

  useEffect(() => {
    if (activeSection !== 'custom-gifts') return;
    (async () => {
      try {
        setCustomGiftLoading(true);
        const res = await getUserCustomGiftRequests();
        if (res?.success) setCustomGiftRequests(res.data || []);
      } catch (e: any) {
        toast.error(e.message || "Failed to load custom gift requests");
      } finally {
        setCustomGiftLoading(false);
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
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - Admin Style */}
        <Sidebar className="border-r border-border">
          {/* Sidebar Header with Logo/Branding */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                U
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-foreground truncate">
                  {profile?.name || 'My Account'}
                </h2>
                <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
              </div>
            </div>
          </div>

          <SidebarContent>
            {/* Shopping Section */}
            <SidebarGroup>
              <SidebarGroupLabel>Shopping</SidebarGroupLabel>
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
                      onClick={() => setActiveSection("tracking")}
                      isActive={activeSection === "tracking"}
                    >
                      <Truck className="h-4 w-4" />
                      <span>Track Orders</span>
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

            {/* Account Section */}
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
                      onClick={() => setActiveSection("payments")}
                      isActive={activeSection === "payments"}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Payment History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("my-reviews")}
                      isActive={activeSection === "my-reviews"}
                    >
                      <FileText className="h-4 w-4" />
                      <span>My Reviews</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("custom-gifts")}
                      isActive={activeSection === "custom-gifts"}
                    >
                      <Gift className="h-4 w-4" />
                      <span>Custom Gift Requests</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Logout Section */}
            <SidebarGroup className="mt-auto">
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
          {/* Header - Admin Style */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="h-full px-4 flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold">My Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Welcome back, {profile?.name?.split(' ')[0] || 'User'}</p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <CreditCard className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === "overview" && (
              <DashboardOverview />
            )}

            {activeSection === "my-reviews" && (
              <MyReviewsPage />
            )}

            {activeSection === "custom-gifts" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Custom Gift Requests</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {customGiftRequests.length} request{customGiftRequests.length !== 1 ? "s" : ""} submitted
                    </p>
                  </div>
                  <Button onClick={() => navigate("/custom-gift-request")}>
                    <Gift className="mr-2 h-4 w-4" />
                    New Request
                  </Button>
                </div>

                {customGiftLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : customGiftRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No custom gift requests yet</p>
                      <Button onClick={() => navigate("/custom-gift-request")}>
                        Submit Your First Request
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {customGiftRequests.map((req) => (
                      <Card key={req.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{req.title}</h3>
                              <p className="text-sm text-muted-foreground">{req.recipient_name || "No recipient specified"}</p>
                            </div>
                            <Badge className={
                              req.status === "completed" ? "bg-green-100 text-green-800" :
                              req.status === "approved" ? "bg-blue-100 text-blue-800" :
                              req.status === "under_review" ? "bg-yellow-100 text-yellow-800" :
                              req.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {req.status.replace("_", " ").charAt(0).toUpperCase() + req.status.replace("_", " ").slice(1)}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{req.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {req.occasion && (
                              <div>
                                <p className="text-muted-foreground">Occasion</p>
                                <p className="font-medium capitalize">{req.occasion}</p>
                              </div>
                            )}
                            {(req.budget_min || req.budget_max) && (
                              <div>
                                <p className="text-muted-foreground">Budget</p>
                                <p className="font-medium">₹{req.budget_min || "0"} - ₹{req.budget_max || "∞"}</p>
                              </div>
                            )}
                            {req.estimated_price != null && (
                              <div>
                                <p className="text-muted-foreground">Est. Price</p>
                                <p className="font-medium">₹{req.estimated_price}</p>
                              </div>
                            )}
                            {req.estimated_completion_date && (
                              <div>
                                <p className="text-muted-foreground">Est. Date</p>
                                <p className="font-medium">{new Date(req.estimated_completion_date).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>

                          {req.admin_notes && (
                            <div className="mt-3 p-3 bg-accent/5 rounded text-sm">
                              <p className="font-medium mb-1">Admin Notes:</p>
                              <p className="text-muted-foreground">{req.admin_notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/custom-gift-request?id=${req.id}`)}>
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "orders" && (
              <OrdersPage />
            )}

            {activeSection === "payments" && (
              <div className="animate-fade-in">
                <PaymentHistory />
              </div>
            )}

            {activeSection === "tracking" && (
              <TrackOrdersPage />
            )}

            {activeSection === "profile" && (
              <ProfilePage />
            )}

            {activeSection === "profile-old" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Profile</h2>
                  <div className="flex items-center gap-2">
                    {profile?.isVerified ? (
                      <Badge>Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                    {profile?.role && <Badge variant="outline">{profile.role}</Badge>}
                  </div>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-semibold">{profile?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-semibold">{profile?.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-semibold">{profile?.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">User ID</p>
                          <p className="font-mono text-sm">{profile?.id || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Joined</p>
                          <p className="font-semibold">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Default Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => {
                      const da = profile?.addresses?.find((a: any) => a.is_default);
                      return da ? (
                        <div className="text-sm">
                          <p>{da.full_name}</p>
                          <p>{da.label}</p>
                          <p>{da.phone}</p>
                          <p>{da.address_line1}{da.address_line2 ? `, ${da.address_line2}` : ''}</p>
                          <p>{da.city}, {da.state} - {da.postal_code}</p>
                          <p>{da.country || 'India'}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No default address added yet</p>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "addresses" && (
              <AddressesPage />
            )}

            {activeSection === "addresses-old" && (
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
              <WishlistPage />
            )}

            {activeSection === "wishlist-old" && (
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
                                <img src={product?.images?.[0] || product?.thumbnail || '/placeholder.svg'} alt={product?.name} className="w-full h-40 object-cover rounded-md mb-3" />
                                <h3 className="font-semibold mb-1 line-clamp-2">{product?.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{product?.category}</p>
                                <p className="font-bold text-primary">₹{product?.price}</p>
                              </Link>
                              <div className="mt-3 flex gap-2">
                                <Button className="flex-1" onClick={() => handleAddToCartFromWishlist(product?.id)} disabled={loadingState?.type === 'add' && loadingState.itemId === product?.id}>
                                  Add to Cart
                                </Button>
                                <Button variant="outline" onClick={() => handleRemoveWishlist(item.id)}>
                                  Remove
                                </Button>
                              </div>
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
