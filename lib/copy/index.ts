import { MockCopyProvider } from "./mock-provider";
import type { CopyProvider } from "./types";

export type {
  CopyGenerationRequest,
  CopyGenerationResult,
  CopyProvider,
  GeneratedCopyVariant,
} from "./types";
export { toAdVariationInputs } from "./types";
export { MockCopyProvider } from "./mock-provider";

/**
 * Aktif metin sağlayıcısını döndürür.
 * `COPY_PROVIDER=openai|deepseek` ile ileride gerçek API'ye geçilir;
 * şimdilik her zaman mock (şablon) sağlayıcı kullanılır.
 */
export function getCopyProvider(): CopyProvider {
  const preferred = (process.env.COPY_PROVIDER || "mock").toLowerCase();

  // İleride:
  // if (preferred === "openai") return new OpenAiCopyProvider();
  // if (preferred === "deepseek") return new DeepSeekCopyProvider();

  void preferred;
  return new MockCopyProvider();
}
