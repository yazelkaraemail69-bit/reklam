import { AdminShell } from "@/components/admin/AdminShell";
import { isPersistentStorageConfigured } from "@/lib/store";
import { isPersistentUploadStorageConfigured } from "@/lib/upload";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isPersistent = isPersistentStorageConfigured();
  const isUploadPersistent = isPersistentUploadStorageConfigured();

  return (
    <AdminShell>
      {!isPersistent ? (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <strong className="font-bold">Demo modu:</strong> Kalıcı veri deposu bağlı değil. Bu
          ortamda yaptığınız değişiklikler sunucu yeniden başladığında sıfırlanabilir. Kalıcı
          hale getirmek için Vercel projenizde <strong>Storage → Upstash for Redis</strong> bağlayın.
        </div>
      ) : null}
      {!isUploadPersistent ? (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <strong className="font-bold">Görsel yükleme (demo modu):</strong> Kalıcı görsel deposu
          bağlı değil. Bu ortamda yüklenen görseller sunucu yeniden başladığında kaybolabilir.
          Kalıcı hale getirmek için Vercel projenizde <strong>Storage → Blob</strong> bağlayın.
        </div>
      ) : null}
      {children}
    </AdminShell>
  );
}
