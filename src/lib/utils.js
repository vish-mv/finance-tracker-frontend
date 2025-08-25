import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
};

export const monthNumberToShortName = (monthNumber) => {
  // Backend uses 1-12, map to Jan-Dec
  if (!monthNumber) return "";
  const date = new Date(2000, Math.max(0, Math.min(11, monthNumber - 1)), 1);
  return date.toLocaleString(undefined, { month: "short" });
};

export const authStorage = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },
  setToken(token) {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },
  clearToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },
};