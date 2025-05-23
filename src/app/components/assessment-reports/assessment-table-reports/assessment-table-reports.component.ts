import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessementI, AssessmentType } from '../../../services/dtos/assessment.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentService } from '../../../services/study-content.service';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-assessment-table-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-table-reports.component.html',
  styleUrl: './assessment-table-reports.component.scss'
})
export class AssessmentTableReportsComponent implements OnInit {
  @Input() assessments: AssessementI[] = [];
  @Input() maxPointsAssessment: number | null = null;

  @Output() evaluationClicked = new EventEmitter<AssessementI>();

  stagesWithContent: Stage[] = [];
  types: string[] = [];
  groupedAssessments: Record<string, Record<number, AssessementI[]>> = {}; 

  constructor(
    private studyContentService: StudyContentService,
    private stagesService: StagesService
  ) {}

  ngOnInit(): void {
    this.loadStagesWithContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessments'] && this.stagesWithContent.length > 0) {
      this.prepareAssessmentGrid();
    }
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
            this.stagesWithContent = this.sortStages(stagesWithContent);

            // Ejecutar grid si ya tenemos evaluaciones cargadas
            if (this.assessments.length > 0) {
              this.prepareAssessmentGrid();
            }
          }
        });
      });
    });
  }

 private prepareAssessmentGrid(): void {
  this.types = Object.values(AssessmentType);
  const grouped: Record<string, Record<number, AssessementI[]>> = {};

  for (const a of this.assessments) {
    if (!grouped[a.type]) {
      grouped[a.type] = {};
    }

    if (!grouped[a.type][a.stageId]) {
      grouped[a.type][a.stageId] = [];
    }

    grouped[a.type][a.stageId].push(a);
  }

  this.groupedAssessments = grouped;
}

  private sortStages(stages: Stage[]): Stage[] {
    return stages.sort(
      (a, b) => this.extractStageNumber(a.number) - this.extractStageNumber(b.number)
    );
  }

  private extractStageNumber(stageLabel: string): number {
    return parseFloat(stageLabel.replace(/[^0-9.]/g, '')) || 0;
  }

  hasAssessments(type: string, stageId: number): boolean {
    return (
      this.groupedAssessments[type] &&
      this.groupedAssessments[type][stageId] &&
      this.groupedAssessments[type][stageId].length > 0
    );
  }

  isMaxReached(points: number): boolean {
    return this.maxPointsAssessment !== null && points >= this.maxPointsAssessment;
  }

  isBelowMax(points: number): boolean {
    return this.maxPointsAssessment !== null && points < this.maxPointsAssessment;
  }
}