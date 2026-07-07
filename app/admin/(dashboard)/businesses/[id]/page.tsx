import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBusinessById } from "@/lib/store";
import { BusinessForm } from "@/components/admin/BusinessForm";

interface EditBusinessPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "İşletmeyi Düzenle",
};

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
  const { id } = await params;
  const business = await getBusinessById(id);

  if (!business) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-emerald-950">İşletmeyi Düzenle</h1>
        <p className="mt-1 text-sm text-slate-500">{business.name}</p>
      </div>
      <BusinessForm mode="edit" initialData={business} />
    </div>
  );
}
