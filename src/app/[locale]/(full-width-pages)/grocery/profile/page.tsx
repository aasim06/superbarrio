"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { CustomerOrder } from "@/types/grocery";
import { formatPrice } from "@/utils/currency";
import { useLocale } from "next-intl";
import {
  User as UserIcon,
  Mail,
  MapPin,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  LogOut,
  LogIn,
  ArrowLeft,
  Plus,
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface SavedAddress {
  label: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  isDefault?: boolean;
}

export default function CustomerProfilePage() {
  const { user, logout, setIsAuthModalOpen } = useCustomerAuth();
  const locale = useLocale();
  const router = useRouter();

  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<SavedAddress>({
    label: "Home",
    fullName: user?.displayName || "",
    street: "Calle Gran Vía 28",
    apartment: "3º B",
    city: "Madrid",
    postalCode: "28013",
    province: "Madrid",
    phone: "612 345 678",
    isDefault: true,
  });

  useEffect(() => {
    // 1. Calculate orders stats
    try {
      const stored = localStorage.getItem("tailgrocery_orders");
      if (stored) {
        const list: CustomerOrder[] = JSON.parse(stored);
        const filtered = user?.email
          ? list.filter((o) => o.email?.toLowerCase() === user.email?.toLowerCase())
          : list;
        const validList = filtered.length > 0 ? filtered : list;
        setOrderCount(validList.length);
        const sum = validList.reduce((acc, curr) => acc + (curr.total || 0), 0);
        setTotalSpent(sum);
      }
    } catch {
      // ignore
    }

    // 2. Load saved address
    try {
      const saved = localStorage.getItem("tailgrocery_saved_address");
      if (saved) {
        const parsed = JSON.parse(saved);
        const addr: SavedAddress = {
          label: "Primary Delivery",
          fullName: parsed.fullName || user?.displayName || "Aasim Ameer",
          street: parsed.street || "Calle Gran Vía 28",
          apartment: parsed.apartment || "Piso 4",
          city: parsed.city || "Madrid",
          postalCode: parsed.postalCode || "28013",
          province: parsed.province || "Madrid",
          phone: parsed.phone || "612 345 678",
          isDefault: true,
        };
        setSavedAddresses([addr]);
        setAddressForm(addr);
      } else {
        const defaultAddr: SavedAddress = {
          label: "Home",
          fullName: user?.displayName || "Aasim Ameer",
          street: "Calle Gran Vía 28",
          apartment: "Piso 3º B",
          city: "Madrid",
          postalCode: "28013",
          province: "Madrid",
          phone: "612 345 678",
          isDefault: true,
        };
        setSavedAddresses([defaultAddr]);
        setAddressForm(defaultAddr);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("tailgrocery_saved_address", JSON.stringify(addressForm));
      setSavedAddresses([addressForm]);
      setIsEditingAddress(false);
      toast.success("Delivery address updated successfully!");
    } catch {
      toast.error("Could not save address.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#04130b] text-gray-900 dark:text-white pb-20 pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200/60 pb-4 dark:border-emerald-950/60">
          <div className="flex items-center gap-3">
            <Link
              href="/grocery"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-emerald-950 dark:bg-[#071910] dark:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Customer Profile & Addresses
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/70">
                Manage your personal information, delivery addresses and reward balance.
              </p>
            </div>
          </div>

          <Link
            href="/grocery/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Orders ({orderCount})</span>
          </Link>
        </div>

        {!user ? (
          /* Not Logged In State */
          <div className="rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <UserIcon className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold">You are browsing as Guest</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-emerald-300/70">
              Sign in with Google to view and update your profile, save your delivery addresses, and track orders.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-700 transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Profile Card */}
            <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-emerald-950/60 dark:bg-[#071910]">
              <div className="h-28 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 p-6 flex justify-end items-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                  Verified Google Customer
                </span>
              </div>
              <div className="relative px-6 pb-6 pt-0">
                <div className="-mt-14 mb-4 flex flex-wrap items-end justify-between gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white dark:ring-[#071910] shadow-lg bg-gray-100">
                    <img
                      src={user.photoURL || "/images/user/user-01.jpg"}
                      alt={user.displayName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100/80 transition-colors dark:border-red-950 dark:bg-red-950/20 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{user.displayName}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      VIP Member
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{user.email}</span>
                  </p>
                </div>

                {/* Stats Ribbon */}
                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-3.5 dark:bg-emerald-950/30 border border-gray-100 dark:border-emerald-900/40 text-center">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Total Orders</p>
                    <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                      {orderCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Reward Points</p>
                    <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                      {user.points || 250} Pts
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Total Spent</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                      {formatPrice(totalSpent, locale)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* VIP Loyalty Reward Progress */}
            <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 dark:border-amber-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      SuperBarrio Gold Rewards
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Earn 10 points for every €1 spent on organic vegetables and fruits
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                  {user.points || 250} / 500 Pts
                </span>
              </div>
              <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((user.points || 250) / 500) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500 font-medium">
                Reach 500 points to unlock an automatic €10 OFF coupon on your next checkout!
              </p>
            </div>

            {/* Delivery Addresses Section */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-emerald-950/60 dark:bg-[#071910]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-400">
                    Saved Delivery Addresses
                  </h3>
                  <p className="text-xs text-gray-500">
                    Your orders will be delivered here automatically in 20 minutes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>{isEditingAddress ? "Cancel" : "Edit Address"}</span>
                </button>
              </div>

              {isEditingAddress ? (
                /* Address Edit Form */
                <form onSubmit={handleSaveAddress} className="space-y-3.5 rounded-2xl bg-gray-50/70 p-4 dark:bg-emerald-950/30 border border-gray-200/60 dark:border-emerald-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-900 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-900 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-900 dark:bg-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Apartment/Floor
                      </label>
                      <input
                        type="text"
                        value={addressForm.apartment}
                        onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-900 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-900 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-emerald-900 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-emerald-950 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-700 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Address</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Saved Address Cards */
                <div className="space-y-3">
                  {savedAddresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                              {addr.label}
                            </h4>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Default
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                            {addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-emerald-300/70">
                            {addr.postalCode} {addr.city} ({addr.province})
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                            Contact: {addr.fullName} • +34 {addr.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
