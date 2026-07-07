"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Business } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ExternalLinkIcon, LoaderIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";

export function BusinessTable({ businesses }: { businesses: Business[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`"${name}" işletmesini silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Silme işlemi başarısız oldu.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme işlemi başarısız oldu.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!businesses.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-500">Henüz işletme eklenmedi.</p>
        <Link
          href="/admin/businesses/new"
          className="mt-4 inline-block font-bold text-brand-dark hover:underline"
        >
          İlk işletmenizi ekleyin →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {error ? (
        <p className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      <ul className="divide-y divide-slate-100">
        {businesses.map((business) => (
          <li
            key={business.id}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {business.coverImageUrl ? (
                  <Image
                    src={business.coverImageUrl}
                    alt={business.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-bold text-emerald-950">{business.name}</h3>
                  <Badge variant={business.isPublished ? "brand" : "neutral"}>
                    {business.isPublished ? "Yayında" : "Taslak"}
                  </Badge>
                </div>
                <p className="truncate text-sm text-slate-500">
                  {business.category} · {business.city}
                </p>
                <p className="text-xs text-slate-400">
                  /{business.slug} · {formatDate(business.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/${business.slug}`}
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-dark"
                aria-label="Sayfayı görüntüle"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
              <Link
                href={`/admin/businesses/${business.id}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-dark"
                aria-label="Düzenle"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
              <Button
                variant="danger"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleDelete(business.id, business.name)}
                disabled={deletingId === business.id}
                aria-label="Sil"
              >
                {deletingId === business.id ? (
                  <LoaderIcon className="h-4 w-4" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
