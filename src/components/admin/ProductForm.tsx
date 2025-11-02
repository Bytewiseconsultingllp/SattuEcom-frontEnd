import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/api/products";
import { useState, useEffect } from "react";
import { getCategories as apiGetCategories, createCategory as apiCreateCategory, type Category as ApiCategory } from "@/lib/api/categories";
import { Loader2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  price: z.number().min(0, "Price must be positive"),
  original_price: z.number().min(0, "Original price must be positive").optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(1000),
  images: z.array(z.string()).min(1, "At least one image is required"),
  in_stock: z.boolean(),
  ingredients: z.string().optional(),
  usage: z.string().optional(),
  benefits: z.array(z.string()).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      original_price: product?.original_price || undefined,
      category: product?.category || "",
      description: product?.description || "",
      images: Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : [],
      in_stock: product?.in_stock ?? true,
      ingredients: product?.ingredients || "",
      usage: product?.usage || "",
      benefits: product?.benefits
        ? Array.isArray(product.benefits)
          ? product.benefits
          : String(product.benefits).split(",").map((b: string) => b.trim()).filter(Boolean)
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "benefits",
  });

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const res = await apiGetCategories();
        if (res?.success) {
          setCategories(res.data || []);
          // If editing and product has a category not in the list, prepend it
          const current = form.getValues("category");
          if (current && !(res.data || []).some((c) => c.name === current)) {
            setCategories((prev) => [{ id: "local", name: current }, ...prev]);
          }
        }
      } catch (e: any) {
        setCategoriesError(e?.message || "Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        name: data.name,
        price: data.price,
        original_price: data.original_price,
        category: data.category,
        description: data.description,
        images: data.images,
        in_stock: data.in_stock,
        ingredients: data.ingredients,
        usage: data.usage,
        benefits: data.benefits ? data.benefits.filter(Boolean) : [],
      };

      if (isEdit) {
        await updateProduct(product.id, productData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product added successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(isEdit ? "Failed to update product" : "Failed to add product");
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Enter product name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register("price", { valueAsNumber: true })}
            placeholder="299"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="original-price">Original Price (₹)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            {...form.register("original_price", { valueAsNumber: true })}
            placeholder="399"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={form.watch("category") || ""}
          onValueChange={(value) => {
            if (value === "__add__") {
              setShowCategoryModal(true);
              return;
            }
            form.setValue("category", value, { shouldValidate: true });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__add__">+ Add new category</SelectItem>
            {categoriesLoading && (
              <div className="px-2 py-1 text-sm text-muted-foreground">Loading...</div>
            )}
            {(!categoriesLoading && categoriesError) && (
              <div className="px-2 py-1 text-sm text-destructive">{categoriesError}</div>
            )}
            {(!categoriesLoading && !categoriesError) && categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Product description"
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <Label>Product Images</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload up to 5 images. The first image will be the primary image.
        </p>
        <ImageUpload
          value={form.watch("images")}
          onChange={(images) => form.setValue("images", images, { shouldValidate: true })}
          maxImages={5}
        />
        {form.formState.errors.images && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.images.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="ingredients">Ingredients</Label>
        <Textarea
          id="ingredients"
          {...form.register("ingredients")}
          placeholder="List ingredients"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="usage">Usage Instructions</Label>
        <Textarea
          id="usage"
          {...form.register("usage")}
          placeholder="How to use this product"
          rows={2}
        />
      </div>

      <div>
        <Label>Benefits</Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                {...form.register(`benefits.${index}` as const)}
                placeholder={`Benefit ${index + 1}`}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                className="h-9"
              >
                Remove
              </Button>
            </div>
          ))}

          <Button type="button" onClick={() => append("")}>Add Benefit</Button>
        </div>
      </div>

      <div>
        <Label htmlFor="in_stock">Stock Status</Label>
        <Select
          value={form.watch("in_stock").toString()}
          onValueChange={(value) => form.setValue("in_stock", value === "true")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">In Stock</SelectItem>
            <SelectItem value="false">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Update Product" : "Add Product"}
        </Button>
      </div>

      {/* Add Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Enter a name for the new category. It will be available immediately after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-category">Category Name</Label>
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Organic Products"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCreatingCategory) {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategoryName("");
              }}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );

  async function handleCreateCategory() {
    const val = newCategoryName.trim();
    if (!val) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const created = await apiCreateCategory(val);
      const cat = created?.data || { id: crypto.randomUUID?.() || val, name: val };
      
      // Add to categories list if not already present
      setCategories((prev) => {
        if (prev.some((c) => c.name === cat.name)) {
          return prev;
        }
        return [cat, ...prev];
      });
      
      // Set the newly created category as selected
      form.setValue("category", cat.name, { shouldValidate: true });
      
      toast.success("Category created successfully");
      setShowCategoryModal(false);
      setNewCategoryName("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  }
}
