import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-report-instructor-quick-actions',
  standalone: true,
  imports: [],
  templateUrl: './report-instructor-quick-actions.component.html',
  styleUrl: './report-instructor-quick-actions.component.scss',
})
export class ReportInstructorQuickActionsComponent {

  @Output() summaryRequested =
    new EventEmitter<void>();

  @Output() summaryByDayRequested =
    new EventEmitter<void>();

  @Output() exportRequested =
    new EventEmitter<void>();

  onSummary(): void {
    this.summaryRequested.emit();
  }

  onSummaryByDay(): void {
    this.summaryByDayRequested.emit();
  }

  onExport(): void {
    this.exportRequested.emit();
  }
}