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
import { Label } from "@/components/ui/label";
import { getOrderById } from "@/lib/api/order";
import { CheckCircle2, Truck, Package, Clock, ArrowLeft, MapPin, Mail, Phone, Calendar, Hash, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getOrderById(id);
      if (res?.success) {
        setOrder(res.data);
      } else {
        toast.error("Order not found");
      }
    } catch (e: any) {
      console.error("Failed to load order:", e);
      toast.error(e.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button variant="ghost" className="mb-6 hover:bg-primary/10" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
          </Button>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div>
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24 mt-2" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !order ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
                  <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
                  <Button onClick={() => navigate('/user-dashboard')}>Go to Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header Card */}
              <Card className="mb-6 shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">Order #{order.id?.slice(-8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at || order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <Badge className={`gap-2 px-4 py-2 text-sm ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status?.toUpperCase()}
                      </Badge>
                      <p className="text-2xl font-bold">₹{(order.total_amount || order.total).toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Items */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(order.order_items || []).map((item: any) => (
                          <div
                            key={item.id || item.product_id}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border rounded-lg hover:shadow-md transition-all"
                          >
                            <div className="flex-shrink-0">
                              <img
                                src={item.product?.images?.[0] || '/placeholder.svg'}
                                alt={item.product?.name || 'Product'}
                                className="h-20 w-20 rounded-lg object-cover border-2"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base mb-1">{item.product?.name || 'Unknown Product'}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.product?.category && <span>📦 {item.product.category}</span>}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  @ ₹{item.price}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-xl">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 border-t pt-4">
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Subtotal</span>
                            <span className="font-medium">₹{(order.total_amount || order.total).toFixed(2)}</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Discount</span>
                              <span className="font-medium text-green-600">-₹{order.discount_amount.toFixed(2)}</span>
                            </div>
                          )}
                          {order.delivery_charges > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Delivery Charges</span>
                              <span className="font-medium">₹{order.delivery_charges.toFixed(2)}</span>
                            </div>
                          )}
                          {order.tax_amount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Tax (GST)</span>
                              <span className="font-medium">₹{order.tax_amount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3 mt-3 flex justify-between items-center">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-primary">
                              ₹{(order.total_amount || order.total).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Status Timeline */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Order Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Timeline items */}
                        {order.statusHistory && order.statusHistory.length > 0 ? (
                          <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            
                            {order.statusHistory.map((historyItem: any, index: number) => {
                              const isLast = index === order.statusHistory.length - 1;
                              const statusColors: any = {
                                pending: 'bg-gray-400',
                                processing: 'bg-yellow-400',
                                shipped: 'bg-blue-400',
                                delivered: 'bg-green-400',
                                cancelled: 'bg-red-400',
                              };
                              
                              return (
                                <div key={index} className="relative flex gap-4 pb-6">
                                  {/* Timeline dot */}
                                  <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ${statusColors[historyItem.status] || 'bg-gray-400'}`}>
                                    {historyItem.status === 'delivered' && <CheckCircle2 className="h-4 w-4 text-white" />}
                                    {historyItem.status === 'shipped' && <Truck className="h-4 w-4 text-white" />}
                                    {historyItem.status === 'processing' && <Package className="h-4 w-4 text-white" />}
                                    {historyItem.status === 'cancelled' && <XCircle className="h-4 w-4 text-white" />}
                                    {historyItem.status === 'pending' && <Clock className="h-4 w-4 text-white" />}
                                  </div>
                                  
                                  {/* Timeline content */}
                                  <div className="flex-1 pt-0.5">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-sm capitalize">{historyItem.status}</h4>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(historyItem.changedAt).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    {historyItem.comment && (
                                      <p className="text-xs text-muted-foreground mt-1">{historyItem.comment}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No status history available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipment Tracking */}
                  {(order.status === 'shipped' || order.status === 'delivered') && order.shipment && (
                    <Card className="shadow-lg border-blue-200">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                          <Truck className="h-5 w-5" />
                          Shipment Tracking
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {order.shipment.deliveryPartner && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Label className="text-xs text-blue-600 font-semibold">Delivery Partner</Label>
                              <p className="text-sm font-medium mt-1">{order.shipment.deliveryPartner}</p>
                            </div>
                          )}
                          {order.shipment.trackingNumber && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Label className="text-xs text-blue-600 font-semibold">Tracking Number</Label>
                              <p className="text-sm font-medium mt-1">{order.shipment.trackingNumber}</p>
                            </div>
                          )}
                          {order.shipment.estimatedDelivery && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Label className="text-xs text-blue-600 font-semibold">Estimated Delivery</Label>
                              <p className="text-sm font-medium mt-1">{order.shipment.estimatedDelivery}</p>
                            </div>
                          )}
                          {order.shipment.shippedAt && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Label className="text-xs text-blue-600 font-semibold">Shipped On</Label>
                              <p className="text-sm font-medium mt-1">
                                {new Date(order.shipment.shippedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Shipping Address */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {order.shipping_address ? (
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">{order.shipping_address.full_name}</p>
                          <p>{order.shipping_address.address_line1}</p>
                          {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                          <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                          <p>{order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                          {order.shipping_address.phone && (
                            <p className="flex items-center gap-2 mt-3 text-primary">
                              <Phone className="h-4 w-4" />
                              {order.shipping_address.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No address available</p>
                      )}
                    </CardContent>
                  </Card>


                  {/* Need Help */}
                  <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="text-base">Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        If you have any questions about your order, feel free to contact us.
                      </p>
                      <Button variant="outline" className="w-full" onClick={() => navigate('/contact-us')}>
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

    </div>
  );
}
