import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/api/products";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  price: z.number().min(0, "Price must be positive"),
  original_price: z.number().min(0, "Original price must be positive").optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(1000),
  image_url: z.string().url("Must be a valid URL").optional(),
  in_stock: z.boolean(),
  ingredients: z.string().optional(),
  usage: z.string().optional(),
  benefits: z.array(z.string()).optional(),
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
      image_url: product?.image_url || "",
      in_stock: product?.in_stock ?? true,
      ingredients: product?.ingredients || "",
      usage: product?.usage || "",
      benefits: product?.benefits
        ? Array.isArray(product.benefits)
          ? product.benefits
          : String(product.benefits).split(",").map((b: string) => b.trim()).filter(Boolean)
        : [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "benefits",
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        name: data.name,
        price: data.price,
        original_price: data.original_price,
        category: data.category,
        description: data.description,
        image_url: data.image_url,
        in_stock: data.in_stock,
        ingredients: data.ingredients,
        usage: data.usage,
        // benefits: send as array (filter out empty values)
        benefits: data.benefits ? data.benefits.filter(Boolean) : [],
        // also provide a comma-separated fallback if backend expects CSV
        benefits_csv: data.benefits ? data.benefits.filter(Boolean).join(",") : "",
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
          value={form.watch("category")}
          onValueChange={(value) => form.setValue("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sattu Powder">Sattu Powder</SelectItem>
            <SelectItem value="Ready to Drink">Ready to Drink</SelectItem>
            <SelectItem value="Snacks & Ladoo">Snacks & Ladoo</SelectItem>
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
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          {...form.register("image_url")}
          placeholder="https://example.com/image.jpg"
        />
        {form.formState.errors.image_url && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.image_url.message}</p>
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
                defaultValue={field as any}
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
    </form>
  );
}
