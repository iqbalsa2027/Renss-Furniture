export function formatCurrency(amount: number, currencyCode = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}
