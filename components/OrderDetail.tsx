// components/OrderDetail.tsx
"use client";

import { Order } from "@/services/orderService";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Package } from "lucide-react";

interface OrderDetailProps {
  order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const statusColors = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500"
  };

  // Get items from order (either from items array or JSONB)
  const orderItems = order.items || [];

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Order Number</p>
          <p className="font-semibold">{order.order_number}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="font-semibold">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge className={cn(statusColors[order.status as keyof typeof statusColors], "text-white")}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Payment</p>
          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
            {order.payment_status}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {order.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
          </p>
        </div>
      </div>

      <Separator />

      {/* Shipping Address */}
      {order.shipping_address && (
        <div>
          <h4 className="font-semibold mb-2">Shipping Address</h4>
          <div className="text-sm space-y-1">
            <p>{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.address}</p>
            <p>
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </p>
            <p>{order.shipping_address.country}</p>
            <p>Phone: {order.shipping_address.phone}</p>
          </div>
        </div>
      )}

      <Separator />

      {/* Order Items */}
      <div>
        <h4 className="font-semibold mb-4">Order Items ({orderItems.length})</h4>
        <div className="space-y-3">
          {orderItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No items found</p>
          ) : (
            orderItems.map((item, index) => (
              <div key={item.id || index} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm">Qty: {item.quantity}</span>
                    <span className="text-sm font-medium">
                      ${item.price?.toFixed(2) || '0.00'} each
                    </span>
                    <span className="text-sm font-bold text-primary">
                      ${item.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>${order.shipping?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>${order.tax?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span>${order.discount?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${order.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {order.notes && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Order Notes</h4>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        </>
      )}

      {/* Status History */}
      {order.status_history && order.status_history.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-4">Status History</h4>
            <div className="space-y-2">
              {order.status_history.map((history, index) => (
                <div key={history.id} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    {index < (order.status_history?.length ?? 0) - 1 && (
                      <div className="absolute top-3 left-1 w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(history.created_at).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}