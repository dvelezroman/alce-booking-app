import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageProgressByStage, StageProgressDto } from '../../../services/dtos/stage-progress.dto';
import { StudentAssessment } from '../../../services/dtos/stage-assessment.dto';

@Component({
  selector: 'app-stage-assessment-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-assessment-results.component.html',
  styleUrls: ['./stage-assessment-results.component.scss']
})
export class StageAssessmentResultsComponent implements OnChanges {

  @Input() progressList: StageProgressByStage = [];
  @Input() selectedIds: number[] = [];
  @Input() resetSelection: boolean = false;

  @Output() selectionChange = new EventEmitter<number[]>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetSelection'] && this.resetSelection) {
      this.selectedIds = []; 
      this.selectionChange.emit([]);
    }
  }

  getColor(progress: number): string {
    const hue = 280 - (progress * 0.9);
    return `hsl(${hue}, 75%, 65%)`;
  }

  /** Seleccionar o deseleccionar */
  toggleSelection(item: StageProgressDto): void {
    const id = item.studentId;

    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(x => x !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
    }

    this.selectionChange.emit(this.selectedIds);
  }

  /** Saber si está seleccionado */
  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  /** Devuelve evaluaciones NO aprobadas (<80) */
  getPendingAssessments(item: StageProgressDto): StudentAssessment[] {
    if (!item.assessments || item.assessments.length === 0) {
      return [];
    }

    const failed = item.assessments.filter(a => a.points < 80);
    const uniqueByType = new Map<string, StudentAssessment>();

    failed.forEach(a => {
      if (!uniqueByType.has(a.type)) {
        uniqueByType.set(a.type, a);
      }
    });

    return Array.from(uniqueByType.values());
  }

  /** Saber si el estudiante aprobó el stage */
  hasApprovedAll(item: StageProgressDto): boolean {
    if (!item.assessments || item.assessments.length === 0) return false;

    return item.assessments.every(a => a.points >= 80);
  }
  
  getPendingAssessmentLabel(item: StageProgressDto): string {
    const pending = this.getPendingAssessments(item);

    if (pending.length === 0) return '';

    return pending.map(p => p.type).join(', ');
  }
}