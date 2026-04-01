import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

interface RestrictionEntry {
  hours: number[];
  studentClassification: string | null;
  mode: string | null;
  city: string | null;
}

interface DayRestrictionInfo {
  day: number;
  month: string;
  entries: RestrictionEntry[];
}

@Component({
  selector: 'app-restrictions-month',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restrictions-month.component.html',
  styleUrl: './restrictions-month.component.scss'
})
export class RestrictionsMonthComponent implements OnChanges {
  @Input() data: any = {};
  @Input() month!: string;
  @Input() year!: number;

  @Output() delete = new EventEmitter<{ day: number; entry: RestrictionEntry }>();
  @Output() monthChange = new EventEmitter<{ month: string; year: number }>();

  restrictions: DayRestrictionInfo[] = [];
  availableMonths: number[] = [];

  currentMonth!: string;
  currentYear!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['month'] || changes['year']) {
      this.currentMonth = this.month;
      this.currentYear = this.year;
    }

    this.availableMonths = Object.keys(this.data || {}).map(k => Number(k));

    this.buildRestrictions();
  }

  //---- HELPERS DE NAVEGACIÓN ----//

  private get currentMonthIndex(): number {
    return this.getMonthIndex(this.currentMonth);
  }

  get canGoBack(): boolean {
    if (!this.availableMonths.length) return false;
    return this.currentMonthIndex > Math.min(...this.availableMonths);
  }

  get canGoForward(): boolean {
    const today = new Date();
    const currentRealMonth = today.getMonth();
    const currentRealYear = today.getFullYear();

    if (this.currentYear > currentRealYear) return false;
    if (this.currentYear === currentRealYear) {
      return this.currentMonthIndex < currentRealMonth;
    }

    return true;
  }

  //---- CONSTRUCCIÓN DE RESTRICCIONES ----//

  private buildRestrictions(): void {
    const monthIndex = this.getMonthIndex(this.currentMonth);

    if (monthIndex === -1) {
      this.restrictions = [];
      return;
    }

    const monthEntries = this.data?.[monthIndex.toString()] ?? [];

    const groupedByDay = new Map<number, RestrictionEntry[]>();

    monthEntries.forEach((entry: any) => {
      const day = entry.day;
      const existing = groupedByDay.get(day) ?? [];

      existing.push({
        hours: entry.hours ?? [],
        studentClassification: entry.studentClassification ?? null,
        mode: entry.mode ?? null,
        city: entry.city ?? null,
      });

      groupedByDay.set(day, existing);
    });

    this.restrictions = Array.from(groupedByDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([day, entries]) => ({
        day,
        month: this.currentMonth,
        entries
      }));
  }

  //---- NAVEGACIÓN ENTRE MESES ----//

  prevMonth() {
    if (!this.canGoBack) return;

    const date = new Date(this.currentYear, this.currentMonthIndex - 1, 1);
    this.currentMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.currentYear = date.getFullYear();

    this.buildRestrictions();
  }

  nextMonth() {
    if (!this.canGoForward) return;

    const date = new Date(this.currentYear, this.currentMonthIndex + 1, 1);
    this.currentMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.currentYear = date.getFullYear();

    this.buildRestrictions();
  }

  getMonthIndex(monthName: string): number {
    const monthMap: Record<string, number> = {
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
      DICIEMBRE: 11
    };

    return monthMap[monthName] ?? -1;
  }

  formatHours(hours: number[]): string {
    if (!hours || hours.length === 0) {
      return 'Día completo deshabilitado';
    }

    return [...hours]
      .sort((a, b) => a - b)
      .map(h => `${h}:00`)
      .join(', ');
  }

  formatRestrictionLabel(
    studentClassification: string | null,
    mode: string | null,
    city: string | null
  ): string {
    const student = studentClassification ?? 'TODOS';
    const meetingMode = mode ?? 'TODAS MODALIDADES';
    const location = city ?? 'TODAS CIUDADES';

    return `${student} · ${meetingMode} · ${location}`;
  }

  onDelete(day: number, entry: RestrictionEntry): void {
    this.delete.emit({ day, entry });
  }
}