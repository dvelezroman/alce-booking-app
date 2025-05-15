import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportFormComponent } from '../../components/reports/report-form/report-form.component';
import { StudyContentPayloadI } from '../../services/dtos/study-content.dto';
import { StudyContentService } from '../../services/study-content.service';
import { ReportTableComponent } from '../../components/reports/report-table/report-table.component';

@Component({
  selector: 'app-reports-progress',
  standalone: true,
  imports: [CommonModule, ReportFormComponent, ReportTableComponent],
  templateUrl: './reports-progress.component.html',
  styleUrls: ['./reports-progress.component.scss'],
})
export class ReportsProgressComponent {
  studentContentHistory: StudyContentPayloadI[] = [];
  searchExecuted = false;

  constructor(private studyContentService: StudyContentService) {}

  onFiltersSubmitted(filters: { studentId: number; from?: string; to?: string }) {
    this.searchExecuted = true; 

    const fromDate = filters.from ?? undefined;
    const toDate = filters.to ?? undefined;

    this.studyContentService
      .getStudyContentHistoryForStudentId(filters.studentId, fromDate, toDate)
      .subscribe({
        next: (history) => {
          this.studentContentHistory = history;
        },
        error: (err) => {
          this.studentContentHistory = [];  
        },
      });
  }
}
