import { ShieldCheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface IyzicoTrustBadgeProps {
  className?: string;
  compact?: boolean;
}

/** Ödeme CTA altında güven sinyali — Iyzico 256-bit */
export function IyzicoTrustBadge({ className, compact }: IyzicoTrustBadgeProps) {
  if (compact) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500",
          className
        )}
      >
        <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-dark" />
        iyzico ile 256-bit güvenli ödeme
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3",
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-dark shadow-sm">
        <ShieldCheckIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-emerald-950">iyzico ile 256-bit Güvenli Ödeme</p>
        <p className="text-xs leading-5 text-slate-500">
          Kart bilgileriniz bizim sunucularımızda saklanmaz. Ödeme Iyzico altyapısıyla alınır.
          Gizli ücret yoktur.
        </p>
      </div>
    </div>
  );
}
