import { getPayments } from "@/lib/store";
import { PaymentsTable } from "@/components/admin/PaymentsTable";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await getPayments();
  const pending = payments.filter((p) => p.status === "pending").length;
  const paid = payments.filter((p) => p.status === "paid").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-emerald-950">Ödemeler</h1>
        <p className="mt-1 text-sm text-slate-500">
          {payments.length} kayıt · {pending} ödeme bekliyor · {paid} ödendi
        </p>
      </div>
      <PaymentsTable payments={payments} />
    </div>
  );
}
