// lib/services/subCategoryService.ts
import { createClient } from '@/lib/supabase/client';
import { 
  SubCategory, 
  CreateSubCategoryDTO, 
  UpdateSubCategoryDTO, 
  SubCategoryFilters, 
  SubCategoryResponse 
} from '@/types/subCategory';

const supabase = createClient();

export class SubCategoryService {
  // Get all sub-categories with pagination and filters
  static async getSubCategories(filters: SubCategoryFilters = {}): Promise<SubCategoryResponse> {
    const {
      search = '',
      category_id,
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('sub_categories')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' });

    // Apply category filter
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
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
      data: data as SubCategory[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // Get sub-categories by category ID
  static async getSubCategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
    const { data, error } = await supabase
      .from('sub_categories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data as SubCategory[];
  }

  // Get single sub-category by ID
  static async getSubCategoryById(id: string): Promise<SubCategory> {
    const { data, error } = await supabase
      .from('sub_categories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as SubCategory;
  }

  // Get sub-category by slug
  static async getSubCategoryBySlug(slug: string): Promise<SubCategory> {
    const { data, error } = await supabase
      .from('sub_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as SubCategory;
  }

  // Validate slug availability
  static async validateSlug(slug: string, excludeId?: string): Promise<{available: boolean; message?: string; suggested?: string}> {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return {
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      };
    }

    if (slug.length < 3 || slug.length > 50) {
      return {
        available: false,
        message: 'Slug must be between 3 and 50 characters'
      };
    }

    let query = supabase
      .from('sub_categories')
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
      const suggested = await this.generateUniqueSlug(slug);
      return {
        available: false,
        message: 'This slug is already taken',
        suggested
      };
    }

    return { available: true };
  }

  // Generate unique slug suggestion
  static async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data } = await supabase
        .from('sub_categories')
        .select('slug')
        .eq('slug', slug);
      
      if (!data || data.length === 0) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Create new sub-category
  static async createSubCategory(data: CreateSubCategoryDTO): Promise<SubCategory> {
    const { data: user } = await supabase.auth.getUser();
    
    // Validate slug
    const validation = await this.validateSlug(data.slug);
    if (!validation.available) {
      throw new Error(validation.message || 'Invalid slug');
    }

    const subCategoryData = {
      ...data,
      created_by: user.user?.id,
    };

    const { data: subCategory, error } = await supabase
      .from('sub_categories')
      .insert([subCategoryData])
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return subCategory as SubCategory;
  }

  // Update sub-category
  static async updateSubCategory(id: string, data: UpdateSubCategoryDTO): Promise<SubCategory> {
    // If slug is being updated, validate it
    if (data.slug) {
      const validation = await this.validateSlug(data.slug, id);
      if (!validation.available) {
        throw new Error(validation.message || 'Invalid slug');
      }
    }

    const { data: subCategory, error } = await supabase
      .from('sub_categories')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return subCategory as SubCategory;
  }

  // Delete sub-category
  static async deleteSubCategory(id: string): Promise<void> {
    // Get the sub-category to get the image URL
    const subCategory = await this.getSubCategoryById(id);
    
    // Delete the image from storage if it exists
    if (subCategory.image_url) {
      const fileName = subCategory.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('categories')
          .remove([fileName]);
      }
    }

    // Delete the sub-category
    const { error } = await supabase
      .from('sub_categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Toggle sub-category status
  static async toggleStatus(id: string): Promise<SubCategory> {
    const subCategory = await this.getSubCategoryById(id);
    const newStatus = subCategory.status === 'active' ? 'inactive' : 'active';
    return this.updateSubCategory(id, { status: newStatus });
  }

  // Bulk delete sub-categories
  static async bulkDeleteSubCategories(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('sub_categories')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Get sub-category count by category
  static async getCountByCategory(categoryId: string): Promise<number> {
    const { count, error } = await supabase
      .from('sub_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }
}