import type { ReactNode } from "react";
import { SparklesIcon } from "@/components/ui/icons";

interface CroTipProps {
  title?: string;
  children: ReactNode;
}

export function CroTip({ title = "Strateji ipucu", children }: CroTipProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-brand/20 bg-brand-50 px-4 py-3">
      <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark" />
      <div className="min-w-0 text-sm leading-6 text-emerald-950">
        <p className="font-bold">{title}</p>
        <div className="mt-0.5 font-normal text-slate-700">{children}</div>
      </div>
    </div>
  );
}
