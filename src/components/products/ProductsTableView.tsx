"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";
import {
  GROCERY_CATEGORIES,
  getAllProducts,
  saveProduct,
  deleteProduct,
} from "@/data/groceryData";
import { GroceryProduct } from "@/types/grocery";
import {
  PlusIcon,
  TrashBinIcon,
  PencilIcon,
  SearchIcon,
  RefreshIcon,
  EyeIcon,
  LeafIcon,
  AlertIcon,
  CheckCircleIcon,
  CloseIcon,
  BoxCubeIcon,
} from "@/icons";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/utils/currency";

const PRESET_IMAGES = [
  {
    name: "Plátanos de Canarias",
    category: "fruits-vegetables",
    url: "/images/grocery/platano-canarias.jpg",
  },
  {
    name: "Manzanas Royal Gala",
    category: "fruits-vegetables",
    url: "/images/grocery/manzana-royal-gala.jpg",
  },
  {
    name: "Zanahorias de Huerta",
    category: "fruits-vegetables",
    url: "/images/grocery/zanahorias-dulces.jpg",
  },
  {
    name: "Mandarinas Clemenules",
    category: "fruits-vegetables",
    url: "/images/grocery/mandarinas-clemenules.jpg",
  },
  {
    name: "Tomates de Ensalada",
    category: "fruits-vegetables",
    url: "/images/grocery/tomates-ensalada.jpg",
  },
  {
    name: "Aguacates Hass",
    category: "fruits-vegetables",
    url: "/images/grocery/aguacates-hass.jpg",
  },
];

const UNIT_PRESETS = [
  "1 kg",
  "500g",
  "250g",
  "1 Dozen",
  "Pack of 4",
  "1 Liter",
  "500 ml",
  "1 Piece",
];

