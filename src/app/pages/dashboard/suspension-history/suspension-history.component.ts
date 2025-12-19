import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsService } from '../../../services/students.service';
import { StudentSuspensionHistory } from '../../../services/dtos/student.dto';

import { SuspensionHistoryTableComponent } from '../../../components/suspension-history/suspension-history-table/suspension-history-table.component';
import { SuspensionHistoryFiltersComponent } from '../../../components/suspension-history/suspension-history-filters/suspension-history-filters.component';

@Component({
  selector: 'app-suspension-history',
  standalone: true,
  imports: [
    CommonModule,
    SuspensionHistoryTableComponent,
    SuspensionHistoryFiltersComponent,
  ],
  templateUrl: './suspension-history.component.html',
  styleUrl: './suspension-history.component.scss',
})
export class SuspensionHistoryComponent implements OnInit {

  // ============================
  // STATE
  // ============================

  suspensionHistory: StudentSuspensionHistory[] = [];
  loading = false;

  filters: {
    studentId?: number;
    stageId?: number;
  } = {};

  constructor(private studentsService: StudentsService) {}

  // ============================
  // LIFECYCLE
  // ============================

  ngOnInit(): void {
    this.loadSuspensionHistory();
  }

  // ============================
  // LOAD DATA
  // ============================

  private loadSuspensionHistory(): void {
    this.loading = true;

    this.studentsService.getSuspensionHistory(this.filters).subscribe({
      next: (history) => {
        this.suspensionHistory = history;
        this.loading = false;
      },
      error: (err) => {
        console.error('[SuspensionHistory] Error cargando historial', err);
        this.loading = false;
      },
    });
  }

  // ============================
  // FILTERS FROM CHILD
  // ============================

  onFiltersChange(filters: { studentId?: number; stageId?: number }) {
    this.filters = { ...filters };
    this.loadSuspensionHistory();
  }
}