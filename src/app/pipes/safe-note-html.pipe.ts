import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeNoteHtml',
  standalone: true,
})
export class SafeNoteHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    // 1. Reemplazar \n o \\n por <br>
    let parsed = value.replace(/\\n|\\r\\n|\n/g, '<br>');

    // 2. Detectar URLs y convertirlas en links
    const urlRegex = /https?:\/\/[^\s'"]+/g;
    parsed = parsed.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // 3. Devolver HTML seguro
    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }
}