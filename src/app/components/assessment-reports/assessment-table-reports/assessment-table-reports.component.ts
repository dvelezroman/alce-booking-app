import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessementI, AssessmentType } from '../../../services/dtos/assessment.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-assessment-table-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-table-reports.component.html',
  styleUrl: './assessment-table-reports.component.scss'
})
export class AssessmentTableReportsComponent implements OnChanges {
  @Input() assessments: AssessementI[] = [];
  @Input() maxPointsAssessment: number | null = null;
  @Input() stagesWithContent: Stage[] = [];

  @Output() evaluationClicked = new EventEmitter<AssessementI>();

  types: string[] = [];
  groupedAssessments: Record<string, Record<number, AssessementI[]>> = {}; 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessments'] || changes['stagesWithContent']) {
      if (this.assessments.length > 0 && this.stagesWithContent.length > 0) {
        this.prepareAssessmentGrid();
      }
    }
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

  hasAssessments(type: string, stageId: number): boolean {
    return (
      this.groupedAssessments[type]?.[stageId]?.length > 0
    );
  }

  isMaxReached(points: number): boolean {
    return this.maxPointsAssessment !== null && points >= this.maxPointsAssessment;
  }

  isBelowMax(points: number): boolean {
    return this.maxPointsAssessment !== null && points < this.maxPointsAssessment;
  }
}