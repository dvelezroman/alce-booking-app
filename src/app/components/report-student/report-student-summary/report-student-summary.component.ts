import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-report-student-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-student-summary.component.html',
  styleUrl: './report-student-summary.component.scss'
})
export class ReportStudentSummaryComponent {
  @Input() studentId?: number;
}