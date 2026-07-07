import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  name,
  required,
  rows = 4,
  ...rest
}: TextareaProps) {
  const textareaId = id ?? name;
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-emerald-950" htmlFor={textareaId}>
      {label ? (
        <span>
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </span>
      ) : null}
      <textarea
        id={textareaId}
        name={name}
        required={required}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base font-normal leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60",
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
