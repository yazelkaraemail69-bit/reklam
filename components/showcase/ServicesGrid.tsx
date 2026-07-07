import type { BusinessService } from "@/lib/types";
import { StarIcon } from "@/components/ui/icons";

export function ServicesGrid({
  services,
  businessName,
}: {
  services: BusinessService[];
  businessName: string;
}) {
  if (!services.length) return null;

  return (
    <section className="bg-brand-50 py-12 sm:py-16">
      <div className="container-app">
        <h2 className="mb-8 text-2xl font-black text-emerald-950 sm:text-3xl">
          Neden {businessName}?
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-brand-light/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand-dark">
                <StarIcon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-emerald-950">{service.title}</h3>
              {service.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
