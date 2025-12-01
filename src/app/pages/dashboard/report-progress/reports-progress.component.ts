import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportFormComponent } from '../../../components/reports/report-form/report-form.component';
import { ReportTableComponent } from '../../../components/reports/report-table/report-table.component';
import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentPayloadI, StudyContentDto } from '../../../services/dtos/study-content.dto';
import { StagesService } from '../../../services/stages.service';
import { StudyContentService } from '../../../services/study-content.service';
import { StageProgressList } from '../../../services/dtos/stage-progress.dto';
import { StageProgressService } from '../../../services/stage-progress';

@Component({
  selector: 'app-reports-progress',
  standalone: true,
  imports: [CommonModule, ReportFormComponent, ReportTableComponent],
  templateUrl: './reports-progress.component.html',
  styleUrls: ['./reports-progress.component.scss'],
})
export class ReportsProgressComponent implements OnInit {
  studentContentHistory: StudyContentPayloadI[] = [];
  stages: Stage[] = [];
  studentStageContents: StudyContentDto[] = [];
  stagesWithContent: Stage[] = [];
  currentStageIndex: number = 0;
  searchExecuted = false;
  showStageTitle: boolean = false;
  studentStageDescription: string = '';

  selectedStudentId: number | null = null;
  filtersStudentId: number = 0;
  studentProgress: StageProgressList = [];
  studentCurrentStageProgress: number = 0;

  constructor(
    private studyContentService: StudyContentService,
    private stagesService: StagesService,
    private stageProgressService: StageProgressService
  ) {}

  ngOnInit(): void {
    this.loadStagesWithContent();
  }

  private loadStagesWithContent(): void {
    this.stagesService.getAll().subscribe(allStages => {
      const stagesWithContent: Stage[] = [];
      let processedCount = 0;

      allStages.forEach(stage => {
        this.studyContentService.filterBy(stage.id).subscribe(contents => {
          if (contents.length > 0) {
            stagesWithContent.push(stage);
          }

          processedCount++;
          if (processedCount === allStages.length) {
            this.stagesWithContent = stagesWithContent.sort((a, b) => {
              const aNum = parseFloat(a.number.replace(/[^0-9.]/g, '')) || 0;
              const bNum = parseFloat(b.number.replace(/[^0-9.]/g, '')) || 0;
              return aNum - bNum;
            });
            this.stages = this.stagesWithContent;  
          }
        });
      });
    });
  }

  onFiltersSubmitted(filters: { studentId: number; studentStage?: string; from?: string; to?: string }) {
    this.searchExecuted = true;
    this.selectedStudentId = filters.studentId;
    this.filtersStudentId = filters.studentId;   
    this.studentStageDescription = filters.studentStage || 'No disponible';

    const fromDate = filters.from ?? undefined;
    const toDate = filters.to ?? undefined;

    // 1) Historial de contenidos
    this.studyContentService
      .getStudyContentHistoryForStudentId(filters.studentId, fromDate, toDate)
      .subscribe({
        next: (history) => {
          this.studentContentHistory = history;
          this.identifyAndLoadCurrentStage(history);

          // 2) DESPUÉS de saber cuál es el stage actual (currentStageIndex),
          //    cargamos el progreso para ese stage concreto:
          if (this.currentStageIndex >= 0 && this.stages[this.currentStageIndex]) {
            const stageId = this.stages[this.currentStageIndex].id;
            this.loadStageProgress(stageId, filters.studentId);
          } else {
            this.studentCurrentStageProgress = 0;
          }
        },
        error: () => {
          this.studentContentHistory = [];
          this.studentCurrentStageProgress = 0;
        },
      });

    // ⚠️ IMPORTANTE:
    // Ya no se usa getProgressByStudent aquí,
    // porque eso siempre trae el stage actual del estudiante,
    // no el que se está mostrando en el reporte.
  }

  private identifyAndLoadCurrentStage(history: StudyContentPayloadI[]): void {
    if (history.length === 0) {
      this.studentStageContents = [];
      return;
    }

    const studentStage = this.studentStageDescription;

    const targetStageIndex = this.stages.findIndex(
      s => s.description === studentStage
    );

    if (targetStageIndex === -1) {
      this.studentStageContents = [];
      return;
    }

    this.currentStageIndex = targetStageIndex;
    const targetStageId = this.stages[targetStageIndex].id;

    this.loadStageContents(targetStageId);
  }

  private loadStageContents(stageId: number): void {
    this.studyContentService.filterBy(stageId).subscribe({
      next: (contents) => {
        this.studentStageContents = contents;
      },
      error: () => {
        this.studentStageContents = [];
      },
    });
  }

  private loadStageProgress(stageId: number, studentId: number): void {
    this.studentCurrentStageProgress = 0;

    this.stageProgressService
      .getProgressByStudentByStage(studentId, stageId)
      .subscribe({
        next: (resp) => {
          // Si backend devuelve algo raro o vacío, garantizamos número o 0
          const raw = resp && (resp as any).progress;
          const value = raw !== undefined && raw !== null ? Number(raw) : 0;
          this.studentCurrentStageProgress = isNaN(value) ? 0 : value;
        },
        error: () => {
          this.studentCurrentStageProgress = 0;
        }
      });
  }

  goToPreviousStage() {
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      const stageId = this.stages[this.currentStageIndex].id;

      this.loadStageContents(stageId);

      if (this.filtersStudentId) {
        this.loadStageProgress(stageId, this.filtersStudentId);
      } else {
        this.studentCurrentStageProgress = 0;
      }
    }
  }

  goToNextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      const stageId = this.stages[this.currentStageIndex].id;

      this.loadStageContents(stageId);

      if (this.filtersStudentId) {
        this.loadStageProgress(stageId, this.filtersStudentId);
      } else {
        this.studentCurrentStageProgress = 0;
      }
    }
  }

  stageHasHistoryByDataStage(stageDescription: string): boolean {
    return this.studentContentHistory.some(
      record => record.data?.stage === stageDescription
    );
  }

  get canGoPrevious(): boolean {
    return this.currentStageIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentStageIndex < this.stages.length - 1;
  }

  onHasVisibleResults(visible: boolean) {
    Promise.resolve().then(() => {
      this.showStageTitle = visible;
    });
  }
}