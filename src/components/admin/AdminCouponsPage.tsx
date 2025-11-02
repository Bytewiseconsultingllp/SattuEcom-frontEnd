import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setSelectedCoupon(null);
          setIsAddOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No coupons created yet. Create your first coupon!
          </p>
        ) : (
          coupons.map((coupon) => (
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
