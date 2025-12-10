import { useEffect, useMemo, useState } from "react";
import { Gift, Plus, Edit, Trash2, Search, Filter, Package, Heart, Sparkles, Calendar, TrendingUp, AlertCircle, Image as ImageIcon } from "lucide-react";
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

interface GiftDesign {
  id: string;
  name: string;
  type: "single_product" | "combo";
  price: number;
  image_url?: string;
  description?: string;
  wrapping_options?: string[];
  card_message?: string;
  occasion?: string;
  is_active: boolean;
  products?: any[];
  created_at: string;
}

export default function ModernGiftDesignPage() {
  const [designs, setDesigns] = useState<GiftDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOccasion, setFilterOccasion] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<GiftDesign | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "single_product" as GiftDesign["type"],
    price: 0,
    image_url: "",
    description: "",
    wrapping_options: [] as string[],
    card_message: "",
    occasion: "",
    is_active: true,
  });

  const occasions = ["birthday", "anniversary", "wedding", "festival", "corporate", "thank_you", "congratulations", "other"];

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/gifts");
      // Backend returns { success: true, data: [...] }
      setDesigns(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch gift designs");
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = useMemo(() => {
    return designs.filter((design) => {
      const matchesSearch = design.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesType = filterType === "all" || design.type === filterType;
      const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? design.is_active : !design.is_active);
      const matchesOccasion = filterOccasion === "all" || design.occasion === filterOccasion;
      return matchesSearch && matchesType && matchesStatus && matchesOccasion;
    });
  }, [designs, searchName, filterType, filterStatus, filterOccasion]);

  const resetForm = () => {
    setFormData({
      name: "",
      type: "single_product",
      price: 0,
      image_url: "",
      description: "",
      wrapping_options: [],
      card_message: "",
      occasion: "",
      is_active: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedDesign) {
        await axiosInstance.put(`/admin/gifts/${selectedDesign.id}`, formData);
        toast.success("Gift design updated successfully");
        setIsEditOpen(false);
      } else {
        await axiosInstance.post("/admin/gifts", formData);
        toast.success("Gift design created successfully");
        setIsAddOpen(false);
      }
      fetchDesigns();
      resetForm();
      setSelectedDesign(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save gift design");
    }
  };

  const deleteDesign = async () => {
    if (!selectedDesign) return;
    try {
      await axiosInstance.delete(`/admin/gifts/${selectedDesign.id}`);
      toast.success("Gift design deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDesign(null);
      fetchDesigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete gift design");
    }
  };

  const toggleDesignStatus = async (designId: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/admin/gifts/${designId}/status`, { is_active: !currentStatus });
      toast.success(`Gift design ${!currentStatus ? "activated" : "deactivated"}`);
      fetchDesigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update gift design");
    }
  };

  const getOccasionIcon = (occasion?: string) => {
    switch (occasion) {
      case "birthday":
        return "🎂";
      case "anniversary":
        return "💑";
      case "wedding":
        return "💒";
      case "festival":
        return "🎊";
      case "corporate":
        return "💼";
      case "thank_you":
        return "🙏";
      case "congratulations":
        return "🎉";
      default:
        return "🎁";
    }
  };

  const getOccasionColor = (occasion?: string) => {
    switch (occasion) {
      case "birthday":
        return "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300";
      case "anniversary":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "wedding":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "festival":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "corporate":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300";
    }
  };

  const getTotalRevenue = () => designs.reduce((sum, d) => sum + d.price, 0);
  const getActiveCount = () => designs.filter(d => d.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Marketing Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gift Design Management</h1>
            <p className="text-orange-100">
              Create beautiful gift packages for every occasion
            </p>
          </div>
          <Gift className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Total Designs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {designs.length}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {getActiveCount()} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Combo Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {designs.filter(d => d.type === "combo").length}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Multi-product gifts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Single Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-900 dark:text-pink-100">
              {designs.filter(d => d.type === "single_product").length}
            </div>
            <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
              Individual gifts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              ₹{getTotalRevenue().toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Portfolio value
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
                placeholder="Search gift designs..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single_product">Single Product</SelectItem>
                <SelectItem value="combo">Combo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterOccasion} onValueChange={setFilterOccasion}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Occasions</SelectItem>
                {occasions.map(occ => (
                  <SelectItem key={occ} value={occ}>
                    {occ.charAt(0).toUpperCase() + occ.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[150px]">
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
                setSelectedDesign(null);
                setIsAddOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Design
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gift Designs Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading gift designs...</p>
          </CardContent>
        </Card>
      ) : filteredDesigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {designs.length === 0 ? "No gift designs created yet" : "No designs match your filters"}
            </p>
            {designs.length === 0 && (
              <Button onClick={() => setIsAddOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Gift Design
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDesigns.map((design) => (
            <Card key={design.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden group">
              {/* Image Section */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 overflow-hidden">
                {design.image_url ? (
                  <img
                    src={design.image_url}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-orange-300 dark:text-orange-700" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Switch
                    checked={design.is_active}
                    onCheckedChange={() => toggleDesignStatus(design.id, design.is_active)}
                    className="bg-white/90 data-[state=checked]:bg-orange-500"
                  />
                </div>
                {design.occasion && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className={`${getOccasionColor(design.occasion)} border-0`}>
                      <span className="mr-1">{getOccasionIcon(design.occasion)}</span>
                      {design.occasion.charAt(0).toUpperCase() + design.occasion.slice(1).replace("_", " ")}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{design.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={design.type === "combo" ? "default" : "secondary"} className="text-xs">
                        {design.type === "combo" ? "Combo Package" : "Single Product"}
                      </Badge>
                      <Badge variant={design.is_active ? "default" : "secondary"} className="text-xs">
                        {design.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{design.price.toLocaleString()}
                </div>

                {design.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {design.description}
                  </p>
                )}

                {design.wrapping_options && design.wrapping_options.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>{design.wrapping_options.length} wrapping options</span>
                  </div>
                )}

                {design.card_message && (
                  <div className="text-xs text-muted-foreground italic line-clamp-1">
                    "{design.card_message}"
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedDesign(design);
                      setFormData({
                        name: design.name,
                        type: design.type,
                        price: design.price,
                        image_url: design.image_url || "",
                        description: design.description || "",
                        wrapping_options: design.wrapping_options || [],
                        card_message: design.card_message || "",
                        occasion: design.occasion || "",
                        is_active: design.is_active,
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
                      setSelectedDesign(design);
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
          setSelectedDesign(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDesign ? "Edit Gift Design" : "Create New Gift Design"}</DialogTitle>
            <DialogDescription>
              {selectedDesign ? "Update gift design details" : "Add a new pre-designed gift package"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gift Name *</Label>
              <Input
                placeholder="e.g., Festive Sattu Combo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_product">Single Product</SelectItem>
                    <SelectItem value="combo">Combo Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 999"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select value={formData.occasion} onValueChange={(v) => setFormData({ ...formData, occasion: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map(occ => (
                    <SelectItem key={occ} value={occ}>
                      {getOccasionIcon(occ)} {occ.charAt(0).toUpperCase() + occ.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your gift package..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Card Message</Label>
              <Textarea
                placeholder="Default message for gift card..."
                value={formData.card_message}
                onChange={(e) => setFormData({ ...formData, card_message: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Wrapping Options (comma separated)</Label>
              <Input
                placeholder="e.g., Premium Box, Eco-Friendly Bag, Traditional Cloth"
                value={formData.wrapping_options.join(", ")}
                onChange={(e) => setFormData({ ...formData, wrapping_options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
              />
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
              setSelectedDesign(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
              {selectedDesign ? "Update Design" : "Create Design"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gift Design</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gift design? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Design: <strong>{selectedDesign?.name}</strong>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteDesign}>
              Delete Design
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
