// services/userService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface User {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  // Get all users with pagination and filters
  static async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    const {
      search = '',
      role,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Get order counts and total spent for each user
    const usersWithStats = await Promise.all(
      (data || []).map(async (user) => {
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select('total')
          .eq('user_id', user.id);

        if (orderError) {
          return { ...user, total_orders: 0, total_spent: 0 };
        }

        return {
          ...user,
          total_orders: orders?.length || 0,
          total_spent: orders?.reduce((sum, order) => sum + order.total, 0) || 0
        };
      })
    );

    return {
      data: usersWithStats as User[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // Get single user by ID
  static async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Get user orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    return {
      ...data,
      total_orders: orders?.length || 0,
      total_spent: orders?.reduce((sum, order) => sum + order.total, 0) || 0
    } as User;
  }

  // Update user role
  static async updateUserRole(id: string, role: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as User;
  }

  // Update user profile
  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: user, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return user as User;
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Get user statistics
  static async getUserStats() {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('role, created_at');

    if (error) {
      throw new Error(error.message);
    }

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const managerCount = users.filter(u => u.role === 'manager').length;
    const customerCount = users.filter(u => u.role === 'customer').length;

    // Users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsers = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userCounts = new Map();
    monthlyUsers.data?.forEach(user => {
      const month = months[new Date(user.created_at).getMonth()];
      userCounts.set(month, (userCounts.get(month) || 0) + 1);
    });

    return {
      totalUsers,
      adminCount,
      managerCount,
      customerCount,
      monthlyGrowth: Array.from(userCounts.entries()).map(([month, count]) => ({
        month,
        count
      }))
    };
  }
}