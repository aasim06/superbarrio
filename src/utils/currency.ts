export function getCurrencySymbol(locale?: string): string {
  return locale === "es" ? "€" : "$";
}

export function formatPrice(amount: number, locale?: string): string {
  const symbol = getCurrencySymbol(locale);
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatCompactCurrency(
  amount: number,
  locale?: string,
): string {
  const symbol = getCurrencySymbol(locale);
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

