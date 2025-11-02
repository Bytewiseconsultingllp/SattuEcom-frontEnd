import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import {
  CreditCard,
  Download,
  Eye,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  getAllPayments,
  getPaymentStats,
  processRefund,
  type Payment,
} from "@/lib/api/payments.production";
import { toast } from "sonner";
import { format } from "date-fns";

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | undefined>();
  const [stats, setStats] = useState<any>(null);
  const limit = 10;

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [page, statusFilter, searchQuery]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await getAllPayments(params);
      setPayments(response.data);
      setTotal(response.total);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error(error.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getPaymentStats();
      setStats(response.data);
    } catch (error: any) {
      console.error("Failed to fetch payment stats:", error);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment || !refundReason) {
      toast.error("Please provide a reason for refund");
      return;
    }

    try {
      await processRefund(selectedPayment.id, {
        amount: refundAmount,
        reason: refundReason,
      });
      toast.success("Refund processed successfully");
      setRefundDialogOpen(false);
      setRefundReason("");
      setRefundAmount(undefined);
      fetchPayments();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Failed to process refund");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      captured: {
        label: "Completed",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      authorized: {
        label: "Authorized",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      },
      created: {
        label: "Pending",
        variant: "outline",
        icon: <Clock className="h-3 w-3" />,
      },
      failed: {
        label: "Failed",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      },
      refunded: {
        label: "Refunded",
        variant: "secondary",
        icon: <RefreshCw className="h-3 w-3" />,
      },
      partial_refund: {
        label: "Partial Refund",
        variant: "secondary",
        icon: <RefreshCw className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.created;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_payments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_revenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_refunds)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_payments > 0
                  ? (
                      ((stats.by_status.find((s: any) => s._id === "captured")?.count || 0) /
                        stats.total_payments) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Management
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="captured">Completed</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="created">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchPayments();
                  fetchStats();
                }}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && payments.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.razorpay_payment_id?.slice(0, 20) || payment.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.order_id.toString().slice(0, 8)}...
                        </TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_method || "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === "captured" &&
                              payment.refund_status === "none" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setRefundDialogOpen(true);
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, total)} of {total} payments
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-sm">
                    {selectedPayment.razorpay_payment_id || selectedPayment.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Razorpay Order ID</p>
                  <p className="font-mono text-sm">{selectedPayment.razorpay_order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedPayment.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{selectedPayment.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p>{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p>{formatDate(selectedPayment.updated_at)}</p>
                </div>
                {selectedPayment.payment_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{selectedPayment.payment_email}</p>
                  </div>
                )}
                {selectedPayment.payment_contact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p>{selectedPayment.payment_contact}</p>
                  </div>
                )}
                {selectedPayment.refund_amount && selectedPayment.refund_amount > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Amount</p>
                      <p className="font-semibold text-orange-600">
                        {formatCurrency(selectedPayment.refund_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Status</p>
                      <Badge variant="secondary">{selectedPayment.refund_status}</Badge>
                    </div>
                  </>
                )}
                {selectedPayment.error_description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Error Description</p>
                    <p className="text-red-600">{selectedPayment.error_description}</p>
                  </div>
                )}
                {selectedPayment.order && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Order Details</p>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Total:</span>{" "}
                        {formatCurrency(selectedPayment.order.total_amount)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant="outline">{selectedPayment.order.status}</Badge>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  This action will process a refund to the customer's payment method.
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Amount</p>
                <p className="font-semibold">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Refund Amount (Optional)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder={`Max: ${selectedPayment.amount}`}
                  value={refundAmount || ""}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                  max={selectedPayment.amount}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for full refund
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Reason for Refund *</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Please provide a reason for the refund"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRefundDialogOpen(false);
                    setRefundReason("");
                    setRefundAmount(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessRefund}
                  disabled={!refundReason}
                  variant="destructive"
                >
                  Process Refund
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
