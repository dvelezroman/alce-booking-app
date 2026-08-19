import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-report-student-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-student-header.component.html',
  styleUrl: './report-student-header.component.scss'
})
export class ReportStudentHeaderComponent {
  @Input() isReportGenerated = false;

  @Output() downloadRequested = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();

  onDownload(): void {
    if (!this.isReportGenerated) return;
    this.downloadRequested.emit();
  }

  onRefresh(): void {
    this.refreshRequested.emit();
  }
}