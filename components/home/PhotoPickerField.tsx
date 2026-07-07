"use client";

import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { compressImageFile, fileToDataUrl } from "@/lib/client-image";
import { Button } from "@/components/ui/Button";
import { ImageIcon, LoaderIcon, TrashIcon } from "@/components/ui/icons";

// base64 boyutu ham dosyadan ~%33 daha büyüktür; localStorage kotasını
// (tarayıcı başına genelde 5-10 MB, birden çok işletme paylaşır) aşmamak
// için makul bir üst sınır.
const MAX_DATA_URL_LENGTH = 2 * 1024 * 1024;

interface PhotoPickerFieldProps {
  label?: string;
  value: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
  hint?: string;
  compact?: boolean;
}

/**
 * Tamamen istemci tarafında (sunucuya hiç istek atmadan) çalışan görsel
 * seçici. Seçilen dosya sıkıştırılıp base64 `data:` URL'sine çevrilir ve
 * doğrudan `onChange` ile döndürülür; bu değer daha sonra `localStorage`'a
 * yazılabilir. Admin panelindeki `ImageUploadField`'ın sunucu gerektirmeyen
 * eşdeğeridir.
 */
export function PhotoPickerField({
  label,
  value,
  onChange,
  required,
  hint,
  compact,
}: PhotoPickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası (JPG, PNG, WEBP veya GIF) seçin.");
      return;
    }

    setError("");
    setIsProcessing(true);
    try {
      const compressed = await compressImageFile(file);
      const dataUrl = await fileToDataUrl(compressed);
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        setError("Görsel çok büyük. Lütfen daha küçük boyutlu bir fotoğraf seçin.");
        return;
      }
      onChange(dataUrl);
    } catch {
      setError("Görsel işlenirken bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="grid gap-1.5">
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
            <img src={value} alt={label || "Seçilen görsel"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isProcessing}
              >
                Değiştir
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="w-9 p-0"
                onClick={() => onChange("")}
                aria-label="Görseli kaldır"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            {isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <LoaderIcon className="h-6 w-6 text-brand-dark" />
              </div>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-slate-500 hover:text-brand-dark"
          >
            {isProcessing ? <LoaderIcon className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
            <span className="text-center text-xs font-medium">
              {isProcessing ? "İşleniyor..." : "Fotoğraf seçmek için tıklayın ya da sürükleyin"}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
      {hint && !error ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </div>
  );
}
