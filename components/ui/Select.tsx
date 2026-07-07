import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, id, className, name, required, children, ...rest }: SelectProps) {
  const selectId = id ?? name;
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-emerald-950" htmlFor={selectId}>
      {label ? (
        <span>
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </span>
      ) : null}
      <select
        id={selectId}
        name={name}
        required={required}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base font-normal text-slate-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-red-400 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}
