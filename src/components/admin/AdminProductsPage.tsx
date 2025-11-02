import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ProductDetailsModal } from "./ProductDetailsModal";
import { ProductForm } from "./ProductForm";
import { Badge } from "../ui/badge";
import { deleteAProduct, getProducts } from "@/lib/api/products";
import { toast } from "sonner";
import { getCategories } from "@/lib/api/categories";

function AdminProductsPage() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("none");

  useEffect(() => {
    getAllProducts();
    getAllCategories();
  }, []);

  async function getAllCategories() {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching categories");
    }
  }

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
    if (!confirm("Are you sure you want to delete this product?")) return;
    
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

  // Filter and search logic
  const filteredProducts = products.filter((product: any) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    // Stock filter
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in_stock" && product.in_stock) ||
                        (stockFilter === "out_of_stock" && !product.in_stock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (priceSort === "low_to_high") return a.price - b.price;
    if (priceSort === "high_to_low") return b.price - a.price;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter, priceSort]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Sort */}
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default</SelectItem>
                <SelectItem value="low_to_high">Price: Low to High</SelectItem>
                <SelectItem value="high_to_low">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {paginatedProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {products.length === 0 ? "No products found. Add your first product!" : "No products match your filters."}
              </p>
            ) : (
              paginatedProducts.map((product) => {
                return (
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
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length}
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
