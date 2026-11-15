"use client";

import React from "react";
import CustomSelect, { CustomSelectOption } from "../ui/dropdown/CustomSelect";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  align?: "left" | "right";
}

export default function Select({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
  size = "md",
  align = "left",
}: SelectProps) {
  const currentValue = value !== undefined ? value : defaultValue;

  const customOptions: CustomSelectOption[] = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    sublabel: opt.sublabel,
  }));

  return (
    <CustomSelect
      options={customOptions}
      value={currentValue}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      size={size}
      align={align}
    />
  );
}