export default function ProductsTableView() {
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState(
    GROCERY_CATEGORIES.filter((c) => c.id !== "all")
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // all | in_stock | low_stock | out_of_stock
  const [sortBy, setSortBy] = useState("default"); // default | price_asc | price_desc | stock_desc | stock_asc | name_asc

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GroceryProduct | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<GroceryProduct | null>(null);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Edit Form Fields
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editUnit, setEditUnit] = useState("1 kg");
  const [editCategory, setEditCategory] = useState("fruits-vegetables");
  const [editStockQuantity, setEditStockQuantity] = useState("50");
  const [editLowStockThreshold, setEditLowStockThreshold] = useState("10");
  const [editInStock, setEditInStock] = useState(true);
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load products
  const refreshProducts = () => {
    setProducts(getAllProducts());
  };

  useEffect(() => {
    refreshProducts();

    const handleUpdate = () => {
      refreshProducts();
    };

    window.addEventListener("grocery-products-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("grocery-products-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.length) {
          setCategoriesList(d.data);
        }
      })
      .catch(() => {});
  }, []);

  // Calculate profit margin for edit modal
  const editSaleNum = parseFloat(editPrice) || 0;
  const editCostNum = parseFloat(editCostPrice) || 0;
  const editProfit = editSaleNum - editCostNum;
  const editMarginPercent =
    editSaleNum > 0 ? ((editProfit / editSaleNum) * 100).toFixed(1) : "0.0";

  // Category map for quick lookup
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoriesList.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categoriesList]);

  // Dropdown options
  const categoryFilterOptions = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...categoriesList.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    ],
    [categoriesList]
  );

  const categoryEditOptions = useMemo(
    () =>
      categoriesList.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categoriesList]
  );

  const stockStatusOptions = useMemo(
    () => [
      { value: "all", label: "All Stock Statuses" },
      { value: "in_stock", label: "In Stock" },
      { value: "low_stock", label: "Low Stock (Alert)" },
      { value: "out_of_stock", label: "Out of Stock" },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "default", label: "Sort: Default" },
      { value: "name_asc", label: "Name: A to Z" },
      { value: "price_asc", label: "Price: Low to High" },
      { value: "price_desc", label: "Price: High to Low" },
      { value: "stock_desc", label: "Highest Stock" },
      { value: "stock_asc", label: "Lowest Stock" },
    ],
    []
  );

  // Overall catalog metrics
  const metrics = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalInventoryValue = 0;

    products.forEach((p) => {
      const stock = p.stockQuantity ?? 50;
      const threshold = p.lowStockThreshold ?? 10;
      totalInventoryValue += p.price * stock;

      if (!p.inStock || stock === 0) {
        outOfStock++;
      } else if (stock <= threshold) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return { total, inStock, lowStock, outOfStock, totalInventoryValue };
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const nameEnMatch = p.nameEn?.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const originMatch = p.origin?.toLowerCase().includes(q);
        return Boolean(nameMatch || nameEnMatch || skuMatch || catMatch || originMatch);
      });
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Stock status filter
    if (stockFilter !== "all") {
      list = list.filter((p) => {
        const stock = p.stockQuantity ?? 50;
        const threshold = p.lowStockThreshold ?? 10;
        if (stockFilter === "out_of_stock") {
          return !p.inStock || stock === 0;
        }
        if (stockFilter === "low_stock") {
          return p.inStock && stock > 0 && stock <= threshold;
        }
        if (stockFilter === "in_stock") {
          return p.inStock && stock > threshold;
        }
        return true;
      });
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "stock_desc":
        list.sort((a, b) => (b.stockQuantity ?? 50) - (a.stockQuantity ?? 50));
        break;
      case "stock_asc":
        list.sort((a, b) => (a.stockQuantity ?? 50) - (b.stockQuantity ?? 50));
        break;
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Multi-select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Edit Modal
  const openEditModal = (product: GroceryProduct) => {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditSku(product.sku || "");
    setEditPrice(product.price ? product.price.toString() : "");
    setEditOriginalPrice(
      product.originalPrice ? product.originalPrice.toString() : ""
    );
    setEditCostPrice(product.costPrice ? product.costPrice.toString() : "");
    setEditUnit(product.unit || "1 kg");
    setEditCategory(product.category || "fruits-vegetables");
    setEditStockQuantity(
      product.stockQuantity !== undefined ? product.stockQuantity.toString() : "50"
    );
    setEditLowStockThreshold(
      product.lowStockThreshold !== undefined
        ? product.lowStockThreshold.toString()
        : "10"
    );
    setEditInStock(product.inStock !== false);
    setEditExpiryDate(product.expiryDate || "");
    setEditImageUrl(product.imageUrl || "");
    setEditBadge(product.badge || "");
    setEditOrigin(product.origin || "");
    setEditDescription(product.description || "");
    setIsEditModalOpen(true);
  };

  // Save Edit Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editName.trim()) {
      alert("Please provide a product name.");
      return;
    }
    const saleNum = parseFloat(editPrice);
    if (isNaN(saleNum) || saleNum <= 0) {
      alert("Please provide a valid sale price.");
      return;
    }

    const origNum = parseFloat(editOriginalPrice);
    const costNum = parseFloat(editCostPrice);
    const stockNum = parseInt(editStockQuantity, 10) || 0;
    const lowStockNum = parseInt(editLowStockThreshold, 10) || 10;

    const updatedProduct: GroceryProduct = {
      ...editingProduct,
      name: editName.trim(),
      nameEn: editingProduct.nameEn || editName.trim(),
      sku: editSku.trim() || undefined,
      category: editCategory,
      price: saleNum,
      originalPrice: origNum > 0 ? origNum : undefined,
      costPrice: costNum > 0 ? costNum : undefined,
      unit: editUnit.trim() || "1 item",
      stockQuantity: stockNum,
      lowStockThreshold: lowStockNum,
      inStock: editInStock && stockNum > 0,
      expiryDate: editExpiryDate || undefined,
      badge: editBadge.trim() || undefined,
      origin: editOrigin.trim() || "SuperBarrio",
      imageUrl: editImageUrl.trim(),
      description: editDescription.trim(),
    };

    // Save in local storage & dispatch sync
    saveProduct(updatedProduct);

    // Sync with API
    fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    }).catch((err) => console.warn("API sync error:", err));

    refreshProducts();
    setIsEditModalOpen(false);
    showToast(`Product "${updatedProduct.name}" updated successfully!`);
  };

  // Open Delete Single Modal
  const openDeleteModal = (product: GroceryProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Confirm Single Delete
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const id = productToDelete.id;
    const name = productToDelete.name;

    deleteProduct(id);

    // Sync with API
    fetch(`/api/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("API delete error:", err));

    setSelectedIds((prev) => prev.filter((item) => item !== id));
    refreshProducts();
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
    showToast(`Product "${name}" deleted successfully.`);
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = () => {
    selectedIds.forEach((id) => {
      deleteProduct(id);
      fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    });

    const count = selectedIds.length;
    setSelectedIds([]);
    refreshProducts();
    setIsBulkDeleteModalOpen(false);
    showToast(`${count} products deleted successfully.`);
  };

  // Helper to generate SKU
  const generateSku = () => {
    const prefix = editName
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w.slice(0, 3).toUpperCase())
      .join("-");
    const num = Math.floor(100 + Math.random() * 900);
    setEditSku(`SB-${prefix || "PRD"}-${num}`);
  };

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-99999 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-semibold text-emerald-800 shadow-2xl transition-all duration-300 dark:border-emerald-800/60 dark:bg-gray-900 dark:text-emerald-300">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
          </span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Products */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Catalog Items
            </p>
            <h4 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
              {metrics.total}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Active supermarket products
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <BoxCubeIcon className="h-6 w-6" />
          </div>
        </div>

        {/* In Stock */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              In Stock Units
            </p>
            <h4 className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.inStock}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ready for immediate dispatch
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <LeafIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Low Stock Alerts
            </p>
            <h4 className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
              {metrics.lowStock}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Needs replenishment soon
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Out of Stock
            </p>
            <h4 className="mt-2 text-2xl font-black text-red-600 dark:text-red-400">
              {metrics.outOfStock}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Disabled on customer storefront
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <ComponentCard
        title="Products Inventory Table"
        desc="Complete grocery catalog with real-time editing, delete operations, and inventory synchronization."
      >
        <div className="space-y-4">
          {/* Header Controls: Search, Filters, and + Add Product Button */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <SearchIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search products by title, SKU, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Professional Custom Dropdowns & Add Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <div className="w-48 sm:w-52">
                <Select
                  options={categoryFilterOptions}
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                  placeholder="Select Category"
                />
              </div>

              {/* Stock Filter */}
              <div className="w-44 sm:w-48">
                <Select
                  options={stockStatusOptions}
                  value={stockFilter}
                  onChange={(val) => setStockFilter(val)}
                  placeholder="Stock Status"
                />
              </div>

              {/* Sort Order */}
              <div className="w-44 sm:w-48">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  placeholder="Sort By"
                  align="right"
                />
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={refreshProducts}
                title="Refresh product list"
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RefreshIcon className="h-4 w-4" />
                <span>Refresh</span>
              </button>

              {/* + Add Product Button */}
              <Link
                href="/add-product"
                className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white shadow-theme-xs transition hover:bg-brand-600 active:scale-95"
              >
                <PlusIcon className="h-4 w-4" />
                <span>+ Add Product</span>
              </Link>
            </div>
          </div>

          {/* Bulk Action Bar (when rows are selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5 border border-gray-200 dark:bg-gray-800/60 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="font-bold text-brand-600 dark:text-brand-400">
                  {selectedIds.length}
                </span>{" "}
                product(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  <TrashBinIcon className="h-3.5 w-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full min-w-[980px] divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
                <tr>
                  <th className="w-10 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Product Details</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">SKU / Code</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Category</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Sale Price</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Cost & Margin</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Stock & Status</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700 dark:divide-gray-800 dark:bg-gray-900 dark:text-gray-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                        <BoxCubeIcon className="h-7 w-7" />
                      </div>
                      <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                        No products found
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {searchQuery || selectedCategory !== "all" || stockFilter !== "all"
                          ? "Try adjusting your search query or filters to find what you are looking for."
                          : "No products added yet. Click '+ Add Product' to start building your supermarket catalog."}
                      </p>
                      {(searchQuery || selectedCategory !== "all" || stockFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            setStockFilter("all");
                          }}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Clear all filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    const stock = p.stockQuantity ?? 50;
                    const threshold = p.lowStockThreshold ?? 10;
                    const isOut = !p.inStock || stock === 0;
                    const isLow = p.inStock && stock > 0 && stock <= threshold;

                    // Margin
                    const cost = p.costPrice ?? (p.price * 0.6);
                    const margin = p.price > 0 ? (((p.price - cost) / p.price) * 100).toFixed(0) : "0";

                    return (
                      <tr
                        key={p.id}
                        className={`transition hover:bg-gray-50/70 dark:hover:bg-gray-800/50 ${
                          isSelected ? "bg-brand-50/40 dark:bg-brand-950/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(p.id)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                          />
                        </td>

                        {/* Product Details (Image, Title, Unit, Badge) */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-black text-gray-400">
                                  {p.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 line-clamp-1 dark:text-white">
                                  {p.name}
                                </span>
                                {p.badge && (
                                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{p.unit}</span>
                                {p.origin && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[150px]">{p.origin}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {p.sku || `SB-${p.id}`}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium capitalize text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                            {categoryMap[p.category] || p.category.replace("-", " ")}
                          </span>
                        </td>

                        {/* Sale Price & Discount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatPrice(p.price)}
                          </div>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <div className="text-[11px] text-gray-400 line-through">
                              {formatPrice(p.originalPrice)}
                            </div>
                          )}
                        </td>

                        {/* Cost & Margin */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {p.costPrice ? formatPrice(p.costPrice) : "—"}
                          </div>
                          <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            +{margin}% margin
                          </span>
                        </td>

                        {/* Stock & Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900 dark:text-white">
                              {stock} units
                            </span>
                            {isOut ? (
                              <Badge color="error">Out of Stock</Badge>
                            ) : isLow ? (
                              <Badge color="warning">Low Stock</Badge>
                            ) : (
                              <Badge color="success">In Stock</Badge>
                            )}
                          </div>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Storefront link */}
                            <Link
                              href="/grocery"
                              title="View in Customer Storefront"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              title="Edit product details"
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-300 dark:hover:bg-brand-900/60"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => openDeleteModal(p)}
                              title="Delete product"
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <TrashBinIcon className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination & Link */}
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        </div>
      </ComponentCard>

      {/* ================= EDIT PRODUCT MODAL ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-3xl p-6 sm:p-8"
      >
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Product Details
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Update pricing, inventory levels, media, and categorization.
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            ID: {editingProduct?.id}
          </span>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Row 1: Title & SKU */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Product Title / Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Organic Gala Apples"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>SKU / Barcode</Label>
                <button
                  type="button"
                  onClick={generateSku}
                  className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Generate
                </button>
              </div>
              <Input
                type="text"
                placeholder="e.g. SB-APL-101"
                value={editSku}
                onChange={(e) => setEditSku(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Category / Department *</Label>
              <Select
                options={categoryEditOptions}
                value={editCategory}
                onChange={(val) => setEditCategory(val)}
                placeholder="Select category"
              />
            </div>
            <div>
              <Label>Unit / Size (e.g. 1 kg, 500g, 1 Dozen) *</Label>
              <Input
                type="text"
                placeholder="1 kg"
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {UNIT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditUnit(preset)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                      editUnit === preset
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Prices & Margin */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Sale Price (€) *</Label>
              <Input
                type="number"
                step={0.01}
                placeholder="3.49"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Original Price (€) [Discount]</Label>
              <Input
                type="number"
                step={0.01}
                placeholder="4.20"
                value={editOriginalPrice}
                onChange={(e) => setEditOriginalPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Cost Price (€) [Wholesale]</Label>
              <Input
                type="number"
                step={0.01}
                placeholder="2.10"
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Live Margin Banner */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2 text-xs border border-gray-100 dark:bg-gray-800/40 dark:border-gray-800">
            <span className="text-gray-600 dark:text-gray-400">
              Estimated Profit Margin:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +€{editProfit.toFixed(2)} ({editMarginPercent}%)
            </span>
          </div>

          {/* Row 4: Stock, Alert Limit & In Stock toggle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Stock Units Count</Label>
              <Input
                type="number"
                placeholder="50"
                value={editStockQuantity}
                onChange={(e) => setEditStockQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label>Low Stock Alert Limit</Label>
              <Input
                type="number"
                placeholder="10"
                value={editLowStockThreshold}
                onChange={(e) => setEditLowStockThreshold(e.target.value)}
              />
            </div>
            <div>
              <Label>Status / Availability</Label>
              <div className="flex h-11 items-center gap-3">
                <Switch
                  label={editInStock ? "Active / In Stock" : "Disabled (Out of Stock)"}
                  checked={editInStock}
                  onChange={(val) => setEditInStock(val)}
                />
              </div>
            </div>
          </div>

          {/* Row 5: Badge & Origin */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Product Badge (e.g. Fresh, 20% OFF, Bestseller)</Label>
              <Input
                type="text"
                placeholder="Fresh"
                value={editBadge}
                onChange={(e) => setEditBadge(e.target.value)}
              />
            </div>
            <div>
              <Label>Origin / Farm Location</Label>
              <Input
                type="text"
                placeholder="Murcia, Spain"
                value={editOrigin}
                onChange={(e) => setEditOrigin(e.target.value)}
              />
            </div>
          </div>

          {/* Row 6: Image URL with Presets */}
          <div>
            <Label>Product Image URL *</Label>
            <Input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
            />
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-gray-500">
                Or pick from sample images:
              </span>
              <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setEditImageUrl(img.url)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      editImageUrl === img.url
                        ? "border-brand-500 ring-2 ring-brand-500/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 7: Description */}
          <div>
            <Label>Description</Label>
            <TextArea
              rows={3}
              placeholder="Enter product description, freshness details, or recipe tips..."
              value={editDescription}
              onChange={(val) => setEditDescription(val)}
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-theme-xs transition hover:bg-brand-600 active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-md p-6"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <TrashBinIcon className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
            Delete Product?
          </h3>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              "{productToDelete?.name}"
            </span>
            ? This product will be immediately removed from the catalog, storefront, and inventory.
          </p>

          {/* Product Snippet */}
          {productToDelete && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left dark:border-gray-800 dark:bg-gray-800/60">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                {productToDelete.imageUrl && (
                  <img
                    src={productToDelete.imageUrl}
                    alt={productToDelete.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 line-clamp-1 dark:text-white">
                  {productToDelete.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  {productToDelete.sku || `SB-${productToDelete.id}`} • {formatPrice(productToDelete.price)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-1/2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="w-1/2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-theme-xs hover:bg-red-700 active:scale-95"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* ================= BULK DELETE MODAL ================= */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        className="max-w-md p-6"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <TrashBinIcon className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
            Delete {selectedIds.length} Products?
          </h3>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Are you sure you want to delete these {selectedIds.length} selected items? This action cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="w-1/2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmBulkDelete}
              className="w-1/2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-theme-xs hover:bg-red-700 active:scale-95"
            >
              Yes, Delete All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
