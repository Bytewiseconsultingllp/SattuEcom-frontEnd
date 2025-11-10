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
import { Plus, Edit, Trash2, Gift } from "lucide-react";
import { toast } from "sonner";
import {
  createGiftDesign,
  updateGiftDesign,
  deleteGiftDesign,
  toggleGiftDesignStatus,
  getAllAdminGiftDesigns,
  type GiftDesign,
  type GiftDesignType,
} from "@/lib/api/gifts";
import { Textarea } from "../ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";

const giftDesignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["single_product", "combo"]),
  price: z.string().min(1, "Price is required"),
  product_id: z.string().optional(),
  product_quantity: z.string().optional(),
  combo_items: z.string().optional(), // JSON string of combo items
  image_url: z.string().optional(),
  wrapping_style: z.string().optional(),
  includes_card: z.boolean().default(true),
  card_message_template: z.string().optional(),
  stock_available: z.string().optional(),
  tags: z.string().optional(),
  is_active: z.boolean().default(true),
});

type GiftDesignFormData = z.infer<typeof giftDesignSchema>;

const defaultValues: GiftDesignFormData = {
  name: "",
  description: "",
  type: "single_product",
  price: "",
  product_id: "",
  product_quantity: "1",
  combo_items: "",
  image_url: "",
  wrapping_style: "standard",
  includes_card: true,
  card_message_template: "",
  stock_available: "-1",
  tags: "",
  is_active: true,
};

