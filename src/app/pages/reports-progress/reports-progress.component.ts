import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportFormComponent } from '../../components/reports/report-form/report-form.component';
import { StudyContentPayloadI, StudyContentDto } from '../../services/dtos/study-content.dto';
import { StudyContentService } from '../../services/study-content.service';
import { ReportTableComponent } from '../../components/reports/report-table/report-table.component';
import { StagesService } from '../../services/stages.service';
import { Stage } from '../../services/dtos/student.dto';

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
  currentStageIndex: number = 0;
  searchExecuted = false;
  showStageTitle: boolean = false;
  studentStageDescription: string = '';

  constructor(
    private studyContentService: StudyContentService,
    private stagesService: StagesService
  ) {}

  ngOnInit(): void {
    this.loadStages();
  }

  private loadStages(): void {
    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = stages;
      },
      error: () => {
        console.error('Error al cargar los stages.');
      },
    });
  }

  onFiltersSubmitted(filters: { studentId: number; studentStage?: string; from?: string; to?: string }) {
    this.searchExecuted = true;
    this.studentStageDescription = filters.studentStage || 'No disponible';

    const fromDate = filters.from ?? undefined;
    const toDate = filters.to ?? undefined;

    this.studyContentService
      .getStudyContentHistoryForStudentId(filters.studentId, fromDate, toDate)
      .subscribe({
        next: (history) => {
          this.studentContentHistory = history;
          this.identifyAndLoadCurrentStage(history);
        },
        error: () => {
          this.studentContentHistory = [];
        },
      });
  }

  private identifyAndLoadCurrentStage(history: StudyContentPayloadI[]): void {
    if (history.length === 0) {
      this.studentStageContents = [];
      return;
    }

    const oldestContent = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const targetStageIndex = this.stages.findIndex(s => s.description === oldestContent.data?.stage);

    if (targetStageIndex === -1) {
      console.warn('No se encontró el stage correspondiente.');
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
        console.error('Error al cargar los contenidos del stage.');
        this.studentStageContents = [];
      },
    });
  }

  goToPreviousStage() {
    let prevIndex = this.currentStageIndex - 1;
    while (prevIndex >= 0) {
      if (this.stageHasHistoryByDataStage(this.stages[prevIndex].description)) {
        this.currentStageIndex = prevIndex;
        this.loadStageContents(this.stages[prevIndex].id);
        break;
      }
      prevIndex--;
    }
  }

  goToNextStage() {
    let nextIndex = this.currentStageIndex + 1;
    while (nextIndex < this.stages.length) {
      if (this.stageHasHistoryByDataStage(this.stages[nextIndex].description)) {
        this.currentStageIndex = nextIndex;
        this.loadStageContents(this.stages[nextIndex].id);
        break;
      }
      nextIndex++;
    }
  }

  stageHasHistoryByDataStage(stageDescription: string): boolean {
    return this.studentContentHistory.some(
      record => record.data?.stage === stageDescription
    );
  }

    get canGoPrevious(): boolean {
    return this.stages.slice(0, this.currentStageIndex).some(stage =>
      this.stageHasHistoryByDataStage(stage.description)
    );
  }

  get canGoNext(): boolean {
    return this.stages.slice(this.currentStageIndex + 1).some(stage =>
      this.stageHasHistoryByDataStage(stage.description)
    );
  }

  onHasVisibleResults(visible: boolean) {
    Promise.resolve().then(() => {
      this.showStageTitle = visible;
    });
  }
}