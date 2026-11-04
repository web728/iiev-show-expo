// Structured logger with PII redaction. Never log raw emails, phones, tokens.

const SENSITIVE_KEYS = /(email|phone|mobile|password|token|secret|authorization|cookie|fullname|name|address|ip)$/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) return value;
  if (typeof value === "string") {
    return value
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
      .replace(/\+?\d[\d\s-]{8,}\d/g, "[phone]");
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.test(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

type Level = "info" | "warn" | "error";
function emit(level: Level, event: string, data?: Record<string, unknown>) {
  const line = JSON.stringify({ t: new Date().toISOString(), level, event, ...(data ? (redact(data) as object) : {}) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, data?: Record<string, unknown>) => emit("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => emit("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
};
