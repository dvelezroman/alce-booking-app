import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportFormComponent } from '../../../components/reports/report-form/report-form.component';
import { ReportTableComponent } from '../../../components/reports/report-table/report-table.component';
import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentPayloadI, StudyContentDto } from '../../../services/dtos/study-content.dto';
import { StagesService } from '../../../services/stages.service';
import { StudyContentService } from '../../../services/study-content.service';


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

  constructor(
    private studyContentService: StudyContentService,
    private stagesService: StagesService
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

  goToPreviousStage() {
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      const stageId = this.stages[this.currentStageIndex].id;
      this.loadStageContents(stageId);
    }
  }

  goToNextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      const stageId = this.stages[this.currentStageIndex].id;
      this.loadStageContents(stageId);
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
