import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'luxonDateOnly',
  standalone: true,
})
export class LuxonDateOnlyPipe implements PipeTransform {
  transform(value: string | Date | undefined, locale: string = 'es'): string {
    if (!value) return 'No registrado';
    return DateTime.fromISO(value.toString())
      .setLocale(locale)
      .toLocaleString(DateTime.DATE_MED); 
  }
}
