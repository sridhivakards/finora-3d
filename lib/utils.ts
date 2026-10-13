import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Indian currency representation (e.g., ₹1,03,000, ₹18,400, ₹71,600)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const [integerPart, decimalPart] = absAmount.toFixed(showDecimals ? 2 : 0).split(".");

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  const result = showDecimals && decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return `${isNegative ? "-" : ""}₹${result}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}
