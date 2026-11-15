"use client";

import React, { useState, useMemo, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { formatPrice } from "@/utils/currency";
import { GroceryProduct } from "@/types/grocery";
import Pagination from "@/components/tables/Pagination";
import { getAllProducts } from "@/data/groceryData";
import { SearchIcon, CloseIcon } from "@/icons";

interface Props {
  initialProducts: GroceryProduct[];
}

export default function InventoryTableClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<GroceryProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setProducts(getAllProducts());
    const handleUpdate = () => setProducts(getAllProducts());
    window.addEventListener("grocery-products-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("grocery-products-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Search toolbar */}
      <div className="relative max-w-sm">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <SearchIcon className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search stock by SKU, name, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full min-w-[780px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">SKU</th>
              <th className="px-4 py-3 whitespace-nowrap">Product Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Category</th>
              <th className="px-4 py-3 whitespace-nowrap">Sale Price</th>
              <th className="px-4 py-3 whitespace-nowrap">Stock Units</th>
              <th className="px-4 py-3 whitespace-nowrap">Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                  No inventory products found matching &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const stock = p.stockQuantity ?? 50;
                const isLow = stock <= (p.lowStockThreshold ?? 10) && stock > 0;
                const isOut = stock === 0 || !p.inStock;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {p.sku || `SB-${p.id}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.unit}</div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize whitespace-nowrap">
                      {p.category.replace("-", " ")}
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">{stock}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isOut ? (
                        <Badge color="error">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge color="warning">Low Stock</Badge>
                      ) : (
                        <Badge color="success">In Stock</Badge>
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
  );
}
