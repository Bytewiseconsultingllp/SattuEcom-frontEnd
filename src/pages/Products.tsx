import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/api/products";
import { getCategories, type Category } from "@/lib/api/categories";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, X, Filter, Leaf, Package, TrendingUp, Grid3x3, LayoutGrid } from "lucide-react";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when page or page size changes
  useEffect(() => {
    getAllProducts();
  }, [currentPage, pageSize]);

  async function fetchCategories() {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      // Don't show error toast for categories - it's not critical
    }
  }

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

  // Use categories from API instead of deriving from current page products
  const derivedCategories = [
    "All Products",
    ...categories.map(cat => cat.name)
  ];

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
        {/* Hero Section with Gradient Background */}
        {/* <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-20">
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl" />
            <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4" data-animate="true">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
                <Leaf className="h-4 w-4 text-lime-300" />
                <span className="text-sm font-semibold uppercase tracking-wider text-lime-100">Premium Collection</span>
              </div>

              
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Discover Our <span className="text-lime-300">Products</span>
              </h1>

              
              <p className="text-xl text-emerald-100/90 leading-relaxed max-w-2xl mx-auto">
                Explore our range of premium sattu and millet products, crafted with 100% natural ingredients 
                and traditional methods for modern nutrition.
              </p>

              
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto" data-gsap-stagger data-stagger="center">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="text-3xl font-bold text-lime-300">{totalProducts}+</div>
                  <div className="text-sm text-emerald-100/80 mt-1">Products</div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="text-3xl font-bold text-lime-300">100%</div>
                  <div className="text-sm text-emerald-100/80 mt-1">Natural</div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <div className="text-3xl font-bold text-lime-300">50K+</div>
                  <div className="text-sm text-emerald-100/80 mt-1">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Main Content Section */}
        <div className="relative bg-gradient-to-b from-emerald-50 via-lime-50/30 to-white py-12">
          <div className="container mx-auto px-4">
            {/* Search Bar with Enhanced Design */}
            <div className="mb-8" data-animate="true">
              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <Input
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-12 pr-12 py-3 h-14 text-base bg-white border-2 border-emerald-200 focus:border-emerald-500 rounded-2xl shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar with Modern Design */}
            <aside className="lg:col-span-1">
              {/* Mobile Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full mb-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
                <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-100 sticky top-24" data-animate="true">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                      <Filter className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-900">Filters</h2>
                  </div>

                  {/* Categories */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-600" />
                      Categories
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {derivedCategories.map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          className={`w-full justify-start transition-all ${
                            selectedCategory === category 
                              ? "bg-gradient-to-r from-emerald-600 to-lime-600 text-white hover:from-emerald-700 hover:to-lime-700" 
                              : "hover:bg-emerald-50 text-emerald-700"
                          }`}
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      Price Range
                    </h3>
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        max={1000}
                        step={50}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm font-semibold text-emerald-700">
                        <span className="bg-white px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
                        <span className="bg-white px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-4">Availability</h3>
                    <div className="flex items-center space-x-3 bg-emerald-50 p-3 rounded-2xl">
                      <Checkbox 
                        id="in_stock" 
                        checked={in_stockOnly}
                        onCheckedChange={handleStockChange}
                        className="border-emerald-600"
                      />
                      <Label htmlFor="in_stock" className="cursor-pointer text-emerald-700 font-medium">
                        In Stock Only
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Enhanced Header with count, view mode, and page size */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-emerald-100 mb-6" data-animate="true">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-emerald-900 font-semibold text-lg">
                      Showing {filteredProducts.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                    </p>
                    {searchQuery && (
                      <p className="text-sm text-emerald-600 mt-1">
                        Search results for: <span className="font-bold text-emerald-800">"{searchQuery}"</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-xl">
                      <Button
                        size="sm"
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-emerald-100"}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === "list" ? "default" : "ghost"}
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-emerald-100"}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Page Size Selector */}
                    <Select value={pageSize.toString()} onValueChange={(val) => {
                      setPageSize(parseInt(val));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px] border-2 border-emerald-200 focus:border-emerald-500">
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
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <div key={i} className="animate-fade-in">
                      <Skeleton className="h-64 w-full rounded-2xl mb-3 bg-emerald-100" />
                      <Skeleton className="h-5 w-2/3 mb-2 bg-emerald-100" />
                      <Skeleton className="h-4 w-1/3 mb-4 bg-emerald-100" />
                      <Skeleton className="h-10 w-full bg-emerald-100" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div 
                    className={`gap-6 mb-8 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"}`}
                    data-gsap-stagger 
                    data-stagger="start"
                  >
                    {filteredProducts.map(product => (
                      <div 
                        key={product._id} 
                        className="cursor-pointer group"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-emerald-100" data-animate="true">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-emerald-700">
                          Page {currentPage} of {totalPages}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
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
                                    <span className="px-2 text-emerald-400">...</span>
                                  )}
                                  <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 ${
                                      currentPage === page 
                                        ? "bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700" 
                                        : "border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    }`}
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
                            className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16" data-animate="true">
                  <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-lg border-2 border-emerald-100">
                    <Package className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-emerald-900 text-xl font-semibold mb-2">
                      No Products Found
                    </p>
                    <p className="text-emerald-600">
                      {searchQuery 
                        ? `No products found matching "${searchQuery}"`
                        : "No products found matching your filters."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
