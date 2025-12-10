import { useEffect, useState } from "react";
import { Star, Eye, EyeOff, Trash2, Search, Filter, TrendingUp, MessageSquare, ThumbsUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

interface Review {
  id: string;
  product?: { name: string; images?: string[] };
  user?: { name: string; email: string };
  rating: number;
  comment?: string;
  is_hidden: boolean;
  created_at: string;
}

export default function ModernReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchQuery, visibilityFilter, ratingFilter, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/reviews");
      // Backend returns { success: true, data: [...] }
      setReviews(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (visibilityFilter !== "all") {
      filtered = filtered.filter((r) =>
        visibilityFilter === "visible" ? !r.is_hidden : r.is_hidden
      );
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter((r) => r.rating === parseInt(ratingFilter));
    }

    setFilteredReviews(filtered);
  };

  const toggleVisibility = async (reviewId: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/admin/reviews/${reviewId}/visibility`, {
        is_hidden: !currentStatus,
      });
      toast.success(`Review ${!currentStatus ? "hidden" : "shown"} successfully`);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update review");
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await axiosInstance.delete(`/admin/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      dist[r.rating as keyof typeof dist]++;
    });
    return dist;
  };

  const ratingDist = getRatingDistribution();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Marketing Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Management</h1>
            <p className="text-orange-100">
              Monitor customer feedback and build trust
            </p>
          </div>
          <Star className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {reviews.length}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              All time feedback
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {reviews.filter((r) => !r.is_hidden).length}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Public reviews
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {getAverageRating()}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              5 Star Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
              {ratingDist[5]}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Excellent ratings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDist[rating as keyof typeof ratingDist] / reviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {ratingDist[rating as keyof typeof ratingDist]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, customer, or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="visible">Visible Only</SelectItem>
                <SelectItem value="hidden">Hidden Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setVisibilityFilter("all");
                setRatingFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading reviews...</p>
          </CardContent>
        </Card>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {reviews.length === 0 ? "No reviews yet" : "No reviews match your filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Product Image */}
                  {review.product?.images?.[0] && (
                    <div className="flex-shrink-0">
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {review.product?.name || "Unknown Product"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={review.is_hidden ? "secondary" : "default"}>
                          {review.is_hidden ? "Hidden" : "Visible"}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {review.comment}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVisibility(review.id, review.is_hidden)}
                      >
                        {review.is_hidden ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Deleting customer reviews may impact your store's credibility.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedReview && deleteReview(selectedReview.id)}
            >
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
