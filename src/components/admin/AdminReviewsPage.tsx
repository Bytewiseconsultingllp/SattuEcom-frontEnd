import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Eye, EyeOff, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { getAllReviews, toggleReviewVisibility, deleteReviewAsAdmin, type Review } from "@/lib/api/reviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await getAllReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleVisibility(reviewId: string, currentlyHidden: boolean) {
    try {
      const res = await toggleReviewVisibility(reviewId, !currentlyHidden);
      if (res.success) {
        toast.success(currentlyHidden ? "Review is now visible" : "Review hidden successfully");
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update review visibility");
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    
    try {
      const res = await deleteReviewAsAdmin(reviewId);
      if (res.success) {
        toast.success("Review deleted successfully");
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  }

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      (review.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVisibility = 
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && !review.is_hidden) ||
      (visibilityFilter === "hidden" && review.is_hidden);
    
    const matchesRating = 
      ratingFilter === "all" || 
      review.rating === Number(ratingFilter);
    
    return matchesSearch && matchesVisibility && matchesRating;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Marketing Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Management</h1>
            <p className="text-orange-100">
              Manage customer reviews and feedback
            </p>
          </div>
          <Star className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
            <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Customer Reviews</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Monitor and manage all customer reviews. You can toggle visibility or delete inappropriate reviews. Positive reviews help build trust with potential customers.
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{filteredReviews.length}</span>
                <span className="text-orange-600 dark:text-orange-400">Total Reviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{reviews.filter(r => !r.is_hidden).length}</span>
                <span className="text-orange-600 dark:text-orange-400">Visible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{reviews.filter(r => r.is_hidden).length}</span>
                <span className="text-orange-600 dark:text-orange-400">Hidden</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-sm text-muted-foreground p-6">Loading reviews...</p>
          ) : filteredReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              {reviews.length === 0 ? "No reviews yet" : "No reviews match your filters"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {review.product?.images?.[0] && (
                            <img 
                              src={review.product.images[0]} 
                              alt={review.product.name} 
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium text-sm">{review.product?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{review.user?.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{review.user?.email || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <p className="max-w-[200px] truncate text-sm">
                                {review.comment || 'No comment'}
                              </p>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Product</p>
                                <p className="text-sm text-muted-foreground">{review.product?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Customer</p>
                                <p className="text-sm text-muted-foreground">
                                  {review.user?.full_name} ({review.user?.email})
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Rating</p>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Comment</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {review.comment || 'No comment provided'}
                                </p>
                              </div>
                              {review.images && review.images.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Images</p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {review.images.map((img, idx) => (
                                      <img 
                                        key={idx} 
                                        src={img} 
                                        alt={`Review ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium mb-1">Date</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.is_hidden ? "destructive" : "default"}>
                          {review.is_hidden ? "Hidden" : "Visible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVisibility(review.id, review.is_hidden || false)}
                            title={review.is_hidden ? "Show review" : "Hide review"}
                          >
                            {review.is_hidden ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(review.id)}
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminReviewsPage;
