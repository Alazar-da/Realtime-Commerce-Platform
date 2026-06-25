// app/(customer)/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Package, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Clock,
  ChevronRight,
  Star,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderService } from "@/services/orderService";
import { Order } from "@/services/orderService";
import { ReviewService } from "@/services/reviewService";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500"
};

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [canReview, setCanReview] = useState<{ [key: string]: boolean }>({});
  const [reviewing, setReviewing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const orderData = await OrderService.getOrderById(params.id as string);
      setOrder(orderData);

      // Check if user can review each product
      if (user && orderData.status === 'delivered') {
        const reviewStatus: { [key: string]: boolean } = {};
        for (const item of orderData.items || []) {
          const can = await ReviewService.canUserReviewProduct(user.id, item.product_id);
          reviewStatus[item.product_id] = can;
        }
        setCanReview(reviewStatus);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Order not found');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (productId: string, rating: number, content: string) => {
    if (!user) {
      toast.error('Please login to review');
      return;
    }

    try {
      setReviewing(prev => ({ ...prev, [productId]: true }));
      await ReviewService.createReview(user.id, {
        product_id: productId,
        order_id: order!.id,
        rating,
        content
      });
      toast.success('Review submitted successfully! It will be reviewed by our team.');
      setCanReview(prev => ({ ...prev, [productId]: false }));
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setReviewing(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || "bg-gray-500";
    return (
      <Badge className={cn(color, "text-white")}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Order Status Timeline */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Order Placed</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Processing</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Shipped</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Delivered</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.address}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
              <p>{order.shipping_address.country} {order.shipping_address.postal_code}</p>
              <p>Phone: {order.shipping_address.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Payment Method</h4>
            <p className="text-sm text-muted-foreground capitalize">
              {order.payment_method.replace('_', ' ')}
            </p>
            <div className="mt-2">
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                {order.payment_status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <h2 className="text-xl font-bold mb-4">Order Items</h2>
      <div className="space-y-4">
        {order.items?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-bold text-primary">${item.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Review Button for Delivered Orders */}
                  {order.status === 'delivered' && canReview[item.product_id] && (
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const rating = prompt('Rate this product (1-5 stars):');
                          if (rating) {
                            const numRating = parseInt(rating);
                            if (numRating >= 1 && numRating <= 5) {
                              const content = prompt('Write your review:');
                              if (content) {
                                handleReview(item.product_id, numRating, content);
                              }
                            } else {
                              toast.error('Please enter a rating between 1 and 5');
                            }
                          }
                        }}
                        disabled={reviewing[item.product_id]}
                      >
                        {reviewing[item.product_id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Write a Review
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Order Notes</h4>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      {order.status_history && order.status_history.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Order Timeline</h4>
            <div className="space-y-4">
              {order.status_history.map((history, index) => (
                <div key={history.id} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                    {index < (order.status_history!.length - 1) && (
                      <div className="absolute top-4 left-1.5 w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{history.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(history.created_at).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}