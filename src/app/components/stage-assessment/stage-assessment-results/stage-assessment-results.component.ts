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

  /** Devuelve evaluaciones NO aprobadas (<80) o no existentes */
  getPendingAssessments(item: StageProgressDto): StudentAssessment[] {
    const REQUIRED_TYPES = ['Grammar', 'Speaking'];
    const assessments = item.assessments ?? [];

    // Si no tiene ninguna evaluación → ambas pendientes
    if (assessments.length === 0) {
      return REQUIRED_TYPES.map(type => ({
        type,
        points: 0,
      } as StudentAssessment));
    }

    const result: StudentAssessment[] = [];

    REQUIRED_TYPES.forEach(type => {
      const assessmentsOfType = assessments.filter(a => a.type === type);

      if (assessmentsOfType.length === 0) {
        // No existe ese tipo → pendiente
        result.push({ type, points: 0 } as StudentAssessment);
        return;
      }

      const hasApproved = assessmentsOfType.some(a => a.points >= 80);

      if (!hasApproved) {
        // Existe pero ninguna aprobó
        result.push(assessmentsOfType[0]);
      }
    });

    return result;
  }

  /** Devuelve el estado de un tipo de evaluación */
    getAssessmentStatus(
      item: StageProgressDto,
      type: string
    ): 'approved' | 'pending' {
      const assessments = item.assessments ?? [];

      const ofType = assessments.filter(a => a.type === type);

      if (ofType.length === 0) {
        return 'pending';
      }

      return ofType.some(a => a.points >= 80)
        ? 'approved'
        : 'pending';
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