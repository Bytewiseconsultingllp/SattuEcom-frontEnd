import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getMyPayments, requestRefund, type Payment } from "@/lib/api/payments.production";
import { toast } from "sonner";
import { format } from "date-fns";

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | undefined>();
  const limit = 10;

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await getMyPayments(params);
      setPayments(response.data);
      setTotal(response.total);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error(error.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleRequestRefund = async () => {
    if (!selectedPayment || !refundReason) {
      toast.error("Please provide a reason for refund");
      return;
    }

    try {
      await requestRefund(selectedPayment.id, {
        amount: refundAmount,
        reason: refundReason,
      });
      toast.success("Refund request submitted successfully");
      setRefundDialogOpen(false);
      setRefundReason("");
      setRefundAmount(undefined);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || "Failed to request refund");
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

  if (loading && payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>

            <div className="flex items-center gap-2">
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
                onClick={fetchPayments}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payment history found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
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
        <DialogContent className="max-w-2xl">
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
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedPayment.razorpay_order_id}</p>
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
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDate(selectedPayment.created_at)}</p>
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
                  <div>
                    <p className="text-sm text-muted-foreground">Refund Amount</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(selectedPayment.refund_amount)}
                    </p>
                  </div>
                )}
                {selectedPayment.error_description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Error Description</p>
                    <p className="text-red-600">{selectedPayment.error_description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
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
                  placeholder="Please provide a reason for the refund request"
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
                <Button onClick={handleRequestRefund} disabled={!refundReason}>
                  Submit Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
