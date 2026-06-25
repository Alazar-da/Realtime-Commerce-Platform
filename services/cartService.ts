// services/cartService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  grandTotal: number;
}

export class CartService {
  // Get cart items
  static async getCart(userId: string): Promise<CartResponse> {
    const { data: items, error } = await supabase
      .from('cart')
      .select(`
        *,
        product:products(
          id,
          name,
          slug,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    const subtotal = items?.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0) || 0;

    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const discount = 0;

    return {
      items: items || [],
      total: items?.length || 0,
      subtotal,
      tax,
      shipping,
      discount,
      grandTotal: subtotal + tax + shipping - discount
    };
  }

  // Add item to cart
  static async addToCart(userId: string, productId: string, quantity: number): Promise<void> {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('cart')
        .update({ 
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(error.message);
      }
    }
  }

  // Update cart item quantity
  static async updateCartItem(userId: string, productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return;
    }

    const { error } = await supabase
      .from('cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Remove item from cart
  static async removeFromCart(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Clear cart
  static async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Get cart count
  static async getCartCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('cart')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      return 0;
    }

    return count || 0;
  }

  // Sync cart with stock
  static async syncCartWithStock(userId: string): Promise<void> {
    const { data: items, error } = await supabase
      .from('cart')
      .select(`
        *,
        product:products(stock_quantity)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    for (const item of items) {
      if (item.quantity > item.product.stock_quantity) {
        await this.updateCartItem(userId, item.product_id, item.product.stock_quantity);
      }
    }
  }
}