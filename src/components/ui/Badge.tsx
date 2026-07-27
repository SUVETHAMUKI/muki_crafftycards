import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        {
          "border-transparent bg-primary text-primary-foreground shadow": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground shadow": variant === "destructive",
          "border-transparent bg-emerald-500 text-white shadow dark:bg-emerald-600": variant === "success",
          "border-transparent bg-amber-500 text-white shadow dark:bg-amber-600": variant === "warning",
          "text-foreground border-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
