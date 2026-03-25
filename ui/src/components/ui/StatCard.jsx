import React from "react";
import { cn } from "../../utils/utils";

function StatCard({ stat }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
            stat.colorClass || "bg-primary-500",
            "bg-opacity-10"
          )}
        >
          {stat.icon && (
            <stat.icon
              className={cn("w-6 h-6", stat.colorClass.replace("bg-", "text-"))}
            />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary line-clamp-1">{stat.title}</p>
          <h4 className="text-2xl font-semibold text-text-primary mt-1">
            {stat.value}
          </h4>
        </div>
      </div>
      {stat.subtitle && (
        <p className="text-xs font-medium text-text-muted mt-4 border-t border-border/50 pt-3">
          {stat.subtitle}
        </p>
      )}
    </div>
  );
}
;

export { StatCard };
