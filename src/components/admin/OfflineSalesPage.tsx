import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  Download,
  X,
  Search,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getOfflineSales, createOfflineSale, updateOfflineSale, deleteOfflineSale, sendCredentialForSale, exportOfflineSales, getOfflineSalesStats, OfflineSale } from "@/lib/api/offlineSales";
import { getProducts } from "@/lib/api/products";
import { Loader2 } from "lucide-react";


export function OfflineSalesPage() {
  const [sales, setSales] = useState<OfflineSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<OfflineSale | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    paymentMethod: "cash",
    notes: "",
    gstType: "non-gst",
    discount: 0,
  });
  const [exportPeriod, setExportPeriod] = useState<"weekly" | "monthly" | "quarterly" | "annually">("weekly");
  const [items, setItems] = useState<{ product: string; quantity: number; price: number }[]>([]);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterGST, setFilterGST] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<{ id: string; name: string; price?: number }[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const [lastSaleDate, setLastSaleDate] = useState<string | null>(null);


  // Fetch sales on mount and when filters change
  useEffect(() => {
    fetchSales();
  }, [search, filterGST, filterPayment, page, limit]);

  // Fetch global stats (not paginated or filtered)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOfflineSalesStats();
        setStats(data);
      } catch (e) {
        // ignore stats error
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLastSaleDate();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await getOfflineSales({
        q: search || undefined,
        gstType: filterGST !== 'all' ? filterGST : undefined,
        paymentMethod: filterPayment !== 'all' ? filterPayment : undefined,
        page,
        limit,
      });
      setSales(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || (res.data ? res.data.length : 0));
    } catch (error: any) {
      toast.error(error.message || "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastSaleDate = async () => {
    try {
      const res = await getOfflineSales({
        page: 1,
        limit: 1,
      });
      const lastSale = res.data && res.data.length > 0 ? res.data[0] : null;
      if (lastSale && lastSale.date) {
        const normalized = format(new Date(lastSale.date), "yyyy-MM-dd");
        setLastSaleDate(normalized);
      } else {
        setLastSaleDate(null);
      }
    } catch (error) {
      setLastSaleDate(null);
    }
  };

  const handleOpenDialog = (sale?: OfflineSale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        date: sale.date,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerEmail: (sale as any).customerEmail || "",
        paymentMethod: sale.paymentMethod,
        notes: sale.notes || "",
        gstType: (sale as any).gstType || "non-gst",
        discount: (sale as any).discount || 0,
      });
      setItems(sale.items);
    } else {
      setEditingSale(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        paymentMethod: "cash",
        notes: "",
        gstType: "non-gst",
        discount: 0,
      });
      setItems([]);
    }
    setDialogOpen(true);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSearchProducts = async () => {
    const query = productSearchQuery.trim();
    if (!query) {
      toast.info("Type a product name to search");
      return;
    }

    try {
      setSearchingProducts(true);
      const res: any = await getProducts(1, 10, { search: query });
      const results = (res?.data || res?.products || res || [])
        .map((p: any) => ({
          id: p?.id || p?._id || p?.product?._id || p?.product?.id,
          name: p?.name || p?.product?.name,
          price: p?.price ?? p?.product?.price,
        }))
        .filter((p: any) => p.id && p.name);

      if (!results.length) {
        toast.info("No products found for this search");
      }

      setProductSearchResults(results);
    } catch (error: any) {
      toast.error(error.message || "Failed to search products");
      setProductSearchResults([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleAddProductFromSearch = (
    product: { id: string; name: string; price?: number }
  ) => {
    setItems((prev) => [
      ...prev,
      {
        product: product.name,
        quantity: 1,
        price: product.price != null ? product.price : 0,
      },
    ]);
    setProductSearchResults([]);
    setProductSearchQuery("");
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateFinalAmount = () => {
    const total = calculateTotal();
    return Math.max(0, total - (formData.discount || 0));
  };

  const handleSave = async () => {
    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.customerEmail ||
      items.length === 0 ||
      items.some((i) => !i.product || i.price === 0)
    ) {
      toast.error("Please fill in all required fields, add at least one item, and ensure each item has a price");
      return;
    }

    if (!editingSale && lastSaleDate) {
      const selected = new Date(formData.date);
      const last = new Date(lastSaleDate);
      if (selected < last) {
        toast.error(`Sale date cannot be before ${format(last, "dd MMM yyyy")}`);
        return;
      }
    }

    const totalAmount = calculateTotal();
    const finalAmount = calculateFinalAmount();

    setSaving(true);
    try {
      if (editingSale) {
        await updateOfflineSale(editingSale._id!, {
          ...formData,
          items,
          totalAmount,
          finalAmount,
        });
        toast.success("Sale updated successfully");
      } else {
        await createOfflineSale({
          ...formData,
          items,
          totalAmount,
          finalAmount,
        });
        toast.success("Sale recorded successfully and customer created with welcome email!");
      }
      setDialogOpen(false);
      fetchSales();
      fetchLastSaleDate();
    } catch (error: any) {
      toast.error(error.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };


  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportOfflineSales(exportPeriod);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offline-sales-${exportPeriod}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${exportPeriod.charAt(0).toUpperCase() + exportPeriod.slice(1)} report exported successfully`);
    } catch (error: any) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteOfflineSale(id);
        toast.success("Sale deleted successfully");
        fetchSales();
        fetchLastSaleDate();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete sale");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const downloadExcelTemplate = () => {
    const csvContent = `Date,Customer Name,Phone,Email,Product 1,Qty 1,Price 1,Product 2,Qty 2,Price 2,GST Type,Invoice Number,Discount,Payment Method,Notes
2025-01-01,John Doe,9876543210,john.doe@example.com,Product A,1,100,Product B,2,50,non-gst,,0,cash,Sample sale
2025-01-02,Jane Smith,9876543211,jane.smith@example.com,Product C,3,200,,,,gst,INV-001,50,upi,GST sale`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", "offline_sales_template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Template downloaded successfully");
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const importedSales = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = lines[i].split(",").map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          // Parse items from CSV
          const items = [];
          for (let j = 0; j < 3; j++) {
            const product = row[`Product ${j + 1}`];
            const qty = row[`Qty ${j + 1}`];
            const price = row[`Price ${j + 1}`];

            if (product && qty && price) {
              items.push({
                product,
                quantity: parseInt(qty),
                price: parseFloat(price),
              });
            }
          }

          if (items.length === 0) continue;

          const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);
          const discount = parseFloat(row.Discount) || 0;
          const finalAmount = totalAmount - discount;

          importedSales.push({
            date: row.Date,
            customerName: row["Customer Name"],
            customerPhone: row.Phone,
            customerEmail: row.Email || row["Email"] || "",
            items,
            totalAmount,
            discount,
            finalAmount,
            gstType: row["GST Type"] || "non-gst",
            invoiceNumber: row["Invoice Number"] || "",
            paymentMethod: row["Payment Method"] || "cash",
            notes: row.Notes || "",
          });
        }

        // Bulk create sales in small concurrent batches, suppress welcome emails
        const BATCH_SIZE = 10;
        for (let i = 0; i < importedSales.length; i += BATCH_SIZE) {
          const batch = importedSales.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map((sale) =>
              createOfflineSale({
                ...sale,
                suppressEmail: true,
              } as any)
            )
          );
        }

        toast.success(`${importedSales.length} sales imported successfully`);
        setExcelImportOpen(false);
        fetchSales();
      } catch (error: any) {
        toast.error("Error importing Excel file: " + error.message);
      }
    };

    reader.readAsText(file);
  };

  const totalRevenue = stats?.totalRevenue ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Offline Sales Entry</h1>
            <p className="text-green-100">
              Record manual sales transactions
            </p>
          </div>
          <ShoppingBag className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Removed bulk Send Credentials dialog in favor of per-row action */}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{stats?.totalSales ?? 0}</p>
              </div>
              <ShoppingBag className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRevenue * 0.4)}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <Button onClick={() => handleOpenDialog()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Record Sale
            </Button>
            <Button onClick={() => setExcelImportOpen(true)} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>All Offline Sales</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Input
                  placeholder="Search name, phone, email, invoice"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-64 md:w-72"
                />
                <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
              </div>
              <Select value={filterGST} onValueChange={(v: any) => { setFilterGST(v); setPage(1); }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="GST Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All GST</SelectItem>
                  <SelectItem value="gst">GST</SelectItem>
                  <SelectItem value="non-gst">Non-GST</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={(v: any) => { setFilterPayment(v); setPage(1); }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
              <Select value={exportPeriod} onValueChange={(value: any) => setExportPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No sales recorded</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Record First Sale
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Final</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell>
                        {format(new Date(sale.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell className="text-sm text-blue-600">
                        {(sale as any).customerEmail}
                      </TableCell>
                      <TableCell>{sale.customerPhone}</TableCell>
                      <TableCell>
                        {sale.invoiceNumber ? (
                          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {sale.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sale.items.length} items</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={((sale as any).gstType === 'gst') ? "default" : "secondary"}>
                          {((sale as any).gstType === 'gst') ? 'GST' : 'Non-GST'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(sale.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency((sale as any).finalAmount || sale.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={sendingEmailId === sale._id}
                            onClick={async () => {
                              setSendingEmailId(sale._id!);
                              try {
                                await sendCredentialForSale(sale._id!);
                                toast.success("Password reset email sent");
                              } catch (e: any) {
                                toast.error(e.message || "Failed to send email");
                              } finally {
                                setSendingEmailId(null);
                              }
                            }}
                          >
                            {sendingEmailId === sale._id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-1" /> Send
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(sale._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <div className="flex items-center justify-between p-4 pt-0">
          <p className="text-sm text-muted-foreground">{totalCount} results</p>
          <div className="flex items-center gap-2">
            <Select value={String(limit)} onValueChange={(v: any) => { setLimit(parseInt(v)); setPage(1); }}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSale ? "Edit Sale" : "Record New Sale"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Sale Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  min={!editingSale && lastSaleDate ? lastSaleDate : undefined}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Customer name"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  placeholder="Phone number"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Welcome email with login credentials will be sent to this address
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstType">GST Type *</Label>
                <Select
                  value={formData.gstType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gstType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-gst">Non-GST</SelectItem>
                    <SelectItem value="gst">GST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Items *</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Search product by name..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchProducts();
                        }
                      }}
                      className="pl-8"
                    />
                    <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSearchProducts}
                    disabled={searchingProducts}
                  >
                    {searchingProducts ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching
                      </>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
                {productSearchResults.length > 0 && (
                  <div className="border rounded p-2 max-h-40 overflow-auto space-y-1 bg-muted/40">
                    {productSearchResults.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs md:text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                        onClick={() => handleAddProductFromSearch(p)}
                      >
                        <div className="truncate mr-2">
                          <span className="font-medium">{p.name}</span>
                          {p.price != null && (
                            <span className="text-muted-foreground ml-2">₹{p.price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="sr-only">Product</Label>
                        <Input
                          placeholder="Product name"
                          value={item.product}
                          onChange={(e) =>
                            updateItem(index, "product", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-24">
                        <Label className="sr-only">Quantity</Label>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div className="w-32">
                        <Label className="sr-only">Price</Label>
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, "price", parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="Discount amount"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Subtotal:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              {formData.discount > 0 && (
                <div className="flex justify-between items-center text-orange-600">
                  <span className="font-semibold">Discount:</span>
                  <span className="text-lg font-bold">
                    -{formatCurrency(formData.discount)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-lg">Final Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateFinalAmount())}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingSale ? "Updating..." : "Saving..."}
                </>
              ) : (
                editingSale ? "Update Sale" : "Record Sale"
              )}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <Dialog open={excelImportOpen} onOpenChange={setExcelImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Offline Sales from Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900 mb-3">
                Download the template, fill it with your sales data, and upload it here.
              </p>
              <Button
                onClick={downloadExcelTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excelFile">Select CSV File</Label>
              <Input
                id="excelFile"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleExcelImport}
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, XLSX
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-xs text-amber-900">
                <strong>Note:</strong> Make sure your file has the correct columns: Date, Customer Name, Phone, Product 1-3, Qty 1-3, Price 1-3, GST Type, Invoice Number, Discount, Payment Method, Notes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExcelImportOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