function AdminGiftDesignPage() {
  const [designs, setDesigns] = useState<GiftDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<GiftDesign | null>(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState<"all" | GiftDesignType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const form = useForm<GiftDesignFormData>({
    resolver: zodResolver(giftDesignSchema),
    defaultValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  async function fetchDesigns() {
    try {
      setLoading(true);
      const res = await getAllAdminGiftDesigns();
      if (res.success) {
        setDesigns(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch gift designs");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    form.reset(defaultValues);
  }

  function handleEdit(design: GiftDesign) {
    setSelectedDesign(design);
    form.reset({
      name: design.name,
      description: design.description || "",
      type: design.type,
      price: String(design.price),
      product_id: design.product_id || "",
      product_quantity: String(design.product_quantity || 1),
      combo_items: design.combo_items ? JSON.stringify(design.combo_items) : "",
      image_url: design.image_url || "",
      wrapping_style: design.wrapping_style || "standard",
      includes_card: design.includes_card !== false,
      card_message_template: design.card_message_template || "",
      stock_available: String(design.stock_available ?? -1),
      tags: design.tags?.join(", ") || "",
      is_active: design.is_active,
    });
    setIsEditOpen(true);
  }

  async function onSubmit(values: GiftDesignFormData) {
    try {
      const price = Number(values.price);
      if (!price || price <= 0) {
        toast.error("Price must be greater than 0");
        return;
      }

      const payload: any = {
        name: values.name.trim(),
        description: values.description?.trim(),
        type: values.type,
        price,
        image_url: values.image_url?.trim(),
        wrapping_style: values.wrapping_style,
        includes_card: values.includes_card,
        card_message_template: values.card_message_template?.trim(),
        stock_available: values.stock_available ? Number(values.stock_available) : -1,
        tags: values.tags ? values.tags.split(",").map(t => t.trim()) : [],
        is_active: values.is_active,
      };

      if (values.type === "single_product") {
        if (!values.product_id) {
          toast.error("Product ID is required for single product gifts");
          return;
        }
        payload.product_id = values.product_id;
        payload.product_quantity = values.product_quantity ? Number(values.product_quantity) : 1;
      } else {
        if (!values.combo_items) {
          toast.error("Combo items are required for combo gifts");
          return;
        }
        try {
          payload.combo_items = JSON.parse(values.combo_items);
        } catch {
          toast.error("Invalid combo items format. Use JSON array.");
          return;
        }
      }

      if (selectedDesign) {
        const res = await updateGiftDesign(selectedDesign.id, payload);
        if (res.success) {
          toast.success("Gift design updated successfully");
          setIsEditOpen(false);
          setSelectedDesign(null);
          resetForm();
          fetchDesigns();
        }
      } else {
        const res = await createGiftDesign(payload as any);
        if (res.success) {
          toast.success("Gift design created successfully");
          setIsAddOpen(false);
          resetForm();
          fetchDesigns();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save gift design");
    }
  }

  async function handleDelete(designId: string) {
    if (!confirm("Are you sure you want to delete this gift design?")) return;

    try {
      const res = await deleteGiftDesign(designId);
      if (res.success) {
        toast.success("Gift design deleted successfully");
        fetchDesigns();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete gift design");
    }
  }

  async function handleToggleStatus(designId: string, currentStatus: boolean) {
    try {
      const res = await toggleGiftDesignStatus(designId, !currentStatus);
      if (res.success) {
        toast.success(`Gift design ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchDesigns();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update gift design status");
    }
  }

  const GiftDesignForm = () => {
    const designType = form.watch("type");

    return (
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gift Design Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Premium Rose Bouquet" {...field} />
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
                <FormLabel>Gift Type *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single_product">Single Product</SelectItem>
                    <SelectItem value="combo">Combo Gift</SelectItem>
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
                  <Textarea placeholder="Describe this gift design..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {designType === "single_product" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="MongoDB product ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {designType === "combo" && (
            <FormField
              control={form.control}
              name="combo_items"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Combo Items (JSON) *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='[{"product_id": "id1", "quantity": 2}, {"product_id": "id2", "quantity": 1}]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wrapping_style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wrapping Style</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="eco-friendly">Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includes_card"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <FormLabel className="!m-0">Includes Gift Card</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="card_message_template"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Message Template</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Happy Birthday! Wishing you joy and happiness..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_available"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Available (-1 = unlimited)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="-1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., birthday, romantic, premium" {...field} />
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
                if (selectedDesign) {
                  setIsEditOpen(false);
                  setSelectedDesign(null);
                } else {
                  setIsAddOpen(false);
                }
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{selectedDesign ? "Update" : "Create"} Gift Design</Button>
          </div>
        </form>
      </Form>
    );
  };

  const filteredDesigns = useMemo(() => {
    return designs.filter((d) => {
      const matchesName = searchName.trim() ? d.name.toLowerCase().includes(searchName.trim().toLowerCase()) : true;
      const matchesType = filterType === "all" ? true : d.type === filterType;
      const matchesStatus = filterStatus === "all" ? true : filterStatus === "active" ? d.is_active : !d.is_active;
      return matchesName && matchesType && matchesStatus;
    });
  }, [designs, searchName, filterType, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gift Design Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredDesigns.length} gift design{filteredDesigns.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setSelectedDesign(null);
            setIsAddOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Gift Design
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="single_product">Single Product</SelectItem>
            <SelectItem value="combo">Combo</SelectItem>
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
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSearchName("");
              setFilterType("all");
              setFilterStatus("all");
            }}
          >
            Reset
          </Button>
          <Button variant="outline" className="flex-1" onClick={fetchDesigns}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Gift Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">Loading gift designs...</p>
        ) : filteredDesigns.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No gift designs created yet. Create your first gift design!
          </p>
        ) : (
          filteredDesigns.map((design) => (
            <Card key={design.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <CardTitle className="text-lg">{design.name}</CardTitle>
                  </div>
                  <Badge variant={design.is_active ? "default" : "secondary"}>
                    {design.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium text-primary">₹{design.price}</p>

                {design.image_url && (
                  <img src={design.image_url} alt={design.name} className="w-full h-32 object-cover rounded" />
                )}

                <p className="text-xs text-muted-foreground">
                  Type: <span className="capitalize">{design.type.replace("_", " ")}</span>
                </p>

                {design.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{design.description}</p>
                )}

                {design.wrapping_style && (
                  <p className="text-xs text-muted-foreground">
                    Wrapping: <span className="capitalize">{design.wrapping_style}</span>
                  </p>
                )}

                {design.tags && design.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {design.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(design)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(design.id, design.is_active)}
                  >
                    {design.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(design.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Gift Design Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Gift Design</DialogTitle>
          </DialogHeader>
          <GiftDesignForm />
        </DialogContent>
      </Dialog>

      {/* Edit Gift Design Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gift Design</DialogTitle>
          </DialogHeader>
          <GiftDesignForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminGiftDesignPage;
