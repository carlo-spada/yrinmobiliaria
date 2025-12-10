import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background transition-colors appearance-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
