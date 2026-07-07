"use client";

import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { compressImageFile } from "@/lib/client-image";
import { Button } from "@/components/ui/Button";
import { ImageIcon, LoaderIcon, TrashIcon, XIcon } from "@/components/ui/icons";

async function uploadFile(file: File): Promise<string> {
  const compressed = await compressImageFile(file);
  const formData = new FormData();
  formData.append("file", compressed);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Görsel yüklenemedi.");
  }
  return data.url as string;
}

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  required?: boolean;
  hint?: string;
  /** Galeri gibi ızgara içinde küçük kart görünümü. */
  compact?: boolean;
  /** Yükleme başlayıp bittiğinde üst forma haber verir (submit'i kilitlemek için). */
  onUploadingChange?: (uploading: boolean) => void;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onRemove,
  required,
  hint,
  compact,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin.");
      return;
    }

    setError("");
    setIsUploading(true);
    onUploadingChange?.(true);
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);

    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
      onChange("");
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className={cn("grid gap-1.5", !compact && "text-sm font-semibold text-emerald-950")}>
      {label ? (
        <span className="text-sm font-semibold text-emerald-950">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </span>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-slate-50 transition-colors",
          compact ? "aspect-square" : "aspect-video",
          isDragging ? "border-brand bg-brand-50" : "border-slate-300",
          error && "border-red-400"
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label || "Yüklenen görsel"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                Değiştir
              </Button>
              {onRemove ? (
                <Button type="button" variant="danger" size="sm" className="w-9 p-0" onClick={onRemove} aria-label="Görseli kaldır">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <LoaderIcon className="h-6 w-6 text-brand-dark" />
              </div>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-slate-500 hover:text-brand-dark"
          >
            {isUploading ? (
              <LoaderIcon className="h-6 w-6" />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
            <span className="text-center text-xs font-medium">
              {isUploading ? "Yükleniyor..." : "Görsel seçmek için tıklayın ya da sürükleyin"}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
      {hint && !error ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <Button type="button" variant="ghost" size="sm" className="w-9 p-0" onClick={() => setShowUrlInput(false)} aria-label="Kapat">
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="justify-self-start text-xs font-medium text-slate-500 underline decoration-dotted hover:text-brand-dark"
        >
          ya da bağlantı (URL) yapıştır
        </button>
      )}
    </div>
  );
}
