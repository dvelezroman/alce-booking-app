import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';


interface RestrictionEntry {
  hours: number[];
  studentClassification:
    string | null;
  mode:
    string | null;
  city:
    string | null;
}


interface RestrictionRow {
  day: number;
  month: string;
  entries: RestrictionEntry[];
}


@Component({
  selector: 'app-feature-flag-restrictions-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './feature-flag-restrictions-table.component.html',
  styleUrl: './feature-flag-restrictions-table.component.scss',
})
export class FeatureFlagRestrictionsTableComponent
  implements OnChanges {

  @Input() data: any = {};
  @Input() month = '';
  @Input() year = 0;

  @Output() deleteRequested =
    new EventEmitter<{
      day: number;
      entry: RestrictionEntry;
    }>();

  restrictions: RestrictionRow[] = [];
  expanded = false;


  ngOnChanges( changes: SimpleChanges ): void {

    if (
      changes['data'] ||
      changes['month'] ||
      changes['year']
    ) {
      this.buildRestrictions();
    }
  }


  private buildRestrictions(): void {

    const monthIndex =
      this.getMonthIndex(
        this.month,
      );

    if (
      monthIndex === -1
    ) {

      this.restrictions = [];

      return;
    }

    const monthEntries =
      this.data?.[
        monthIndex.toString()
      ] ?? [];

    const grouped =
      new Map<
        number,
        RestrictionEntry[]
      >();

    monthEntries.forEach(
      (entry: any) => {

        const existing =
          grouped.get(
            entry.day,
          ) ?? [];

        existing.push({
          hours:
            entry.hours ?? [],

          studentClassification:
            entry.studentClassification ??
            null,

          mode:
            entry.mode ??
            null,

          city:
            entry.city ??
            null,
        });

        grouped.set(
          entry.day,
          existing,
        );
      },
    );

    this.restrictions =
      Array.from(
        grouped.entries(),
      )
        .sort(
          (a, b) =>
            a[0] - b[0],
        )
        .map(
          ([day, entries]) => ({
            day,
            month:
              this.month,
            entries,
          }),
        );
  }


  getMonthIndex(
    monthName: string,
  ): number {

    const months:
      Record<string, number> = {
        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    return (
      months[
        monthName
      ] ?? -1
    );
  }


  formatHours(
    hours: number[],
  ): string {

    if (
      !hours ||
      hours.length === 0
    ) {
      return 'Día completo';
    }

    return [...hours]
      .sort(
        (a, b) =>
          a - b,
      )
      .map(
        hour =>
          `${hour}:00`,
      )
      .join(', ');
  }


  formatRestrictionLabel(
    studentClassification:
      string | null,
    mode:
      string | null,
    city:
      string | null,
  ): string {

    const student =
      studentClassification ??
      'Todos los estudiantes';

    const meetingMode =
      mode ??
      'Todas las modalidades';

    const location =
      city ??
      'Todas las ciudades';

    return (
      `${student} · ` +
      `${meetingMode} · ` +
      `${location}`
    );
  }


  onDelete(
    day: number,
    entry: RestrictionEntry,
  ): void {

    this.deleteRequested.emit({
      day,
      entry,
    });
  }

   toggleExpanded(): void { this.expanded = !this.expanded }
}