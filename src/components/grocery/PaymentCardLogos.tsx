"use client";

import React from "react";

interface LogoProps {
  className?: string;
}

// 1. Bizum Logo (Spain's #1 Instant Mobile Payment)
export const BizumLogo: React.FC<LogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 68 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Bizum"
  >
    {/* Stylized Bizum circular loop mark */}
    <circle cx="12" cy="12" r="10.5" fill="#00A99D" />
    <path
      d="M8.5 15.5L15.5 8.5M8.5 8.5L15.5 15.5"
      stroke="white"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1.5" fill="white" />
    {/* bizum typography */}
    <text
      x="26"
      y="16.5"
      fill="#00A99D"
      fontSize="13"
      fontWeight="900"
      letterSpacing="-0.5px"
      fontFamily="Outfit, system-ui, sans-serif"
    >
      bizum
    </text>
  </svg>
);

// 2. Visa Logo
export const VisaLogo: React.FC<LogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 54 20"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="VISA"
  >
    <path
      d="M19.8 1.5L14.7 18.5H9.7L6.6 4.4C6.3 3.3 6.1 2.5 5.3 2C4.1 1.3 2.1 0.7 0.3 0.3L0.5 0H8.4C9.5 0 10.4 0.8 10.7 2L12.7 12.6L17.3 1.5H19.8ZM37.3 12.4C37.3 7.7 30.7 7.4 30.8 5.3C30.8 4.6 31.5 3.9 32.8 3.8C33.5 3.7 35.3 3.6 37.4 4.5L38.1 1.2C37 0.8 35.6 0.5 33.8 0.5C29.4 0.5 26.3 2.8 26.2 6.1C26.1 8.6 28.3 9.9 30 10.8C31.7 11.6 32.3 12.2 32.3 12.9C32.3 14.1 30.9 14.6 29.6 14.6C28.3 14.6 27.6 14.3 26.4 13.8L25.9 16.2C27 16.7 28.9 17 30.9 17C35.5 17 38.5 14.7 38.5 11.2L37.3 12.4ZM49.1 18.5H53.2L50.7 1.5H47C46.1 1.5 45.4 2 45.1 2.8L38.8 18.5H43.7L44.7 15.7H50.6L49.1 18.5ZM46.1 12.2L48.6 5.4L50 12.2H46.1ZM26.4 1.5L22.6 18.5H18L21.8 1.5H26.4Z"
      fill="#1A1F71"
      className="dark:fill-[#2B6CB0]"
    />
  </svg>
);

// 3. Mastercard Logo
export const MastercardLogo: React.FC<LogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 36 22"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Mastercard"
  >
    <circle cx="12" cy="11" r="9" fill="#EB001B" />
    <circle cx="24" cy="11" r="9" fill="#F79E1B" fillOpacity="0.95" />
    <path
      d="M18 4.67a9 9 0 0 1 0 12.66 9 9 0 0 1 0-12.66z"
      fill="#FF5F00"
    />
  </svg>
);

// 4. Apple Pay Logo
export const ApplePayLogo: React.FC<LogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 46 20"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Apple Pay"
  >
    {/* Apple Logo Silhouette */}
    <path d="M10.2 4.6c-.6.8-1.5 1.3-2.4 1.2-.1-.9.3-1.8.8-2.5.6-.7 1.6-1.2 2.4-1.3.1 1-.2 1.8-.8 2.6zm.8 1.4c-1.3-.1-2.4.8-3 .8-.6 0-1.6-.7-2.6-.7-1.4 0-2.6.8-3.3 2-1.5 2.5-.4 6.3 1.1 8.3.7 1.1 1.6 2.2 2.8 2.2 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1 2.7-2.1.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.4 0-2.1 1.7-3.2 1.8-3.2-1-1.5-2.6-1.7-3.2-1.6zM22.1 3.2h4.5c2.4 0 4.1 1.7 4.1 4.1s-1.7 4.1-4.1 4.1h-2.5v5.3h-2V3.2zm4.3 6.4c1.4 0 2.3-.9 2.3-2.3 0-1.4-.9-2.3-2.3-2.3h-2.3v4.6h2.3zM32.8 12.8c0-1.6 1.3-2.6 3.6-2.7l2.4-.2v-.6c0-1-.7-1.6-1.9-1.6-1 0-1.7.4-1.9 1.1h-1.8c.2-1.6 1.7-2.6 3.7-2.6 2.2 0 3.7 1.1 3.7 2.9v7.6h-1.9v-1.6c-.6 1.1-1.8 1.8-3.1 1.8-1.9 0-3.3-1.1-3.3-2.7zm6-1.3v-.8l-2.2.1c-1.4.1-2.1.7-2.1 1.5 0 .9.8 1.4 1.8 1.4 1.4 0 2.5-.9 2.5-2.2zM43.7 19.9l1.6-4.9-3.7-8.3h2.1l2.6 6.3 2.5-6.3h2.1l-5.3 11.7h-1.9z" />
  </svg>
);

// 5. PayPal Logo
export const PayPalLogo: React.FC<LogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 48 20"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="PayPal"
  >
    {/* Dark Blue First P */}
    <path
      d="M13.6 2.2H6.4C5.8 2.2 5.3 2.6 5.2 3.2L2.3 17.6C2.2 18 2.5 18.4 2.9 18.4H6.5C7 18.4 7.4 18 7.5 17.5L8.4 13.2C8.5 12.6 9 12.2 9.6 12.2H12C15.8 12.2 18.4 10.3 18.9 6.7C19.2 5.2 18.7 3.9 17.6 3.1C16.6 2.5 15.3 2.2 13.6 2.2Z"
      fill="#003087"
    />
    {/* Light Blue Second Overlapping P */}
    <path
      d="M15.4 6.2H10.8C10.4 6.2 10.1 6.5 10 6.9L8.7 13.6C8.6 14.1 8.9 14.5 9.4 14.5H12.2C12.7 14.5 13.1 14.1 13.2 13.6L13.8 10.3C13.9 9.8 14.3 9.4 14.8 9.4H16.2C19.1 9.4 21.1 7.9 21.6 5.2C21.8 3.9 21.3 3 20.5 2.4C19.5 3.3 18 4.2 16.1 4.7C15.8 5.6 15.6 6.2 15.4 6.2Z"
      fill="#0079C1"
    />
    {/* PayPal Wordmark Text */}
    <text
      x="24"
      y="15.5"
      fill="#003087"
      fontSize="13"
      fontWeight="900"
      fontStyle="italic"
      fontFamily="Outfit, system-ui, sans-serif"
      className="dark:fill-[#63B3ED]"
    >
      PayPal
    </text>
  </svg>
);

// 6. Cash on Delivery / Efectivo Icon
export const CashBadgeIcon: React.FC<LogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" />
    <path d="M6 9h.01M18 15h.01" strokeLinecap="round" />
  </svg>
);

// 7. Reusable Payment Pill Wrapper
export const PaymentBadge: React.FC<{
  children: React.ReactNode;
  label?: string;
  title?: string;
}> = ({ children, label, title }) => (
  <div
    title={title || label}
    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-gray-200/90 bg-white px-2.5 py-1 shadow-2xs transition-transform hover:scale-105 dark:border-gray-700/80 dark:bg-gray-800"
  >
    {children}
    {label && (
      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
        {label}
      </span>
    )}
  </div>
);
