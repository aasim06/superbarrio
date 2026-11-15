export interface CustomerRecord {
  id: string;
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  streetAddress?: string;
  apartment?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  provider: "google" | "email" | "guest";
  lastLoginAt: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  rewardPoints: number;
  status: "active" | "vip" | "inactive";
}
