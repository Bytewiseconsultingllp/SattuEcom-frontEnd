import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, ShoppingCart, Users, TrendingUp, 
  Plus, Edit, Trash2, Eye, Search, Filter,
  LayoutDashboard, FileText, DollarSign, TrendingDown
} from "lucide-react";
import { products } from "@/data/products";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    agency: "",
    trackingNumber: "",
    estimatedDelivery: ""
  });

  const stats = [
    { title: "Total Revenue", value: "₹2.4L", change: "+12.5%", icon: TrendingUp, color: "text-success" },
    { title: "Total Orders", value: "1,234", change: "+8.2%", icon: ShoppingCart, color: "text-primary" },
    { title: "Products", value: "156", change: "+3", icon: Package, color: "text-accent" },
    { title: "Customers", value: "892", change: "+15.3%", icon: Users, color: "text-primary" },
  ];

  const orders = [
    { id: "ORD001", customer: "John Doe", customerId: 1, total: 899, status: "delivered", date: "2025-01-15", items: [{ name: "Sattu Powder", qty: 2 }] },
    { id: "ORD002", customer: "Jane Smith", customerId: 2, total: 449, status: "shipped", date: "2025-01-14", items: [{ name: "Ready to Drink", qty: 1 }] },
    { id: "ORD003", customer: "Bob Johnson", customerId: 3, total: 1299, status: "processing", date: "2025-01-13", items: [{ name: "Sattu Ladoo", qty: 3 }] },
    { id: "ORD004", customer: "Alice Brown", customerId: 1, total: 699, status: "pending", date: "2025-01-12", items: [{ name: "Custom Sattu", qty: 1 }] },
  ];

  const customers = [
    { id: 1, name: "John Doe", email: "john@example.com", orders: 12, spent: 5200 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 8, spent: 3400 },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", orders: 15, spent: 7800 },
  ];

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

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--secondary))'];

  const filteredOrders = orderStatusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === orderStatusFilter);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === "shipped") {
      setShowDeliveryForm(true);
    }
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const handleDeliverySubmit = () => {
    toast.success("Delivery details saved successfully");
    setShowDeliveryForm(false);
  };

  const customerOrders = selectedCustomer 
    ? orders.filter(o => o.customerId === selectedCustomer.id)
    : [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r border-sidebar-border">
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
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
                    <Card key={index} className="hover-scale cursor-pointer transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="text-success border-success">
                            {stat.change}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
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
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer} • ₹{order.total}</p>
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
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Product Management</h2>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all">
                          <div className="flex items-center gap-4 flex-1">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.name}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline">{product.category}</Badge>
                                <span className="text-sm font-bold text-primary">₹{product.price}</span>
                                <Badge variant={product.inStock ? "default" : "destructive"}>
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
                  <h2 className="text-2xl font-bold">Order Management</h2>
                  <div className="flex gap-4">
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
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
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{order.id}</h3>
                                <Badge variant={
                                  order.status === "delivered" ? "default" :
                                  order.status === "shipped" ? "secondary" :
                                  order.status === "processing" ? "outline" : "destructive"
                                }>
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.customer} • {order.date} • ₹{order.total}
                              </p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setSelectedOrder(order)}>
                                  Manage
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Customer</Label>
                                    <p className="text-sm">{selectedOrder?.customer}</p>
                                  </div>
                                  <div>
                                    <Label>Order Items</Label>
                                    {selectedOrder?.items.map((item: any, idx: number) => (
                                      <p key={idx} className="text-sm">{item.name} x {item.qty}</p>
                                    ))}
                                  </div>
                                  <div>
                                    <Label>Total Amount</Label>
                                    <p className="text-sm">₹{selectedOrder?.total}</p>
                                  </div>
                                  <div>
                                    <Label>Order Status</Label>
                                    <Select 
                                      value={selectedOrder?.status}
                                      onValueChange={(value) => handleStatusChange(selectedOrder?.id, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {showDeliveryForm && (
                                    <div className="space-y-4 border-t pt-4">
                                      <h3 className="font-semibold">Delivery Details</h3>
                                      <div>
                                        <Label>Delivery Agency</Label>
                                        <Input 
                                          value={deliveryDetails.agency}
                                          onChange={(e) => setDeliveryDetails({...deliveryDetails, agency: e.target.value})}
                                          placeholder="e.g., Blue Dart, DTDC"
                                        />
                                      </div>
                                      <div>
                                        <Label>Tracking Number</Label>
                                        <Input 
                                          value={deliveryDetails.trackingNumber}
                                          onChange={(e) => setDeliveryDetails({...deliveryDetails, trackingNumber: e.target.value})}
                                          placeholder="Enter tracking number"
                                        />
                                      </div>
                                      <div>
                                        <Label>Estimated Delivery</Label>
                                        <Input 
                                          type="date"
                                          value={deliveryDetails.estimatedDelivery}
                                          onChange={(e) => setDeliveryDetails({...deliveryDetails, estimatedDelivery: e.target.value})}
                                        />
                                      </div>
                                      <Button onClick={handleDeliverySubmit}>Save Delivery Details</Button>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                        {customers.map((customer) => (
                          <div 
                            key={customer.id} 
                            className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-muted/50 border-primary' : ''}`}
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{customer.name}</h3>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{customer.orders} orders</p>
                              <p className="text-sm text-muted-foreground">₹{customer.spent} spent</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedCustomer && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Orders by {selectedCustomer.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {customerOrders.length > 0 ? (
                            customerOrders.map((order) => (
                              <div key={order.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold">{order.id}</p>
                                    <p className="text-sm text-muted-foreground">{order.date}</p>
                                  </div>
                                  <Badge>{order.status}</Badge>
                                </div>
                                <p className="text-sm">₹{order.total}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-center py-8">No orders found</p>
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
                          <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                          <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} />
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
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                              <p className="text-sm text-muted-foreground">Avg Order Value</p>
                              <p className="text-xl font-bold">₹972</p>
                            </div>
                          </div>
                          <Badge className="bg-success">+5.2%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Conversion Rate</p>
                              <p className="text-xl font-bold">3.2%</p>
                            </div>
                          </div>
                          <Badge className="bg-primary">+0.8%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <TrendingDown className="h-8 w-8 text-destructive" />
                            <div>
                              <p className="text-sm text-muted-foreground">Return Rate</p>
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
