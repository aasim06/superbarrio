"use client";

import React from "react";
import { LeafIcon } from "@/icons";

interface SuperBarrioLogoProps {
  collapsed?: boolean;
  className?: string;
  showSubtitle?: boolean;
}

export const SuperBarrioLogo: React.FC<SuperBarrioLogoProps> = ({
  collapsed = false,
  className = "",
  showSubtitle = true,
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Box */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_4px_14px_rgba(22,163,74,0.35)] transition-transform duration-200 hover:scale-105">
        <LeafIcon className="h-5 w-5" />
        <span className="absolute -top-0.5 -end-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400 ring-1 ring-white dark:ring-gray-900" />
        </span>
      </div>

      {/* Brand Typography (visible when sidebar is expanded) */}
      {!collapsed && (
        <div className="flex flex-col text-start min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-outfit text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Super<span className="text-emerald-600 dark:text-emerald-400">Barrio</span>
            </span>
            <span className="rounded-full bg-emerald-100/90 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-emerald-800 uppercase dark:bg-emerald-950/80 dark:text-emerald-300">
              HUB
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[10px] font-semibold text-gray-400 dark:text-emerald-300/70 tracking-wide truncate">
              Supermercado Control
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperBarrioLogo;

