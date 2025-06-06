import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-summary-by-day',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-summary-by-day.component.html',
  styleUrl: './attendance-summary-by-day.component.scss'
})
export class AttendanceSummaryByDayComponent implements OnChanges {
  @Input() rawData: { localdate: string, localhour: number, count: number }[] = [];

  groupedByDay: Record<string, { hours: number; stageCount: number }> = {};

  ngOnChanges(): void {
    this.groupByDate();
  }

  private groupByDate(): void {
    this.groupedByDay = {};

    for (const item of this.rawData) {
      const date = new Date(item.localdate).toISOString().substring(0, 10);

      if (!this.groupedByDay[date]) {
        this.groupedByDay[date] = { hours: 0, stageCount: 0 };
      }

      this.groupedByDay[date].hours += 1;
      this.groupedByDay[date].stageCount += item.count;
    }
  }

  get sortedDates(): string[] {
    return Object.keys(this.groupedByDay).sort();
  }

  get totalHours(): number {
    return Object.values(this.groupedByDay).reduce((sum, entry) => sum + entry.hours, 0);
  }
}