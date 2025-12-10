import { useEffect, useMemo, useState } from "react";
import { Tag, Plus, Edit, Trash2, Search, Filter, Percent, DollarSign, Gift as GiftIcon, Truck, Calendar, Users, TrendingUp, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "free_shipping";
  discount_value?: number;
  max_discount_amount?: number;
  min_purchase_amount?: number;
  description?: string;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  usage_count?: number;
  is_active: boolean;
  applicable_products?: string[];
  buy_quantity?: number;
  get_quantity?: number;
}

export default function ModernCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as Coupon["type"],
    discount_value: 0,
    max_discount_amount: 0,
    min_purchase_amount: 0,
    description: "",
    start_date: "",
    end_date: "",
    usage_limit: 0,
    is_active: true,
    buy_quantity: 1,
    get_quantity: 1,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/coupons");
      // Backend returns { success: true, data: [...] }
      setCoupons(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch = coupon.code.toLowerCase().includes(searchCode.toLowerCase());
      const matchesType = filterType === "all" || coupon.type === filterType;
      const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? coupon.is_active : !coupon.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [coupons, searchCode, filterType, filterStatus]);

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      discount_value: 0,
      max_discount_amount: 0,
      min_purchase_amount: 0,
      description: "",
      start_date: "",
      end_date: "",
      usage_limit: 0,
      is_active: true,
      buy_quantity: 1,
      get_quantity: 1,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedCoupon) {
        await axiosInstance.put(`/admin/coupons/${selectedCoupon.id}`, formData);
        toast.success("Coupon updated successfully");
        setIsEditOpen(false);
      } else {
        await axiosInstance.post("/admin/coupons", formData);
        toast.success("Coupon created successfully");
        setIsAddOpen(false);
      }
      fetchCoupons();
      resetForm();
      setSelectedCoupon(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const deleteCoupon = async () => {
    if (!selectedCoupon) return;
    try {
      await axiosInstance.delete(`/admin/coupons/${selectedCoupon.id}`);
      toast.success("Coupon deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/admin/coupons/${couponId}/status`, { is_active: !currentStatus });
      toast.success(`Coupon ${!currentStatus ? "activated" : "deactivated"}`);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-5 w-5 text-orange-600" />;
      case "fixed":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "buy_x_get_y":
        return <GiftIcon className="h-5 w-5 text-purple-600" />;
      case "free_shipping":
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  const getCouponBadgeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
      case "fixed":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "buy_x_get_y":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "free_shipping":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300";
    }
  };

  const getCouponDescription = (coupon: Coupon) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.discount_value}% off${coupon.max_discount_amount ? ` (max ₹${coupon.max_discount_amount})` : ""}`;
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

  const getTotalSavings = () => {
    return coupons.reduce((sum, c) => sum + ((c.usage_count || 0) * (c.discount_value || 0)), 0);
  };

  const getActiveCount = () => coupons.filter(c => c.is_active).length;
  const getTotalUsage = () => coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Marketing Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coupon Management</h1>
            <p className="text-orange-100">
              Create powerful discount campaigns
            </p>
          </div>
          <Tag className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Total Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {coupons.length}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {getActiveCount()} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {getTotalUsage()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Times redeemed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              ₹{getTotalSavings().toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Customer discounts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {coupons.filter(c => {
                if (!c.end_date) return false;
                const daysLeft = Math.ceil((new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 7 && daysLeft > 0;
              }).length}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Within 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupon codes..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                resetForm();
                setSelectedCoupon(null);
                setIsAddOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading coupons...</p>
          </CardContent>
        </Card>
      ) : filteredCoupons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {coupons.length === 0 ? "No coupons created yet" : "No coupons match your filters"}
            </p>
            {coupons.length === 0 && (
              <Button onClick={() => setIsAddOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Coupon
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className={`h-1 ${coupon.is_active ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-slate-300'}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCouponIcon(coupon.type)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {coupon.code}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyCouponCode(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </CardTitle>
                      <Badge className={`${getCouponBadgeColor(coupon.type)} border-0 mt-1`}>
                        {coupon.type.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xl font-bold text-orange-600">
                  {getCouponDescription(coupon)}
                </div>

                {coupon.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {coupon.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-muted-foreground">
                  {coupon.min_purchase_amount && coupon.min_purchase_amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Min. Purchase:</span>
                      <span className="font-medium">₹{coupon.min_purchase_amount}</span>
                    </div>
                  )}
                  {coupon.usage_limit && coupon.usage_limit > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Usage:</span>
                      <span className="font-medium">
                        {coupon.usage_count || 0} / {coupon.usage_limit}
                      </span>
                    </div>
                  )}
                  {(coupon.start_date || coupon.end_date) && (
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {coupon.start_date && (
                        <span>{new Date(coupon.start_date).toLocaleDateString()}</span>
                      )}
                      {coupon.start_date && coupon.end_date && <span>-</span>}
                      {coupon.end_date && (
                        <span>{new Date(coupon.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCoupon(coupon);
                      setFormData({
                        code: coupon.code,
                        type: coupon.type,
                        discount_value: coupon.discount_value || 0,
                        max_discount_amount: coupon.max_discount_amount || 0,
                        min_purchase_amount: coupon.min_purchase_amount || 0,
                        description: coupon.description || "",
                        start_date: coupon.start_date || "",
                        end_date: coupon.end_date || "",
                        usage_limit: coupon.usage_limit || 0,
                        is_active: coupon.is_active,
                        buy_quantity: coupon.buy_quantity || 1,
                        get_quantity: coupon.get_quantity || 1,
                      });
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setSelectedCoupon(coupon);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setSelectedCoupon(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>
              {selectedCoupon ? "Update coupon details" : "Add a new discount coupon for customers"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coupon Code *</Label>
                <Input
                  placeholder="e.g., SUMMER50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type !== "free_shipping" && formData.type !== "buy_x_get_y" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    placeholder={formData.type === "percentage" ? "e.g., 20" : "e.g., 500"}
                    value={formData.discount_value || ""}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {formData.type === "percentage" && (
                  <div className="space-y-2">
                    <Label>Max Discount Amount</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1000"
                      value={formData.max_discount_amount || ""}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>
            )}

            {formData.type === "buy_x_get_y" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buy Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.buy_quantity || ""}
                    onChange={(e) => setFormData({ ...formData, buy_quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Get Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.get_quantity || ""}
                    onChange={(e) => setFormData({ ...formData, get_quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your coupon offer..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. Purchase Amount</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.min_purchase_amount || ""}
                  onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  placeholder="0 = unlimited"
                  value={formData.usage_limit || ""}
                  onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false);
              setIsEditOpen(false);
              setSelectedCoupon(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
              {selectedCoupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Coupon Code: <strong>{selectedCoupon?.code}</strong>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCoupon}>
              Delete Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
