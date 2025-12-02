import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUserCookie } from '@/utils/cookie';
import { createReview, deleteReview, getProductReviewSummary, getProductReviews, hasUserReviewed, updateReview, type Review } from '@/lib/api/reviews';
import { uploadReviewImages } from '@/lib/api/upload';
import { Loader2, Star as StarIcon, MessageSquare, Upload, X, Check } from 'lucide-react';

type Props = { productId: string };

function Star({ filled }: { filled: boolean }) {
  return (
    <StarIcon 
      className={`h-5 w-5 ${filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
    />
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => <Star key={n} filled={n <= Math.round(value)} />)}
    </span>
  );
}

export default function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<{ average: number; count: number; breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number } } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);
  const [form, setForm] = useState<{ rating: number; comment: string; images: string[] }>({ rating: 0, comment: '', images: [] });
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputId = 'review-images-input';
  const [imageAction, setImageAction] = useState<'append' | 'replace'>('append');
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const MAX_IMAGES = 5;
  const MAX_SIZE_MB = 3; // 3MB per image

  // Helpers to fetch summary and reviews so we can call them after mutations too
  async function fetchSummary() {
    try {
      const res = await getProductReviewSummary(productId);
      if (res?.success) setSummary(res.data);
    } catch {
      // non-fatal
    }
  }

  async function fetchReviews() {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (filter !== 'all') params.rating = filter;
      const res = await getProductReviews(productId, params);
      if (res?.success) {
        // Filter out hidden reviews (admin can hide offensive reviews)
        const visibleReviews = (res.data || []).filter(review => !review.is_hidden);
        setReviews(visibleReviews);
        setTotal(visibleReviews.length);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId, page, limit, filter]);

  useEffect(() => {
    (async () => {
      try {
        const uc = getUserCookie();
        if (!uc || !(uc.token || uc?.data?.token)) return;
        const r = await hasUserReviewed(productId);
        if (r?.success) setMyReviewId(r.data?.reviewId || null);
      } catch {
        // noop
      }
    })();
  }, [productId]);

  const avg = summary?.average || 0;
  const count = summary?.count || 0;
  const breakdown = summary?.breakdown || ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as any);

  async function handleSubmit() {
    const uc = getUserCookie();
    if (!uc || !(uc.token || uc?.data?.token)) {
      toast.info('Please login to write a review');
      return;
    }
    if (!form.rating) { toast.error('Please select a star rating'); return; }
    try {
      setSubmitting(true);
      if (myReviewId) {
        const res = await updateReview(myReviewId, { rating: form.rating, comment: form.comment, images: form.images, image_action: imageAction });
        if (res?.success) {
          await fetchSummary();
          await fetchReviews();
          setShowReviewForm(false);
          toast.success(res.message || 'Review updated');
        }
      } else {
        const res = await createReview({ product_id: productId, rating: form.rating, comment: form.comment, images: form.images });
        if (res?.success) {
          await fetchSummary();
          // Reset to first page to ensure the newest shows up depending on sort
          setPage(1);
          await fetchReviews();
          // Set the review ID so user can edit/delete
          const reviewData = res.data as any;
          if (reviewData?.reviewId || reviewData?._id || reviewData?.id) {
            setMyReviewId(reviewData?.reviewId || reviewData?._id || reviewData?.id);
          }
          setShowReviewForm(false);
          toast.success(res.message || 'Review posted');
          // Don't reset form so user can see their submitted review
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!myReviewId) return;
    try {
      setSubmitting(true);
      const res = await deleteReview(myReviewId);
      if (res?.success) {
        await fetchSummary();
        await fetchReviews();
        setMyReviewId(null);
        setForm({ rating: 0, comment: '', images: [] });
        toast.success('Review deleted');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(files: File[]) {
    const validFiles: File[] = [];
    const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Check remaining slots
    const remaining = Math.max(0, MAX_IMAGES - form.images.length);
    const filesToUpload = validFiles.slice(0, remaining);
    
    if (validFiles.length > filesToUpload.length) {
      toast.info(`Only ${remaining} images allowed (max ${MAX_IMAGES})`);
    }

    try {
      setUploadingImages(true);
      const result = await uploadReviewImages(filesToUpload);
      
      if (result.success && result.data) {
        const newUrls = result.data.map(img => img.url);
        setForm(f => ({ ...f, images: [...f.images, ...newUrls] }));
        toast.success(`${filesToUpload.length} image(s) uploaded successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-emerald-900">Ratings & Reviews</h2>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Overall Rating */}
        <div className="bg-gradient-to-br from-emerald-50 to-lime-50 rounded-2xl p-6 border-2 border-emerald-200">
          <div className="text-center">
            <div className="text-6xl font-bold text-emerald-900 mb-2">{avg.toFixed(1)}</div>
            <Stars value={avg} />
            <div className="text-sm text-emerald-600 mt-2">{count} total ratings</div>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="lg:col-span-2 space-y-3">
          {[5,4,3,2,1].map(n => {
            const nCount = (breakdown as any)[n] || 0;
            const percent = count ? Math.round((nCount / count) * 100) : 0;
            return (
              <div key={n} className="flex items-center gap-3">
                <span className="w-16 text-sm font-semibold text-emerald-700 flex items-center gap-1">
                  {n} <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-4 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-lime-500 transition-all duration-300" 
                    style={{ width: `${percent}%` }} 
                  />
                </div>
                <span className="w-16 text-right text-sm font-semibold text-emerald-700">{nCount}</span>
                <span className="w-12 text-right text-xs text-emerald-600">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-sm font-semibold text-emerald-700 mr-2">Filter:</span>
        <Button 
          variant={filter==='all' ? 'default' : 'outline'} 
          onClick={() => { setFilter('all'); setPage(1); }}
          className={filter==='all' ? 'bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
        >
          All Reviews
        </Button>
        {[5,4,3,2,1].map(n => (
          <Button 
            key={n} 
            variant={filter===n ? 'default' : 'outline'} 
            onClick={() => { setFilter(n); setPage(1); }}
            className={filter===n ? 'bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
          >
            {n} <StarIcon className="h-4 w-4 ml-1" />
            <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-0">{(breakdown as any)[n] || 0}</Badge>
          </Button>
        ))}
      </div>

        <Separator className="bg-emerald-200" />

        {/* Write Review Button */}
        {!showReviewForm ? (
          <div className="text-center py-8">
            <Button 
              onClick={() => setShowReviewForm(true)}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Write a Review
            </Button>
            <p className="text-sm text-emerald-600 mt-3">Share your experience with this product</p>
          </div>
        ) : (
          <>
            {/* Write Review Form */}
            <div className="bg-gradient-to-br from-emerald-50/50 to-lime-50/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-emerald-900">Write Your Review</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReviewForm(false)}
                  className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                >
                  <X className="h-5 w-5 mr-1" />
                  Cancel
                </Button>
              </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-700">Your rating:</label>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <button 
                  key={n} 
                  type="button" 
                  onClick={() => setForm(f => ({ ...f, rating: n }))} 
                  className="transition-transform hover:scale-110"
                >
                  <StarIcon className={`h-8 w-8 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
              {form.rating > 0 && (
                <span className="ml-3 text-emerald-700 font-semibold">
                  {form.rating === 5 ? 'Excellent!' : form.rating === 4 ? 'Great!' : form.rating === 3 ? 'Good' : form.rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-700">Your review:</label>
            <Textarea 
              placeholder="Share your experience with this product..." 
              value={form.comment} 
              onChange={e => setForm({ ...form, comment: e.target.value })}
              className="min-h-[120px] border-2 border-emerald-200 focus:border-emerald-500 bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-emerald-700">Add photos (optional):</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                let files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
                if (files.length === 0) return;
                await handleImageUpload(files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-sm text-center transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-200 bg-white'}`}
            >
              <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-700 mb-2">Drag and drop images here, or</p>
              <Button 
                type="button" 
                variant="outline" 
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => document.getElementById(fileInputId)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <p className="text-xs text-emerald-600 mt-2">Max {MAX_IMAGES} images, {MAX_SIZE_MB}MB each</p>
              <input id={fileInputId} type="file" multiple accept="image/*" className="hidden" onChange={async (e) => {
                let files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                await handleImageUpload(files);
                (e.target as HTMLInputElement).value = '';
              }} />
              {uploadingImages && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-emerald-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading images...
                </div>
              )}
            </div>
          </div>
          {form.images.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-emerald-700 mb-2 block">Preview:</label>
              <div className="flex gap-3 flex-wrap">
                {form.images.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="preview" className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-200" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {myReviewId && (
            <div className="flex flex-wrap items-center gap-3 text-sm bg-emerald-50 p-3 rounded-xl">
              <span className="font-semibold text-emerald-700">When updating images:</span>
              <Button 
                type="button" 
                size="sm" 
                variant={imageAction === 'append' ? 'default' : 'outline'} 
                onClick={() => setImageAction('append')}
                className={imageAction === 'append' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-300'}
              >
                Append
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant={imageAction === 'replace' ? 'default' : 'outline'} 
                onClick={() => setImageAction('replace')}
                className={imageAction === 'replace' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-300'}
              >
                Replace
              </Button>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || uploadingImages}
              className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {myReviewId ? 'Update Review' : 'Post Review'}
            </Button>
            {myReviewId && (
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                disabled={submitting}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Delete Review
              </Button>
            )}
          </div>
            </div>
          </>
        )}

        <Separator className="bg-emerald-200" />

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-900">Customer Reviews</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-emerald-600">Loading reviews...</p>
            </div>
          ) : (
            reviews.length === 0 ? (
              <div className="text-center py-12 bg-emerald-50 rounded-2xl">
                <MessageSquare className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-emerald-700 font-semibold">No reviews yet</p>
                <p className="text-sm text-emerald-600">Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-emerald-900">{r.user?.full_name || 'Anonymous User'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Stars value={r.rating} />
                        {r.comment && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Verified Purchase</Badge>}
                      </div>
                    </div>
                    <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  {r.comment && <p className="text-emerald-800 leading-relaxed mb-3">{r.comment}</p>}
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {r.images.map((url, idx) => (
                        <img key={idx} src={url} alt="review" className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-200" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-emerald-700 font-semibold">
              Page {page} of {Math.max(1, Math.ceil(total / limit))}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(total / limit)} 
                onClick={() => setPage(p => p + 1)}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
