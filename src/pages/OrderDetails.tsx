import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getOrderById, cancelOrder } from "@/lib/api/order";
import { CheckCircle2, Truck, Package, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReasonKey, setCancelReasonKey] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");
  const cancelReasons = [
    { key: 'ordered_by_mistake', label: 'Ordered by mistake' },
    { key: 'found_better_price', label: 'Found a better price elsewhere' },
    { key: 'delivery_too_slow', label: 'Delivery time is too long' },
    { key: 'change_of_mind', label: 'Changed my mind' },
    { key: 'other', label: 'Other (specify)' },
  ];

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getOrderById(id);
        if (res?.success) setOrder(res.data);
      } catch (e: any) {
        toast.error(e.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const StatusBadge = ({ status }: { status?: string }) => (
    <Badge variant={
      (status || '').toLowerCase() === 'delivered' ? 'default' :
        (status || '').toLowerCase() === 'shipped' ? 'secondary' : 'outline'}>
      {((s) => s === 'delivered' ? <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> : s === 'shipped' ? <Truck className="h-3.5 w-3.5 mr-1" /> : s === 'processing' ? <Package className="h-3.5 w-3.5 mr-1" /> : <Clock className="h-3.5 w-3.5 mr-1" />)((order?.status || '').toLowerCase())}
      {status || 'pending'}
    </Badge>
  );

  async function handleConfirmCancel() {
    if (!order?.id) return;
    const selected = cancelReasons.find(r => r.key === cancelReasonKey);
    const reason = cancelReasonKey === 'other' ? cancelReasonText.trim() : selected?.label;
    if (!reason) return toast.error('Please select or enter a reason');
    try {
      const res = await cancelOrder(order.id, reason);
      if (res?.success) {
        toast.success('Order cancelled');
        setCancelDialogOpen(false);
        // reload details
        const r2 = await getOrderById(order.id);
        if (r2?.success) setOrder(r2.data);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel order');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Order Details {order?.id ? `- ${order.id}` : ''}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-64" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-14 w-14 rounded" />
                          <div>
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24 mt-2" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : !order ? (
                <p className="text-sm text-muted-foreground">Order not found.</p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at || order.date).toLocaleDateString()} • {(order.order_items?.length) ?? order.items} items • ₹{order.total_amount ?? order.total}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(order.order_items || []).map((it: any) => (
                      <div key={it.id || it.product_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.product?.image || it.product?.thumbnail || it.product?.image_url || '/placeholder.svg'}
                            alt={it.product?.name || it.product_id}
                            className="h-14 w-14 rounded object-cover"
                          />                          <div>
                            <p className="text-sm font-medium">{it.product?.name || it.product_id}</p>
                            <p className="text-xs text-muted-foreground">Qty: {it.quantity} • ₹{it.price}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">₹{(it.price || 0) * (it.quantity || 0)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address ? `${order.shipping_address.address_line1}${order.shipping_address.address_line2 ? ', ' + order.shipping_address.address_line2 : ''}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.postal_code}` : '-'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Payment</h3>
                      <p className="text-sm text-muted-foreground">Total: ₹{order.total_amount ?? order.total}</p>
                    </div>
                  </div>

                  {(['pending', 'processing'] as string[]).includes((order.status || '').toLowerCase()) && (
                    <div className="pt-2">
                      <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>Cancel Order</Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select a reason for cancellation:</p>
            <div className="grid gap-2">
              {cancelReasons.map(r => (
                <label key={r.key} className={`border rounded p-2 cursor-pointer ${cancelReasonKey === r.key ? 'border-primary' : 'border-border'}`}>
                  <input type="radio" name="cancel_reason_detail" className="mr-2" checked={cancelReasonKey === r.key} onChange={() => setCancelReasonKey(r.key)} />
                  {r.label}
                </label>
              ))}
            </div>
            {cancelReasonKey === 'other' && (
              <div className="space-y-1">
                <label className="text-sm">Please specify</label>
                <Textarea value={cancelReasonText} onChange={(e) => setCancelReasonText(e.target.value)} placeholder="Enter cancellation reason" />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Close</Button>
              <Button variant="destructive" onClick={handleConfirmCancel}>Confirm Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
