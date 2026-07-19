// lib/services/categoryService.ts
import { createClient } from '@/lib/supabase/client';
import { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryFilters, CategoryResponse, SlugValidationResponse } from '@/types/category';

const supabase = createClient();

export class CategoryService {
  // Get all categories with pagination and filters
  static async getCategories(filters: CategoryFilters= {}): Promise<CategoryResponse> {
    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'desc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data as Category[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // Get single category by ID
  static async getCategoryById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Category;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Category;
  }

  // Validate slug availability
  static async validateSlug(slug: string, excludeId?: string): Promise<SlugValidationResponse> {
    // Check slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return {
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      };
    }

    // Check length
    if (slug.length < 3 || slug.length > 50) {
      return {
        available: false,
        message: 'Slug must be between 3 and 50 characters'
      };
    }

    // Check if slug exists
    let query = supabase
      .from('categories')
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
      const suggested = await this.generateUniqueSlug(slug);
      return {
        available: false,
        message: 'This slug is already taken',
        suggested
      };
    }

    return {
      available: true
    };
  }

  // Generate unique slug suggestion
  static async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data } = await supabase
        .from('categories')
        .select('slug')
        .eq('slug', slug);
      
      if (!data || data.length === 0) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Create new category
  static async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const { data: user } = await supabase.auth.getUser();
    
    // Validate slug
    const validation = await this.validateSlug(data.slug);
    if (!validation.available) {
      throw new Error(validation.message || 'Invalid slug');
    }

    const categoryData = {
      ...data,
      created_by: user.user?.id,
    };

    const { data: category, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return category as Category;
  }

  // Update category
  static async updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category> {
    // If slug is being updated, validate it
    if (data.slug) {
      const validation = await this.validateSlug(data.slug, id);
      if (!validation.available) {
        throw new Error(validation.message || 'Invalid slug');
      }
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return category as Category;
  }

// Get category count
  static async getCategoryCount(): Promise<number> {
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  // Check if category has related products
  static async getCategoryProductCount(categoryId: string): Promise<number> {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  // Check if category has related sub-categories
  static async getCategorySubCategoryCount(categoryId: string): Promise<number> {
    const { count, error } = await supabase
      .from('sub_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  // Delete category with check
  static async deleteCategory(categoryId: string): Promise<{ success: boolean; message?: string; relatedCount?: number }> {
    // Check for related products
    const productCount = await this.getCategoryProductCount(categoryId);
    if (productCount > 0) {
      return {
        success: false,
        message: `This category has ${productCount} product(s) associated with it. Please delete or reassign them first.`,
        relatedCount: productCount
      };
    }

    // Check for related sub-categories
    const subCategoryCount = await this.getCategorySubCategoryCount(categoryId);
    if (subCategoryCount > 0) {
      return {
        success: false,
        message: `This category has ${subCategoryCount} sub-category(ies) associated with it. Please delete or reassign them first.`,
        relatedCount: subCategoryCount
      };
    }

    // If no related items, delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  // Force delete with cascade (admin only)
  static async forceDeleteCategory(categoryId: string): Promise<void> {
    // Get all sub-categories
    const { data: subCategories } = await supabase
      .from('sub_categories')
      .select('id')
      .eq('category_id', categoryId);

    // Delete all products in sub-categories
    if (subCategories && subCategories.length > 0) {
      const subCategoryIds = subCategories.map(sc => sc.id);
      await supabase
        .from('products')
        .delete()
        .in('sub_category_id', subCategoryIds);
    }

    // Delete products directly in this category
    await supabase
      .from('products')
      .delete()
      .eq('category_id', categoryId);

    // Delete sub-categories
    await supabase
      .from('sub_categories')
      .delete()
      .eq('category_id', categoryId);

    // Delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(error.message);
    }
  }


  // Toggle category status
  static async toggleStatus(id: string): Promise<Category> {
    const category = await this.getCategoryById(id);
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    return this.updateCategory(id, { status: newStatus });
  }

  // Bulk delete categories
  static async bulkDeleteCategories(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(error.message);
    }
  }
}