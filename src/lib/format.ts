// Shared formatting helpers for calculators

export const currency = (value: number): string => {
  if (!isFinite(value) || isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
};

export const currencyDetailed = (value: number): string => {
  if (!isFinite(value) || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(value);
};

export const percent = (value: number, decimals = 2): string => {
  if (!isFinite(value) || isNaN(value)) return "0.00%";
  return `${value.toFixed(decimals)}%`;
};

export const number = (value: number, decimals = 2): string => {
  if (!isFinite(value) || isNaN(value)) return "0";
  return value.toLocaleString("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
