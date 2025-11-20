import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  getAllInvoices,
  downloadInvoicePDF,
  updateInvoiceStatus,
} from '@/lib/api/invoice';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, paymentStatusFilter, searchTerm]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getAllInvoices(params);
      
      if (response?.success) {
        setInvoices(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        
        // Calculate stats
        const total = response.pagination?.total || 0;
        const paid = response.data?.filter((inv: any) => inv.paymentStatus === 'paid').length || 0;
        const pending = response.data?.filter((inv: any) => inv.paymentStatus === 'pending').length || 0;
        const totalRevenue = response.data
          ?.filter((inv: any) => inv.paymentStatus === 'paid')
          .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0;

        setStats({ total, paid, pending, totalRevenue });
      }
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
      toast.error(error.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      await downloadInvoicePDF(invoiceId, invoiceNumber);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setDetailsDialogOpen(true);
  };

  const handleUpdateStatus = async (invoiceId: string, status: string, paymentStatus?: string) => {
    try {
      await updateInvoiceStatus(invoiceId, status, paymentStatus);
      toast.success('Invoice status updated successfully');
      fetchInvoices();
      setDetailsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update invoice status');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: any }> = {
      draft: { label: 'Draft', variant: 'outline' },
      issued: { label: 'Issued', variant: 'secondary' },
      paid: { label: 'Paid', variant: 'default' },
      overdue: { label: 'Overdue', variant: 'destructive' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
    };
    const config = configs[status?.toLowerCase()] || configs.issued;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Pending', variant: 'outline' },
      paid: { label: 'Paid', variant: 'default' },
      failed: { label: 'Failed', variant: 'destructive' },
      refunded: { label: 'Refunded', variant: 'secondary' },
    };
    const config = configs[status?.toLowerCase()] || configs.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Invoice Management</h1>
        <p className="text-muted-foreground">Manage and track all invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchInvoices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Invoices will appear here when orders are created'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.userName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{invoice.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.orderNumber || invoice.orderId?.slice(0, 8)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
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

      {/* Invoice Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedInvoice.userName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedInvoice.userEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div>
                <h3 className="font-semibold mb-2">Invoice Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p>{getStatusBadge(selectedInvoice.status)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Status</p>
                    <p>{getPaymentStatusBadge(selectedInvoice.paymentStatus)}</p>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div>
                <h3 className="font-semibold mb-2">Amount Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <div className="flex gap-2">
                  <Select
                    defaultValue={selectedInvoice.status}
                    onValueChange={(value) => handleUpdateStatus(selectedInvoice.id, value, selectedInvoice.paymentStatus)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    defaultValue={selectedInvoice.paymentStatus}
                    onValueChange={(value) => handleUpdateStatus(selectedInvoice.id, selectedInvoice.status, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice.id, selectedInvoice.invoiceNumber)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
