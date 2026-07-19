// lib/services/productService.ts
import { createClient } from '@/lib/supabase/client';
import { 
  Product, 
  CreateProductDTO, 
  UpdateProductDTO, 
  ProductFilters, 
  ProductResponse 
} from '@/types/product';

const supabase = createClient();

export class ProductService {
  // Get all products with pagination and filters
  static async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const {
      search = '',
      category_id,
      sub_category_id,
      status = 'all',
      stock_status = 'all',
      featured,
      best_seller,
      on_sale,
      min_price,
      max_price,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Apply category filter
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (sub_category_id) {
      query = query.eq('sub_category_id', sub_category_id);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply stock status filter
    if (stock_status !== 'all') {
      query = query.eq('stock_status', stock_status);
    }

    // Apply featured filter
    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    // Apply best seller filter
    if (best_seller !== undefined) {
      query = query.eq('best_seller', best_seller);
    }

    // Apply on sale filter
    if (on_sale !== undefined) {
      query = query.eq('on_sale', on_sale);
    }

    // Apply price range filters
    if (min_price !== undefined) {
      query = query.gte('price', min_price);
    }

    if (max_price !== undefined) {
      query = query.lte('price', max_price);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data as Product[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('featured', true)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get best sellers
  static async getBestSellers(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('best_seller', true)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .order('sales_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get products on sale
  static async getProductsOnSale(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('on_sale', true)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get new arrivals (latest products)
  static async getNewArrivals(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string, limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get related products
  static async getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .neq('id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get single product by ID
  static async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Product;
  }

  // Get product by slug
  static async getProductBySlug(slug: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Product;
  }

  // Validate slug availability
  static async validateSlug(slug: string, excludeId?: string): Promise<{
    available: boolean; 
    message?: string; 
    suggested?: string
  }> {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return {
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      };
    }

    if (slug.length < 3 || slug.length > 100) {
      return {
        available: false,
        message: 'Slug must be between 3 and 100 characters'
      };
    }

    let query = supabase
      .from('products')
      .select('slug')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      // Generate suggestion
      let suggested = slug;
      let counter = 1;
      while (true) {
        const { data: checkData } = await supabase
          .from('products')
          .select('slug')
          .eq('slug', suggested);
        
        if (!checkData || checkData.length === 0) {
          break;
        }
        suggested = `${slug}-${counter}`;
        counter++;
      }
      
      return {
        available: false,
        message: 'This slug is already taken',
        suggested
      };
    }

    return { available: true };
  }

  // Validate SKU availability
  static async validateSku(sku: string, excludeId?: string): Promise<{
    available: boolean; 
    message?: string
  }> {
    if (!sku || sku.length < 3) {
      return {
        available: false,
        message: 'SKU must be at least 3 characters'
      };
    }

    let query = supabase
      .from('products')
      .select('sku')
      .eq('sku', sku);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return {
        available: false,
        message: 'This SKU is already in use'
      };
    }

    return { available: true };
  }

  // Create new product
  static async createProduct(data: CreateProductDTO): Promise<Product> {
    const { data: user } = await supabase.auth.getUser();
    
    // Validate slug
    const slugValidation = await this.validateSlug(data.slug);
    if (!slugValidation.available) {
      throw new Error(slugValidation.message || 'Invalid slug');
    }

    // Validate SKU
    const skuValidation = await this.validateSku(data.sku);
    if (!skuValidation.available) {
      throw new Error(skuValidation.message || 'Invalid SKU');
    }

    const productData = {
      ...data,
      created_by: user.user?.id,
      published_at: data.status === 'published' ? new Date().toISOString() : null
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return product as Product;
  }

  // Update product
  static async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    // If slug is being updated, validate it
    if (data.slug) {
      const slugValidation = await this.validateSlug(data.slug, id);
      if (!slugValidation.available) {
        throw new Error(slugValidation.message || 'Invalid slug');
      }
    }

    // If SKU is being updated, validate it
    if (data.sku) {
      const skuValidation = await this.validateSku(data.sku, id);
      if (!skuValidation.available) {
        throw new Error(skuValidation.message || 'Invalid SKU');
      }
    }

    const updateData = {
      ...data,
      published_at: data.status === 'published' ? new Date().toISOString() : null
    };

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return product as Product;
  }

      // Get product count
  static async getProductCount(): Promise<number> {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    
    // Delete gallery images
    if (product.gallery_images && product.gallery_images.length > 0) {
      for (const imageUrl of product.gallery_images) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('products')
            .remove([fileName]);
        }
      }
    }

    // Delete main image
    if (product.image_url) {
      const fileName = product.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('products')
          .remove([fileName]);
      }
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Update product stock
  static async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.getProductById(id);
    const newQuantity = product.stock_quantity + quantity;
    
    let stockStatus = product.stock_status;
    if (newQuantity <= 0) {
      stockStatus = 'out_of_stock';
    } else if (newQuantity <= product.low_stock_threshold) {
      stockStatus = 'backorder';
    } else {
      stockStatus = 'in_stock';
    }

    return this.updateProduct(id, {
      stock_quantity: newQuantity,
      stock_status: stockStatus
    });
  }


  // Bulk delete products
  static async bulkDeleteProducts(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteProduct(id);
    }
  }

  // Toggle product status
  static async toggleStatus(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    const newStatus = product.status === 'published' ? 'draft' : 'published';
   /*  return this.updateProduct(id, { 
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null
    }); */
     return this.updateProduct(id, { 
      status: newStatus
    });
  }

  // Toggle featured
  static async toggleFeatured(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    return this.updateProduct(id, { featured: !product.featured });
  }

  // Toggle best seller
  static async toggleBestSeller(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    return this.updateProduct(id, { best_seller: !product.best_seller });
  }

  // Toggle on sale
  static async toggleOnSale(id: string): Promise<Product> {
    const product = await this.getProductById(id);
    return this.updateProduct(id, { on_sale: !product.on_sale });
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_product_view', { product_id: id });
    if (error) {
      console.error('Failed to increment view count:', error);
    }
  }

  // Get inventory report
  static async getInventoryReport(): Promise<{
    totalProducts: number;
    totalStock: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const { data, error, count } = await supabase
      .from('products')
      .select('stock_quantity, stock_status, low_stock_threshold', { count: 'exact' });

    if (error) {
      throw new Error(error.message);
    }

    const totalProducts = count || 0;
    const totalStock = data?.reduce((sum, p) => sum + p.stock_quantity, 0) || 0;
    const outOfStock = data?.filter(p => p.stock_status === 'out_of_stock').length || 0;
    const lowStock = data?.filter(p => 
      p.stock_status === 'backorder' || 
      (p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold)
    ).length || 0;

    return { totalProducts, totalStock, lowStock, outOfStock };
  }

  // Search products for autocomplete
  static async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%,sku.ilike.%${query}%`)
      .eq('status', 'published')
      .eq('stock_status', 'in_stock')
      .order('name')
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Product[];
  }

  // Get products with filters for customer facing
  static async getCustomerProducts(filters: {
    search?: string;
    category?: string;
    sub_category?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
    page?: number;
    limit?: number;
  }): Promise<ProductResponse> {
    const {
      search = '',
      category,
      sub_category,
      min_price,
      max_price,
      sort = 'newest',
      page = 1,
      limit = 12
    } = filters;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        sub_category:sub_categories(*)
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('stock_status', 'in_stock');

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category.slug', category);
    }

    if (sub_category) {
      query = query.eq('sub_category.slug', sub_category);
    }

    if (min_price !== undefined) {
      query = query.gte('price', min_price);
    }

    if (max_price !== undefined) {
      query = query.lte('price', max_price);
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'popular':
        query = query.order('sales_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data as Product[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
}