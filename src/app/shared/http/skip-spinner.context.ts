import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SKIP_SPINNER = new HttpContextToken<boolean>(() => false);

export function skipSpinnerContext(): { context: HttpContext } {
  return { context: new HttpContext().set(SKIP_SPINNER, true) };
}

export function shouldSkipSpinnerForUrl(url: string): boolean {
  return (
    url.includes('/notificador/whatsapp/jobs/') ||
    url.includes('/notificador/whatsapp/status')
  );
}
