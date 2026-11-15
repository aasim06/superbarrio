import { z } from "zod";

export const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().optional().default("admin"),
  password: z.string().optional().default("admin"),
  role: z.string().min(1, "Role is required").default("Store Manager & Owner"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Phone number is required"),
  bio: z.string().optional().default("SuperBarrio Supermarket Administrator"),
  location: z.string().optional().default("Madrid, España"),
  avatarUrl: z.string().optional().default("/images/user/owner.png"),
  facebook: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  country: z.string().min(1, "Country is required").default("España"),
  cityState: z.string().min(1, "City / State is required").default("Madrid, España"),
  postalCode: z.string().min(1, "Postal code is required").default("28013"),
  taxId: z.string().min(1, "TAX ID is required").default("B-88392011"),
  twoFactorEnabled: z.boolean().default(false),
});

export type AdminProfileData = z.infer<typeof ProfileSchema>;

export const DEFAULT_ADMIN_PROFILE: AdminProfileData = {
  firstName: "Aasim",
  lastName: "Ameer",
  username: "admin",
  password: "admin",
  role: "Store Manager & Owner",
  email: "aasimameer06@gmail.com",
  phone: "+34 612 345 678",
  bio: "SuperBarrio Supermarket General Director & Store Administrator",
  location: "Madrid, España",
  avatarUrl: "/uploads/1794678331404-Screenshot_2026-09-21_132329.png",
  facebook: "https://facebook.com/superbarrio",
  twitter: "https://x.com/superbarrio",
  linkedin: "https://linkedin.com/company/superbarrio",
  instagram: "https://instagram.com/superbarrio",
  country: "España",
  cityState: "Madrid, España",
  postalCode: "28013",
  taxId: "B-88392011",
  twoFactorEnabled: false,
};

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(3, "Current password is required"),
    newPassword: z.string().min(4, "New password must be at least 4 characters"),
    confirmPassword: z.string().min(4, "Confirm password must be at least 4 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
