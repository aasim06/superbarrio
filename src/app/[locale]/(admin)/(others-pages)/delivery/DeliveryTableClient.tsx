"use client";

import React, { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import { formatPrice } from "@/utils/currency";
import Pagination from "@/components/tables/Pagination";
import { SearchIcon, CloseIcon } from "@/icons";

export interface DeliveryZone {
  zone: string;
  codes: string;
  speed: string;
  fee: number;
  minOrder: number;
  status: string;
}

interface Props {
  zones: DeliveryZone[];
}

export default function DeliveryTableClient({ zones }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filtered = useMemo(() => {
    if (!search.trim()) return zones;
    const q = search.toLowerCase().trim();
    return zones.filter(
      (z) =>
        z.zone.toLowerCase().includes(q) ||
        z.codes.toLowerCase().includes(q) ||
        z.speed.toLowerCase().includes(q)
    );
  }, [zones, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <SearchIcon className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search delivery zones, codes..."
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
        <table className="w-full min-w-[780px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Zone Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Postal Codes</th>
              <th className="px-4 py-3 whitespace-nowrap">Dispatch Time</th>
              <th className="px-4 py-3 whitespace-nowrap">Standard Fee</th>
              <th className="px-4 py-3 whitespace-nowrap">Free Delivery Over</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                  No delivery zones found.
                </td>
              </tr>
            ) : (
              paginated.map((z) => (
                <tr key={z.zone} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {z.zone}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {z.codes}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{z.speed}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {z.fee === 0 ? "FREE" : formatPrice(z.fee)}
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-600 whitespace-nowrap">
                    {formatPrice(z.minOrder)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge color="success">{z.status}</Badge>
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
