"use client";

import React, { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import { formatPrice } from "@/utils/currency";
import Pagination from "@/components/tables/Pagination";
import { SearchIcon, CloseIcon } from "@/icons";

export interface Coupon {
  code: string;
  discount: string;
  minOrder: number;
  validUntil: string;
  status: string;
}

interface Props {
  coupons: Coupon[];
}

export default function CouponsTableClient({ coupons }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.toLowerCase().trim();
    return coupons.filter(
      (c) => c.code.toLowerCase().includes(q) || c.status.toLowerCase().includes(q)
    );
  }, [coupons, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <SearchIcon className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full min-w-[700px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Coupon Code</th>
              <th className="px-4 py-3 whitespace-nowrap">Discount</th>
              <th className="px-4 py-3 whitespace-nowrap">Min Order Amount</th>
              <th className="px-4 py-3 whitespace-nowrap">Valid Until</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                  No coupons found.
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={c.code} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {c.discount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatPrice(c.minOrder)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.validUntil}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge color={c.status === "Active" ? "success" : "light"}>{c.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
