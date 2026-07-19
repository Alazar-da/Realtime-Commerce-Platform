// services/orderService.ts (Updated with fixed status history)

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  items: OrderItem[];
  shipping_address: {
    full_name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  notes: string;
  created_at: string;
  updated_at: string;
  status_history?: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface CreateOrderDTO {
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  shipping_address: {
    full_name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  notes?: string;
}

export class OrderService {

  // Get all orders for a user with pagination
  static async getUserOrders(
    userId: string, 
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ orders: Order[]; total: number }> {
    const {
      status,
      limit = 10,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options || {};

    try {
      // Build the query
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data: orders, error, count } = await query;

      if (error) {
        console.error('Error fetching user orders:', error);
        throw new Error(error.message);
      }

      if (!orders || orders.length === 0) {
        return { orders: [], total: count || 0 };
      }

      // Get order items for each order
      const orderIds = orders.map(order => order.id);
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        // Continue with empty items rather than failing
      }

      // Get status history for each order
      const { data: statusHistory, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: true });

      if (historyError) {
        console.error('Error fetching status history:', historyError);
      }

      // Map items and history to orders
      const ordersWithDetails = orders.map(order => {
        const items = orderItems?.filter(item => item.order_id === order.id) || [];
        const history = statusHistory?.filter(h => h.order_id === order.id) || [];

        return {
          ...order,
          items: items,
          status_history: history
        } as Order;
      });

      return {
        orders: ordersWithDetails,
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      throw error;
    }
  }

  // Create new order with items
  static async createOrder(userId: string, data: CreateOrderDTO): Promise<Order> {
    // Get cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);

    if (cartError) {
      console.error('Cart fetch error:', cartError);
      throw new Error('Failed to fetch cart items');
    }

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Prepare order items
    const items: OrderItem[] = cartItems.map(item => ({
      product_id: item.product_id,
      product_name: item.product.name,
      product_image: item.product.image_url,
      sku: item.product.sku,
      quantity: item.quantity,
      price: item.product.price,
      total: item.product.price * item.quantity
    }));

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const discount = 0;
    const total = subtotal + tax + shipping - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order with items as JSONB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'pending',
        payment_method: data.payment_method,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        items: items,
        shipping_address: data.shipping_address,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(orderError.message);
    }

    console.log('Order created:', order);

    // Insert items into order_items table
    const orderItems = items.map(item => ({
      ...item,
      order_id: order.id
    }));

    try {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items insertion error:', itemsError);
      } else {
        console.log('Order items inserted successfully');
      }
    } catch (itemsError) {
      console.error('Error during order items insertion:', itemsError);
    }

    // Add initial status history
    try {
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
          order_id: order.id,
          status: 'pending',
          note: 'Order placed successfully',
          created_by: userId,
          created_at: new Date().toISOString()
        }]);

      if (historyError) {
        console.error('Status history insertion error:', historyError);
      } else {
        console.log('Status history added successfully');
      }
    } catch (historyError) {
      console.error('Error during status history insertion:', historyError);
    }

    // Clear cart
    try {
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);
    } catch (clearError) {
      console.error('Cart clear error:', clearError);
    }

    // Get complete order
    return this.getOrderById(order.id);
  }

  // Get order by ID with items and status history
  static async getOrderById(orderId: string): Promise<Order> {
    console.log('Fetching order by ID:', orderId);
    
    // First get the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Order fetch error:', error);
      throw new Error(error.message);
    }

    // Get order items
    let orderItems: any[] = [];
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (items && items.length > 0) {
        orderItems = items;
      } else if (order.items) {
        // Fallback to JSONB items
        orderItems = Array.isArray(order.items) ? order.items : 
                    typeof order.items === 'string' ? JSON.parse(order.items) : [];
      }
    } catch (itemsError) {
      console.error('Error fetching order items:', itemsError);
      if (order.items) {
        orderItems = Array.isArray(order.items) ? order.items : 
                    typeof order.items === 'string' ? JSON.parse(order.items) : [];
      }
    }

    // Get status history
    let statusHistory: any[] = [];
    try {
      const { data: history } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (history && history.length > 0) {
        statusHistory = history;
      } else {
        // If no history, create a default entry
        console.log('No status history found, creating default...');
        const { data: defaultHistory, error: defaultError } = await supabase
          .from('order_status_history')
          .insert([{
            order_id: orderId,
            status: order.status || 'pending',
            note: 'Order status history initialized',
            created_by: order.user_id,
            created_at: order.created_at || new Date().toISOString()
          }])
          .select();

        if (!defaultError && defaultHistory) {
          statusHistory = defaultHistory;
        }
      }
    } catch (historyError) {
      console.error('Error fetching status history:', historyError);
    }

    return {
      ...order,
      items: orderItems || [],
      status_history: statusHistory || []
    } as Order;
  }

   // Get all orders for admin
  static async getAllOrders(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const {
      status,
      search,
      page = 1,
      limit = 20
    } = filters || {};

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: orders, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Get items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        const { data: statusHistory } = await supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: true });

        return {
          ...order,
          items: orderItems || [],
          status_history: statusHistory || []
        };
      })
    );

    return {
      orders: ordersWithItems as Order[],
      total: count || 0
    };
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber: string): Promise<Order> {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Get order items
    let orderItems: any[] = [];
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      orderItems = items || [];
    } catch (itemsError) {
      if (order.items) {
        orderItems = Array.isArray(order.items) ? order.items : 
                    typeof order.items === 'string' ? JSON.parse(order.items) : [];
      }
    }

    // Get status history
    let statusHistory: any[] = [];
    try {
      const { data: history } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });
      statusHistory = history || [];
    } catch (historyError) {
      console.error('Status history error:', historyError);
    }

    return {
      ...order,
      items: orderItems || [],
      status_history: statusHistory || []
    } as Order;
  }

  // Update order status with stock deduction on delivery
  static async updateOrderStatus(
    orderId: string, 
    status: Order['status'], 
    note?: string,
    userId?: string
  ): Promise<Order> {
    // Get current order
    const order = await this.getOrderById(orderId);

    // If moving to delivered, deduct stock
    if (status === 'delivered' && order.status !== 'delivered') {
      await this.deductStock(orderId);
    }

    // If cancelling, restore stock (only if not already delivered)
    if (status === 'cancelled' && order.status !== 'cancelled' && order.status !== 'delivered') {
      await this.restoreStock(orderId);
    }

    // Update order status
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Add status history
    try {
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          status: status,
          note: note || `Order status changed from ${order.status} to ${status}`,
          created_by: userId || order.user_id,
          created_at: new Date().toISOString()
        }]);

      if (historyError) {
        console.error('Status history insertion error:', historyError);
      } else {
        console.log(`Status history added: ${status}`);
      }
    } catch (historyError) {
      console.error('Error inserting status history:', historyError);
    }

    return this.getOrderById(orderId);
  }

  // Deduct stock for order items (called when delivered)
  static async deductStock(orderId: string): Promise<void> {
    let items: any[] = [];
    
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (orderItems && orderItems.length > 0) {
        items = orderItems;
      } else {
        // Fallback to JSONB items
        const { data: order } = await supabase
          .from('orders')
          .select('items')
          .eq('id', orderId)
          .single();
        
        if (order && order.items) {
          items = Array.isArray(order.items) ? order.items : 
                  typeof order.items === 'string' ? JSON.parse(order.items) : [];
        }
      }
    } catch (itemsError) {
      console.error('Error fetching order items for stock deduction:', itemsError);
    }

    if (!items || items.length === 0) {
      console.warn('No items found for order:', orderId);
      return;
    }

    console.log(`Deducting stock for ${items.length} items in order ${orderId}`);

    for (const item of items) {
      try {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity, sales_count')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity);
          const stockStatus = newStock === 0 ? 'out_of_stock' : 'in_stock';

          await supabase
            .from('products')
            .update({ 
              stock_quantity: newStock,
              stock_status: stockStatus,
              sales_count: (product.sales_count || 0) + item.quantity
            })
            .eq('id', item.product_id);
        }
      } catch (error) {
        console.error(`Error processing item ${item.product_id}:`, error);
      }
    }
  }

  // Restore stock for cancelled orders
  static async restoreStock(orderId: string): Promise<void> {
    let items: any[] = [];
    
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (orderItems && orderItems.length > 0) {
        items = orderItems;
      } else {
        const { data: order } = await supabase
          .from('orders')
          .select('items')
          .eq('id', orderId)
          .single();
        
        if (order && order.items) {
          items = Array.isArray(order.items) ? order.items : 
                  typeof order.items === 'string' ? JSON.parse(order.items) : [];
        }
      }
    } catch (itemsError) {
      console.error('Error fetching order items for stock restore:', itemsError);
    }

    for (const item of items) {
      try {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity, sales_count')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = product.stock_quantity + item.quantity;
          const stockStatus = newStock > 0 ? 'in_stock' : 'out_of_stock';

          await supabase
            .from('products')
            .update({ 
              stock_quantity: newStock,
              stock_status: stockStatus,
              sales_count: Math.max(0, (product.sales_count || 0) - item.quantity)
            })
            .eq('id', item.product_id);
        }
      } catch (error) {
        console.error(`Error restoring stock for item:`, error);
      }
    }
  }

// payment status
// services/orderService.ts

// Update payment status - FIXED
static async updatePaymentStatus(
  orderId: string, 
  paymentStatus: Order['payment_status']
): Promise<Order> {
  try {
    // First, check if the order exists
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();

    if (checkError) {
      console.error('Order not found:', checkError);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Perform the update without .single()
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw new Error(updateError.message);
    }

    // Fetch the updated order using getOrderById
    return await this.getOrderById(orderId);
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    throw error;
  }
}

  // Cancel order
  static async cancelOrder(orderId: string, userId?: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.status === 'delivered') {
      throw new Error('Cannot cancel a delivered order');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    return this.updateOrderStatus(orderId, 'cancelled', 'Order cancelled by user', userId);
  }

  // Get order statistics for admin
  static async getOrderStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total, created_at');

    if (error) {
      throw new Error(error.message);
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentOrders = orders.filter(o => new Date(o.created_at) > last7Days);

    return {
      totalOrders,
      totalRevenue,
      statusCounts,
      recentOrdersCount: recentOrders.length,
      recentRevenue: recentOrders.reduce((sum, o) => sum + o.total, 0)
    };
  }
}