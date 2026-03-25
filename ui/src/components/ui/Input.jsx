import React from "react";
import { cn } from "../../utils/utils";

const Input = React.forwardRef(
  ({ className, label, type = "text", error, icon: Icon, rightIcon: RightIcon, ...props }, ref) => {
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
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-10",
              RightIcon && "pr-12",
              error ? "border-red-500" : "border-border",
              className
            )}
            ref={ref}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center justify-center">
              {typeof RightIcon === 'function' ? <RightIcon size={18} /> : RightIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
