import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "brand" | "dark" | "neutral" | "danger";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  brand: "bg-brand/10 text-emerald-700",
  dark: "bg-brand-dark/10 text-brand-dark",
  neutral: "bg-slate-100 text-slate-600",
  danger: "bg-red-100 text-red-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "brand", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold",
        VARIANT_CLASSES[variant],
        className
      )}
      {...rest}
    />
  );
}
