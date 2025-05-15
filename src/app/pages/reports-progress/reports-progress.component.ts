import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportFormComponent } from '../../components/reports/report-form/report-form.component';
import { StudyContentPayloadI } from '../../services/dtos/study-content.dto';
import { StudyContentService } from '../../services/study-content.service';

@Component({
  selector: 'app-reports-progress',
  standalone: true,
  imports: [CommonModule, ReportFormComponent],
  templateUrl: './reports-progress.component.html',
  styleUrls: ['./reports-progress.component.scss'],
})
export class ReportsProgressComponent {
  studentContentHistory: StudyContentPayloadI[] = [];

  constructor(private studyContentService: StudyContentService) {}

  onFiltersSubmitted(filters: { studentId: number; from?: string; to?: string }) {
    console.log('Filtros recibidos en el padre:', filters);
    const fromDate = filters.from ?? '';
    const toDate = filters.to ?? '';

    this.studyContentService
      .getStudyContentHistoryForStudentId(filters.studentId, fromDate, toDate)
      .subscribe({
        next: (history) => {
          this.studentContentHistory = history;
          console.log('Historial cargado:', history);
        },
        error: (err) => {
          console.error('Error al obtener el historial:', err);
        },
      });
  }
}