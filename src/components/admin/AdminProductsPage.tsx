import { useEffect, useState } from "react";
import { Button } from "../ui/button";

import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ProductDetailsModal } from "./ProductDetailsModal";
import { ProductForm } from "./ProductForm";
import { Badge } from "../ui/badge";
import { deleteAProduct, getProducts } from "@/lib/api/products";
import { toast } from "sonner";

function AdminProductsPage() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts();
  }, []);

  async function getAllProducts() {
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error: any) {
      toast.error("Error Fetching the Products");
    }
  }

  async function handleProductDelete(productId: string) {
    
    try{
        const response = await deleteAProduct(productId);
        if(response.success) {
            toast.success("Product Deleted Successfully");
            getAllProducts();
        }
    } catch (error: any) {
      toast.error("Error in deleting the Product");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {products.length !== undefined && products.length !== null && <p>No Products, Add a product</p>}
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline">{product.category}</Badge>
                      <span className="text-sm font-bold text-primary">
                        ₹{product.price}
                      </span>
                      <Badge
                        variant={product.in_stock ? "default" : "destructive"}
                      >
                        {product.in_stock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsViewProductOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditProductOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleProductDelete(product.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div> 
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={() => {
              getAllProducts(); // Refresh product list
              setIsAddProductOpen(false);
            }}
            onCancel={() => setIsAddProductOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSuccess={() => {
              getAllProducts(); // Refresh product list
              setIsEditProductOpen(false);
              setSelectedProduct(null);
            }}
            onCancel={() => {
              setIsEditProductOpen(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Product Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        open={isViewProductOpen}
        onOpenChange={(open) => {
          setIsViewProductOpen(open);
          if (!open) setSelectedProduct(null);
        }}
      />
    </div>
  );
}

export default AdminProductsPage;
