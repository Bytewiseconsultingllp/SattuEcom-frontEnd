import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface ProductDetailsModalProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({
  product,
  open,
  onOpenChange,
}: ProductDetailsModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.image_url && (
            <div className="w-full">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div>
            <Label>Product Name</Label>
            <p className="text-sm mt-1">{product.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price</Label>
              <p className="text-sm mt-1 font-semibold text-primary">
                ₹{product.price}
              </p>
            </div>
            {product.originalPrice && (
              <div>
                <Label>Original Price</Label>
                <p className="text-sm mt-1 line-through text-muted-foreground">
                  ₹{product.originalPrice}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>Category</Label>
            <div className="mt-1">
              <Badge variant="outline">{product.category}</Badge>
            </div>
          </div>

          <div>
            <Label>Stock Status</Label>
            <div className="mt-1">
              <Badge variant={product.in_stock ? "default" : "destructive"}>
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <p className="text-sm mt-1">{product.description}</p>
          </div>

          {product.ingredients && (
            <div>
              <Label>Ingredients</Label>
              <p className="text-sm mt-1">{product.ingredients}</p>
            </div>
          )}

          {product.usage && (
            <div>
              <Label>Usage Instructions</Label>
              <p className="text-sm mt-1">{product.usage}</p>
            </div>
          )}

          {product.benefits && Array.isArray(product.benefits) && (
            <div>
              <Label>Benefits</Label>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                {product.benefits.map((benefit: string, index: number) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {product.rating !== undefined && product.rating !== null && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rating</Label>
                <p className="text-sm mt-1">⭐ {product.rating}</p>
              </div>
              {product.reviews_count !== undefined &&
                product.reviews_count !== null && (
                  <div>
                    <Label>Reviews</Label>
                    <p className="text-sm mt-1">
                      {product.reviews_count} reviews
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
