import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  floatingLabel?: boolean;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, floatingLabel = false, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value !== '');
      props.onBlur?.(e);
    };

    if (floatingLabel && label) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-md border border-input bg-background px-4 pt-4 pb-2 text-sm ring-offset-background transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 text-muted-foreground pointer-events-none transition-all duration-200",
              isFocused || hasValue || props.value
                ? "top-1.5 text-xs"
                : "top-3.5 text-sm",
              isFocused && "text-primary",
              error && "text-destructive"
            )}
          >
            {label}
          </label>
          {error && (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
