// lib/services/reviewService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface CreateReviewDTO {
  product_id: string;
  order_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

export class ReviewService {
  // Create a review
  static async createReview(userId: string, data: CreateReviewDTO): Promise<Review> {
    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert([{
        ...data,
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return review as Review;
  }

  // Get reviews for a product
  static async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<{
    reviews: Review[];
    total: number;
    rating: number;
  }> {
    // Get reviews
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, error, count } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:profiles(username)
      `, { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    // Get average rating
    const { data: ratingData } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    const averageRating = ratingData?.reduce((sum:any, r) => sum + r.rating, 0) / (ratingData?.length || 1) || 0;

    return {
      reviews: reviews as Review[],
      total: count || 0,
      rating: averageRating
    };
  }

  // Get user's reviews
  static async getUserReviews(userId: string): Promise<Review[]> {
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        product:products(name, slug, image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return reviews as Review[];
  }

  // Check if user can review a product (has purchased it)
  static async canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        items:order_items!inner(product_id)
      `)
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .eq('items.product_id', productId)
      .limit(1);

    if (error) {
      return false;
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .limit(1);

    return (orders && orders.length > 0) && (!existingReview || existingReview.length === 0);
  }

  // Get review stats for a product
  static async getReviewStats(productId: string): Promise<{
    total: number;
    average: number;
    distribution: { [key: number]: number };
  }> {
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    if (error) {
      throw new Error(error.message);
    }

    const total = reviews.length;
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / (total || 1);

    const distribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = reviews.filter(r => r.rating === i).length;
    }

    return { total, average, distribution };
  }

  // Mark review as helpful
  static async markHelpful(reviewId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_review_helpful', {
      review_id: reviewId
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Admin: Update review status
  static async updateReviewStatus(
    reviewId: string, 
    status: 'approved' | 'rejected',
    userId?: string
  ): Promise<Review> {
    const { data: review, error } = await supabase
      .from('product_reviews')
      .update({ 
        status, 
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return review as Review;
  }

  // Admin: Get all pending reviews
  static async getPendingReviews(limit: number = 50): Promise<Review[]> {
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:profiles(username, email),
        product:products(name, slug)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return reviews as Review[];
  }
}