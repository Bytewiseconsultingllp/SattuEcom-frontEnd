import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Edit, Trash2, Tag, Percent, Gift } from "lucide-react";
import { toast } from "sonner";
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, type Coupon, type CouponType, getAllAdminCoupons } from "@/lib/api/coupons";
import { getProducts } from "@/lib/api/products";
import { Textarea } from "../ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";

// Zod schema outside component to prevent recreation
const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  type: z.enum(["percentage", "fixed", "buy_x_get_y", "free_shipping"]),
  description: z.string().optional().or(z.literal("")),
  discount_value: z.string().optional().or(z.literal("")),
  min_purchase_amount: z.string().optional().or(z.literal("")),
  max_discount_amount: z.string().optional().or(z.literal("")),
  buy_quantity: z.string().optional().or(z.literal("")),
  get_quantity: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  usage_limit: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
}).superRefine((data, ctx) => {
  const toNum = (s?: string) => {
    if (s == null || s === "") return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };
  const discount = toNum(data.discount_value);
  const maxDiscount = toNum(data.max_discount_amount);
  const minPurchase = toNum(data.min_purchase_amount);
  const buyQty = toNum(data.buy_quantity);
  const getQty = toNum(data.get_quantity);

  if ((data.type === "percentage" || data.type === "fixed") && (discount == null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount_value"], message: "Discount value is required" });
  }
  if (data.type === "percentage" && discount != null && (discount <= 0 || discount > 100)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount_value"], message: "Percentage must be 1-100" });
  }
  if (data.type === "fixed" && discount != null && discount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount_value"], message: "Amount must be > 0" });
  }
  if (data.type === "buy_x_get_y") {
    if (buyQty == null || buyQty <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["buy_quantity"], message: "Required" });
    if (getQty == null || getQty <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["get_quantity"], message: "Required" });
  }
});

type CouponFormData = z.infer<typeof couponSchema>;

