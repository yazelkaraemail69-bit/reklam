import { promises as fs } from "fs";
import path from "path";

export type TelemetryLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export type TelemetryCategory =
  | "API_CHECKOUT"
  | "IMAGE_UPLOAD"
  | "STORE_KV"
  | "GEMINI_AI"
  | "GOOGLE_ADS"
  | "UNHANDLED_EXCEPTION"
  | "GENERAL";

export interface TelemetryEntry {
  id: string;
  timestamp: string;
  environment: string;
  level: TelemetryLevel;
  category: TelemetryCategory;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export type TelemetryInput = Omit<TelemetryEntry, "id" | "timestamp" | "environment"> & {
  timestamp?: string;
};

const LOGS_DIR = path.join(process.cwd(), "data", "logs");
const TELEMETRY_FILE = path.join(LOGS_DIR, "telemetry.json");

// Mask sensitive info before saving to log file
function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("password") || lowerKey.includes("secret") || lowerKey.includes("token")) {
      sanitized[key] = "[PROTECTED]";
    } else if (lowerKey.includes("email") && typeof value === "string") {
      const parts = value.split("@");
      sanitized[key] = parts[0] ? `${parts[0].slice(0, 2)}***@${parts[1] || ""}` : value;
    } else if (lowerKey.includes("tax") && typeof value === "string") {
      sanitized[key] = value.slice(0, 3) + "*****" + value.slice(-2);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

async function ensureLogDir(): Promise<void> {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function logTelemetry(input: TelemetryInput): Promise<TelemetryEntry> {
  const entry: TelemetryEntry = {
    id: `log-${crypto.randomUUID().slice(0, 8)}`,
    timestamp: input.timestamp || new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    level: input.level,
    category: input.category,
    message: input.message,
    stack: input.stack,
    context: sanitizeContext(input.context),
  };

  // Asynchronous write to prevent blocking main UI loop
  setTimeout(async () => {
    try {
      await ensureLogDir();
      let logs: TelemetryEntry[] = [];
      try {
        const raw = await fs.readFile(TELEMETRY_FILE, "utf-8");
        logs = JSON.parse(raw) as TelemetryEntry[];
      } catch {
        logs = [];
      }
      logs.unshift(entry);
      // Keep last 200 logs to prevent file bloat
      if (logs.length > 200) {
        logs = logs.slice(0, 200);
      }
      await fs.writeFile(TELEMETRY_FILE, JSON.stringify(logs, null, 2), "utf-8");
    } catch (err) {
      console.error("[TelemetryLogger] Fail to write log file:", err);
    }
  }, 0);

  return entry;
}

export async function getTelemetryLogs(
  limit = 50,
  category?: TelemetryCategory
): Promise<TelemetryEntry[]> {
  try {
    await ensureLogDir();
    const raw = await fs.readFile(TELEMETRY_FILE, "utf-8");
    let logs = JSON.parse(raw) as TelemetryEntry[];
    if (category) {
      logs = logs.filter((l) => l.category === category);
    }
    return logs.slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearTelemetryLogs(): Promise<boolean> {
  try {
    await ensureLogDir();
    await fs.writeFile(TELEMETRY_FILE, JSON.stringify([], null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}
