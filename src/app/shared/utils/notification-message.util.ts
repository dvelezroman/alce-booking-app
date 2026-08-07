/** Quita la línea técnica "Descárgalo con GET /reports/.../download" del cuerpo. */
export function sanitizeNotificationBody(body: string): string {
  return body
    .replace(/^\s*Desc[aá]rgalo con GET[^\n]*\n?/gim, '')
    .replace(/\n\s*Desc[aá]rgalo con GET[^\n]*/gim, '')
    .trim();
}
