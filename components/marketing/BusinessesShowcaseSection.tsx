import Image from "next/image";
import Link from "next/link";
import type { Business } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/icons";

export function BusinessesShowcaseSection({ businesses }: { businesses: Business[] }) {
  if (!businesses.length) return null;

  return (
    <section id="vitrinler" className="py-20 sm:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-brand-dark">
            Örnek Vitrinler
          </span>
          <h2 className="mt-3 text-3xl font-black text-emerald-950 sm:text-4xl">
            Platformdaki işletmeler
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.slice(0, 6).map((business) => (
            <Link
              key={business.id}
              href={`/${business.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src={business.coverImageUrl}
                  alt={business.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <Badge variant="brand">{business.category}</Badge>
                <h3 className="mt-3 text-lg font-bold text-emerald-950">{business.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPinIcon className="h-4 w-4" /> {business.city}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark">
                  Vitrini gör <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
