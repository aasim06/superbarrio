"use client";

import React, { useState, useRef } from "react";
import { ChevronDownIcon, CheckLineIcon } from "@/icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  align?: "left" | "right";
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className = "",
  disabled = false,
  size = "md",
  align = "left",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const isSmall = size === "sm";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button - Clean & Icon-Free */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between border transition-all outline-none text-left",
          isSmall
            ? "h-8.5 rounded-lg px-2.5 text-[11px]"
            : "h-11 rounded-xl px-3.5 text-xs",
          isOpen
            ? "border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-gray-800"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
          disabled && "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
        )}
      >
        <span
          className={cn(
            "truncate font-medium",
            selectedOption
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDownIcon
          className={cn(
            "shrink-0 text-gray-400 transition-transform duration-200 ml-2",
            isSmall ? "size-3.5" : "size-4",
            isOpen && "rotate-180 text-brand-500"
          )}
        />
      </button>

      {/* Popover Dropdown Menu - Sleek, Elevated & Icon-Free */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] z-50 min-w-full rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0",
            isSmall ? "w-44" : "min-w-[220px]"
          )}
        >
          <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors",
                    isSmall ? "text-[11px] py-1.5" : "text-xs py-2",
                    isSelected
                      ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-500/20 dark:text-brand-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60"
                  )}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="block truncate font-medium">
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span className="block font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        {option.sublabel}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <CheckLineIcon
                      className={cn(
                        "shrink-0 text-brand-600 dark:text-brand-400 ml-auto",
                        isSmall ? "size-3.5" : "size-4"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
