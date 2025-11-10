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
import { Loader2 } from 'lucide-react';

type Props = { productId: string };

function Star({ filled }: { filled: boolean }) {
  return <span className={filled ? 'text-primary' : 'text-muted-foreground'}>★</span>;
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
          toast.success(res.message || 'Review updated');
        }
      } else {
        const res = await createReview({ product_id: productId, rating: form.rating, comment: form.comment, images: form.images });
        if (res?.success) {
          await fetchSummary();
          // Reset to first page to ensure the newest shows up depending on sort
          setPage(1);
          await fetchReviews();
          toast.success(res.message || 'Review posted');
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
    <Card>
      <CardHeader>
        <CardTitle>Ratings & Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{avg}</div>
            <div>
              <Stars value={avg} />
              <div className="text-sm text-muted-foreground">{count} ratings</div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5,4,3,2,1].map(n => {
              const nCount = (breakdown as any)[n] || 0;
              const percent = count ? Math.round((nCount / count) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-3">
                  <span className="w-10 text-sm">{n}★</span>
                  <div className="h-3 bg-muted rounded w-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm">{nCount}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant={filter==='all' ? 'default' : 'outline'} onClick={() => { setFilter('all'); setPage(1); }}>All</Button>
            {[5,4,3,2,1].map(n => (
              <Button key={n} variant={filter===n ? 'default' : 'outline'} onClick={() => { setFilter(n); setPage(1); }}>
                {n}★ <Badge className="ml-2" variant="secondary">{(breakdown as any)[n] || 0}</Badge>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Your rating:</span>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))} className="text-xl">
                  <span className={n <= form.rating ? 'text-primary' : 'text-muted-foreground'}>★</span>
                </button>
              ))}
            </div>
          </div>
          <Textarea placeholder="Share your experience" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
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
            className={`border-2 border-dashed rounded p-4 text-sm ${dragOver ? 'border-primary bg-primary/5' : 'border-muted'}`}
          >
            Drag and drop images here, or
            <Button type="button" variant="outline" className="ml-2" onClick={() => document.getElementById(fileInputId)?.click()}>Upload</Button>
            <input id={fileInputId} type="file" multiple accept="image/*" className="hidden" onChange={async (e) => {
              let files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              await handleImageUpload(files);
              (e.target as HTMLInputElement).value = '';
            }} />
            {uploadingImages && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading images to Cloudinary...
              </div>
            )}
          </div>
          {form.images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {form.images.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} alt="preview" className="w-16 h-16 object-contain rounded" />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-muted text-foreground rounded-full w-6 h-6"
                    onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                    aria-label="Remove image"
                  >×</button>
                </div>
              ))}
            </div>
          )}
          {myReviewId && (
            <div className="flex items-center gap-3 text-sm">
              <span>When updating images:</span>
              <Button type="button" size="sm" variant={imageAction === 'append' ? 'default' : 'outline'} onClick={() => setImageAction('append')}>Append</Button>
              <Button type="button" size="sm" variant={imageAction === 'replace' ? 'default' : 'outline'} onClick={() => setImageAction('replace')}>Replace</Button>
              <span className="text-muted-foreground">(Max {MAX_IMAGES} images, {MAX_SIZE_MB}MB each)</span>
            </div>)
          }
          <div className="flex items-center gap-2">
            <Button onClick={handleSubmit} disabled={submitting || uploadingImages}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {myReviewId ? 'Update Review' : 'Post Review'}
            </Button>
            {myReviewId && (
              <Button variant="outline" onClick={handleDelete} disabled={submitting}>Delete</Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reviews...</div>
          ) : (
            reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reviews yet.</div>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{r.user?.full_name || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stars value={r.rating} />
                    {r.comment ? <Badge variant="outline">Verified Review</Badge> : null}
                  </div>
                  {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {r.images.map((url, idx) => (
                        <img key={idx} src={url} alt="review" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {Math.max(1, Math.ceil(total / limit))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helpers
async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Roughly estimate total bytes of an array of base64 data URLs
function estimateTotalBase64Bytes(images: string[]): number {
  let total = 0;
  for (const s of images) {
    if (!s) continue;
    const idx = s.indexOf(',');
    const base64 = idx >= 0 ? s.slice(idx + 1) : s;
    // 4 base64 chars encode 3 bytes → multiply by 0.75
    total += Math.floor(base64.length * 0.75);
  }
  return total;
}
