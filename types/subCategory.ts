// types/subCategory.ts
import { Category } from './category';

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  category?: Category; // For joined queries
}

export interface CreateSubCategoryDTO {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateSubCategoryDTO {
  category_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  status?: 'active' | 'inactive';
}

export interface SubCategoryFilters {
  search?: string;
  category_id?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'slug' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface SubCategoryResponse {
  data: SubCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}