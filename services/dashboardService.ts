// services/dashboardService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentUsers: RecentUser[];
  recentOrders: RecentOrder[];
  salesByDay: { date: string; total: number; count: number }[];
  topProducts: { id: string; name: string; sales: number; revenue: number }[];
  categoryDistribution: { name: string; count: number }[];
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export interface RecentUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    // Get all orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    // Get all products
    const { data: products } = await supabase
      .from('products')
      .select('*');

    // Get all users
    const { data: users } = await supabase
      .from('profiles')
      .select('*');

    // Get recent orders (last 5)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        status,
        created_at,
        shipping_address->>'full_name' as customer_name
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent users (last 5)
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, email, username, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get sales by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: salesByDay } = await supabase
      .from('orders')
      .select('created_at, total')
      .gte('created_at', sevenDaysAgo.toISOString())
      .eq('status', 'delivered');

    // Aggregate sales by day
    const salesMap = new Map();
    salesByDay?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      if (salesMap.has(date)) {
        const existing = salesMap.get(date);
        salesMap.set(date, {
          total: existing.total + order.total,
          count: existing.count + 1
        });
      } else {
        salesMap.set(date, {
          total: order.total,
          count: 1
        });
      }
    });

    const salesByDayArray = Array.from(salesMap.entries()).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count
    }));

    // Get top products by sales
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        total,
        product:products(name)
      `)
      .limit(100);

    const productSales = new Map();
    orderItems?.forEach((item:any) => {
      if (productSales.has(item.product_id)) {
        const existing = productSales.get(item.product_id);
        productSales.set(item.product_id, {
          name: item.product?.name || 'Unknown',
          sales: existing.sales + item.quantity,
          revenue: existing.revenue + item.total
        });
      } else {
        productSales.set(item.product_id, {
          name: item.product?.name || 'Unknown',
          sales: item.quantity,
          revenue: item.total
        });
      }
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get category distribution
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');

    const categoryCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);
        return {
          name: category.name,
          count: count || 0
        };
      })
    );

    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;
    const totalUsers = users?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const lowStockProducts = products?.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length || 0;
    const outOfStockProducts = products?.filter(p => p.stock_quantity === 0).length || 0;

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      recentUsers: recentUsers || [],
      recentOrders: (recentOrders as unknown as RecentOrder[]) || [],
      salesByDay: salesByDayArray,
      topProducts,
      categoryDistribution: categoryCounts
    };
  }
}