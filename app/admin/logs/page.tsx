"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TelemetryCategory, TelemetryEntry } from "@/lib/logger/telemetry";

export default function AdminTelemetryLogsPage() {
  const [logs, setLogs] = useState<TelemetryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [analyzingLogId, setAnalyzingLogId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, string>>({});

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = categoryFilter !== "ALL" ? `/api/admin/logs?category=${categoryFilter}` : "/api/admin/logs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [categoryFilter]);

  const handleClearLogs = async () => {
    if (!confirm("Tüm telemetri loglarını silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
        setAiAnalysisResult({});
      }
    } catch {
      alert("Loglar silinemedi.");
    }
  };

  const handleAnalyzeWithLLM = async (log: TelemetryEntry) => {
    setAnalyzingLogId(log.id);
    try {
      // Trigger Yardımcı LLM via local proxy endpoint or pipeline
      const res = await fetch("http://localhost:8000/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "architect",
          messages: [
            {
              role: "user",
              content: `Aşağıdaki hata logunun kök nedenini analiz et ve canlı projemiz için çözüm önerisi sun:\nHata Kategori: ${log.category}\nMesaj: ${log.message}\nStack: ${log.stack || "yok"}\nContext: ${JSON.stringify(log.context)}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const analysis = data.choices?.[0]?.message?.content || "Analiz yanıtı alınamadı.";
        setAiAnalysisResult((prev) => ({ ...prev, [log.id]: analysis }));
      } else {
        setAiAnalysisResult((prev) => ({
          ...prev,
          [log.id]: "Yardımcı LLM'e ulaşılamadı. Lütfen localhost:8000 adresinin açık olduğunu doğrulayın.",
        }));
      }
    } catch {
      setAiAnalysisResult((prev) => ({
        ...prev,
        [log.id]: "Yardımcı LLM yerel sunucusu (localhost:8000) yanıt vermedi.",
      }));
    } finally {
      setAnalyzingLogId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                ● Canlı Telemetri & Hata Kayıtları
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Sistem Günlükleri (Logs)</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Yerel test sunucusundaki tüm hatalar, uyarılar ve Yardımcı LLM analiz köprüsü.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
            >
              🔄 Yenile
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/60 text-xs font-medium text-red-300 border border-red-800/40 rounded-lg transition-colors"
            >
              🗑️ Logları Temizle
            </button>
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium transition-colors"
            >
              ← Admin Paneli
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "API_CHECKOUT", "IMAGE_UPLOAD", "STORE_KV", "GEMINI_AI", "UNHANDLED_EXCEPTION"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat === "ALL" ? "Tümü" : cat}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
            Günlükler yükleniyor...
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
            Henüz hiç hata veya günlük kaydı bulunmuyor. Sistem %100 temiz! 🎉
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        log.level === "ERROR" || log.level === "CRITICAL"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                      {log.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{log.id}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{log.timestamp}</span>
                    <button
                      onClick={() => handleAnalyzeWithLLM(log)}
                      disabled={analyzingLogId === log.id}
                      className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {analyzingLogId === log.id ? "🤖 Analiz Ediliyor..." : "🤖 Yardımcı LLM İle Analiz Et"}
                    </button>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-100">{log.message}</div>

                {log.context ? (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-400">
                    <span className="text-slate-500 font-bold">Context: </span>
                    {JSON.stringify(log.context)}
                  </div>
                ) : null}

                {log.stack ? (
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer hover:text-slate-300 transition-colors">
                      Stack Trace Göster
                    </summary>
                    <pre className="mt-2 bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-red-400/80">
                      {log.stack}
                    </pre>
                  </details>
                ) : null}

                {/* AI Analysis Result */}
                {aiAnalysisResult[log.id] ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-xl space-y-2 mt-3">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🤖 Yardımcı LLM Sentinel Analiz Yanıtı:</span>
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {aiAnalysisResult[log.id]}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
