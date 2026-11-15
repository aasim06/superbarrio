"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CartIcon,
  ChevronDownIcon,
  DocsIcon,
  DollarLineIcon,
  GridIcon,
  HorizontaLDots,
  PlusIcon,
  TableIcon,
  UserCircleIcon,
  WhatsAppIcon,
} from "../icons/index";
import SuperBarrioLogo from "@/components/common/SuperBarrioLogo";

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  target?: string;
  subItems?: {
    key: string;
    label: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    target?: string;
  }[];
};

const groceryNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    key: "overview",
    label: "Overview",
    path: "/dashboard",
  },
  {
    icon: <CartIcon />,
    key: "orders",
    label: "Orders",
    path: "/orders",
  },
  {
    icon: <TableIcon />,
    key: "products",
    label: "Products",
    path: "/products",
  },
  {
    icon: <PlusIcon />,
    key: "add-product",
    label: "Add Product",
    path: "/add-product",
  },
  {
    icon: <DocsIcon />,
    key: "categories",
    label: "Categories",
    path: "/categories",
  },
  {
    icon: <BoxCubeIcon />,
    key: "inventory",
    label: "Inventory / Stock",
    path: "/inventory",
  },
  {
    icon: <UserCircleIcon />,
    key: "customers",
    label: "Customers",
    path: "/customers",
  },
  {
    icon: <DocsIcon />,
    key: "delivery",
    label: "Delivery & Zones",
    path: "/delivery",
  },
  {
    icon: <DollarLineIcon />,
    key: "coupons",
    label: "Coupons",
    path: "/coupons",
  },
];

const operationsNavItems: NavItem[] = [
  {
    icon: <WhatsAppIcon />,
    key: "whatsapp",
    label: "WhatsApp Dispatch",
    path: "/whatsapp",
    new: true,
  },
  {
    icon: <DocsIcon />,
    key: "khata",
    label: "B2B Credit & Khata",
    path: "/khata",
    new: true,
  },
  {
    icon: <UserCircleIcon />,
    key: "settings",
    label: "Settings",
    path: "/profile",
  },
  {
    icon: <CartIcon />,
    key: "storefront",
    label: "Live Storefront",
    path: "/grocery",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const normalizePath = useCallback((p?: string | null) => {
    if (!p) return "";
    const clean = p.split("?")[0].split("#")[0];
    const withoutLocale = clean.replace(/^\/(es|en|ar|de)(?=\/|$)/, "") || "/";
    return withoutLocale.length > 1 && withoutLocale.endsWith("/")
      ? withoutLocale.slice(0, -1)
      : withoutLocale;
  }, []);

  const isActive = useCallback(
    (path?: string) => {
      if (!path || !pathname) return false;
      return normalizePath(path) === normalizePath(pathname);
    },
    [pathname, normalizePath],
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav) => (
        <li key={nav.key}>
          <Link
            href={nav.path!}
            prefetch={true}
            className={cn(
              "menu-item group cursor-pointer",
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive",
              !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start",
            )}
          >
            <span
              suppressHydrationWarning
              className={cn(
                isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive",
              )}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text flex items-center justify-between w-full">
                <span>{nav.label}</span>
                {nav.new && (
                  <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    NEW
                  </span>
                )}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:mt-0 rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"
      } ${
        isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full rtl:translate-x-full"
      } xl:translate-x-0 xl:rtl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-6 ${
          !isExpanded && !isHovered ? "xl:justify-center px-2" : "justify-start px-6"
        }`}
      >
        <Link href="/dashboard" className="transition-transform active:scale-95">
          <SuperBarrioLogo collapsed={!isExpanded && !isHovered} />
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-3 flex text-xs font-bold tracking-wider text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Supermarket"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(groceryNavItems)}
            </div>

            <div>
              <h2
                className={`mb-3 flex text-xs font-bold tracking-wider text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Operations"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(operationsNavItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
