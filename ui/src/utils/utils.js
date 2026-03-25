import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes safely.
 * Allows overriding base component classes without conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
