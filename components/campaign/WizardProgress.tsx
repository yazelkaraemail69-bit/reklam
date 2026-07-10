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
      <div className="sm:hidden">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
          Adım {currentIndex + 1} / {total}
        </p>
        <p className="mt-1 text-lg font-black text-emerald-950">{current?.title}</p>
        <p className="text-sm text-slate-500">{current?.hint}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <ol
        className="hidden gap-2 sm:grid"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const clickable = Boolean(onStepSelect) && index <= currentIndex;
          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStepSelect?.(index)}
                className={cn(
                  "w-full rounded-xl border px-2 py-2.5 text-center transition-colors",
                  active && "border-brand bg-brand-50",
                  done && "border-brand/40 bg-white hover:border-brand",
                  !active && !done && "border-slate-200 bg-white",
                  clickable && "cursor-pointer",
                  !clickable && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    active && "bg-brand text-white",
                    done && "bg-brand-dark text-white",
                    !active && !done && "bg-slate-100 text-slate-500"
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
                <p
                  className={cn(
                    "mt-1.5 truncate text-[11px] font-bold",
                    active ? "text-brand-dark" : "text-slate-600"
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
  );
}
