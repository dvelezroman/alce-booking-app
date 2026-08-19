import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type ReportType = 'detailed' | 'statistical' | 'meetings';

@Component({
  selector: 'app-report-student-type-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-student-type-selector.component.html',
  styleUrl: './report-student-type-selector.component.scss'
})
export class ReportStudentTypeSelectorComponent {
  @Input() activeReport: ReportType = 'detailed';

  @Output() detailedRequested = new EventEmitter<void>();
  @Output() statisticalRequested = new EventEmitter<void>();
  @Output() meetingsRequested = new EventEmitter<void>();

  selectReport(type: ReportType): void {
    if (type === 'detailed') {
      this.detailedRequested.emit();
      return;
    }

    if (type === 'statistical') {
      this.statisticalRequested.emit();
      return;
    }

    this.meetingsRequested.emit();
  }

  isActive(type: ReportType): boolean {
    return this.activeReport === type;
  }
}