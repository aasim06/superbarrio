export function getCurrencySymbol(locale?: string): string {
  return "€";
}

export function formatPrice(amount: number, locale?: string): string {
  if (locale === "es") {
    // Spanish format: "1,85 €"
    return `${amount.toFixed(2).replace(".", ",")} €`;
  }
  // English format for Spain euro store: "€1.85"
  return `€${amount.toFixed(2)}`;
}

export function formatCompactCurrency(
  amount: number,
  locale?: string,
): string {
  if (locale === "es") {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1).replace(".", ",")}k €`;
    }
    return `${Math.round(amount).toLocaleString("es-ES")} €`;
  }
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}k`;
  }
  return `€${Math.round(amount).toLocaleString("en-US")}`;
}
