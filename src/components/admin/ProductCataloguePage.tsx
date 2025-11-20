import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Grid3x3,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { getProducts, deleteAProduct } from "@/lib/api/products";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/ProductForm";

export function ProductCataloguePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const allProducts: any[] = [];
      let page = 1;
      const limit = 100;
      let totalPages = 1;

      do {
        const response: any = await getProducts(page, limit);

        if (response?.success) {
          const pageData = Array.isArray(response.data) ? response.data : [];
          allProducts.push(...pageData);
          totalPages = response.totalPages || 1;
        } else if (Array.isArray(response)) {
          // Fallback in case API returns a bare array (legacy behavior)
          allProducts.push(...response);
          totalPages = 1;
        } else if (response?.data && Array.isArray(response.data)) {
          allProducts.push(...response.data);
          totalPages = 1;
        } else {
          totalPages = 1;
        }

        page += 1;
      } while (page <= totalPages);

      setProducts(allProducts);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast.error(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteAProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const exportToExcel = () => {
    try {
      // Group products by category
      const categorizedData: any = {};
      
      products.forEach((product) => {
        const category = product.category || "Uncategorized";
        if (!categorizedData[category]) {
          categorizedData[category] = [];
        }
        categorizedData[category].push({
          ID: product.id,
          Name: product.name,
          Category: product.category,
          Price: product.price,
          
          Description: product.description || "",
        });
      });

      // Create CSV content
      let csvContent = "";
      
      Object.keys(categorizedData).forEach((category) => {
        csvContent += `\n${category}\n`;
        csvContent += "ID,Name,Category,Price,Description\n";
        
        categorizedData[category].forEach((product: any) => {
          csvContent += `${product.ID},"${product.Name}",${product.Category},${product.Price},"${product.Description}"\n`;
        });
      });

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `products_catalogue_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Products exported successfully");
    } catch (error) {
      toast.error("Failed to export products");
    }
  };

  const categories = Array.from(
    new Set(Array.isArray(products) ? products.map((p) => p.category).filter(Boolean) : [])
  );

  const filteredProducts = Array.isArray(products) ? products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    if (!Array.isArray(products)) return stats;
    products.forEach((product) => {
      const category = product.category || "Uncategorized";
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  };

  const getPriceStats = () => {
    if (!Array.isArray(products) || products.length === 0) {
      return { average: 0, min: 0, max: 0 };
    }

    let sum = 0;
    let min = Number(products[0]?.price) || 0;
    let max = Number(products[0]?.price) || 0;

    products.forEach((product) => {
      const price = Number(product.price) || 0;
      sum += price;
      if (price < min) min = price;
      if (price > max) max = price;
    });

    return {
      average: sum / products.length,
      min,
      max,
    };
  };

  const categoryStats = getCategoryStats();
  const priceStats = getPriceStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Product Catalogue</h1>
            <p className="text-indigo-100">
              Manage products organized by categories
            </p>
          </div>
          <Package className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{Array.isArray(products) ? products.length : 0}</p>
              </div>
              <Package className="h-10 w-10 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Grid3x3 className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(priceStats.average || 0)}
                </p>
              </div>
              <Package className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(priceStats.max || 0)}
                </p>
              </div>
              <Package className="h-10 w-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category} ({categoryStats[category]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Sections */}
      {selectedCategory === "all" ? (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (p) => p.category === category
            );

            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Grid3x3 className="h-5 w-5" />
                      {category}
                      <Badge variant="secondary">{categoryProducts.length}</Badge>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full" opts={{ align: "start" }}>
                    <CarouselContent>
                      {categoryProducts.map((product) => (
                        <CarouselItem
                          key={product.id}
                          className="basis-full md:basis-1/2 lg:basis-1/4"
                        >
                          <Card className="overflow-hidden group h-full flex flex-col">
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img
                                src={
                                  product.images?.[0] ||
                                  product.thumbnail ||
                                  "/placeholder.svg"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <CardContent className="p-3 flex-1 flex flex-col">
                              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                {product.name}
                              </h3>
                              <p className="text-lg font-bold text-primary mb-2">
                                {formatCurrency(product.price)}
                              </p>
                              
                              <div className="mt-auto flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowProductDialog(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowProductForm(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {categoryProducts.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              {selectedCategory}
              <Badge variant="secondary">{filteredProducts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={
                        product.images?.[0] ||
                        product.thumbnail ||
                        "/placeholder.svg"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <CardContent className="p-2">
                    <h3 className="font-semibold text-xs line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-primary mb-1">
                      {formatCurrency(product.price)}
                    </p>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 px-1"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 px-1"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 px-1"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Details Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={selectedProduct.images?.[0] || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Product Name</p>
                    <p className="font-semibold">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedProduct.price)}</p>
                  </div>
                  
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog (Add/Edit) */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={() => {
              setShowProductForm(false);
              setEditingProduct(null);
              fetchProducts();
            }}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
