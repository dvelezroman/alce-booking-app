/**
 * Mensaje legible desde errores típicos de HttpClient / NestJS:
 * `{ message: string | string[] }`, `{ error }`, cuerpo string, o `err.message`.
 */
export function getHttpErrorMessage(err: unknown, fallback: string): string {
  if (err == null || typeof err !== 'object') {
    return fallback;
  }

  const anyErr = err as { error?: unknown; message?: unknown };
  const body = anyErr.error;

  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (body && typeof body === 'object') {
    const record = body as { message?: unknown; error?: unknown };
    const msg = record.message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg.trim();
    }
    if (Array.isArray(msg) && msg.length > 0) {
      return msg.map((m) => String(m).trim()).filter(Boolean).join('\n');
    }
    if (record.error != null && record.error !== '') {
      return String(record.error);
    }
  }

  if (anyErr.message) {
    return String(anyErr.message);
  }

  return fallback;
}
