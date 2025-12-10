import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Eye,
  Download,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { getAllUsers } from "@/lib/api/user";
import { getOrders } from "@/lib/api/order";
import { format } from "date-fns";
import { Pagination } from "@/components/common/Pagination";

export function ModernCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(currentPage, pageSize, searchQuery);
      const customersData = Array.isArray(response?.data) ? response.data : [];
      setCustomers(customersData);
      setTotalCustomers(response?.total || 0);
      setTotalPages(response?.totalPages || 0);
    } catch (error: any) {
      console.error("Failed to fetch customers:", error);
      toast.error(error.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers; // Filtering is now done on backend

  const stats = {
    total: totalCustomers,
    active: customers.filter((c) => c.status === "active").length,
    newThisMonth: customers.filter((c) => {
      const createdDate = new Date(c.created_at);
      const now = new Date();
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewOrders = async (customer: any) => {
    try {
      setLoadingOrders(true);
      setSelectedCustomer(customer);
      setShowOrdersDialog(true);
      const response = await getOrders();
      const allOrders = Array.isArray(response) ? response : response?.data || [];
      // Filter orders for this customer - handle both _id and id
      const customerId = customer._id || customer.id;
      const filteredOrders = allOrders.filter((order: any) => {
        const orderUserId = order.user_id || order.user?._id || order.user?.id || order.user;
        return orderUserId === customerId || orderUserId?.toString() === customerId?.toString();
      });
      // Normalize differing API fields so UI can rely on consistent keys
      const normalizedOrders = filteredOrders.map((o: any) => ({
        ...o,
        totalAmount: o.totalAmount ?? o.total_amount ?? o.total ?? o.amount ?? 0,
        createdAt: o.createdAt ?? o.created_at ?? o.date ?? null,
        items: o.items ?? o.order_items ?? [],
      }));
      setCustomerOrders(normalizedOrders);
    } catch (error: any) {
      toast.error(error.message || "Failed to load customer orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Store Management Blue Theme */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
            <p className="text-blue-100">Manage your customer base</p>
          </div>
          <Button variant="secondary" size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Export Customers
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Users className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.newThisMonth}
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading customers...</p>
          </CardContent>
        </Card>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No customers found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(customer.name || customer.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {customer.name || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {customer.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {customer.phone || "Not provided"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{customer.role || "user"}</Badge>
                        </TableCell>
                        <TableCell>
                          {customer.createdAt || customer.created_at
                            ? format(new Date(customer.createdAt || customer.created_at), "dd MMM yyyy")
                            : "Not available"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowCustomerDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrders(customer)}
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Orders
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalCustomers)} of {totalCustomers} customers
                  </div>
                  <Select value={pageSize.toString()} onValueChange={(val) => {
                    setPageSize(parseInt(val));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={loading}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(selectedCustomer.name || selectedCustomer.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedCustomer.name || "N/A"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {selectedCustomer.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="secondary">
                    {selectedCustomer.role || "user"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <p className="font-medium">
                    {selectedCustomer.createdAt || selectedCustomer.created_at
                      ? format(new Date(selectedCustomer.createdAt || selectedCustomer.created_at), "dd MMM yyyy, hh:mm a")
                      : "Not available"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-medium font-mono text-sm">
                    {selectedCustomer.id}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    setShowCustomerDialog(false);
                    handleViewOrders(selectedCustomer);
                  }}
                  className="w-full"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
              </div>

              {selectedCustomer.address && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </p>
                  <p className="font-medium">{selectedCustomer.address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Orders Dialog */}
      <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Orders by {selectedCustomer?.name || selectedCustomer?.email}
            </DialogTitle>
          </DialogHeader>
          {loadingOrders ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found for this customer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Orders Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{customerOrders.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          customerOrders.reduce(
                            (sum, order) => sum + (order.totalAmount ?? order.total_amount ?? order.total ?? 0),
                            0
                          )
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          customerOrders.reduce(
                            (sum, order) => sum + (order.totalAmount ?? order.total_amount ?? order.total ?? 0),
                            0
                          ) / customerOrders.length
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.orderNumber || order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.createdAt || order.created_at
                                ? format(new Date(order.createdAt || order.created_at), "dd MMM yyyy, hh:mm a")
                                : "Date not available"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(order.totalAmount ?? order.total_amount ?? order.total ?? 0)}
                          </p>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {order.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.items.length} item(s)
                          </p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item: any, idx: number) => (
                              <p key={idx} className="text-sm">
                                {item.quantity}x {item.product?.name || item.name || "Product"}
                              </p>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-muted-foreground">
                                +{order.items.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
