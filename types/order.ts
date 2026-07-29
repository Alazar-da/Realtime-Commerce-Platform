// types/Order.ts

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ShippingAddress {
  full_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  notes: string | null;
  created_at: string;
  updated_at: string;
  status_history?: OrderStatusHistory[];
}

// For creating a new order
export interface CreateOrderDTO {
  payment_method: Order['payment_method'];
  shipping_address: ShippingAddress;
  notes?: string;
}

// For updating an order
export interface UpdateOrderDTO {
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  notes?: string;
}

// For API responses with pagination
export interface OrderResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// For order filters
export interface OrderFilters {
  status?: Order['status'] | 'all';
  payment_status?: Order['payment_status'] | 'all';
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'total' | 'order_number' | 'status';
  sortOrder?: 'asc' | 'desc';
}