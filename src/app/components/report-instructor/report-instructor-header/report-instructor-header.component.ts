import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-report-instructor-header',
  standalone: true,
  imports: [],
  templateUrl: './report-instructor-header.component.html',
  styleUrl: './report-instructor-header.component.scss',
})
export class ReportInstructorHeaderComponent {

  @Output() exportRequested =
    new EventEmitter<void>();

  @Output() summaryRequested =
    new EventEmitter<void>();

  onExport(): void {
    this.exportRequested.emit();
  }

  onSummary(): void {
    this.summaryRequested.emit();
  }
}