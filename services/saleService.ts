// services/saleService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  sale_date: string;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    sku: string;
    image_url: string;
  };
}

export interface CreateSaleDTO {
  product_id: string;
  quantity: number;
  price: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
}

export class SaleService {
  // Create a sale and deduct stock
  static async createSale(data: CreateSaleDTO): Promise<Sale> {
    const { data: user } = await supabase.auth.getUser();
    
    const total = data.price * data.quantity;

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        product_id: data.product_id,
        quantity: data.quantity,
        price: data.price,
        total: total,
        customer_name: data.customer_name || null,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        created_by: user.user?.id || null,
        notes: data.notes || null,
        sale_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (saleError) {
      throw new Error(saleError.message);
    }

    // Deduct stock from product
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', data.product_id)
      .single();

    if (product) {
      const newStock = Math.max(0, product.stock_quantity - data.quantity);
      const stockStatus = newStock === 0 ? 'out_of_stock' : 'in_stock';

      await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          stock_status: stockStatus,
          sales_count: (product.sales_count || 0) + data.quantity
        })
        .eq('id', data.product_id);
    }

    return sale as Sale;
  }

  // Get all sales with product details
  static async getAllSales(filters?: {
    start_date?: string;
    end_date?: string;
    product_id?: string;
    limit?: number;
  }): Promise<Sale[]> {
    const {
      start_date,
      end_date,
      product_id,
      limit = 100
    } = filters || {};

    let query = supabase
      .from('sales')
      .select(`
        *,
        product:products(name, sku, image_url)
      `)
      .order('sale_date', { ascending: false })
      .limit(limit);

    if (start_date) {
      query = query.gte('sale_date', start_date);
    }

    if (end_date) {
      query = query.lte('sale_date', end_date);
    }

    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    const { data: sales, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return sales as Sale[];
  }

  // Get sales summary
  static async getSalesSummary(): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    todaySales: number;
    todayRevenue: number;
    topProducts: { product_name: string; total_sold: number; total_revenue: number }[];
  }> {
    // Get all sales
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products(name)
      `);

    if (error) {
      throw new Error(error.message);
    }

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);

    // Today's sales
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.sale_date).toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

    // Top products
    const productMap = new Map<string, { name: string; total_sold: number; total_revenue: number }>();
    for (const sale of sales) {
      const key = sale.product_id;
      const existing = productMap.get(key);
      if (existing) {
        existing.total_sold += sale.quantity;
        existing.total_revenue += sale.total;
      } else {
        productMap.set(key, {
          name: sale.product?.name || 'Unknown',
          total_sold: sale.quantity,
          total_revenue: sale.total
        });
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10);

    return {
      totalSales,
      totalRevenue,
      totalItems,
      todaySales: todaySales.length,
      todayRevenue,
      topProducts
    };
  }

  // Get sales by date range
  static async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:products(name, sku, image_url)
      `)
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return sales as Sale[];
  }
}