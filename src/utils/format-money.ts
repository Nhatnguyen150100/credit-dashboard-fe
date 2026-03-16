export const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
