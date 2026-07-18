import { CAMPAIGN_WIZARD_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentIndex: number;
  onStepSelect?: (index: number) => void;
}

export function WizardProgress({ currentIndex, onStepSelect }: WizardProgressProps) {
  const current = CAMPAIGN_WIZARD_STEPS[currentIndex];
  const total = CAMPAIGN_WIZARD_STEPS.length;

  return (
    <div className="space-y-4">
      {/* Mobil Sürüm: Basit Çubuk */}
      <div className="sm:hidden bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-dark uppercase tracking-wide">
            Adım {currentIndex + 1} / {total}
          </span>
          <span className="text-xs font-semibold text-slate-500">{Math.round(((currentIndex + 1) / total) * 100)}% Tamamlandı</span>
        </div>
        <p className="mt-2 text-base font-black text-emerald-950">{current?.title}</p>
        <p className="text-xs text-slate-500">{current?.hint}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand bg-gradient-to-r from-brand to-emerald-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Masaüstü Sürüm: Bağlantılı Halka Adımları */}
      <div className="hidden sm:block relative">
        {/* Adımları Birleştiren Arka Plan Çizgisi */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 pointer-events-none z-0">
          <div
            className="h-full bg-brand bg-gradient-to-r from-brand to-emerald-500 transition-all duration-300"
            style={{ width: `${(currentIndex / (total - 1)) * 100}%` }}
          />
        </div>

        <ol className="relative flex justify-between gap-2 z-10">
          {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            const clickable = Boolean(onStepSelect) && index <= currentIndex;

            return (
              <li key={step.id} className="flex-1 flex flex-col items-center">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepSelect?.(index)}
                  className={cn(
                    "group flex flex-col items-center focus:outline-none",
                    clickable ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  {/* Adım Numarası / İkon Çemberi */}
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                      active && "bg-brand border-brand text-white ring-4 ring-brand/20 shadow-[0_0_12px_rgba(34,197,94,0.4)] scale-110",
                      done && "bg-brand-dark border-brand-dark text-white hover:bg-brand hover:border-brand",
                      !active && !done && "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
                    )}
                  >
                    {done ? (
                      <span className="text-xs font-black">✓</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>

                  {/* Adım Başlığı */}
                  <p
                    className={cn(
                      "mt-2.5 px-1 text-center text-xs font-bold transition-colors duration-300 max-w-[100px] truncate",
                      active && "text-brand-dark scale-105",
                      done && "text-slate-700",
                      !active && !done && "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {step.title}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
