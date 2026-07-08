/**
 * Basit giriş denemesi hız sınırlayıcı (brute-force koruması). `/api/auth/login`
 * için kullanılır: aynı IP adresinden kısa sürede çok fazla başarısız giriş
 * denemesi yapılırsa, doğru şifre girilse bile bir süreliğine reddedilir.
 *
 * - Kalıcı depolama (Upstash Redis) yapılandırılmışsa onu kullanır: bu sayede
 *   sınır, Vercel'in farklı sunucu örnekleri arasında da tutarlı çalışır.
 * - Yapılandırılmamışsa, süreç belleğinde (in-memory) tutulur; tek bir
 *   sunucu örneğinde çalışırken de en azından basit/otomatik saldırıları
 *   ciddi ölçüde yavaşlatır. Vercel serverless'ta bu en iyi çaba (best
 *   effort) niteliğindedir - kalıcı/çok-örnekli koruma için Upstash önerilir.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 10 * 60; // 10 dakika

const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = Boolean(KV_URL && KV_TOKEN);

async function upstash<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Hız sınırlama isteği başarısız oldu (${res.status})`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

function pruneMemoryStore(now: number) {
  // Bellek büyümesini engellemek için, süresi dolmuş eski girişleri temizle.
  if (memoryStore.size < 500) return;
  for (const [key, entry] of memoryStore) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** `identifier` genelde istemci IP adresidir. Her çağrıda bir deneme sayılır. */
export async function checkLoginRateLimit(identifier: string): Promise<RateLimitResult> {
  const key = `login-attempts:${identifier}`;

  if (hasKv) {
    try {
      const count = await upstash<number>(["INCR", key]);
      if (count === 1) {
        await upstash(["EXPIRE", key, WINDOW_SECONDS]);
      }
      if (count > MAX_ATTEMPTS) {
        const ttl = await upstash<number>(["TTL", key]);
        return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    } catch {
      // Upstash'e ulaşılamazsa, girişi tamamen kilitlemek yerine belleğe düş.
    }
  }

  const now = Date.now();
  pruneMemoryStore(now);
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
