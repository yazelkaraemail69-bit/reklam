"use client";

import { useMemo, useState } from "react";
import type { CampaignMetrics } from "@/lib/types";

interface AnalyticsGraphProps {
  metrics: CampaignMetrics[];
}

export function AnalyticsGraph({ metrics }: AnalyticsGraphProps) {
  const [selectedMetric, setSelectedMetric] = useState<"clicks" | "spend" | "impressions">("clicks");
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number;
    clicks: number;
    spend: number;
    impressions: number;
    x: number;
    y: number;
  } | null>(null);

  // Group metrics by date
  const groupedData = useMemo(() => {
    const map = new Map<string, { date: string; impressions: number; clicks: number; spend: number; messages: number }>();
    
    metrics.forEach((row) => {
      const existing = map.get(row.date) || {
        date: row.date,
        impressions: 0,
        clicks: 0,
        spend: 0,
        messages: 0,
      };
      
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.spend += row.spend;
      existing.messages += row.messages || 0;
      
      map.set(row.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [metrics]);

  if (groupedData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">Gösterilecek trend verisi bulunmuyor.</p>
      </div>
    );
  }

  // Dimensions
  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max values for scale
  const maxValue = Math.max(
    ...groupedData.map((d) => {
      if (selectedMetric === "clicks") return d.clicks;
      if (selectedMetric === "spend") return d.spend;
      return d.impressions;
    }),
    1
  );

  // Helper to format dates (e.g. "2026-07-05" -> "05 Tem")
  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const day = parts[2];
        const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        const monthIndex = parseInt(parts[1], 10) - 1;
        return `${day} ${monthNames[monthIndex] || parts[1]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Generate SVG coordinates
  const points = groupedData.map((d, index) => {
    const x = paddingLeft + (index / Math.max(groupedData.length - 1, 1)) * chartWidth;
    
    let rawVal = d.clicks;
    if (selectedMetric === "spend") rawVal = d.spend;
    else if (selectedMetric === "impressions") rawVal = d.impressions;

    const y = paddingTop + chartHeight - (rawVal / maxValue) * chartHeight;
    return { x, y, data: d, val: rawVal };
  });

  // SVG Line path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  // SVG Area path for gradient background
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-black text-emerald-950">Kampanya Trend Analizi</h3>
          <p className="text-xs text-slate-500">Günlük performans değişim grafiği</p>
        </div>

        {/* Metrik Seçici Butonlar */}
        <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60 self-start">
          <button
            type="button"
            onClick={() => setSelectedMetric("clicks")}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              selectedMetric === "clicks" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tıklama
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("spend")}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              selectedMetric === "spend" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Harcama
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("impressions")}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              selectedMetric === "impressions" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Gösterim
          </button>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines (Horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = Math.round(maxValue * (1 - ratio));
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-bold"
                >
                  {selectedMetric === "spend" ? `${gridVal} TL` : gridVal.toLocaleString("tr-TR")}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {groupedData.map((d, i) => {
            if (groupedData.length > 8 && i % Math.ceil(groupedData.length / 6) !== 0) return null;
            const x = paddingLeft + (i / Math.max(groupedData.length - 1, 1)) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-bold"
              >
                {formatDateLabel(d.date)}
              </text>
            );
          })}

          {/* Gradient Area under the line */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-300" />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Interactive dots & hover zones */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Visible dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.date === p.data.date ? "5.5" : "3.5"}
                className={`transition-all duration-150 ${
                  hoveredPoint?.date === p.data.date
                    ? "fill-brand-dark stroke-white stroke-2 scale-110"
                    : "fill-brand stroke-white stroke-1.5"
                }`}
              />

              {/* Invisible interactive zone for hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r="18"
                className="fill-transparent cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint({
                    date: p.data.date,
                    value: p.val,
                    clicks: p.data.clicks,
                    spend: p.data.spend,
                    impressions: p.data.impressions,
                    x: p.x,
                    y: p.y,
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Custom HTML Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-lg text-[11px] font-bold text-slate-700 pointer-events-none transition-all duration-100 z-20 min-w-[120px]"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 35}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="border-b border-slate-100 pb-1 text-emerald-950 font-black">
              {formatDateLabel(hoveredPoint.date)}
            </p>
            <div className="mt-1.5 space-y-1">
              <p className="flex justify-between gap-4">
                <span className="text-slate-400">Tıklama:</span>
                <span className="text-emerald-500 font-extrabold">{hoveredPoint.clicks}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-slate-400">Harcama:</span>
                <span className="text-slate-800">{hoveredPoint.spend.toLocaleString("tr-TR")} TL</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-slate-400">Gösterim:</span>
                <span className="text-slate-500">{hoveredPoint.impressions.toLocaleString("tr-TR")}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
