"use client";

import React from "react";
import { AngleLeftIcon, AngleRightIcon } from "@/icons";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems === 0)) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  // Range calculation
  const startItem =
    totalItems !== undefined && itemsPerPage
      ? totalItems === 0
        ? 0
        : (currentPage - 1) * itemsPerPage + 1
      : undefined;
  const endItem =
    totalItems !== undefined && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

  return (
    <div
      className={`flex flex-col gap-3.5 py-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-bold text-gray-900 dark:text-white">{startItem}</span> to{" "}
          <span className="font-bold text-gray-900 dark:text-white">{endItem}</span> of{" "}
          <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> entries
        </div>
      ) : (
        <div />
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Prev Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="flex h-9 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <AngleLeftIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) =>
              typeof p === "string" ? (
                <span
                  key={`dots-${idx}`}
                  className="flex h-9 w-6 items-center justify-center text-xs text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-xs font-bold transition ${
                    currentPage === p
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "border border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:border-gray-800 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="flex h-9 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="hidden sm:inline">Next</span>
            <AngleRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
