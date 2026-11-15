"use client";

import React, { useState, useMemo, useTransition } from "react";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import { CustomerRecord } from "@/types/customer";
import {
  Users,
  Search,
  RotateCw,
  Sparkles,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialCustomers: CustomerRecord[];
}

export default function CustomersTableClient({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "google" | "vip" | "buyers">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const itemsPerPage = 8;

  // Refresh customer list from live API
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/customers", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
        toast.success(`Synced ${data.data.length} registered customers.`);
      }
    } catch (err) {
      toast.error("Could not refresh customers list.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy email helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // KPI calculations
  const stats = useMemo(() => {
    const total = customers.length;
    const googleCount = customers.filter((c) => c.provider === "google").length;
    const buyersCount = customers.filter((c) => (c.ordersCount || 0) > 0).length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalPoints = customers.reduce((sum, c) => sum + (c.rewardPoints || 0), 0);
    return { total, googleCount, buyersCount, totalSpent, totalPoints };
  }, [customers]);

  // Tab & search filtering
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      // Tab filter
      if (activeTab === "google" && c.provider !== "google") return false;
      if (activeTab === "vip" && c.status !== "vip" && (c.ordersCount || 0) < 2) return false;
      if (activeTab === "buyers" && (!c.ordersCount || c.ordersCount === 0)) return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.provider && c.provider.toLowerCase().includes(q))
      );
    });
  }, [customers, search, activeTab]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "Recent";
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Registered
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Portal Accounts
            </span>
          </div>
        </div>

        {/* Google Authenticated */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Google Verified
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.googleCount}
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              OAuth 2.0
            </span>
          </div>
        </div>

        {/* Active Buyers */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active Shoppers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.buyersCount}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              €{stats.totalSpent.toFixed(2)} Vol
            </span>
          </div>
        </div>

        {/* VIP Loyalty Points */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Loyalty Points
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.totalPoints}
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              Pts Awarded
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        {/* Controls: Search, Tabs, Refresh */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              All Users ({customers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("google");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "google"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Google ({stats.googleCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("vip");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "vip"
                  ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-700 dark:text-emerald-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              VIP Club
            </button>
            <button
              onClick={() => {
                setActiveTab("buyers");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "buyers"
                  ? "bg-white text-amber-600 shadow-sm dark:bg-gray-700 dark:text-amber-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Ordered ({stats.buyersCount})
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh live customer records"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer shrink-0"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full min-w-[980px] divide-y divide-gray-100 dark:divide-gray-800 text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">Customer / Profile</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Auth & Email</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Phone & Contact</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Delivery City / Address</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Orders & Spent</th>
                <th className="px-4 py-3.5 whitespace-nowrap">VIP Points</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Last Login</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <UserCheck className="mx-auto h-8 w-8 mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium">No registered customers match your criteria.</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      New sign-ins from Google or Email will appear here dynamically.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const isGoogle = c.provider === "google";
                  const avatarSrc =
                    c.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      c.name || "Customer"
                    )}&background=10b981&color=fff&bold=true`;

                  return (
                    <tr
                      key={c.id || c.email}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Customer / Profile */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={avatarSrc}
                              alt={c.name}
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition shadow-sm"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  c.name || "U"
                                )}&background=10b981&color=fff&bold=true`;
                              }}
                            />
                            <span
                              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900"
                              title="Online / Active"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              {c.name}
                              {c.status === "vip" && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  VIP
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] font-mono text-gray-400 truncate max-w-[150px]">
                              {c.uid ? `UID: ${c.uid.slice(0, 12)}...` : "Registered"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Auth & Email */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {isGoogle ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24">
                                  <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                  />
                                </svg>
                                Google
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                <Mail className="h-2.5 w-2.5" />
                                Email
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <span className="font-medium select-all">{c.email}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(c.email);
                              }}
                              className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5 rounded"
                              title="Copy email"
                            >
                              {copiedEmail === c.email ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Contact */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-gray-700 dark:text-gray-300">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </td>

                      {/* Delivery Address */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 max-w-[220px]">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {c.city || "Valencia"}
                            </span>
                            {c.address && (
                              <p className="text-[11px] text-gray-400 truncate" title={c.address}>
                                {c.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Orders & Spent */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                            <ShoppingBag className="h-3 w-3 text-emerald-600" />
                            {c.ordersCount || 0} {c.ordersCount === 1 ? "order" : "orders"}
                          </span>
                          <p className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            €{(c.totalSpent || 0).toFixed(2)}
                          </p>
                        </div>
                      </td>

                      {/* VIP Loyalty Points */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 font-bold font-mono text-amber-700 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          {c.rewardPoints ?? 250} Pts
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDateTime(c.lastLoginAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.status === "vip" || (c.ordersCount || 0) >= 2 ? (
                          <Badge color="success">VIP Member</Badge>
                        ) : (
                          <Badge color="light">Active</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Customer Quick View Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedCustomer.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedCustomer.name
                    )}&background=10b981&color=fff&bold=true`
                  }
                  alt={selectedCustomer.name}
                  className="h-12 w-12 rounded-full ring-2 ring-emerald-500"
                />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Authentication</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-1">
                  {selectedCustomer.provider === "google" && "Google OAuth 2.0 (Verified)"}
                  {selectedCustomer.provider === "email" && "Email & Password"}
                  {selectedCustomer.provider === "guest" && "Guest Checkout"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Phone Contact</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {selectedCustomer.phone || "None registered"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-medium text-gray-900 dark:text-white text-right max-w-[220px]">
                  {selectedCustomer.address || "No address saved"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Total Orders Placed</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedCustomer.ordersCount || 0} orders (€{(selectedCustomer.totalSpent || 0).toFixed(2)})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Loyalty Balance</span>
                <span className="font-bold text-amber-600">
                  {selectedCustomer.rewardPoints ?? 250} Pts
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Last Portal Login</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {formatDateTime(selectedCustomer.lastLoginAt)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {selectedCustomer.phone && (
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                >
                  WhatsApp Contact
                </a>
              )}
              <a
                href={`mailto:${selectedCustomer.email}`}
                className="flex-1 text-center py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-xs transition"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
