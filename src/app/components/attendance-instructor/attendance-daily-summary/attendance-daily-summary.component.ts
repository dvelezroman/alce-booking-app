import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-daily-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-daily-summary.component.html',
  styleUrl: './attendance-daily-summary.component.scss'
})
export class AttendanceDailySummaryComponent implements OnChanges {
  @Input() rawData: { localdate: string, localhour: number, count: number }[] = [];

  groupedByDay: Record<string, number> = {};

  ngOnChanges(): void {
    this.groupByDate();
  }

  private groupByDate(): void {
    this.groupedByDay = {};

    for (const item of this.rawData) {
      const date = new Date(item.localdate).toISOString().substring(0, 10);
      if (!this.groupedByDay[date]) {
        this.groupedByDay[date] = 0;
      }
      this.groupedByDay[date] += 1; 
    }
  }

  get sortedDates(): string[] {
    return Object.keys(this.groupedByDay).sort();
  }
}