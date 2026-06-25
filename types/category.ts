// types/category.ts
export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  status?: 'active' | 'inactive';
}

export interface CategoryFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'slug' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SlugValidationResponse {
  available: boolean;
  message?: string;
  suggested?: string;
}