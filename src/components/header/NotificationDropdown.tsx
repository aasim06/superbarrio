"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  AlertCircle,
  Truck,
  CheckCheck,
  X,
  Clock,
} from "lucide-react";
import { StoreNotification } from "@/app/api/notifications/route";

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch store notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("grocery-orders-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("grocery-orders-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif: StoreNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    closeDropdown();
    router.push(notif.link);
  };

  const getNotificationIcon = (type: StoreNotification["type"]) => {
    switch (type) {
      case "order":
        return (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <ShoppingCart className="size-4" />
          </span>
        );
      case "low_stock":
        return (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <AlertTriangle className="size-4" />
          </span>
        );
      case "out_of_stock":
        return (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            <AlertCircle className="size-4" />
          </span>
        );
      case "delivery":
      default:
        return (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <Truck className="size-4" />
          </span>
        );
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
        aria-label="Store Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 z-10 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white dark:border-gray-900" />
          </span>
        )}
        <Bell className="size-5" />
      </button>

      {/* Notifications Dropdown Panel */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -left-13.5 mt-4.25 flex h-auto max-h-[500px] w-88 sm:w-96 flex-col rounded-2xl border border-gray-200 bg-white p-3.5 shadow-theme-lg xl:right-0 xl:left-auto dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-bold text-gray-800 dark:text-white">
              Store Notifications
            </h5>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
                title="Mark all as read"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeDropdown}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="custom-scrollbar max-h-80 overflow-y-auto space-y-1 pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              <p className="font-medium">No store notifications.</p>
              <p className="mt-0.5 text-[11px]">Everything is operating normally.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors",
                  notif.unread
                    ? "bg-brand-50/40 hover:bg-brand-50/70 dark:bg-brand-500/5 dark:hover:bg-brand-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                )}
              >
                {/* Icon */}
                {getNotificationIcon(notif.type)}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {notif.title}
                    </p>
                    {notif.unread && (
                      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                    {notif.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Clock className="size-3" />
                    <span>{notif.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: View All Orders */}
        <div className="mt-3 border-t border-gray-100 pt-2.5 dark:border-gray-800">
          <Link
            href="/orders"
            onClick={closeDropdown}
            className="block w-full rounded-xl border border-gray-200 bg-white py-2 text-center text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-brand-400 transition"
          >
            View All Live Orders & Dispatch
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
