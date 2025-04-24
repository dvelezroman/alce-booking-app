import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumLabel',
  standalone: true,
  pure: true
})
export class EnumLabelPipe implements PipeTransform {
  transform(value: string, enumObj: any): string {
    return enumObj?.[value] || value;
  }
}
