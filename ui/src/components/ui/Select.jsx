import React from "react";
import { cn } from "../../utils/utils";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef(
  ({ className, label, error, icon: Icon, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-sm font-semibold text-text-secondary uppercase tracking-tight mb-1.5 block">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <Icon size={18} className={cn(error && "text-red-400")} />
            </div>
          )}
          <select
            className={cn(
              "flex h-11 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-all appearance-none font-semibold focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-10",
              "pr-10",
              error ? "border-red-500" : "border-border",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
