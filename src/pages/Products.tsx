import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/api/products";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [in_stockOnly, setIn_StockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getAllProducts();
  }, [currentPage, pageSize]);

  async function getAllProducts() {
    try {
      setIsLoading(true);
      const response = await getProducts(currentPage, pageSize);
      if (response.success) {
        setAllProducts(response.data || []);
        setTotalProducts(response.total || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error: any) {
      toast.error("Error fetching products");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter products based on all criteria
  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = selectedCategory === "All Products" || product.category === selectedCategory;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    const stockMatch = !in_stockOnly || product.in_stock;
    const searchMatch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && priceMatch && stockMatch && searchMatch;
  });

  // Handle product click to navigate to details page
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    handleFilterChange();
  };

  const handlePriceChange = (range: number[]) => {
    setPriceRange(range);
    handleFilterChange();
  };

  const handleStockChange = (checked: boolean) => {
    setIn_StockOnly(checked);
    handleFilterChange();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleFilterChange();
  };

  const clearSearch = () => {
    setSearchQuery("");
    handleFilterChange();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Our Products</h1>
            <p className="text-lg text-primary-foreground/90">Discover our range of premium sattu products</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Filters</h2>

                {/* Categories */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={1000}
                    step={50}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-semibold mb-4">Availability</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in_stock" 
                      checked={in_stockOnly}
                      onCheckedChange={handleStockChange}
                    />
                    <Label htmlFor="in_stock" className="cursor-pointer">In Stock Only</Label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Header with count and page size selector */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-muted-foreground">
                    Showing {filteredProducts.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Search results for: <span className="font-semibold text-foreground">"{searchQuery}"</span>
                    </p>
                  )}
                </div>
                <Select value={pageSize.toString()} onValueChange={(val) => {
                  setPageSize(parseInt(val));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 per page</SelectItem>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <div key={i} className="animate-fade-in">
                      <Skeleton className="h-64 w-full rounded-lg mb-3" />
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/3 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {filteredProducts.map(product => (
                      <div 
                        key={product._id} 
                        className="animate-fade-in cursor-pointer"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-8 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        {/* Page numbers */}
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
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {searchQuery 
                      ? `No products found matching "${searchQuery}"`
                      : "No products found matching your filters."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
