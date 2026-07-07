import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-emerald-600 focus-visible:ring-brand shadow-sm",
  secondary: "bg-brand-dark text-white hover:bg-emerald-900 focus-visible:ring-brand-dark shadow-sm",
  outline: "border-2 border-brand text-brand-dark bg-white hover:bg-brand-50 focus-visible:ring-brand",
  ghost: "text-brand-dark hover:bg-brand-50 focus-visible:ring-brand",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

export const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const BUTTON_BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BUTTON_BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...rest}
    />
  );
}
