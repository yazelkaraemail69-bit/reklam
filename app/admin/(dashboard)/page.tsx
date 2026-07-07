import { getBusinesses } from "@/lib/store";
import { BusinessTable } from "@/components/admin/BusinessTable";
import { LinkButton } from "@/components/ui/LinkButton";
import { PlusIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const businesses = await getBusinesses();
  const publishedCount = businesses.filter((b) => b.isPublished).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-emerald-950">İşletmeler</h1>
          <p className="mt-1 text-sm text-slate-500">
            {businesses.length} işletme kayıtlı · {publishedCount} tanesi yayında
          </p>
        </div>
        <LinkButton href="/admin/businesses/new">
          <PlusIcon className="h-4 w-4" /> Yeni İşletme
        </LinkButton>
      </div>

      <BusinessTable businesses={businesses} />
    </div>
  );
}
