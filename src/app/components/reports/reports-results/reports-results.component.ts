import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingReportDetailed, StatisticalDataI, MeetingDataI } from '../../../services/dtos/meeting-theme.dto';
import { DateTime } from 'luxon';
import { LuxonDatePipe } from '../../../shared/utils/locale-date.pipe';

@Component({
  selector: 'app-reports-results',
  standalone: true,
  imports: [CommonModule, LuxonDatePipe,],
  templateUrl: './reports-results.component.html',
  styleUrl: './reports-results.component.scss'
})
export class ReportsResultsComponent {
  @Input() activeReport: 'detailed' | 'statistical' | 'meetings' = 'detailed';
  @Input() reportData: MeetingReportDetailed[] = [];
  @Input() statisticalData: StatisticalDataI | null = null;
  @Input() meetingsData: MeetingDataI[] = [];
  @Input() isReportGenerated: boolean = false;

  formatLocalDateOnly(dateInput: string | Date): string {
    const dt = typeof dateInput === 'string'
      ? DateTime.fromISO(dateInput)
      : DateTime.fromJSDate(dateInput);
  
    return dt.toFormat('yyyy/MM/dd');
  }

  formatHourNumber(hour: number): string {
    return hour.toString().padStart(2, '0') + ':00';
  }
}