import type { PaymentOrder } from "@/lib/types";
import { getAdPackage } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABEL: Record<PaymentOrder["status"], string> = {
  pending: "Ödeme Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  expired: "Süresi Doldu",
  cancelled: "İptal",
};

const STATUS_VARIANT: Record<
  PaymentOrder["status"],
  "brand" | "dark" | "neutral" | "danger"
> = {
  pending: "neutral",
  paid: "brand",
  failed: "danger",
  expired: "neutral",
  cancelled: "danger",
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PaymentsTableProps {
  payments: PaymentOrder[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-bold text-emerald-950">Henüz ödeme kaydı yok</p>
        <p className="mt-1 text-sm text-slate-500">
          Wizard üzerinden kampanya kaydı yapıldığında burada görünür.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-bold">Müşteri</th>
            <th className="px-4 py-3 font-bold">Paket</th>
            <th className="px-4 py-3 font-bold">Tutar</th>
            <th className="px-4 py-3 font-bold">Durum</th>
            <th className="px-4 py-3 font-bold">E-posta</th>
            <th className="px-4 py-3 font-bold">Link</th>
            <th className="px-4 py-3 font-bold">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold text-emerald-950">{payment.customerName}</p>
                <p className="text-xs text-slate-500">{payment.customerEmail}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {payment.packageId ? getAdPackage(payment.packageId).name : "—"}
              </td>
              <td className="px-4 py-3 font-semibold text-emerald-950">
                {formatMoney(payment.amount)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[payment.status]}>
                  {STATUS_LABEL[payment.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {payment.emailSentAt
                  ? "Gönderildi"
                  : payment.emailError
                    ? "Hata"
                    : "—"}
              </td>
              <td className="px-4 py-3">
                {payment.iyzicoPaymentUrl ? (
                  <a
                    href={payment.iyzicoPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-dark hover:underline"
                  >
                    Aç
                  </a>
                ) : (
                  <span className="text-slate-400">Yok</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(payment.createdAt).toLocaleString("tr-TR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
