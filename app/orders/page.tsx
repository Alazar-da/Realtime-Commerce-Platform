// app/(customer)/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  ChevronRight, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderService } from "@/services/orderService";
import { Order } from "@/services/orderService";
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

const statusIcons = {
  pending: Clock,
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
};

export default function CustomerOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserAndOrders();
  }, []);

  const fetchUserAndOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const userOrders = await OrderService.getUserOrders(user.id);
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Package;
    return <Icon className="h-4 w-4" />;
  };

  const filteredOrders = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please Login</h3>
            <p className="text-muted-foreground mb-4">Login to view your orders.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping today!
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              {filteredOrders(status).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {status !== 'all' ? status : ''} orders found
                </div>
              ) : (
                filteredOrders(status).map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">
                              {order.order_number}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{order.items?.length || 0} items</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="text-sm capitalize">{order.status}</span>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                          {order.items?.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm bg-muted/30 px-3 py-1.5 rounded-lg">
                              <span>{item.product_name}</span>
                              <span className="text-muted-foreground">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}