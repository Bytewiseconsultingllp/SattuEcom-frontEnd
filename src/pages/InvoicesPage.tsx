import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getUserInvoices, downloadInvoicePDF } from '@/lib/api/invoice';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await getUserInvoices({ page, limit: 10 });
      
      if (response?.success) {
        setInvoices(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
      toast.error(error.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoice_number: string) => {
    try {
      await downloadInvoicePDF(invoiceId, invoice_number);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: any; icon: any }> = {
      pending: {
        label: 'Pending',
        variant: 'outline',
        icon: <Clock className="h-3 w-3" />,
      },
      paid: {
        label: 'Paid',
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      failed: {
        label: 'Failed',
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />,
      },
      refunded: {
        label: 'Refunded',
        variant: 'secondary',
        icon: <RefreshCw className="h-3 w-3" />,
      },
    };
    const config = configs[status?.toLowerCase()] || configs.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
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

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.payment_status === 'paid').length,
    pending: invoices.filter(inv => inv.payment_status === 'pending').length,
    totalAmount: invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Invoices</h1>
          <p className="text-muted-foreground">View and download your invoices</p>
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
                <CheckCircle2 className="h-8 w-8 text-green-600" />
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
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchInvoices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-4">
                  Invoices will appear here when you place orders
                </p>
                <Button asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Invoice Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold">
                                {invoice.invoice_number}
                              </h3>
                              {getPaymentStatusBadge(invoice.payment_status)}
                              {invoice.sale_type && (
                                <Badge variant="outline" className="capitalize">
                                  {invoice.sale_type}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Issued: {formatDate(invoice.issue_date)}</span>
                              </div>
                              {/* Only show due date for offline sales with pending payment */}
                              {invoice.sale_type === 'offline' && invoice.payment_status !== 'paid' && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-orange-600 font-medium">Due: {formatDate(invoice.due_date)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-semibold text-foreground">
                                  {formatCurrency(invoice.total_amount)}
                                </span>
                              </div>
                            </div>

                            {invoice.order_id && (
                              <p className="text-sm text-muted-foreground mt-2 font-mono">
                                Order ID: {invoice.order_id}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {invoice.order_id && (
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/order/${invoice.order_id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Order
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download PDF
                            </Button>
                          </div>
                        </div>

                        {/* Amount Breakdown */}
                        {(invoice.discount_amount > 0 || invoice.tax_amount > 0 || invoice.delivery_charges > 0) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Subtotal</p>
                                <p className="font-medium">{formatCurrency(invoice.subtotal)}</p>
                              </div>
                              {invoice.discount_amount > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Discount</p>
                                  <p className="font-medium text-green-600">
                                    -{formatCurrency(invoice.discount_amount)}
                                  </p>
                                </div>
                              )}
                              {invoice.delivery_charges > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Delivery</p>
                                  <p className="font-medium">{formatCurrency(invoice.delivery_charges)}</p>
                                </div>
                              )}
                              {invoice.tax_amount > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Tax</p>
                                  <p className="font-medium">{formatCurrency(invoice.tax_amount)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground">Total</p>
                                <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
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
      </div>
    </div>
  );
}
