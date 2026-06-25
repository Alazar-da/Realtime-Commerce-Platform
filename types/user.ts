// types/user.ts

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  role: "admin" | "customer";
  created_at: string;
}