import React from "react";
import { cn } from "../../utils/utils";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-primary-600 text-white hover:bg-primary-700",
    secondary: "border-transparent bg-surface-hover text-text-primary hover:bg-surface-hover/80",
    destructive: "border-transparent bg-red-600/10 text-red-500 hover:bg-red-600/20",
    success: "border-transparent bg-green-600/10 text-green-500 hover:bg-green-600/20",
    warning: "border-transparent bg-amber-600/10 text-amber-500 hover:bg-amber-600/20",
    outline: "text-text-primary",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
