// types/product.ts
import { Category } from "./category";
import { SubCategory } from "./subCategory";
export interface Product {
  id: string;
  category_id: string;
  sub_category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  sku: string;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder' | 'discontinued';
  low_stock_threshold: number;
  image_url: string | null;
  gallery_images: string[] | null;
  video_url: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  best_seller: boolean;
  on_sale: boolean;
  rating: number;
  review_count: number;
  sales_count: number;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  published_at: string | null;
  category?: Category;
  sub_category?: SubCategory;
}

export interface CreateProductDTO {
  category_id: string;
  sub_category_id?: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  sku: string;
  stock_quantity?: number;
  stock_status?: 'in_stock' | 'out_of_stock' | 'backorder' | 'discontinued';
  low_stock_threshold?: number;
  image_url?: string;
  gallery_images?: string[];
  video_url?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  best_seller?: boolean;
  on_sale?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  tags?: string[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  sub_category_id?: string;
  status?: 'draft' | 'published' | 'archived' | 'all';
  stock_status?: 'in_stock' | 'out_of_stock' | 'backorder' | 'discontinued' | 'all';
  featured?: boolean;
  best_seller?: boolean;
  on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'sales_count' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}