import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getUserReviews, deleteReview, type Review } from '@/lib/api/reviews';

// Backend getUserReviews populates product: { name, image_url }
// Extend for local consumption
type UserReview = Review & { product?: { name?: string; image_url?: string } };

export default function UserReviewsList() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getUserReviews({ page, limit });
        if (res?.success) {
          setReviews(res.data as UserReview[]);
          setTotal(res.count || 0);
        }
      } catch (e: any) {
        toast.error(e.message || 'Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit]);

  async function handleDelete(id: string) {
    try {
      setDeleting(id);
      const res = await deleteReview(id);
      if (res?.success) {
        setReviews(prev => prev.filter(r => r.id !== id));
        setTotal(t => Math.max(0, t - 1));
        toast.success('Review deleted');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete review');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground">You have not posted any reviews yet.</div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <img src={r.product?.image_url} alt={r.product?.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{r.product?.name || 'Product'}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-primary">{'★'.repeat(r.rating)}</span>
                      <span className="text-muted-foreground">{'★'.repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {r.images.map((url, idx) => (
                        <img key={idx} src={url} alt="review" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    {/* Editing can be routed to product page where ProductReviews allows edit */}
                    <Button asChild size="sm" variant="outline">
                      <a href={`/product/${r.product_id}`}>View & Edit</a>
                    </Button>
                    <Button size="sm" variant="outline" disabled={deleting === r.id} onClick={() => handleDelete(r.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <Separator />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / limit))}</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