const defaultValues: CouponFormData = {
  code: "",
  type: "percentage",
  description: "",
  discount_value: "",
  min_purchase_amount: "",
  max_discount_amount: "",
  buy_quantity: "",
  get_quantity: "",
  start_date: "",
  end_date: "",
  usage_limit: "",
  is_active: true,
};

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Filters/searching for coupons grid
  const [searchCode, setSearchCode] = useState("");
  const [filterType, setFilterType] = useState<"all" | CouponType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Product selection state for product-wise coupons
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<Array<{ id: string; name: string; price?: number }>>([]);
  const [selectedProducts, setSelectedProducts] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues,
    mode: "onSubmit",
    shouldFocusError: false,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      const res = await getAllAdminCoupons();
      if (res.success) {
        setCoupons(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    form.reset(defaultValues);
  }

  function handleEdit(coupon: Coupon) {
    setSelectedCoupon(coupon);
    form.reset({
      code: coupon.code,
      type: coupon.type as CouponType,
      description: coupon.description || "",
      discount_value: coupon.discount_value != null ? String(coupon.discount_value) : "",
      min_purchase_amount: coupon.min_purchase_amount != null ? String(coupon.min_purchase_amount) : "",
      max_discount_amount: coupon.max_discount_amount != null ? String(coupon.max_discount_amount) : "",
      buy_quantity: coupon.buy_quantity != null ? String(coupon.buy_quantity) : "",
      get_quantity: coupon.get_quantity != null ? String(coupon.get_quantity) : "",
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : "",
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : "",
      usage_limit: coupon.usage_limit != null ? String(coupon.usage_limit) : "",
      is_active: coupon.is_active,
    });
    // Load selected product names for applicable_products
    const ids = coupon.applicable_products || [];
    if (ids.length > 0) {
      (async () => {
        try {
          const names: Array<{ id: string; name: string }> = [];
          // Limit to first 10 to avoid too many requests
          const subset = ids.slice(0, 10);
          const { getProductById } = await import("@/lib/api/products");
          for (const pid of subset) {
            try {
              const res: any = await getProductById(pid);
              const p = res?.data || res;
              if (p?.id || p?._id) names.push({ id: p.id || p._id, name: p.name || p.title || p.slug || p.id || pid });
            } catch {
              names.push({ id: pid, name: pid });
            }
          }
          // If more than subset, keep remaining as IDs for now
          if (ids.length > subset.length) {
            for (const pid of ids.slice(subset.length)) names.push({ id: pid, name: pid });
          }
          setSelectedProducts(names);
        } catch {
          setSelectedProducts(ids.map((id: string) => ({ id, name: id })));
        }
      })();
    } else {
      setSelectedProducts([]);
    }
    setIsEditOpen(true);
  }

  async function onSubmit(values: z.infer<typeof couponSchema>) {
    try {
      const toNum = (s?: string) => {
        if (s == null || s === "") return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : undefined;
      };

      const payload: any = {
        code: values.code.toUpperCase().trim(),
        type: values.type,
        description: (values.description || '').trim() || undefined,
        is_active: values.is_active,
      };

      const discount = toNum(values.discount_value);
      const maxDiscount = toNum(values.max_discount_amount);
      const minPurchase = toNum(values.min_purchase_amount);
      const buyQty = toNum(values.buy_quantity);
      const getQty = toNum(values.get_quantity);
      const usageLimit = toNum(values.usage_limit);

      if (values.type === "percentage" || values.type === "fixed") {
        payload.discount_value = discount;
      }

      if (values.type === "percentage" && maxDiscount && maxDiscount > 0) {
        payload.max_discount_amount = maxDiscount;
      }

      if (values.type === "buy_x_get_y") {
        payload.buy_quantity = buyQty;
        payload.get_quantity = getQty;
        // Ensure discount_value is not sent for buy_x_get_y
        delete payload.discount_value;
      }

      if (minPurchase && minPurchase > 0) {
        payload.min_purchase_amount = minPurchase;
      }

      if (values.start_date) {
        payload.start_date = new Date(values.start_date).toISOString();
      }

      if (values.end_date) {
        payload.end_date = new Date(values.end_date).toISOString();
      }

      if (usageLimit && usageLimit > 0) {
        payload.usage_limit = usageLimit;
      }

      // Attach applicable products if any selected
      if (selectedProducts && selectedProducts.length > 0) {
        payload.applicable_products = selectedProducts.map(p => p.id);
      } else {
        // If none selected, omit field (means applicable to all)
        delete payload.applicable_products;
      }

      if (selectedCoupon) {
        const res = await updateCoupon(selectedCoupon.id, payload);
        if (res.success) {
          toast.success("Coupon updated successfully");
          setIsEditOpen(false);
          setSelectedCoupon(null);
          resetForm();
          fetchCoupons();
        }
      } else {
        const res = await createCoupon(payload);
        if (res.success) {
          toast.success("Coupon created successfully");
          setIsAddOpen(false);
          resetForm();
          fetchCoupons();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon");
    }
  }

  async function handleDelete(couponId: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await deleteCoupon(couponId);
      if (res.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  }

  async function handleToggleStatus(couponId: string, currentStatus: boolean) {
    try {
      const res = await toggleCouponStatus(couponId, !currentStatus);
      if (res.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchCoupons();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update coupon status");
    }
  }

  const CouponForm = () => {
    const couponType = form.watch("type");

    return (
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SAVE20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Type *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y Free</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe this coupon..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(couponType === "percentage" || couponType === "fixed") && (
            <FormField
              control={form.control}
              name="discount_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discount Value * {couponType === "percentage" ? "(%)" : "(₹)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={couponType === "percentage" ? "e.g., 20" : "e.g., 100"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {couponType === "percentage" && (
            <FormField
              control={form.control}
              name="max_discount_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Discount Amount (₹) (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Applicable Products - optional product-wise targeting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>Applicable Products (optional)</FormLabel>
              {selectedProducts.length > 0 && (
                <span className="text-xs text-muted-foreground">{selectedProducts.length} selected</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search product by name..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const res: any = await getProducts(1, 10, { search: productQuery });
                    const items = (res?.data || res?.products || res || []).map((p: any) => ({
                      id: p?.id || p?._id || p?.product?._id || p?.product?.id,
                      name: p?.name || p?.product?.name,
                      price: p?.price || p?.product?.price,
                    })).filter((p: any) => p.id && p.name);
                    setProductResults(items);
                  } catch (_) {
                    setProductResults([]);
                  }
                }}
              >
                Search
              </Button>
            </div>
            {productResults.length > 0 && (
              <div className="border rounded p-2 max-h-48 overflow-auto space-y-1">
                {productResults.map((p) => {
                  const checked = selectedProducts.some(sp => sp.id === p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="truncate mr-2">
                        <span className="font-medium">{p.name}</span>
                        {p.price != null && <span className="text-muted-foreground ml-2">₹{p.price}</span>}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={checked ? "secondary" : "outline"}
                        onClick={() => {
                          setSelectedProducts((prev) =>
                            checked ? prev.filter((x) => x.id !== p.id) : [...prev, { id: p.id, name: p.name }]
                          );
                        }}
                      >
                        {checked ? "Selected" : "Select"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedProducts.map((p) => (
                  <Badge key={p.id} variant="secondary" className="px-2 py-1">
                    <span className="mr-1">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedProducts((prev) => prev.filter((x) => x.id !== p.id))}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {couponType === "buy_x_get_y" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buy_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Quantity *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="get_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Get Quantity *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="min_purchase_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Purchase Amount (₹) (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Limit (Optional, 0 = unlimited)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <FormLabel className="!m-0">Active</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (selectedCoupon) {
                  setIsEditOpen(false);
                  setSelectedCoupon(null);
                } else {
                  setIsAddOpen(false);
                }
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{selectedCoupon ? "Update" : "Create"} Coupon</Button>
          </div>
        </form>
      </Form>
    );
  };

  const getCouponIcon = (type: CouponType) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed":
        return <Tag className="h-4 w-4" />;
      case "buy_x_get_y":
        return <Gift className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getCouponDescription = (coupon: Coupon) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.discount_value}% off${coupon.max_discount_amount ? ` (max ₹${coupon.max_discount_amount})` : ''}`;
      case "fixed":
        return `₹${coupon.discount_value} off`;
      case "buy_x_get_y":
        return `Buy ${coupon.buy_quantity} Get ${coupon.get_quantity} Free`;
      case "free_shipping":
        return "Free Shipping";
      default:
        return "";
    }
  };

  // Derived filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesCode = searchCode.trim() ? c.code.toLowerCase().includes(searchCode.trim().toLowerCase()) : true;
      const matchesType = filterType === "all" ? true : c.type === filterType;
      const matchesStatus = filterStatus === "all" ? true : filterStatus === "active" ? c.is_active : !c.is_active;
      return matchesCode && matchesType && matchesStatus;
    });
  }, [coupons, searchCode, filterType, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Marketing Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coupon Management</h1>
            <p className="text-orange-100">
              Create and manage discount coupons for customers
            </p>
          </div>
          <Tag className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
            <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Discount Coupons</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Create percentage or fixed discounts, buy X get Y offers, and free shipping coupons. Set minimum purchase amounts, usage limits, and validity periods to control your promotions effectively.
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{filteredCoupons.length}</span>
                <span className="text-orange-600 dark:text-orange-400">Total Coupons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{coupons.filter(c => c.is_active).length}</span>
                <span className="text-orange-600 dark:text-orange-400">Active</span>
              </div>
            </div>
          </div>
          <Button onClick={() => {
            resetForm();
            setSelectedCoupon(null);
            setIsAddOpen(true);
          }} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search by code"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
            <SelectItem value="free_shipping">Free Shipping</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => { setSearchCode(""); setFilterType("all"); setFilterStatus("all"); }}>Reset</Button>
          <Button variant="outline" className="flex-1" onClick={fetchCoupons}>Refresh</Button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">Loading coupons...</p>
        ) : filteredCoupons.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No coupons created yet. Create your first coupon!
          </p>
        ) : (
          filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCouponIcon(coupon.type)}
                    <CardTitle className="text-lg">{coupon.code}</CardTitle>
                  </div>
                  <Badge variant={coupon.is_active ? "default" : "secondary"}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium text-primary">{getCouponDescription(coupon)}</p>
                
                {coupon.description && (
                  <p className="text-sm text-muted-foreground">{coupon.description}</p>
                )}

                {coupon.min_purchase_amount && coupon.min_purchase_amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Min purchase: ₹{coupon.min_purchase_amount}
                  </p>
                )}

                {coupon.usage_limit && coupon.usage_limit > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Used: {coupon.usage_count || 0} / {coupon.usage_limit}
                  </p>
                )}

                {coupon.applicable_products && coupon.applicable_products.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Applies to {coupon.applicable_products.length} product(s)
                  </p>
                )}

                {(coupon.start_date || coupon.end_date) && (
                  <p className="text-xs text-muted-foreground">
                    {coupon.start_date && `From ${new Date(coupon.start_date).toLocaleDateString()}`}
                    {coupon.start_date && coupon.end_date && " - "}
                    {coupon.end_date && `Until ${new Date(coupon.end_date).toLocaleDateString()}`}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                  >
                    {coupon.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Coupon Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm />
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminCouponsPage;
