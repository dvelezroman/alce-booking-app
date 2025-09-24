import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessementI } from '../../../services/dtos/assessment.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-evaluation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss']
})
export class EvaluationModalComponent implements OnChanges {

  @Input() visible: boolean = false;
  @Input() assessments: AssessementI[] = [];
  @Input() stagesWithContent: Stage[] = [];
  @Input() maxPointsAssessment: number | null = null;
  @Input() minPointsAssessment: number | null = null;
  @Input() currentStageId: number | null = null;
  @Input() highlightStageId: number | null = null;

  @Output() closed = new EventEmitter<void>();

  types: string[] = [];
  groupedAssessments: Record<string, Record<number, AssessementI[]>> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessments'] || changes['stagesWithContent']) {
      if (this.assessments.length > 0 && this.stagesWithContent.length > 0) {
        this.prepareAssessmentGrid();
      }
    }

    if (changes['highlightStageId'] && this.highlightStageId) {
      setTimeout(() => this.scrollToHighlightedStage(), 0);
    }
  }

  private prepareAssessmentGrid(): void {
    this.types = Array.from(new Set(this.assessments.map(a => a.type)));
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

   private scrollToHighlightedStage(): void {
    const el = document.getElementById('highlighted-stage');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  hasAssessments(type: string, stageId: number): boolean {
    return this.groupedAssessments[type]?.[stageId]?.length > 0;
  }

  isMaxReached(points: number): boolean {
    return this.minPointsAssessment !== null && points >= this.minPointsAssessment;
  }

  isBelowMax(points: number): boolean {
    return this.minPointsAssessment !== null && points < this.minPointsAssessment;
  }

  closeModal(): void {
    this.closed.emit();
  }

  get studentName(): string {
    if (this.assessments.length > 0) {
      const user = this.assessments[0].student?.user;
      return user ? `${user.firstName} ${user.lastName}` : 'Estudiante';
    }
    return '';
  }

  get studentStage(): string {
    if (this.assessments.length > 0) {
      const stageId = this.assessments[0].student?.stageId;
      const stage = this.stagesWithContent.find(s => s.id === stageId);
      return stage ? `${stage.description}` : `Stage ${stageId}`;
    }
    return '';
  }
}