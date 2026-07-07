import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, id, className, name, required, ...rest }: InputProps) {
  const inputId = id ?? name;
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-emerald-950" htmlFor={inputId}>
      {label ? (
        <span>
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </span>
      ) : null}
      <input
        id={inputId}
        name={name}
        required={required}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base font-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-red-400 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...rest}
      />
      {hint && !error ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}
